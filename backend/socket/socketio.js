const { addUser, socketsConnected, removeUser, closeChat, changeVisibleChat, sendMessage, assignChat, drawAttenAttention, changeStatus, changeSubnick, changeAvatar, changeVisibleChatAttention, changeUsername, getPerson, socketsConnectedCounter } = require("../models");
const Groq = require("groq-sdk");

async function getGroqResponse(userMessage) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("Clave API de Groq no encontrada en process.env");
        }

        // Instanciamos dentro para asegurar que tome el .env cargado
        const groqClient = new Groq({ apiKey });

        const completion = await groqClient.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Sos 'MiChat Buddy', un asistente virtual de un chat de los años 2000. Hablás en español de Argentina con jerga como 'xD', 'ola', 'che'. Respondé súper breve (máximo 2 oraciones)."
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            model: "groq/compound-mini",
            max_tokens: 100, // Limite para no exceder la cuota gratuita
        });

        return completion.choices[0]?.message?.content || "No sé qué decirte che xD";
    } catch (error) {
        console.error("DEBUG - ERROR COMPLETO GROQ:", error);
        return `¡Hola! Recibí tu mensaje: "${userMessage}". (Che, mi cerebro de IA tuvo un error: ${error.message}. ¡Igual acá sigo firme! xD)`;
    }
}

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("a user connected: " + socket.id);

        addUser(socket.id); //Adicionando o usuario que entrou na lista de sockets online

        io.emit("socketsConnected", socketsConnected); // Mandando para os clientes que o socket entrou e atualizando as listas de sockets
        io.emit("socketsConnectedCounter", socketsConnectedCounter()); // Quantidade de pessoas online...

        socket.on("socket connected notification", ({ avatar }) => {
            const currentPerson = getPerson(socket.id);
            io.emit("socket connected notification", { username: currentPerson ? currentPerson.username : socket.id, avatar }); // mandando o cliente que entoru para notificação...
            io.emit("socketsConnectedCounter", socketsConnectedCounter()); // Quantidade de pessoas online...
        });

        socket.on("change avatar", (avatarlink) => {
            const user = getPerson(socket.id);
            if (user && user.username) {
                const db = require("../database");
                db.get('users').find({ username: user.username }).assign({ avatar: avatarlink }).write();
            }
            changeAvatar(socket.id, avatarlink);
            io.emit("socketsConnected", socketsConnected); // Mandando para os clientes que o socket entrou
        });

        socket.on("send server message text", ({ message, socketidUser, socketidPerson }) => {
            const { updateChatsPerson, chatopen } = sendMessage(socketidUser, socketidPerson);

            if (updateChatsPerson && socketidPerson !== "bot-michat") io.to(socketidPerson).emit("refresh multi chats", updateChatsPerson); // retornando a lista de chats do usuario que clicou

            const senderUser = getPerson(socket.id);
            const usernamesend = senderUser ? senderUser.username : socket.id;

            io.to(socketidUser).emit("send client message text", { message, socketidUser, socketidPerson, usernamesend }); //mandando para o usuario que mandou a msg

            if (socketidPerson !== "bot-michat") {
                io.to(socketidPerson).emit("send client message text", { message, socketidUser, socketidPerson, chatopen, usernamesend }); //mandando para o usuario que recebeu a msg
            } else {
                // Respuesta con IA Groq (Llama 3)
                (async () => {
                    const aiResponse = await getGroqResponse(message);
                    io.to(socketidUser).emit("send client message text", {
                        message: aiResponse,
                        socketidUser: "bot-michat",
                        socketidPerson: socketidUser,
                        chatopen: true,
                        usernamesend: "MiChat Buddy"
                    });
                })();
            }
        });

        socket.on("Draw AttenAttention", (socketidperson) => {
            const { updateChatsPerson, whosend, statusperson } = drawAttenAttention(socket.id, socketidperson);

            if (socketidperson !== "bot-michat") {
                io.to(socketidperson).emit("refresh multi chats", updateChatsPerson);
                io.to(socketidperson).emit("Draw AttenAttention", { id: socket.id, whosend, isend: false, statusperson });
            } else {
                // Bot responde al zumbido
                setTimeout(() => {
                    io.to(socket.id).emit("Draw AttenAttention", { id: "bot-michat", whosend: "MiChat Buddy", isend: false, statusperson: "online" });
                }, 1500);
            }

            io.to(socket.id).emit("Draw AttenAttention", { id: socketidperson, whosend, isend: true, statusperson });
        });

        socket.on("change visible chat draw attention", ({ socketiduser, socketidperson }) => {
            const personChats = changeVisibleChatAttention({ socketiduser, socketidperson }); // troca o visible de true para false e ao contrario também, e pega os chats novamente
            io.to(socketidperson).emit("refresh multi chats", personChats); //manda os chats com o atributo do visible atualizado
        });

        socket.on("change visible chat", (socketidperson) => {
            const userChats = changeVisibleChat(socket.id, socketidperson); // troca o visible de true para false e ao contrario também, e pega os chats novamente
            io.to(socket.id).emit("refresh multi chats", userChats); //manda os chats com o atributo do visible atualizado
        });

        socket.on("click on chat", (socketidperson) => {
            const userChats = assignChat(socket.id, socketidperson, "user"); // mandando o socket id person para a lista do socket user
            io.to(socket.id).emit("refresh multi chats", userChats); // retornando a lista de chats do usuario que clicou
        });

        socket.on("close chat", (socketidperson) => {
            const userChats = closeChat(socket.id, socketidperson); //retornando chats do user
            io.to(socket.id).emit("refresh multi chats", userChats); //envia para o client a nova lista
        });

        socket.on("change status user", (status) => {
            changeStatus(socket.id, status);
            io.emit("socketsConnected", socketsConnected); // Mandando para os clientes que o socket entrou
            io.emit("socketsConnectedCounter", socketsConnectedCounter()); // Quantidade de pessoas online...
        });

        socket.on("change subnick user", (subnick) => {
            let subnickreturn = changeSubnick(socket.id, subnick);
            io.emit("socketsConnected", socketsConnected); // Mandando para os clientes que o socket entrou
            io.to(socket.id).emit("return subnick user", subnickreturn); //envia para o client a nova lista
        });

        socket.on("change username user", (username) => {
            let usernamereturn = changeUsername(socket.id, username);
            io.emit("socketsConnected", socketsConnected); // Mandando para os clientes que o socket entrou
            io.to(socket.id).emit("return username user", usernamereturn); //envia para o client a nova lista
        });
        socket.on("send audio", ({ socketidPerson, audioURL }) => {
            const { updateChatsPerson, chatopen } = sendMessage(socket.id, socketidPerson);

            if (updateChatsPerson) io.to(socketidPerson).emit("refresh multi chats", updateChatsPerson);

            const senderUser = getPerson(socket.id);
            const usernamesend = senderUser ? senderUser.username : socket.id;

            io.to(socket.id).emit("send client message text", { message: "", socketidUser: socket.id, socketidPerson, usernamesend }); //mandando para o usuario que mandou a msg
            io.to(socketidPerson).emit("send client message text", { message: "", socketidUser: socket.id, socketidPerson, chatopen, usernamesend }); //mandando para o usuario que recebeu a msg

            io.to(socketidPerson).emit("send audio", { audioURL, socketidPerson, socketidUser: socket.id }); // Mandando para os clientes que o socket entrou
            io.to(socket.id).emit("send audio", { audioURL, socketidPerson, socketidUser: socket.id }); // Mandando para os clientes que o socket entrou
        });

        socket.on("send wink", ({ socketidPerson, wink }) => {
            console.log("chegou no server wink: " + wink);

            const { updateChatsPerson, chatopen } = sendMessage(socket.id, socketidPerson);
            if (updateChatsPerson) io.to(socketidPerson).emit("refresh multi chats", updateChatsPerson);

            const senderUser = getPerson(socket.id);
            const usernamesend = senderUser ? senderUser.username : socket.id;

            setTimeout(() => {
                const personChats = changeVisibleChatAttention({ socketiduser: socket.id, socketidperson: socketidPerson }); // troca o visible de true para false e ao contrario também, e pega os chats novamente
                io.to(socketidPerson).emit("refresh multi chats", personChats); //manda os chats com o atributo do visible atualizado

                io.to(socketidPerson).emit("send wink", { wink, socketidUser: socket.id, socketidPerson, usernamesend }); //envia wink para a pessoa q vai receber
                io.to(socket.id).emit("send wink", { wink, socketidUser: socketidPerson, socketidPerson: socket.id, usernamesend }); //Envia o emit para a pessoa que cliccou para enviar, os valores estão trocados para que quando ele receba reproduza o wink
            }, 1000);
        });

        socket.on("disconnect", () => {
            removeUser(socket.id); //remove o socket da lista
            io.emit("socketsConnected", socketsConnected); //envia para o client a nova lista
            io.emit("socketsConnectedCounter", socketsConnectedCounter()); // Quantidade de pessoas online...
        });
    });
};
