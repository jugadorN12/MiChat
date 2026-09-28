const config = () => {
    return {
        ipServer: process.env.REACT_APP_BACKEND_URL || "http://localhost:3001",
    };
};

export { config };
