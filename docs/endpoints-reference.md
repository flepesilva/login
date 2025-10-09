# Referencia de Endpoints

## Endpoints de Autenticación (`/auth`)

### POST /auth/login
**Descripción:** Iniciar sesión con email y contraseña.
**Autenticación:** Pública
**Rate Limiting:** Sí
**Request:**
```json
{
  "email": "usuario@correo.com",
  "password": "Password123"
}
```
**Response:**
```json
{
  "id": 1,
  "message": "Login successful"
}
```
**Notas:** Los tokens de acceso y refresh se establecen como cookies HTTP-only.

### POST /auth/register
**Descripción:** Registrar nuevo usuario.
**Autenticación:** Pública
**Request:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@correo.com",
  "password": "Password123",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```
**Response:**
```json
{
  "id": 2,
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@correo.com",
  "role": "USER",
  "message": "Registration successful"
}
```
**Notas:** 
- `avatarUrl` es opcional
- La contraseña debe tener mínimo 8 caracteres con al menos una mayúscula, minúscula y número/carácter especial
- Los tokens se establecen automáticamente como cookies HTTP-only

### POST /auth/forgot-password
**Descripción:** Solicitar restablecimiento de contraseña.
**Autenticación:** Pública
**Request:**
```json
{
  "email": "usuario@correo.com"
}
```
**Response:**
```json
{
  "message": "Password reset link sent to your email"
}
```

### POST /auth/reset-password
**Descripción:** Restablecer contraseña con token.
**Autenticación:** Pública
**Request:**
```json
{
  "token": "jwt_reset_token",
  "newPassword": "NuevoPassword123"
}
```
**Response:**
```json
{
  "message": "Password changed successfully"
}
```

### POST /auth/refresh
**Descripción:** Renovar token de acceso.
**Autenticación:** Requiere refresh token (cookie)
**Response:**
```json
{
  "id": 1,
  "message": "Tokens refreshed successfully"
}
```
**Notas:** Los nuevos tokens se establecen como cookies HTTP-only.

### POST /auth/logout
**Descripción:** Cerrar sesión del usuario.
**Autenticación:** Requiere token JWT
**Response:**
```json
{
  "message": "Logout successful"
}
```
**Notas:** Elimina las cookies de tokens.

### GET /auth/profile
**Descripción:** Obtener perfil del usuario autenticado.
**Autenticación:** Requiere token JWT
**Response:**
```json
{
  "id": 1,
  "email": "usuario@correo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER"
}
```

### GET /auth/google
**Descripción:** Iniciar autenticación con Google OAuth.
**Autenticación:** Pública
**Notas:** Redirige a Google para autenticación.

### GET /auth/google/callback
**Descripción:** Callback de Google OAuth.
**Autenticación:** Pública
**Notas:** Procesa la respuesta de Google, crea usuario si no existe, establece cookies y redirige al frontend.

### GET /auth/test
**Descripción:** Endpoint de prueba para usuarios autenticados.
**Autenticación:** Requiere token JWT y rol USER o superior

## Endpoints de Usuarios (`/users`)

### GET /users
**Descripción:** Obtener lista de todos los usuarios.
**Autenticación:** Requiere token JWT y rol ADMIN
**Response:**
```json
[
  {
    "id": 1,
    "email": "usuario@correo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER",
    "avatarUrl": "https://ejemplo.com/avatar.jpg"
  }
]
```

### GET /users/:id
**Descripción:** Obtener un usuario específico por ID.
**Autenticación:** Requiere token JWT y rol ADMIN
**Response:**
```json
{
  "id": 1,
  "email": "usuario@correo.com",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```

### POST /users
**Descripción:** Crear un nuevo usuario (solo para administradores).
**Autenticación:** Requiere token JWT y rol ADMIN
**Request:**
```json
{
  "firstName": "Admin",
  "lastName": "Root",
  "email": "admin@correo.com",
  "password": "Admin123",
  "role": "ADMIN",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```
**Response:**
```json
{
  "id": 3,
  "firstName": "Admin",
  "lastName": "Root",
  "email": "admin@correo.com",
  "role": "ADMIN",
  "avatarUrl": "https://ejemplo.com/avatar.jpg"
}
```
**Notas:** 
- `role` es opcional (por defecto USER)
- `avatarUrl` es opcional

### PATCH /users/:id
**Descripción:** Actualizar información de un usuario.
**Autenticación:** Requiere token JWT y rol ADMIN
**Request (todos los campos son opcionales):**
```json
{
  "firstName": "NuevoNombre",
  "lastName": "NuevoApellido",
  "email": "nuevo@correo.com",
  "avatarUrl": "https://nuevo-avatar.com/imagen.jpg",
  "role": "USER"
}
```
**Response:**
```json
{
  "message": "User updated"
}
```

### DELETE /users/:id
**Descripción:** Eliminar un usuario.
**Autenticación:** Requiere token JWT y rol ADMIN
**Response:**
```json
{
  "message": "User deleted"
}
```

### PATCH /users/:id/avatar
**Descripción:** Subir avatar de usuario.
**Autenticación:** Requiere token JWT (el propio usuario o ADMIN)
**Content-Type:** multipart/form-data
**Request:** Archivo en campo `file`
**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://storage.com/path/to/avatar.jpg"
}
```
**Notas:** Solo el propio usuario o un administrador puede actualizar el avatar.
