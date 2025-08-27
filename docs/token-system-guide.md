# Guía del Sistema de Tokens

## Tipos de tokens

- **Access Token (JWT)**: Autentica peticiones, se almacena en cookie HTTP-only `access_token` (15 min).
- **Refresh Token (JWT)**: Permite renovar sesión, se almacena en cookie HTTP-only `refresh_token` (7 días).
- **Reset Password Token (JWT)**: Token de un solo uso para recuperación de contraseña.
- **Google OAuth Token**: Login social, crea usuario si no existe.

## Flujos de autenticación

1. **Login local**: El usuario envía email y contraseña, recibe access y refresh token en cookies.
2. **Renovación de sesión**: El frontend llama a `/auth/refresh` usando el refresh token para obtener nuevos tokens.
3. **Logout**: El backend elimina el refresh token y limpia las cookies.
4. **Recuperación de contraseña**: El usuario solicita un token de recuperación, lo recibe por email y lo usa para cambiar la contraseña.
5. **Google OAuth**: El usuario inicia sesión con Google, se crea el usuario si no existe y se generan los tokens.

## Seguridad

- Los tokens se almacenan en cookies HTTP-only para prevenir XSS.
- Las cookies usan SameSite y secure en producción para prevenir CSRF.
- El refresh token se almacena encriptado en la base de datos.
- Rate limiting en login para prevenir fuerza bruta.
- Validación estricta de datos con DTOs.
- Encriptación de contraseñas con bcrypt y argon2.
