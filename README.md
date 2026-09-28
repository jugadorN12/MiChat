# MiChat 💬 - Fase 1: Limpieza y Registro

### Una replica moderna de un chat clásico hecha en JavaScript.

Este proyecto ha sido mejorado en su Fase 1 para ser más sólido, configurable y seguro.

## Novedades Fase 1
- **Sistema de Registro y Login**: Cuentas reales con nombre de usuario único, contraseña hasheada (bcrypt), vinculación de email/celular y base de datos local (lowdb).
- **Configuración por Entorno**: Uso de archivos `.env` para centralizar URLs, puertos y secretos.
- **Internacionalización**: Traducción completa al Español (Argentina).
- **Seguridad**: Actualización de dependencias críticas (Socket.io v4, Express) y auditoría de vulnerabilidades.
- **Robustez**: Manejo visual de desconexión del servidor en tiempo real.
- **Optimización**: Carga perezosa (lazy loading) de componentes pesados como emoticones y winks.

## Requisitos
- Node.js v16+ (probado con v24 usando `--openssl-legacy-provider`)
- npm o yarn

## Instalación Local desde Cero

1. Clonar el repositorio.
2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env  # Configura tus variables aquí
   npm install
   npm start
   ```
3. **Frontend**:
   ```bash
   cd frontend
   cp .env.example .env  # Configura la URL del backend
   npm install
   npm start
   ```

## Variables de Entorno (.env)
### Backend
- `PORT`: Puerto donde corre el servidor (ej: 3001).
- `BACKEND_URL`: URL base del backend (ej: localhost:3001).
- `FRONTEND_URL`: URL del cliente para CORS.
- `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASS`: Configuración opcional para envío de correos de verificación.

### Frontend
- `REACT_APP_BACKEND_URL`: Dirección del servidor de sockets.

## Pendientes / TODO (Próximas Fases)
- [ ] Verificación real por SMS (actualmente solo declarativo).
- [ ] Multimedia avanzado (estilo WhatsApp).
- [ ] Grupos y canales.
- [ ] Panel de noticias y publicidad.
- [ ] Recuperación de contraseña.

---
*Basado en el proyecto original msn-js de pablobion.*
