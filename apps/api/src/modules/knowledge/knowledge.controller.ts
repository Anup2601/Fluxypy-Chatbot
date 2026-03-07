import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { KnowledgeService } from './knowledge.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  // GET /api/v1/knowledge
  @Get()
  findAll(@CurrentUser('orgId') orgId: string) {
    return this.knowledgeService.findAll(orgId);
  }

  // GET /api/v1/knowledge/:id/status
  @Get(':id/status')
  getStatus(
    @Param('id') id: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    return this.knowledgeService.getStatus(id, orgId);
  }

  // POST /api/v1/knowledge/upload
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
      // ✅ Validate file size here (10MB max)
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      // ✅ Validate file type here using original filename
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.docx', '.txt', '.doc'];
        const fileExt = extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExt)) {
          cb(null, true); // accept file
        } else {
          cb(
            new BadRequestException(
              `File type not allowed. Allowed types: PDF, DOCX, TXT. Got: ${fileExt}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.knowledgeService.processFile(
      orgId,
      file,
      name || file.originalname,
    );
  }

  // POST /api/v1/knowledge/text
  @Post('text')
  addText(
    @Body() dto: CreateKnowledgeDto,
    @CurrentUser('orgId') orgId: string,
  ) {
    return this.knowledgeService.processText(orgId, dto);
  }

  // DELETE /api/v1/knowledge/:id
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('orgId') orgId: string,
  ) {
    return this.knowledgeService.remove(id, orgId);
  }
}
