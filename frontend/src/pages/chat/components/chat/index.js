import React, { useState, useEffect, useRef, Suspense } from "react";

import ContentEditable from "react-contenteditable";
//configs
import { socket } from "../../../../configs/socket_export";
//components
import AeroButton from "../../../components/aeroButton/index";
import emotions from "./assets/emoticon.png";
import Audio from "../../../components/audioRecorder/index";
import preventChat from "./components/identifyEmoticonChat/index";

//images
import points from "./assets/points.png";
import tilt from "./assets/tilt.png";
import voice from "./assets/voice.png";
import winks from "./assets/winks.png";
import { Container, HeaderChat, MultiPoints, Sender, DivRecordVoice } from "./styles";

//context
import { useUser } from "../../../context/allusers";

const SendWinks = React.lazy(() => import("./components/sendWinks"));
const SendEmoticon = React.lazy(() => import("./components/sendEmoticons"));
const Winks = React.lazy(() => import("./components/sendWinks/components/winks/index"));

const Chat = (props) => {
    const { language } = useUser();
    const [record, setRecord] = useState();
    const [visibleSendWinks, setVisibleSendWinks] = useState(false);
    const [visibleSendEmoticons, setVisibleSendEmoticon] = useState(false);
    const DivRecordVoiceRef = useRef(null);
    const refContentEditable = useRef(null); // referencia do textArea de digitar
    const [texto, setTexto] = useState(""); // Estado que colecta lo que se está escribiendo
    let [preventEmoticons, eastereggschat] = preventChat(); //essas funções verificam o que esta sendo escrito no chat antes de enviar, e faz alguma ação se o que esta sendo escrito for algo especifico.

    const handleClickDrawAttention = () => {
        const socketidPerson = props.socketidPerson;
        socket.emit("Draw AttenAttention", socketidPerson);
    };

    useEffect(() => {
        const lastChar = texto.slice(-1);
        // Only run if the last character is a potential emoticon trigger or space
        if (texto && (lastChar === ')' || lastChar === ' ' || lastChar === '>')) {
            preventEmoticons({ texto, setTexto });
            eastereggschat({ texto, setTexto });
        }
    }, [texto]);

    const handleSend = () => {
        // Obtenemos el texto actual directamente del DOM para máxima precisión
        const domElement = document.getElementById("text-area");
        const currentText = domElement ? domElement.innerHTML : texto;

        console.log("DEBUG - Texto a enviar:", currentText);

        if (!currentText || currentText.trim() === "" || currentText === "<br>") {
            console.log("DEBUG - Abortando: Mensaje vacío.");
            return false;
        }

        if (props.socketidUser && props.socketidPerson) {
            socket.emit("send server message text", {
                message: currentText,
                socketidUser: props.socketidUser,
                socketidPerson: props.socketidPerson
            });
            console.log("DEBUG - Mensaje enviado al socket.");
            setTexto(""); // Limpiamos el estado
            if (domElement) domElement.innerHTML = ""; // Limpiamos el DOM manualmente por seguridad
        } else {
            console.error("DEBUG - Error: IDs de socket no encontrados.");
        }
    };

    const onPressEnter = (e) => {
        if (e.keyCode === 13 || e.key === "Enter") {
            if (!e.shiftKey) {
                e.preventDefault();
                console.log("DEBUG - Enter presionado");
                handleSend();
            }
        }
    };

    return (
        <>
            <MultiPoints>
                <img src={points} alt="icon-points" />
            </MultiPoints>
            <Suspense fallback={null}>
                <Winks socketidPerson={props.socketidPerson}></Winks>
            </Suspense>

            <HeaderChat>
                <AeroButton onCustomClick={() => (visibleSendEmoticons ? setVisibleSendEmoticon(false) : setVisibleSendEmoticon(true))}>
                    <img src={emotions} alt="icon-emotions" />
                    <Suspense fallback={null}>
                        <SendEmoticon socketidPerson={props.socketidPerson} visible={visibleSendEmoticons} ref={refContentEditable} setTexto={setTexto} texto={texto} />
                    </Suspense>
                </AeroButton>
                <AeroButton onCustomClick={() => (visibleSendWinks ? setVisibleSendWinks(false) : setVisibleSendWinks(true))}>
                    <img src={winks} alt="icon-winks" />
                    <Suspense fallback={null}>
                        <SendWinks socketidPerson={props.socketidPerson} visible={visibleSendWinks} />
                    </Suspense>
                </AeroButton>
                <AeroButton onCustomClick={handleClickDrawAttention}>
                    <img src={tilt} alt="icon-tilt" />
                </AeroButton>
                <DivRecordVoice ref={DivRecordVoiceRef}>
                    <AeroButton>
                        <img src={voice} alt="icon-voice" style={{ margin: 0, padding: 0, marginTop: 2, height: 14 }} />
                    </AeroButton>
                    <Audio audioURL={record} socketidPerson={props.socketidPerson} />
                </DivRecordVoice>
            </HeaderChat>

            <Container>
                <ContentEditable id="text-area" html={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={onPressEnter} ref={refContentEditable} />
            </Container>
            <Sender>
                <button onClick={handleSend}>{language === "es" ? "Enviar" : "Send"}</button>
            </Sender>
        </>
    );
};

export default Chat;
