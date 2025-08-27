# Documentación Backend

## Introducción

Este backend implementa autenticación y gestión de usuarios usando NestJS, JWT, Google OAuth y PostgreSQL. Incluye seguridad avanzada, recuperación de contraseña y envío de correos.

## Arquitectura general

- **NestJS**: Framework principal
- **TypeORM**: ORM para PostgreSQL
- **Passport.js**: Estrategias local, JWT, Google OAuth
- **Módulos**: Auth, User, Mail, Storage
- **Mailjet + Handlebars**: Envío de correos de bienvenida y recuperación
- **Swagger**: Documentación interactiva en `/api/docs`
- **Docker**: Contenedores para base de datos y pgAdmin
- **Makefile**: Comandos para levantar y bajar servicios

## Guía de uso

1. Instala dependencias: `npm install`
2. Configura variables de entorno en `.env` (ver `example.env`)
3. Levanta la base de datos con Docker: `make docker-up`
4. Ejecuta la aplicación: `npm run start:dev`
5. Accede a la documentación Swagger en `/api/docs`
