import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import storageConfig from './config/storage.config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(
    @Inject(storageConfig.KEY)
    private config: ConfigType<typeof storageConfig>,
  ) {
    if (!this.config.awsS3BucketName || !this.config.awsRegion || !this.config.awsAccessKeyId || !this.config.awsSecretAccessKey) {
      throw new Error('Faltan variables de configuración de AWS S3');
    }
    this.bucket = this.config.awsS3BucketName; 
    this.region = this.config.awsRegion;

    // Inicializar el cliente S3 con AWS SDK v3
    this.s3Client = new S3Client({
      endpoint: this.config.awsS3Endpoint,
      region: this.region,
      credentials: {
        accessKeyId: this.config.awsAccessKeyId,
        secretAccessKey: this.config.awsSecretAccessKey,
      },
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimetype: string): Promise<string> {
    // Crear un comando para subir objeto usando AWS SDK v3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'public-read',
    });

    // Ejecutar el comando
    await this.s3Client.send(command);
    
    // Construir y devolver la URL del archivo
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
