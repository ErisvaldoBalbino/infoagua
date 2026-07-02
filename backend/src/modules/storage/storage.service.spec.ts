import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Client } from '@aws-sdk/client-s3';
import { StorageService } from './storage.service';

// ─── Mock file-type (must be before any imports that use it) ─────────────────

const mockFromBuffer = jest.fn();

jest.mock('file-type', () => ({
  fromBuffer: (...args: unknown[]) => mockFromBuffer(...args),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ENDPOINT = 'http://garage.example.com';
const BUCKET = 'infoagua';

function makeFile(
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: 'photo.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    size: 15,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
    ...overrides,
  };
}

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('StorageService', () => {
  let service: StorageService;
  let s3SendMock: jest.Mock;

  beforeEach(async () => {
    s3SendMock = jest.fn().mockResolvedValue({});

    // Default: buffer detected as JPEG image
    mockFromBuffer.mockResolvedValue({ ext: 'jpg', mime: 'image/jpeg' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback = '') => {
              const map: Record<string, string> = {
                'storage.endpoint': ENDPOINT,
                'storage.accessKey': 'access-key',
                'storage.secretKey': 'secret-key',
                'storage.region': 'us-east-1',
                'storage.bucket': BUCKET,
              };
              return map[key] ?? fallback;
            },
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    service.onModuleInit(); // inicializa o S3Client

    // Substitui o client real pelo mock após inicialização
    (service as any).s3 = { send: s3SendMock } as unknown as S3Client;
  });

  afterEach(() => jest.clearAllMocks());


  // ─── upload ──────────────────────────────────────────────────────────────────

  describe('upload', () => {
    it('deve chamar PutObjectCommand com os parâmetros corretos', async () => {
      const file = makeFile();

      await service.upload(file);

      expect(s3SendMock).toHaveBeenCalledTimes(1);

      const [command] = s3SendMock.mock.calls[0];
      const input = command.input;

      expect(input.Bucket).toBe(BUCKET);
      expect(input.Body).toBe(file.buffer);
      expect(input.ContentType).toBe('image/jpeg');
      // Key deve ser UUID + extensão do arquivo original
      expect(input.Key).toMatch(/^[0-9a-f-]{36}\.jpg$/);
    });

    it('deve retornar URL pública com o nome do arquivo', async () => {
      const file = makeFile();

      const result = await service.upload(file);

      expect(result.url).toMatch(
        new RegExp(`^${ENDPOINT}/${BUCKET}/[0-9a-f-]{36}\\.jpg$`),
      );
    });

    it('deve lançar BadRequestException se magic bytes não correspondem a imagem', async () => {
      // Simula um PDF com Content-Type forjado para image/jpeg
      mockFromBuffer.mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' });
      const file = makeFile({ mimetype: 'image/jpeg', originalname: 'malicious.jpg' });

      await expect(service.upload(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(s3SendMock).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se fromBuffer não reconhece o formato', async () => {
      // Simula buffer sem magic bytes conhecidos (arquivo corrompido / binário arbitrário)
      mockFromBuffer.mockResolvedValue(undefined);
      const file = makeFile();

      await expect(service.upload(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(s3SendMock).not.toHaveBeenCalled();
    });

    it('deve aceitar SVG válido sem chamar fromBuffer', async () => {
      const svgBuffer = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
      const file = makeFile({
        mimetype: 'image/svg+xml',
        originalname: 'icon.svg',
        buffer: svgBuffer,
      });

      await service.upload(file);

      // SVG não usa magic-byte detection
      expect(mockFromBuffer).not.toHaveBeenCalled();
      expect(s3SendMock).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException para SVG inválido (conteúdo não-SVG)', async () => {
      const file = makeFile({
        mimetype: 'image/svg+xml',
        originalname: 'fake.svg',
        buffer: Buffer.from('not an svg file'),
      });

      await expect(service.upload(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(s3SendMock).not.toHaveBeenCalled();
    });
  });
});
