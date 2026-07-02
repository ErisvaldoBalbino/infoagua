import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { fromBuffer } from 'file-type';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3: S3Client;
  private bucket: string;
  private publicEndpoint: string;

  constructor(private readonly config: ConfigService) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  async onModuleInit() {
    const endpoint = this.config.get<string>('storage.endpoint', '');
    const accessKeyId = this.config.get<string>('storage.accessKey', '');
    const secretAccessKey = this.config.get<string>('storage.secretKey', '');
    const region = this.config.get<string>('storage.region', 'us-east-1');

    this.bucket = this.config.get<string>('storage.bucket', '');
    this.publicEndpoint = endpoint;

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // Necessário para Garage / MinIO compatíveis com S3
    });

    try {
      await this.ensureBucketExists();
    } catch (error: any) {
      console.error(`[StorageService] Failed to initialize/create bucket: ${error.message}`);
    }
  }

  private async ensureBucketExists() {
    if (!this.bucket) return;
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`[StorageService] Bucket "${this.bucket}" does not exist. Creating...`);
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        console.log(`[StorageService] Bucket "${this.bucket}" created successfully.`);
      } else {
        throw error;
      }
    }
  }

  // ─── Upload ─────────────────────────────────────────────────────────────────

  async upload(file: Express.Multer.File): Promise<UploadResponseDto> {
    await this.validateImageBuffer(file);

    const ext = extname(file.originalname).toLowerCase();
    const key = `${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { url: `${this.publicEndpoint}/${this.bucket}/${key}` };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private async validateImageBuffer(file: Express.Multer.File): Promise<void> {
    if (file.mimetype === 'image/svg+xml') {
      const text = file.buffer.toString('utf8', 0, 256);
      if (!text.includes('<svg') && !text.includes('<?xml')) {
        throw new BadRequestException('Arquivo SVG inválido.');
      }
      return;
    }

    const detected = await fromBuffer(file.buffer);
    const isImage = detected?.mime.startsWith('image/');

    if (!isImage) {
      throw new BadRequestException(
        'Apenas imagens são permitidas (image/*). O conteúdo do arquivo não corresponde a uma imagem válida.',
      );
    }
  }
}
