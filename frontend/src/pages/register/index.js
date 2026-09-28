import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { config } from "../../configs/config_connections";
import Navbar from "../components/navbar/index";
import { useUser } from "../context/allusers";
import { Container, Main } from "../login/styles";
import ReactLoading from "react-loading";

const Register = () => {
    const { register, handleSubmit } = useForm();
    const { setMode, language } = useUser();
    const [loading, setLoading] = useState(false);
    const configs = config();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post(`${configs.ipServer}/routes/auth/register`, data);
            alert(language === "es" ? "¡Registro exitoso! Verificá tu email si lo ingresaste." : "Registration successful! Check your email if provided.");
            setMode("login");
        } catch (error) {
            alert(error.response?.data?.error || "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Main>
            <Navbar />
            <Container>
                <h2>{language === "es" ? "Crear cuenta" : "Sign Up"}</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="div-input-login" style={{ margin: '10px 0' }}>
                        <p>{language === "es" ? "Nombre de usuario (único):" : "Username:"}</p>
                        <input name="username" ref={register({ required: true })} type="text" />
                    </div>
                    <div className="div-input-login" style={{ margin: '10px 0' }}>
                        <p>{language === "es" ? "Contraseña:" : "Password:"}</p>
                        <input name="password" ref={register({ required: true })} type="password" />
                    </div>
                    <div className="div-input-login" style={{ margin: '10px 0' }}>
                        <p>{language === "es" ? "Email (opcional):" : "Email:"}</p>
                        <input name="email" ref={register} type="email" />
                    </div>
                    <div className="div-input-login" style={{ margin: '10px 0' }}>
                        <p>{language === "es" ? "Celular (opcional):" : "Phone:"}</p>
                        <input name="phone" ref={register} type="text" />
                    </div>

                    <div id="footer-buttons" style={{ marginTop: '20px' }}>
                        <button type="submit" disabled={loading}>
                            {loading ? "..." : (language === "es" ? "Registrarse" : "Sign Up")}
                        </button>
                    </div>
                    <p onClick={() => setMode("login")} style={{ cursor: 'pointer', marginTop: '10px', textDecoration: 'underline' }}>
                        {language === "es" ? "Ya tengo cuenta, iniciar sesión" : "Already have an account? Sign In"}
                    </p>
                </form>
            </Container>
        </Main>
    );
};

export default Register;
