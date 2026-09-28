const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("./database");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const config = require("./configs/configs")();

const { socketsConnected } = require("./models");

// Configurar almacenamiento para avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Configurar transportador de email
const transporter = nodemailer.createTransport({
    service: config.email.service || 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

var returnRouter = function (io) {

    // Status del servidor
    router.get("/status", async (req, res) => {
        res.json({
            server: "ok",
            socketsConnectedCount: socketsConnected.length,
        });
    });

    // Subida de imagen
    router.post("/upload", upload.single('image'), (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: "No se subió ningún archivo." });
        }
        const fileUrl = `${config.ipServer}/uploads/${req.file.filename}`;
        res.json({ link: fileUrl });
    });

    // Registro de usuario
    router.post("/auth/register", async (req, res) => {
        const { username, password, email, phone } = req.body;

        if (!username || !password || (!email && !phone)) {
            return res.status(400).json({ error: "Faltan campos obligatorios." });
        }

        const userExists = db.get('users').find({ username }).value();
        if (userExists) {
            return res.status(400).json({ error: "El nombre de usuario ya existe." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            username,
            password: hashedPassword,
            email,
            phone,
            verified: true, // AUTO-VERIFICADO PARA FASE 1 (Evitar fricción en pruebas)
            createdAt: new Date().toISOString()
        };

        db.get('users').push(newUser).write();

        // TODO: integrar verificación SMS cuando haya presupuesto
        if (email) {
            console.log(`Enviando email de verificación a ${email}...`);
            // Lógica de envío real (comentada si no hay config)
            if (config.email.user && config.email.pass) {
                const mailOptions = {
                    from: config.email.user,
                    to: email,
                    subject: 'Verificá tu cuenta de MiChat',
                    text: `¡Hola ${username}! Hacé click acá para verificar tu cuenta: ${config.ipServer}/routes/auth/verify?username=${username}`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.log("Error enviando email:", error);
                });
            } else {
                console.log("Simulación: Link de verificación -> ", `${config.ipServer}/routes/auth/verify?username=${username}`);
            }
        }

        res.json({ message: "Usuario registrado con éxito. Verificá tu email si corresponde." });
    });

    // Login de usuario
    router.post("/auth/login", async (req, res) => {
        const { identifier, password } = req.body; // identifier puede ser username, email o phone

        const user = db.get('users').find(u =>
            u.username === identifier ||
            u.email === identifier ||
            u.phone === identifier
        ).value();

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado." });
        }

        if (!user.verified) {
            return res.status(400).json({ error: "Cuenta no verificada. Por favor revisá tu consola o email para el link de activación." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta." });
        }

        // En un sistema real usaríamos JWT aquí. Por ahora devolvemos el perfil.
        const { password: _, ...userProfile } = user;
        res.json({ message: "Login exitoso", user: userProfile });
    });

    // Verificación de cuenta
    router.get("/auth/verify", (req, res) => {
        const { username } = req.query;
        const user = db.get('users').find({ username }).value();

        if (user) {
            db.get('users').find({ username }).assign({ verified: true }).write();
            res.send("<h1>Cuenta verificada con éxito. ¡Ya podés iniciar sesión!</h1>");
        } else {
            res.status(400).send("Usuario no encontrado.");
        }
    });

    return router;
};

module.exports = returnRouter;
