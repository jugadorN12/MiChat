import React, { useEffect } from "react";
//components
import MultiChats from "../src/pages/multiChats/index";
import Scripts from "./scripts/ref";

//configs
import { socket } from "./configs/socket_export";
import Chat from "./pages/chat/index";
import { NotificationOnline } from "./pages/components/notificationOnline/index";
//context
import { useUser } from "./pages/context/allusers";
//pages
import Home from "./pages/home/index";
import Login from "./pages/login/index";
import Register from "./pages/register/index";
//refs
import { Container } from "./styles";
import GlobalStyle from "./styles/global";

function App() {
    const { userChats, mode, chatRefText, chatRef, multiChatRef, isConnected, language } = useUser();
    let [drawAttention, sendMessage, sendAudio, SendWink] = Scripts();

    useEffect(() => {
        socket.on("send client message text", ({ message, socketidUser, socketidPerson, chatopen, usernamesend }) => {
            sendMessage({ chatRefText, chatRef, multiChatRef, message, socketidUser, socketidPerson, chatopen, usernamesend });
        });

        socket.on("Draw AttenAttention", ({ id, whosend, isend, statusperson }) => {
            //drawAttention({ chatRefText, chatRef, multiChatRef, id, whosend, isend, statusperson });
            drawAttention({ chatRefText, chatRef, multiChatRef, id, whosend, isend, statusperson });
        });

        socket.on("send audio", ({ audioURL, socketidPerson, socketidUser }) => {
            sendAudio({ audioURL, socketidPerson, socketidUser, chatRefText, chatRef, multiChatRef });
        });

        socket.on("send wink", ({ wink, socketidPerson, socketidUser, usernamesend }) => {
            SendWink({ wink, socketidPerson, socketidUser, chatRefText, chatRef, multiChatRef, usernamesend });
        });
    }, []);

    return (
        <Container>
            {!isConnected && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                    color: 'white',
                    padding: '10px',
                    textAlign: 'center',
                    zIndex: 10000,
                    fontWeight: 'bold'
                }}>
                    {language === "es" ? "⚠️ Conexión perdida. Intentando reconectar..." : "⚠️ Connection lost. Reconnecting..."}
                </div>
            )}
            <NotificationOnline />

            {mode === "login" && <Login />}
            {mode === "register" && <Register />}
            {mode === "home" && (
                <>
                    <Home />

                    {userChats && userChats.map((elem, index) => <Chat key={elem.socketidperson} chatRefText={chatRefText} ref={{ chatRefText: (el) => (chatRefText.current[index] = el), chatRef: (el) => (chatRef.current[index] = el) }} socketidperson={elem.socketidperson} visible={elem.visible} />)}

                    <div id="multi-chats">{userChats && userChats.map((elem, index) => <MultiChats key={elem.socketidperson} chatRefProps={{ chatRefText: (el) => (chatRefText.current[index] = el), chatRef: (el) => (chatRef.current[index] = el) }} ref={(el) => (multiChatRef.current[index] = el)} socketidperson={elem.socketidperson} />)}</div>
                </>
            )}

            <GlobalStyle />
        </Container>
    );
}

export default App;
