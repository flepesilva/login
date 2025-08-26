import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { MailModule } from './mail/mail.module';
import dbConfig from './config/db.config';
import mailConfig from './mail/config/mail.config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http.exception.filter';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [dbConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfiguration = configService.get('database');
        if (dbConfiguration) {
          return dbConfiguration;
        }
        
        // Configuración por defecto si no se encuentra la configuración en database
        return {
          type: 'postgres',
          host: configService.get('POSTGRES_HOST') || 'localhost',
          port: parseInt(configService.get('POSTGRES_PORT') || '5432'),
          username: configService.get('POSTGRES_USER') || 'postgres',
          password: configService.get('POSTGRES_PASSWORD') || '',
          database: configService.get('POSTGRES_DB') || 'postgres',
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: configService.get('TYPEORM_SYNC') === 'true',
        };
      },
    }),
    UserModule,
    AuthModule,

    StorageModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}