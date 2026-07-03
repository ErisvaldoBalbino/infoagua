import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { fromBuffer } from 'file-type';
import { UploadResponseDto } from './dto/upload-response.dto';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
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
    this.publicEndpoint =
      this.config.get<string>('storage.publicEndpoint', '') || endpoint;

    this.s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true, // Necessário para Garage / MinIO compatíveis com S3
    });

    try {
      await this.ensureBucketExists();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to initialize/create bucket: ${message}`,
        stack,
      );
    }
  }

  private async ensureBucketExists() {
    if (!this.bucket) return;
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch (error) {
      const s3Error = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (
        s3Error.name === 'NotFound' ||
        s3Error.$metadata?.httpStatusCode === 404
      ) {
        this.logger.log(`Bucket "${this.bucket}" does not exist. Creating...`);
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Bucket "${this.bucket}" created successfully.`);
        await this.setBucketPublicPolicy();
      } else {
        throw error;
      }
    }
  }

  private async setBucketPublicPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    try {
      await this.s3.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`Public read policy applied to bucket "${this.bucket}".`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to apply public policy to bucket "${this.bucket}": ${message}`,
        stack,
      );
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
    if (
      file.mimetype === 'image/svg+xml' ||
      file.originalname.toLowerCase().endsWith('.svg')
    ) {
      throw new BadRequestException('Arquivos SVG não são permitidos.');
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
