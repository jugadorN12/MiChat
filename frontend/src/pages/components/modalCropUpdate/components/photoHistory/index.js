import React, { useEffect, useState } from "react";

import { Container } from "./styles";

//components
import ModalBorder from "../../../modalBorder";

//scripts
import { verifyAvatarDefault, defaultPhotosArray } from "../../../modalBorder/verifyAvatarDefault.js";

//images
import Logo from "./assets/logo-placeholder.png";

//configs
import { socket } from "../../../../../configs/socket_export";

//context
import { useUser } from "../../../../context/allusers";

const PhotoHistory = (props) => {
    const [photos, setPhotos] = useState();
    const [photoFocus, setPhotoFocus] = useState();
    const { language } = useUser();

    useEffect(() => {
        if (JSON.parse(localStorage.getItem("photosHistory"))) {
            setPhotos(JSON.parse(localStorage.getItem("photosHistory")));
        }
    }, []);

    const sendAvatar = (elem) => {
        elem = photoFocus;
        if (!elem) return false;
        socket.emit("change avatar", elem);
        if (localStorage.getItem("saveUser")) {
            let infos = JSON.parse(localStorage.getItem("saveUser"));
            infos.avatar = elem;
            localStorage.setItem("saveUser", JSON.stringify(infos));
        }
        props.close();
    };

    return (
        <Container>
            <div id="header">
                <p>
                    <img src={Logo} alt="" />
                    {language === "es" ? "Imagen de perfil" : "Your Avatar"}
                </p>
                <p id="title-header">{language === "es" ? "Seleccioná una imagen para mostrar" : "Select your avatar"}</p>
                <small>{language === "es" ? "Elegí cómo querés aparecer en MiChat." : "Choose how you want to appear in MiChat."}</small>
            </div>
            <div id="mid">
                <div id="left">
                    <div id="photos-galary">
                        <div>
                            {photos && <h5>{language === "es" ? "Imágenes personalizadas" : "Custom Images"}</h5>}
                            <div>
                                {photos &&
                                    photos.map((elem) => (
                                        <button key={elem} className="button-photos-galary" onClick={() => setPhotoFocus(elem)}>
                                            <img src={verifyAvatarDefault(elem)} alt=""></img>
                                        </button>
                                    ))}
                            </div>

                            <h5>{language === "es" ? "Imágenes predeterminadas" : "Default Images"}</h5>
                            {defaultPhotosArray.map((elem) => (
                                <button key={elem} className="button-photos-galary" onClick={() => setPhotoFocus(elem)}>
                                    <img src={verifyAvatarDefault(elem)} alt=""></img>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div id="right">
                    <ModalBorder id="right-avatar-preview" avatar={photoFocus} size="64" minus="18" top="4px" left="4px" />
                    <button onClick={props.custom}>Custom</button>
                </div>
            </div>
            <div id="bottom">
                <button onClick={props.close}>{language === "es" ? "Cerrar" : "Close"}</button>
                <button onClick={sendAvatar} style={{ marginLeft: "30px", backgroundColor: "MediumSeaGreen" }}>
                    Salvar
                </button>
            </div>
        </Container>
    );
};

export default PhotoHistory;
