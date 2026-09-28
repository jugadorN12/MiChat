import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

//styles
import { Container, Button, SelectFile } from "./styles";

//socket
import { socket } from "../../../../../configs/socket_export";

//configs
import { config } from "../../../../../configs/config_connections";

//context
import { useUser } from "../../../../context/allusers";

export default function App(props) {
    const [upImg, setUpImg] = useState();
    const imgRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [crop, setCrop] = useState({ unit: "%", width: 30, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const { language } = useUser();

    const upload = (photo) => {
        const file = photo;
        if (!file || !file.type.match(/image.*/)) return;

        /* Lets build a FormData object*/
        const fd = new FormData();
        fd.append("image", file); // Append the file

        const configs = config();
        var xhr = new XMLHttpRequest();
        xhr.open("POST", `${configs.ipServer}/routes/upload`);
        xhr.onload = function () {
            if (xhr.status === 200) {
                // Big win!
                const newAvatarLink = JSON.parse(xhr.responseText).link;
                console.log("Avatar subido al servidor local:", newAvatarLink);
                socket.emit("change avatar", newAvatarLink);

                // Actualizar localStorage para que persista en el login
                if (localStorage.getItem("saveUser")) {
                    let saveUser = JSON.parse(localStorage.getItem("saveUser"));
                    saveUser.avatar = newAvatarLink;
                    localStorage.setItem("saveUser", JSON.stringify(saveUser));
                }

                let history = [];

                if (JSON.parse(localStorage.getItem("photosHistory"))) {
                    //verifica se a pessoa ja upou alguma foto na vida
                    if (JSON.parse(localStorage.getItem("photosHistory")).length > 10) {
                        //caso a pessoa ja tenha 7 fotos no historico, ele vai removendo e adicionando a nova
                        history = JSON.parse(localStorage.getItem("photosHistory"));
                        history.shift();
                    } else {
                        history = JSON.parse(localStorage.getItem("photosHistory"));
                    }

                    localStorage.setItem("photosHistory", JSON.stringify([...history, newAvatarLink]));
                } else {
                    //se nunca colocou uma foto, ele ira cair aqui para baixo.
                    localStorage.setItem("photosHistory", JSON.stringify([newAvatarLink]));
                }
            } else {
                alert("Error al subir imagen al servidor. Status: " + xhr.status + " - " + xhr.statusText);
                console.error("Upload Error:", xhr.responseText);
            }
        };
        xhr.onerror = function (e) {
            alert("Error de conexión al subir imagen.");
        };

        /* And now, we send the formdata */
        xhr.send(fd);
    };

    function generateDownload(canvas, crop) {
        if (!crop || !canvas) {
            return;
        }

        function dataURLtoFile(dataurl, filename) {
            //Convert Image to file
            var arr = dataurl.split(","),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        }

        upload(dataURLtoFile(canvas.toDataURL(), "image.png"));
    }

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setUpImg(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onLoad = useCallback((img) => {
        imgRef.current = img;
    }, []);

    useEffect(() => {
        if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
            return;
        }

        const image = imgRef.current;
        const canvas = previewCanvasRef.current;
        const crop = completedCrop;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const ctx = canvas.getContext("2d");
        const pixelRatio = window.devicePixelRatio;

        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
    }, [completedCrop]);

    return (
        <Container>
            <h3>{language === "es" ? "Seleccioná un archivo abajo para recortar y guardar." : "Select a image below to cut and save."}</h3>
            <div id="button-select-photo">
                <SelectFile type="file" accept="image/*" onChange={onSelectFile} />
            </div>
            <div id="photo-and-preview">
                <div id="photo-and-preview-crop">
                    <ReactCrop id="teste" src={upImg} onImageLoaded={onLoad} crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)} />
                </div>

                <div id="photo-and-preview-preview">
                    <h2>Preview</h2>
                    <canvas
                        ref={previewCanvasRef}
                        // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                        style={{
                            width: Math.round(completedCrop?.width ?? 0),
                            height: Math.round(completedCrop?.height ?? 0),
                        }}
                    />
                </div>
            </div>

            <Button
                type="button"
                disabled={!completedCrop?.width || !completedCrop?.height} //ORIGINAL
                onClick={() => {
                    generateDownload(previewCanvasRef.current, completedCrop);
                    props.close();
                }}
            >
                {language === "es" ? "Guardar" : "Save"}
            </Button>
        </Container>
    );
}
