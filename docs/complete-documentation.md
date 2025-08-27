# Documentación Completa del Proyecto API de Autenticación y Login

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Base de Datos](#base-de-datos)
5. [Entidades y Modelos](#entidades-y-modelos)
6. [Sistema de Autenticación](#sistema-de-autenticación)
7. [Endpoints API](#endpoints-api)
8. [Seguridad](#seguridad)
9. [Sistema de Correos](#sistema-de-correos)
10. [Almacenamiento de Archivos](#almacenamiento-de-archivos)
11. [Configuración del Entorno](#configuración-del-entorno)
12. [Instalación y Deployment](#instalación-y-deployment)
13. [Herramientas de Desarrollo](#herramientas-de-desarrollo)
14. [Testing](#testing)

## Descripción General

Este proyecto es una **API REST completa de autenticación y gestión de usuarios** desarrollada con **NestJS** y **TypeScript**. Implementa un sistema robusto de autenticación con múltiples métodos (local y Google OAuth), gestión de roles, recuperación de contraseñas, y todas las funcionalidades necesarias para una aplicación moderna.

### Características Principales
- ✅ Registro e inicio de sesión local
- ✅ Autenticación con Google OAuth 2.0
- ✅ Sistema de roles (ADMIN, USER)
- ✅ Tokens JWT con refresh tokens
- ✅ Recuperación de contraseñas por email
- ✅ Gestión de avatares con AWS S3
- ✅ Sistema de correos con plantillas
- ✅ Rate limiting y seguridad avanzada
- ✅ Documentación automática con Swagger
- ✅ Base de datos PostgreSQL con TypeORM
- ✅ Configuración con Docker

## Arquitectura del Sistema

### Estructura de Módulos
```
src/
├── app.module.ts           # Módulo principal
├── main.ts                 # Punto de entrada
├── auth/                   # Módulo de autenticación
│   ├── config/            # Configuraciones JWT y OAuth
│   ├── decorators/        # Decoradores personalizados
│   ├── dto/               # Data Transfer Objects
│   ├── enums/             # Enumeraciones (roles)
│   ├── guards/            # Guards de autorización
│   ├── strategies/        # Estrategias de Passport
│   └── types/             # Tipos TypeScript
├── user/                  # Módulo de usuarios
│   ├── dto/              # DTOs de usuarios
│   └── entities/         # Entidad User
├── mail/                  # Módulo de correos
│   ├── config/           # Configuración Mailjet
│   └── templates/        # Plantillas Handlebars
├── storage/              # Módulo de almacenamiento AWS S3
├── config/               # Configuraciones generales
└── filters/              # Filtros de excepciones
```

### Patrón de Arquitectura
- **Modular**: Separación clara de responsabilidades
- **Dependency Injection**: Inyección de dependencias nativa de NestJS
- **Guards y Interceptors**: Control de acceso y transformación de datos
- **DTOs**: Validación y transformación de entrada/salida
- **Repository Pattern**: Abstracción de acceso a datos con TypeORM

## Tecnologías Utilizadas

### Backend Framework
- **NestJS 11.x**: Framework Node.js progresivo
- **Node.js 16+**: Runtime JavaScript
- **TypeScript 5.7+**: Lenguaje de programación tipado

### Base de Datos
- **PostgreSQL 14**: Base de datos relacional
- **TypeORM 0.3+**: Object-Relational Mapping
- **pgAdmin**: Interfaz web para administración

### Autenticación y Seguridad
- **Passport.js**: Middleware de autenticación
  - Local Strategy
  - JWT Strategy  
  - Google OAuth Strategy
  - Refresh Token Strategy
- **JWT (JsonWebToken)**: Tokens de autenticación
- **bcrypt**: Encriptación de contraseñas
- **argon2**: Hashing de refresh tokens
- **cookie-parser**: Manejo de cookies HTTP-only

### Validación y Documentación
- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos
- **Swagger/OpenAPI**: Documentación automática de API

### Servicios Externos
- **Mailjet**: Servicio de envío de correos
- **Google OAuth 2.0**: Autenticación social
- **AWS S3**: Almacenamiento de archivos (avatares)

### Desarrollo y Testing
- **Jest**: Framework de testing
- **ESLint**: Linter de código
- **Prettier**: Formateador de código
- **Docker & Docker Compose**: Contenedorización
- **Makefile**: Automatización de comandos

## Base de Datos

### Configuración PostgreSQL
```typescript
// src/config/db.config.ts
export default registerAs('database', (): PostgresConnectionOptions => ({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  database: process.env.POSTGRES_DB || 'postgres',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: process.env.TYPEORM_SYNC === 'true',
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === 'true',
}));
```

### Estructura de la Base de Datos
```sql
-- Tabla principal de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    isActive BOOLEAN DEFAULT true,
    avatarUrl VARCHAR,
    role VARCHAR CHECK (role IN ('ADMIN', 'USER')) DEFAULT 'USER',
    hashedRefreshToken TEXT,
    isOAuthUser BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Entidades y Modelos

### User Entity
```typescript
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    firstName: string;

    @Column({ length: 100 })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    avatarUrl?: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;
    
    @Column({ nullable: true, type: 'text' })
    hashedRefreshToken?: string | null;
    
    @Column({ default: false })
    isOAuthUser: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }
}
```

### Roles Enum
```typescript
export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
```

### Data Transfer Objects (DTOs)

#### RegisterDto
```typescript
export class RegisterDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número o carácter especial'
  })
  password: string;
}
```

## Sistema de Autenticación

### Flujo de Autenticación

#### 1. Registro de Usuario
1. Usuario envía datos de registro
2. Validación con DTOs
3. Encriptación de contraseña
4. Creación en base de datos
5. Envío de email de bienvenida
6. Generación de tokens JWT
7. Configuración de cookies HTTP-only

#### 2. Inicio de Sesión Local
1. Usuario envía email y contraseña
2. Validación con Local Strategy
3. Verificación de credenciales
4. Generación de access y refresh tokens
5. Almacenamiento de refresh token hasheado
6. Configuración de cookies seguras

#### 3. Google OAuth Flow
1. Redirección a Google OAuth
2. Usuario autoriza aplicación
3. Google retorna con datos de perfil
4. Creación/actualización de usuario
5. Generación de tokens
6. Redirección al frontend con cookies

#### 4. Refresh Token Flow
1. Access token expira (15 minutos)
2. Cliente envía refresh token automáticamente
3. Validación de refresh token
4. Generación de nuevos tokens
5. Actualización de cookies

### Estrategias de Passport

#### Local Strategy
```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  validate(email: string, password: string) {
    if (password === '')
      throw new UnauthorizedException('Please Provide The Password');
    return this.authService.validateUser(email, password);
  }
}
```

#### JWT Strategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }
}
```

### Guards de Autorización

#### JWT Auth Guard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

#### Roles Guard
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const user = context.switchToHttp().getRequest().user;
    return requiredRoles.some((role) => user.role === role);
  }
}
```

## Endpoints API

### Endpoints de Autenticación (`/auth`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| POST | `/auth/register` | Registrar nuevo usuario | No | - |
| POST | `/auth/login` | Iniciar sesión | No | - |
| POST | `/auth/logout` | Cerrar sesión | JWT | - |
| POST | `/auth/refresh` | Renovar tokens | Refresh Token | - |
| GET | `/auth/profile` | Obtener perfil | JWT | - |
| POST | `/auth/forgot-password` | Solicitar reset password | No | - |
| POST | `/auth/reset-password` | Resetear contraseña | Token Reset | - |
| GET | `/auth/google` | OAuth con Google | No | - |
| GET | `/auth/google/callback` | Callback Google | No | - |
| GET | `/auth/test` | Endpoint de prueba | JWT | USER |

### Endpoints de Usuarios (`/users`)

| Método | Endpoint | Descripción | Autenticación | Rol |
|--------|----------|-------------|---------------|-----|
| GET | `/users` | Listar usuarios | JWT | ADMIN |
| GET | `/users/:id` | Obtener usuario | JWT | ADMIN |
| POST | `/users` | Crear usuario | JWT | ADMIN |
| PATCH | `/users/:id` | Actualizar usuario | JWT | ADMIN |
| DELETE | `/users/:id` | Eliminar usuario | JWT | ADMIN |
| PATCH | `/users/:id/avatar` | Subir avatar | JWT | ADMIN/Owner |

### Ejemplos de Uso

#### Registro
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "Password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123"
  }' \
  --cookie-jar cookies.txt
```

#### Acceso con Cookies
```bash
curl -X GET http://localhost:3000/auth/profile \
  --cookie cookies.txt
```

## Seguridad

### Medidas de Seguridad Implementadas

#### 1. Autenticación JWT con Cookies HTTP-Only
```typescript
// Configuración de cookies seguras
response.cookie('access_token', accessToken, {
  httpOnly: true,                    // Previene acceso desde JavaScript
  secure: process.env.NODE_ENV === 'production', // Solo HTTPS en prod
  sameSite: 'lax',                  // Protección CSRF
  maxAge: 15 * 60 * 1000,          // 15 minutos
  path: '/'
});
```

#### 2. Encriptación de Contraseñas
- **bcrypt** para contraseñas de usuario
- **argon2** para refresh tokens
- Salt rounds: 10

#### 3. Rate Limiting
```typescript
@Injectable()
export class RateLimitingGuard implements CanActivate {
  private limit = 5;                    // 5 intentos
  private windowMs = 15 * 60 * 1000;    // 15 minutos
  
  canActivate(context: ExecutionContext): boolean {
    // Implementación de rate limiting por IP
  }
}
```

#### 4. Validación Estricta
```typescript
@IsString()
@MinLength(8)
@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número o carácter especial'
})
password: string;
```

#### 5. CORS Configurado
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

#### 6. Headers de Seguridad
- Helmet.js configurado para headers seguros
- Content Security Policy
- X-Frame-Options

## Sistema de Correos

### Configuración Mailjet
```typescript
// src/mail/config/mail.config.ts
export default registerAs('mail', () => ({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY, 
  defaultFrom: process.env.MAIL_FROM,
}));
```

### Plantillas Handlebars

#### Template de Bienvenida
```handlebars
<!-- src/mail/templates/welcome.hbs -->
<h1>¡Bienvenido a Tu App!</h1>
<p>Hola <strong>{{username}}</strong>,</p>
<p>¡Gracias por registrarte! Nos alegra tenerte con nosotros.</p>
```

#### Template de Reset Password
```handlebars
<!-- src/mail/templates/forgot-password.hbs -->
<h1>Restablece tu contraseña</h1>
<p>Hola <strong>{{username}}</strong>,</p>
<p>Para continuar, haz clic en el siguiente botón:</p>
<a href="{{resetLink}}">Restablecer contraseña</a>
```

### Servicio de Email
```typescript
@Injectable()
export class MailService {
  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(process.cwd(), 'src', 'mail', 'templates', `${templateName}.hbs`);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = Handlebars.compile(source);
    return compiled(context);
  }

  async sendWelcomeEmail(to: string, username: string) {
    const html = this.compileTemplate('welcome', { username });
    await this.sendMail(to, 'Bienvenido a nuestra plataforma', html);
  }
}
```

## Almacenamiento de Archivos

### AWS S3 Integration
```typescript
// src/storage/storage.service.ts
@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor(
    @Inject(storageConfig.KEY)
    private config: ConfigType<typeof storageConfig>,
  ) {
    this.s3Client = new S3Client({
      endpoint: this.config.awsS3Endpoint,
      region: this.config.awsRegion,
      credentials: {
        accessKeyId: this.config.awsAccessKeyId,
        secretAccessKey: this.config.awsSecretAccessKey,
      },
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimetype: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
```

### Upload de Avatares
```typescript
@Patch(':id/avatar')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file'))
async uploadAvatar(
  @Param('id') id: string,
  @UploadedFile() file: any,
  @Request() req
) {
  return this.userService.uploadProfilePicture(+id, file);
}
```

## Configuración del Entorno

### Variables de Entorno Requeridas
```env
# Aplicación
NODE_ENV=development
PORT=3000

# Base de Datos PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=oauth_db
TYPEORM_SYNC=true
TYPEORM_MIGRATIONS_RUN=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION_TIME=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRATION_TIME=7d
JWT_RESET_PASSWORD_SECRET=your_reset_secret_here
JWT_RESET_PASSWORD_EXPIRATION_TIME=1h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Email Service (Mailjet)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
MAIL_FROM=noreply@yourapp.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_ENDPOINT=https://s3.amazonaws.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# pgAdmin (Docker)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin_password
```

## Instalación y Deployment

### Prerequisitos
- Node.js 16+
- npm o yarn
- PostgreSQL 12+
- Docker y Docker Compose (opcional)

### Instalación Local

#### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd oauth-new
```

#### 2. Instalar dependencias
```bash
npm install
```

#### 3. Configurar variables de entorno
```bash
cp example.env .env
# Editar .env con tus valores
```

#### 4. Configurar base de datos
```bash
# Opción 1: Con Docker
make docker-up

# Opción 2: PostgreSQL local
createdb oauth_db
```

#### 5. Ejecutar aplicación
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### Docker Deployment

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: db_postgres
    env_file: .env
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4
    container_name: db_pgadmin
    env_file: .env
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_DEFAULT_PASSWORD}
    ports:
      - "5050:80"
    networks:
      - app_network
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:

networks:
  app_network:
    driver: bridge
```

#### Comandos Docker
```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Reiniciar
docker-compose restart
```

## Herramientas de Desarrollo

### Makefile
```makefile
# Levanta los contenedores en segundo plano
docker-up:
	docker compose up -d

# Baja los contenedores
docker-down:
	docker compose down

# Inicia la aplicación en modo desarrollo
start:
	npm run start:dev

# Levanta Docker y luego inicia la app
up: docker-up start

# Reinicia todo
restart: docker-down up
```

### Scripts NPM Disponibles
```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:run": "npm run typeorm migration:run -- -d src/config/db.config.ts",
    "migration:generate": "npm run typeorm migration:generate -- -d src/config/db.config.ts",
    "migration:create": "npm run typeorm migration:create",
    "migration:revert": "npm run typeorm migration:revert -- -d src/config/db.config.ts"
  }
}
```

### ESLint y Prettier Configuration
```javascript
// eslint.config.mjs
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Testing

### Configuración Jest
```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Ejemplo de Test E2E
```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

### Comandos de Testing
```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Debug tests
npm run test:debug
```

## Documentación Swagger

### Acceso a la Documentación
- **URL Local**: `http://localhost:3000/api/docs`
- **Autenticación**: Bearer Token y Cookie Auth soportados

### Configuración Swagger
```typescript
// src/main.ts
const config = new DocumentBuilder()
  .setTitle('Ecommerce API')
  .setDescription('API para la tienda en línea')
  .setVersion('1.0')
  .addBearerAuth() // Para rutas protegidas con token
  .addCookieAuth('access_token') // Para rutas protegidas con cookie
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### Decoradores Swagger
```typescript
@ApiTags('auth')
@ApiOperation({ summary: 'Iniciar sesión' })
@ApiBody({ type: LoginDto })
@ApiResponse({ status: 200, description: 'Login exitoso', type: LoginResponseDto })
@ApiResponse({ status: 401, description: 'Credenciales inválidas' })
@ApiCookieAuth()
@ApiBearerAuth()
```

## Monitoreo y Logs

### Sistema de Filtros de Excepciones
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status],
      message: typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### Logging
- Logs automáticos de excepciones
- Request/Response logging disponible
- Integración con servicios de logging externos posible

## Extensibilidad y Mantenimiento

### Añadir Nuevos Roles
1. Actualizar `Role` enum en `src/auth/enums/role.enum.ts`
2. Actualizar guards y decoradores según sea necesario
3. Añadir migraciones de base de datos si es requerido

### Añadir Nuevos Proveedores OAuth
1. Crear nueva estrategia en `src/auth/strategies/`
2. Configurar en `src/auth/config/`
3. Añadir guard correspondiente
4. Actualizar controlador de auth

### Integración con Servicios Externos
- **Payment Gateways**: Estructura preparada para Stripe, PayPal
- **File Storage**: S3 configurado, fácil migrar a otros providers
- **Notifications**: Base de email lista para SMS, push notifications
- **Analytics**: Hooks disponibles para tracking de eventos

## Mejores Prácticas Implementadas

### Seguridad
- ✅ Nunca exponer tokens en URLs o responses
- ✅ Usar cookies HTTP-only para tokens
- ✅ Implementar rate limiting
- ✅ Validar entrada de usuario estrictamente
- ✅ Usar HTTPS en producción
- ✅ Implementar CORS apropiadamente

### Performance
- ✅ Conexión de base de datos con pool
- ✅ Validaciones eficientes con DTOs
- ✅ Lazy loading donde apropiado
- ✅ Caching de configuraciones

### Mantenibilidad
- ✅ Código modular y bien organizado
- ✅ Separación de responsabilidades
- ✅ Tests automatizados
- ✅ Documentación completa
- ✅ Configuración por entorno

### Escalabilidad
- ✅ Arquitectura modular
- ✅ Base de datos normalizada
- ✅ Servicios externos abstraídos
- ✅ Configuración para múltiples entornos

## Roadmap y Mejoras Futuras

### Funcionalidades Pendientes
- [ ] Two-Factor Authentication (2FA)
- [ ] OAuth con más proveedores (Facebook, Twitter)
- [ ] Sistema de notificaciones push
- [ ] API rate limiting más granular
- [ ] Audit logs
- [ ] Soft delete para usuarios
- [ ] Sistema de permisos más granular
- [ ] Cache con Redis
- [ ] Websockets para notificaciones en tiempo real
- [ ] Health checks endpoint
- [ ] Metrics y monitoring
- [ ] API versioning

### Mejoras de Performance
- [ ] Database indexing optimization
- [ ] Query optimization
- [ ] Response caching
- [ ] Image optimization para avatares
- [ ] CDN integration

### DevOps
- [ ] CI/CD pipelines
- [ ] Docker production images
- [ ] Kubernetes deployment configs
- [ ] Infrastructure as Code
- [ ] Automated testing in pipelines
- [ ] Security scanning

---

## Conclusión

Esta API de autenticación representa una solución completa y robusta para aplicaciones modernas que requieren:

- **Seguridad de nivel enterprise** con múltiples capas de protección
- **Flexibilidad** para integrar con diferentes frontends y servicios
- **Escalabilidad** para crecer con las necesidades del negocio
- **Mantenibilidad** con código limpio y bien documentado
- **Experiencia de usuario** fluida con autenticación social y recuperación de contraseñas

El proyecto está diseñado siguiendo las mejores prácticas actuales de desarrollo, seguridad y arquitectura, proporcionando una base sólida para cualquier aplicación que requiera un sistema de autenticación confiable y feature-complete.

---

**Autor**: Desarrollado con NestJS y TypeScript
**Versión**: 1.0.0
**Fecha**: Agosto 2025
**Documentación**: `/api/docs` (Swagger UI)
