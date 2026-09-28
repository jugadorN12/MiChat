require('dotenv').config();
const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const bodyparser = require("body-parser");
const express = require("express");
const path = require("path");

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = process.env.PORT || 3001;

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

require("./socket/socketio")(io); //Iniciando o socket io

app.use("/routes", require("./routes")(io));

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});

module.exports = app;
