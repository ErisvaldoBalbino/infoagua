import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { UploadResponseDto } from './dto/upload-response.dto';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // ─── POST /storage/upload ────────────────────────────────────────────────────

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter(_req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas imagens são permitidas (image/*).'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagem a ser enviada (image/*)',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload de imagem, retorna URL pública' })
  @ApiResponse({ status: 201, type: UploadResponseDto })
  @ApiResponse({ status: 400, description: 'Arquivo não é uma imagem válida' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  @ApiResponse({ status: 413, description: 'Arquivo excede o limite de 5 MB' })
  upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.storageService.upload(file);
  }

  // ─── DELETE /storage/delete ──────────────────────────────────────────────────

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Deleta imagem por URL' })
  @ApiResponse({ status: 200, description: 'Imagem deletada com sucesso' })
  @ApiResponse({ status: 400, description: 'URL inválida ou malformada' })
  @ApiResponse({ status: 401, description: 'Token ausente ou inválido' })
  delete(@Body('url') url: string): Promise<void> {
    return this.storageService.delete(url);
  }
}
