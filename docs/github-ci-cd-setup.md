# Configuración de CI/CD en GitHub

Esta guía te explica paso a paso cómo configurar los secretos y variables necesarios en GitHub para que el workflow de CI/CD funcione correctamente.

## Resumen del Workflow

El workflow `backend-ci-cd.yml` tiene dos comportamientos según la rama:

- **Ramas `main` y `release/**`**: Ejecuta CI (lint, test, build)
- **Solo ramas `release/**`**: Ejecuta CI + CD (deploy automático a servidor `developDO`)
  - Crea automáticamente el archivo `.env` desde los secretos de GitHub
  - Pull del código, rebuild y restart de contenedores Docker
- **Rama `main`**: Solo CI, el deploy se hace manualmente

## Configuración de Secretos en GitHub

### Paso 1: Acceder a la configuración de secretos

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (Configuración)
3. En el menú lateral izquierdo, busca **Secrets and variables** → **Actions**
4. Click en **New repository secret**

### Paso 2: Agregar los secretos necesarios

Debes crear los siguientes secretos. Todos son obligatorios para que el workflow funcione correctamente.

---

#### Secretos de Infraestructura

##### 1. `SSH_PRIVATE_KEY`

**Descripción**: Clave privada SSH para conectarse al servidor `developDO`

**Cómo obtenerla**:
```bash
# En tu máquina local, ejecuta:
ssh developDO "cat ~/.ssh/id_ed25519"
```

**Valor a copiar**: Todo el contenido, desde `-----BEGIN OPENSSH PRIVATE KEY-----` hasta `-----END OPENSSH PRIVATE KEY-----` (inclusive)

**En GitHub**:
- Name: `SSH_PRIVATE_KEY`
- Secret: Pega la clave privada completa

---

##### 2. `SERVER_HOST_STAGING`

**Descripción**: IP o hostname del servidor de staging (developDO)

**Cómo obtenerla**:
```bash
# En tu máquina local, ejecuta:
ssh developDO "hostname -I | awk '{print \$1}'"
```

O si tienes configurado un hostname/dominio, usa ese.

**Ejemplo de valor**: `104.248.123.45` o `staging.tudominio.com`

**En GitHub**:
- Name: `SERVER_HOST_STAGING`
- Secret: La IP o hostname del servidor

---

##### 3. `SERVER_USER`

**Descripción**: Usuario SSH para conectarse al servidor

**Valor típico**: `root` (o el usuario que uses para SSH)

**Cómo verificarlo**:
```bash
# En tu máquina local:
ssh developDO "whoami"
```

**En GitHub**:
- Name: `SERVER_USER`
- Secret: El nombre de usuario (probablemente `root`)

---

##### 4. `SERVER_PATH`

**Descripción**: Ruta absoluta en el servidor donde está/estará el repositorio clonado

**Ejemplo de valor**: `/root/login-all` o `/home/usuario/proyectos/login-all`

**Cómo decidirla**: Esta es la ruta donde vas a clonar tu repositorio en el servidor. Si aún no lo has clonado, decide dónde quieres tenerlo.

**En GitHub**:
- Name: `SERVER_PATH`
- Secret: La ruta completa (ej: `/root/login-all`)

---

#### Secretos de Aplicación (.env)

Estos secretos se usarán para generar automáticamente el archivo `.env` en cada deploy:

##### Variables de Entorno General

- **`NODE_ENV`**: `production` o `staging`
- **`PORT`**: `3000` (o el puerto que uses)

##### Variables de Base de Datos (PostgreSQL)

- **`POSTGRES_USER`**: Usuario de PostgreSQL (ej: `postgres_user`)
- **`POSTGRES_PASSWORD`**: Contraseña segura para PostgreSQL
- **`POSTGRES_DB`**: Nombre de la base de datos (ej: `login_db`)
- **`TYPEORM_SYNC`**: `false` (IMPORTANTE: nunca `true` en producción)
- **`TYPEORM_MIGRATIONS_RUN`**: `true` o `false` (si quieres ejecutar migraciones automáticamente)

##### Variables de Redis

- **`REDIS_PASSWORD`**: Contraseña segura para Redis

##### Variables de JWT (Seguridad)

**IMPORTANTE**: Genera secretos seguros y únicos. Puedes usar:
```bash
# Genera secretos aleatorios seguros:
openssl rand -base64 32
```

- **`JWT_SECRET`**: Secret para access tokens (genera uno único)
- **`JWT_EXPIRATION_TIME`**: `1h` o `15m` (duración del access token)
- **`JWT_REFRESH_SECRET`**: Secret para refresh tokens (diferente al anterior)
- **`JWT_REFRESH_EXPIRATION_TIME`**: `7d` (duración del refresh token)
- **`JWT_RESET_PASSWORD_SECRET`**: Secret para tokens de reset de contraseña
- **`JWT_RESET_PASSWORD_EXPIRATION_TIME`**: `1h` (duración del token de reset)

##### Variables de Google OAuth (si lo usas)

- **`GOOGLE_CLIENT_ID`**: Client ID de Google Cloud Console
- **`GOOGLE_CLIENT_SECRET`**: Client Secret de Google Cloud Console
- **`GOOGLE_CALLBACK_URL`**: URL de callback (ej: `http://tu-servidor:3000/auth/google/callback`)

##### Variables de Email (Mailjet)

- **`MAILJET_API_KEY`**: API Key de Mailjet
- **`MAILJET_SECRET_KEY`**: Secret Key de Mailjet
- **`MAIL_FROM`**: Email remitente (ej: `noreply@tudominio.com`)

##### Variables de URLs

- **`FRONTEND_URL`**: URL del frontend (ej: `http://tu-frontend:5173` o `https://app.tudominio.com`)
- **`BACKEND_URL`**: URL del backend (ej: `http://tu-servidor:3000` o `https://api.tudominio.com`)

##### Variables de Rate Limiting

- **`THROTTLE_TTL`**: `60` (segundos)
- **`THROTTLE_LIMIT`**: `10` (requests permitidos en el TTL)

##### Variables de Webpay (si lo usas)

- **`WEBPAY_COMMERCE_CODE`**: Código de comercio de Webpay
- **`WEBPAY_API_KEY`**: API Key de Webpay

##### Variables de AWS S3 (si lo usas)

- **`AWS_ACCESS_KEY_ID`**: Access Key de AWS
- **`AWS_SECRET_ACCESS_KEY`**: Secret Key de AWS
- **`AWS_REGION`**: Región de AWS (ej: `us-east-1`)
- **`AWS_S3_BUCKET_NAME`**: Nombre del bucket S3
- **`AWS_S3_ENDPOINT`**: Endpoint de S3 (opcional, para S3-compatible services)

---

## Paso 3: Configurar Environment (Opcional pero recomendado)

Para mayor control y seguridad, puedes crear un environment llamado "staging":

1. En GitHub, ve a **Settings** → **Environments**
2. Click en **New environment**
3. Nombre: `staging`
4. (Opcional) Configura reglas de protección:
   - Required reviewers: Si quieres que alguien apruebe los deploys
   - Wait timer: Tiempo de espera antes del deploy

## Paso 4: Preparar el servidor

Antes de que el workflow funcione, debes preparar el servidor `developDO`:

### 4.1. Clonar el repositorio en el servidor

```bash
# Conéctate al servidor
ssh developDO

# Navega al directorio padre donde quieres clonar el repo
cd /root  # o la ubicación que prefieras

# Clona el repositorio (reemplaza con tu URL)
git clone git@github.com:usuario/repositorio.git login-all

# Verifica que se clonó correctamente
cd login-all/login
ls -la
```

### 4.2. Verificar que Docker está funcionando

```bash
# En el servidor
docker --version
docker compose version

# Verifica que puedes construir las imágenes (opcional)
cd /root/login-all/login
docker compose build
```

**NOTA**: Ya NO necesitas crear manualmente el archivo `.env`. El workflow lo creará automáticamente desde los secretos de GitHub.

---

## Paso 5: Probar el Workflow

### Opción A: Crear una rama release para probar

```bash
# En tu máquina local
git checkout -b release/v1.0.0
git push origin release/v1.0.0
```

Esto disparará el workflow completo (CI + CD):
1. Ejecutará tests y build
2. Creará el archivo `.env` en el servidor
3. Desplegará la aplicación

### Opción B: Push a main (solo CI)

```bash
git checkout main
git push origin main
```

Esto solo ejecutará el CI (tests y build), sin deploy.

---

## Verificar el estado del workflow

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás el workflow ejecutándose
4. Click en el workflow para ver los logs detallados de cada paso

---

## Troubleshooting

### Error: "Permission denied (publickey)"

**Causa**: La clave SSH no está configurada correctamente.

**Solución**:
- Verifica que copiaste la clave privada completa en `SSH_PRIVATE_KEY`
- Asegúrate de que la clave pública está en el servidor en `~/.ssh/authorized_keys`
- Verifica: `ssh developDO "cat ~/.ssh/authorized_keys"`

### Error: "No such file or directory"

**Causa**: La ruta `SERVER_PATH` no existe o es incorrecta.

**Solución**:
- Verifica que el repositorio está clonado en el servidor en la ruta correcta
- Actualiza el secret `SERVER_PATH` con la ruta correcta

### Error: "docker: command not found"

**Causa**: Docker no está instalado o no está en el PATH del usuario SSH.

**Solución**:
- Verifica que Docker está instalado: `ssh developDO "docker --version"`
- Si no está instalado, sigue la guía de instalación de Docker

### Los contenedores no inician

**Causa**: Probablemente hay variables de entorno faltantes o incorrectas.

**Solución**:
- Verifica que agregaste TODOS los secretos necesarios en GitHub
- Revisa los logs del workflow en GitHub Actions para ver qué variable falta
- Verifica los logs de Docker: `ssh developDO "cd /root/login-all/login && docker compose logs"`
- Verifica el archivo .env generado: `ssh developDO "cat /root/login-all/login/.env"`

### Error: Variables de entorno vacías en el .env

**Causa**: Olvidaste agregar algún secret en GitHub o el nombre del secret no coincide.

**Solución**:
- Verifica que el nombre del secret en GitHub coincide EXACTAMENTE con el nombre en el workflow
- GitHub secrets son case-sensitive: `JWT_SECRET` ≠ `jwt_secret`
- Verifica la lista completa de secretos en la sección "Secretos de Aplicación" arriba

---

## Resumen de comandos útiles

```bash
# Ver logs del servidor en tiempo real
ssh developDO "cd /root/login-all/login && docker compose logs -f"

# Verificar estado de contenedores
ssh developDO "cd /root/login-all/login && docker compose ps"

# Reiniciar contenedores manualmente
ssh developDO "cd /root/login-all/login && docker compose restart"

# Ver última commit en el servidor
ssh developDO "cd /root/login-all && git log -1"

# Ver rama actual en el servidor
ssh developDO "cd /root/login-all && git branch --show-current"

# Verificar archivo .env generado
ssh developDO "cat /root/login-all/login/.env"

# Ejecutar un deploy manual (si necesitas)
ssh developDO "cd /root/login-all && git pull && cd login && docker compose up --build -d"
```

---

## Flujo de trabajo recomendado

1. **Desarrollo**: Trabaja en ramas feature (`feature/nueva-funcionalidad`)
2. **Testing**: Merge a una rama `release/vX.Y.Z`
3. **Deploy automático**: El push a `release/**` despliega automáticamente a `developDO`
   - El workflow crea el `.env` automáticamente
   - Ejecuta tests antes de desplegar
   - Si los tests fallan, NO despliega
4. **Producción**: Cuando todo está probado en staging, merge a `main` y haz deploy manual

---

## Checklist de configuración

Antes de hacer tu primer deploy, asegúrate de haber completado:

- [ ] Creados los 4 secretos de infraestructura (SSH, SERVER_HOST, SERVER_USER, SERVER_PATH)
- [ ] Creados todos los secretos de aplicación (.env) necesarios para tu app
- [ ] Generados secretos JWT seguros y únicos
- [ ] Clonado el repositorio en el servidor en la ruta correcta
- [ ] Verificado que Docker funciona en el servidor
- [ ] Configurado el environment "staging" en GitHub (opcional)
- [ ] Creada una rama `release/vX.Y.Z` para testing

---

Si tienes problemas, revisa los logs del workflow en GitHub Actions (pestaña Actions) y los logs de Docker en el servidor con los comandos de arriba.
