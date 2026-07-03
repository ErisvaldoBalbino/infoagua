import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';

// ─── Mock AWS SDK S3Client ───────────────────────────────────────────────────
const s3SendMock = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-s3', () => {
  const original = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: (command: unknown) => s3SendMock(command),
    })),
  };
});

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

  beforeEach(async () => {
    s3SendMock.mockReset().mockResolvedValue({});

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
    await service.onModuleInit(); // inicializa o S3Client e resolve a Promise
    s3SendMock.mockClear();
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

    it('deve usar STORAGE_PUBLIC_ENDPOINT se configurado', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          StorageService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, fallback = '') => {
                const map: Record<string, string> = {
                  'storage.endpoint': ENDPOINT,
                  'storage.publicEndpoint': 'http://public-endpoint.com',
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

      const customService = moduleRef.get<StorageService>(StorageService);
      await customService.onModuleInit();

      const file = makeFile();
      const result = await customService.upload(file);

      expect(result.url).toMatch(
        new RegExp(
          `^http://public-endpoint.com/${BUCKET}/[0-9a-f-]{36}\\.jpg$`,
        ),
      );
    });

    it('deve lançar BadRequestException se magic bytes não correspondem a imagem', async () => {
      // Simula um PDF com Content-Type forjado para image/jpeg
      mockFromBuffer.mockResolvedValue({ ext: 'pdf', mime: 'application/pdf' });
      const file = makeFile({
        mimetype: 'image/jpeg',
        originalname: 'malicious.jpg',
      });

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

    it('deve rejeitar uploads de SVG por segurança', async () => {
      const file = makeFile({
        mimetype: 'image/svg+xml',
        originalname: 'icon.svg',
        buffer: Buffer.from('<svg></svg>'),
      });

      await expect(service.upload(file)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(s3SendMock).not.toHaveBeenCalled();
    });
  });
});
