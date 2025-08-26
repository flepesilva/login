import { IsEmail, IsOptional, IsString, IsUrl, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan'
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez'
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario (debe ser único)',
    example: 'juan.perez@ejemplo.com'
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'URL del avatar del usuario (opcional)',
    example: 'https://ejemplo.com/avatar.jpg',
    required: false
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres, debe incluir al menos una letra y un número)',
    example: 'Password123'
  })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener al menos una letra mayúscula, una minúscula y un número o carácter especial'
  })
  password: string;
}