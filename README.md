# API de Autenticación y Login (NestJS)

## Descripción

Este proyecto implementa un backend de autenticación y login desarrollado con NestJS. Proporciona registro, login local, login con Google OAuth, recuperación de contraseña y gestión básica de usuarios.

## Documentación

1. [Documentación Backend](docs/backend-documentation.md)
   * Endpoints disponibles
   * Configuración del entorno
   * Guía de uso

2. [Guía del Sistema de Tokens](docs/token-system-guide.md)
   * Autenticación JWT
   * Tokens de acceso y refresco

3. [Documentación de Entidades](docs/entities-documentation.md)
   * Estructura de usuario y roles

4. [Referencia de Endpoints](docs/endpoints-reference.md)
   * Ejemplos de peticiones y respuestas

## Características Principales

### Autenticación
- Registro de usuarios con validación
- Login local (usuario y contraseña)
- Login con Google OAuth
- Sistema de tokens JWT en cookies HTTP-only
- Refresh tokens para mantener la sesión
- Logout seguro

### Gestión de Usuarios
- Sistema de roles (ADMIN, USER)
- CRUD básico de usuarios
- Avatares de usuario

### Seguridad
- Tokens JWT en cookies HTTP-only (prevención XSS)
- Cookies seguras y SameSite (prevención CSRF)
- Encriptación de contraseñas (bcrypt/argon2)
- Rate limiting para prevenir fuerza bruta
- Cabeceras HTTP seguras (Helmet)
- CORS configurado para producción
- Validación estricta con DTOs

### Recuperación de Contraseña
- Recuperación por correo electrónico
- Tokens de un solo uso y expiración
- Notificaciones por email

### Sistema de Correos
- Plantillas con Handlebars
- Correos de bienvenida y recuperación

## Tecnologías Utilizadas

- **NestJS**: Framework backend Node.js
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos
- **Passport.js**: Autenticación local y OAuth
- **JWT**: Tokens de autenticación
- **Cookie-parser**: Manejo de cookies
- **Nodemailer**: Envío de correos
- **Handlebars**: Plantillas de email
- **bcrypt/argon2**: Encriptación de contraseñas
- **Swagger**: Documentación API
- **Helmet**: Seguridad HTTP
- **Throttler**: Rate limiting

## Requisitos del Sistema

- Node.js 16+
- PostgreSQL 12+
- Cuenta SMTP para correos
- Credenciales de Google OAuth (opcional)

## Configuración del Entorno

Consulta el archivo `example.env` para ver todas las variables necesarias para la configuración local y de producción.

## Integración con Frontend

Para integrar esta API con tu frontend:

1. **CORS**: El frontend debe estar en un origen permitido
2. **Cookies**: Usa `credentials: 'include'` en fetch/axios
3. **Autenticación**: Los tokens se almacenan en cookies HTTP-only
4. **Renovación de Tokens**: Llama a `/auth/refresh` cuando el token expire