# Documentación de Entidades

## User

```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@correo.com",
  "password": "<encriptada>",
  "isActive": true,
  "avatarUrl": "https://...",
  "role": "USER",
  "hashedRefreshToken": null,
  "isOAuthUser": false,
  "createdAt": "2025-08-26T12:00:00Z",
  "updatedAt": "2025-08-26T12:00:00Z"
}
```

## Roles

- **ADMIN**: Acceso total a todos los endpoints y gestión de usuarios.
- **USER**: Usuario estándar, solo acceso a su propio perfil.



## Relaciones y validaciones

- El email es único y obligatorio.
- La contraseña se almacena encriptada (bcrypt/argon2).
- El avatar es opcional y se almacena en AWS S3.
- El rol se asigna por defecto como USER.
- El campo `isOAuthUser` indica si el usuario fue creado por Google OAuth.
