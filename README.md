# Documentación de la API de Autenticación OAuth

## Descripción

Este proyecto implementa un sistema completo de autenticación y autorización desarrollado con NestJS. La API proporciona múltiples métodos de autenticación, gestión de usuarios, y características de seguridad avanzadas.

## Índice de Documentación

1. [Documentación Backend](docs/backend-documentation.md)
   * Documentación completa de los endpoints disponibles
   * Configuración del entorno de desarrollo
   * Guía de implementación y mejores prácticas

2. [Guía del Sistema de Tokens](docs/token-system-guide.md)
   * Explicación detallada del sistema de autenticación JWT
   * Funcionamiento de los tokens de acceso y refresco mediante cookies HTTP-only
   * Ciclo de vida completo de los tokens y sesiones

3. [Documentación de Entidades](docs/entities-documentation.md)
   * Estructura detallada de todas las entidades del sistema
   * Relaciones entre las entidades
   * Índices y optimizaciones en la base de datos

4. [Referencia de Endpoints](docs/endpoints-reference.md)
   * Documentación completa de todos los endpoints de la API
   * Ejemplos de peticiones y respuestas
   * Esquemas de datos requeridos

## Características Principales

### Autenticación
- Registro de usuarios con validación de datos
- Login local con nombre de usuario y contraseña
- Autenticación OAuth con Google
- Sistema de tokens JWT almacenados en cookies HTTP-only para máxima seguridad
- Refresh tokens para mantener la sesión
- Logout con invalidación de tokens y eliminación de cookies

### Gestión de Usuarios
- Sistema de roles (ADMIN, VENDOR, CUSTOMER)
- Perfiles de usuario personalizables
- Gestión completa de usuarios (CRUD)
- Avatares de usuario

### Seguridad
- Tokens JWT almacenados en cookies HTTP-only para prevenir ataques XSS
- Cookies con atributos secure y SameSite para prevenir CSRF
- Encriptación de contraseñas con bcrypt/argon2
- Protección contra ataques de fuerza bruta con limitación de tasa
- Cabeceras HTTP seguras con Helmet
- CORS configurado para entornos de producción con credentials: true
- Validación estricta de entradas mediante DTOs

### Recuperación de Contraseña
- Flujo completo de recuperación por correo electrónico
- Tokens de un solo uso con tiempo de expiración
- Notificaciones por correo electrónico

### Sistema de Correos
- Plantillas personalizables con Handlebars
- Correos de bienvenida
- Notificaciones de cambio de contraseña
- Correos de recuperación de contraseña

### E-commerce
- Gestión completa de productos y categorías
- Carrito de compras
- Procesamiento de pedidos
- Integración con pasarelas de pago (WebPay Plus)

## Tecnologías Utilizadas

- **NestJS**: Framework de backend basado en Node.js
- **TypeORM**: ORM para gestión de base de datos
- **PostgreSQL**: Base de datos relacional
- **Passport.js**: Estrategias de autenticación
- **JWT**: Tokens para autenticación y autorización
- **Cookie-parser**: Manejo de cookies HTTP-only
- **Nodemailer**: Servicio de envío de correos electrónicos
- **Handlebars**: Motor de plantillas para correos
- **bcrypt/argon2**: Algoritmos de encriptación para contraseñas
- **Swagger**: Documentación interactiva de la API
- **Helmet**: Seguridad mediante cabeceras HTTP
- **Throttler**: Limitación de tasa para prevenir ataques
- **AWS S3**: Almacenamiento de archivos
- **Transbank WebPay**: Integración de pagos

## Requisitos del Sistema

- Node.js 16+
- PostgreSQL 12+
- Cuenta de servicio de correo electrónico (SMTP)
- Credenciales de Google OAuth (para autenticación con Google)
- Cuenta de AWS S3 (para almacenamiento de archivos)
- Credenciales de Transbank WebPay (para procesamiento de pagos)

## Configuración del Entorno

El sistema utiliza las variables de entorno definidas en `example.env`. Consulta este archivo para una referencia completa de todas las variables requeridas.

## Integración con Frontend

Para integrar correctamente esta API con un frontend, es importante considerar:

1. **Configuración CORS**: El frontend debe estar en un origen permitido
2. **Manejo de Cookies**: El frontend debe incluir `credentials: 'include'` en las peticiones fetch/axios
3. **Autenticación**: El sistema utiliza cookies HTTP-only para almacenar tokens, por lo que no es necesario manejar tokens manualmente en el cliente
4. **Renovación de Tokens**: El frontend debe implementar lógica para detectar tokens expirados y llamar al endpoint `/auth/refresh` 