module.exports = () => {
    let ipServer = process.env.BACKEND_URL || "http://localhost:3001";
    if (!ipServer.startsWith("http://") && !ipServer.startsWith("https://")) {
        ipServer = `http://${ipServer}`;
    }

    return {
        ipServer: ipServer,
        client_id: "",
        client_secret: "",
        redirect_uri: `${ipServer}/routes/spotify/callback`,
        email: {
            service: process.env.EMAIL_SERVICE,
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    };
};
