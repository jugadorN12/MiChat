import React from "react";
//icons
import { AiFillGithub, AiFillLinkedin, AiOutlineInstagram } from "react-icons/ai";
//components
import AeroButton from "../../../components/aeroButton/index";
//images
import chatLogo from "./assets/logo-placeholder.png";
import { Container } from "./styles";

const sidebar = () => {
    return (
        <Container>
            <AeroButton className="button">
                <img src={chatLogo} alt="MiChat" />
            </AeroButton>
            <AeroButton className="button">
                <a href="#" target="_blank">
                    <AiFillGithub size="30" />
                </a>
            </AeroButton>
            <AeroButton className="button">
                <a href="#" target="_blank">
                    <AiFillLinkedin size="30" color="#0e76a8" />
                </a>
            </AeroButton>
            <AeroButton className="button">
                <a href="#" target="_blank">
                    <AiOutlineInstagram size="30" color="#E1306C" />
                </a>
            </AeroButton>
        </Container>
    );
};

export default sidebar;
