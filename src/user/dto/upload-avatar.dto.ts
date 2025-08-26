import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de imagen para el avatar del usuario',
  })
  @IsNotEmpty({ message: 'El archivo es obligatorio' })
  file: any;
}
