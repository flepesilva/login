# Referencia de Endpoints

## Endpoints de Autenticación (`/auth`)

### POST /auth/login
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

### POST /auth/register
**Request:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@correo.com",
  "password": "Password123"
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

### POST /auth/forgot-password
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
**Response:**
```json
{
  "id": 1,
  "message": "Tokens refreshed successfully"
}
```

### POST /auth/logout
**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET /auth/profile
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
**Descripción:** Redirige a Google para autenticación OAuth.

### GET /auth/google/callback
**Descripción:** Callback de Google OAuth, crea usuario si no existe y redirige al frontend.

### GET /auth/test
**Descripción:** Endpoint de prueba para rol ADMIN.

## Endpoints de Usuarios (`/users`)

### GET /users
**Response:**
```json
[
  {
    "id": 1,
    "email": "usuario@correo.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "USER"
  }
]
```

### GET /users/:id
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

### POST /users
**Request:**
```json
{
  "firstName": "Admin",
  "lastName": "Root",
  "email": "admin@correo.com",
  "password": "Admin123",
  "role": "ADMIN"
}
```
**Response:**
```json
{
  "id": 3,
  "firstName": "Admin",
  "lastName": "Root",
  "email": "admin@correo.com",
  "role": "ADMIN"
}
```

### PATCH /users/:id
**Request:**
```json
{
  "firstName": "NuevoNombre"
}
```
**Response:**
```json
{
  "message": "User updated"
}
```

### DELETE /users/:id
**Response:**
```json
{
  "message": "User deleted"
}
```

### PATCH /users/:id/avatar
**Descripción:** Subir avatar de usuario (requiere archivo).
