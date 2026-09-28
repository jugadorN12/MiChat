import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { config as getConfigs } from "../../configs/config_connections";
//icons
import { BsPencil, BsTrash } from "react-icons/bs";
import ReactLoading from "react-loading";
//configs
import { socket } from "../../configs/socket_export";
//components
import Navbar from "../components/navbar/index";
import Borderavatar from "../components/modalBorder/index";
import ModalCropUpdate from "../components/modalCropUpdate";
//context
import { useUser } from "../context/allusers";
//images
import brasil from "./assets/brazil.svg";
//gif
import loading from "./assets/login_loading.gif";
import usa from "./assets/united-states.svg";
import { Container, Main } from "./styles";

let timetologin;

const Login = () => {
    const { register, handleSubmit } = useForm();

    const { getUser, setMode, language, changeLanguage } = useUser();
    const [username, setUsername] = useState("");
    const [person, setPerson] = useState();
    const [gifLogin, setGifLogin] = useState(false);

    const [changeStatusBorder, setChangeStatusBorder] = useState();

    const rememberIsChecked = useRef();
    const autoLoginIsChecked = useRef();
    const buttonLogin = useRef();

    const sendSocketEmitStatus = (status) => {
        socket.emit("change status user", status);
    };

    const sendSocketEmitUsername = (username) => {
        socket.emit("change username user", username);
    };

    const configs = getConfigs();

    const onSubmit = async (data) => {
        setGifLogin(true);
        buttonLogin.current.disabled = true;

        try {
            const response = await axios.post(`${configs.ipServer}/routes/auth/login`, {
                identifier: data.username,
                password: data.password
            });

            const user = response.data.user;

            if (user) {
                sendSocketEmitUsername(user.username);

                const userAvatar = user.avatar || person.avatar || "";
                socket.emit("change avatar", userAvatar);

                sendSocketEmitStatus(data.status); // troca status ao entrar.

                data.socketid = socket.id;
                if (rememberIsChecked.current) data.remember = rememberIsChecked.current.checked;
                if (autoLoginIsChecked.current) data.autologin = autoLoginIsChecked.current.checked;

                //se o input estiver selecionado, irá as informações.
                if (data.remember) {
                    localStorage.setItem("saveUser", JSON.stringify({ username: user.username, avatar: userAvatar, autologin: autoLoginIsChecked.current.checked }));
                } else {
                    //caso nao esteja ele irá remover.
                    localStorage.removeItem("saveUser");
                }

                if (JSON.parse(localStorage.getItem("saveUser"))) {
                    let avatar = JSON.parse(localStorage.getItem("saveUser")).avatar; // pega o avatar que esta em local storage
                    if (changeStatusBorder !== "invisible") {
                        socket.emit("socket connected notification", { avatar }); // faz um emit pro serivdor
                    }
                } else {
                    if (changeStatusBorder !== "invisible") {
                        socket.emit("socket connected notification", { avatar: person.avatar }); // faz um emit pro serivdor
                    }
                }

                setMode("home"); //muda para home depois que clica.
            }
        } catch (error) {
            alert(error.response?.data?.error || (language === "es" ? "Error al iniciar sesión" : "Login error"));
            buttonLogin.current.disabled = false;
            setGifLogin(false);
        }
    };

    const handleCancelLogin = () => {
        clearInterval(timetologin);
        setGifLogin(false);
        buttonLogin.current.disabled = false;
    };

    const handleChangeUsername = (e) => {
        //muda o state de username
        setUsername(e.target.value);
    };

    const handleVerifyRememberInput = () => {
        //Função onde verifica se o input de lembrar está ativo, se sim ele deixar clicar para entrar automaticamente.
        if (rememberIsChecked.current.checked) {
            autoLoginIsChecked.current.disabled = false;
        } else {
            autoLoginIsChecked.current.disabled = true;
            autoLoginIsChecked.current.checked = false;
        }
    };

    const clearSaveUser = () => {
        localStorage.removeItem("saveUser");
        setUsername("");
        rememberIsChecked.current.checked = false;
        autoLoginIsChecked.current.checked = false;
        socket.emit("change avatar", "");
        alert(language === "es" ? "Información eliminada." : "Information deleted.");
    };

    (async function () {
        setPerson(await getUser(socket.id));
    })();

    useEffect(() => {
        if (localStorage.getItem("saveUser")) {
            let infos = JSON.parse(localStorage.getItem("saveUser"));
            setUsername(infos.username);
            socket.emit("change avatar", infos.avatar);
            rememberIsChecked.current.checked = true;
            autoLoginIsChecked.current.disabled = false;
            autoLoginIsChecked.current.checked = infos.autologin;

            if (autoLoginIsChecked.current.checked === true && person) {
                buttonLogin.current.click();
            }
        }
        if (localStorage.getItem("michat-language")) {
            changeLanguage(localStorage.getItem("michat-language"));
        }
    }, [person]);

    return (
        <Main>
            <Navbar />
            <Container>
                {person ? <Borderavatar avatar={person.avatar} size="96" status={changeStatusBorder} minus="22" top="4px" left="3px"></Borderavatar> : <ReactLoading type="spin" color="black" height={100} width={100} />}

                <ModalCropUpdate className="change-photo-button">
                    <BsPencil size={15} color="black" />
                </ModalCropUpdate>
                <div id="div-country-flag">
                    <img onClick={() => changeLanguage("br")} className="country-flag" src={brasil} />
                    <img onClick={() => changeLanguage("en")} className="country-flag" src={usa} />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="div-input-login">
                        <p>{language === "es" ? "Nombre de usuario, email o celular:" : "Username, Email or Phone:"}</p>
                        <input id="login-input-email" ref={register} name="username" type="text" value={username} onChange={handleChangeUsername} />
                    </div>

                    <div className="div-input-login" style={{ marginTop: '-10px' }}>
                        <p>{language === "es" ? "Contraseña:" : "Password:"}</p>
                        <input id="login-input-password" ref={register} name="password" type="password" style={{ height: '30px', fontSize: '16px', paddingLeft: '5px' }} />
                    </div>

                    <div id="login-status">
                        <p>{language === "es" ? "Iniciar sesión como:" : "Sign in as:"}</p>
                        <select ref={register} name="status" onChange={(e) => setChangeStatusBorder(e.target.value)}>
                            <option value="online">{language === "es" ? "Conectado (Predeterminado)" : "Online (Default)"}</option>
                            <option value="busy">{language === "es" ? "Ocupado" : "Busy"}</option>
                            <option value="away">{language === "es" ? "Ausente" : "Away"}</option>
                            <option value="invisible">Offline</option>
                        </select>
                    </div>
                    <div className="checkbox-buttons-login">
                        <input type="checkbox" ref={rememberIsChecked} onChange={handleVerifyRememberInput}></input>
                        <p>{language === "es" ? "Recordarme" : "Remember-me"}</p>
                        <button type="button" onClick={clearSaveUser}>
                            <BsTrash />
                        </button>
                    </div>
                    <div className="checkbox-buttons-login">
                        <input disabled type="checkbox" ref={autoLoginIsChecked}></input>
                        <p>{language === "es" ? "Iniciar sesión automáticamente" : "Sign me in automatically"}</p>
                    </div>
                    <div id="footer-buttons">
                        {person ? (
                            <button ref={buttonLogin} type="submit">
                                {language === "es" ? "Entrar" : "Sign in"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                ref={buttonLogin}
                                onClick={() => {
                                    alert(language === "es" ? "No se pudo conectar al servidor, ¡intentá de nuevo!" : "Unable to connect to the server, try again!");
                                }}
                            >
                                {language === "es" ? "Entrar" : "Sign in"}
                            </button>
                        )}
                    </div>
                    <p onClick={() => setMode("register")} style={{ cursor: 'pointer', marginTop: '20px', textDecoration: 'underline', textAlign: 'center' }}>
                        {language === "es" ? "¿No tenés cuenta? Registrate acá" : "No account? Register here"}
                    </p>
                </form>
                {gifLogin && (
                    <div id="div-gif-singin">
                        <small>{language === "es" ? "Iniciando sesión..." : "Signing in..."}</small>
                        <img src={loading} alt="gif-singin" />
                        <p onClick={handleCancelLogin}>{language === "es" ? "Cancelar" : "Cancel"}</p>
                    </div>
                )}
            </Container>
        </Main>
    );
};

export default Login;
