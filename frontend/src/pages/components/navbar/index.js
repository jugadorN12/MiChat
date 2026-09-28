import React from "react";
//images profile
import Logo from "./assets/live-logo.png";
import { Container } from "./styles";

const navbar = () => {
    return (
        <Container>
            <img src={Logo} alt="" />
            <h1 style={{ fontSize: '12px', color: '#454545', marginLeft: '10px', fontWeight: 'normal', fontFamily: 'Segoe UI, Tahoma, sans-serif' }}>MiChat</h1>
        </Container>
    );
};

export default navbar;
