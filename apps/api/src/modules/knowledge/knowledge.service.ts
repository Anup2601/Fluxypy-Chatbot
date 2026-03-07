import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../common/services/gemini.service';
import { PineconeService } from '../../common/services/pinecone.service';
import { ChunkerService } from '../../common/services/chunker.service';
import { FileParserService } from '../../common/services/file-parser.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
    private pinecone: PineconeService,
    private chunker: ChunkerService,
    private fileParser: FileParserService,
  ) {}

  // ── LIST all knowledge sources for an org ──────────
  async findAll(orgId: string) {
    return this.prisma.knowledgeSource.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        chunkCount: true,
        tokenCount: true,
        sourceUrl: true,
        errorMsg: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // ── GET single source ──────────────────────────────
  async findOne(id: string, orgId: string) {
    const source = await this.prisma.knowledgeSource.findFirst({
      where: { id, orgId },
    });
    if (!source) {
      throw new NotFoundException('Knowledge source not found');
    }
    return source;
  }

  // ── GET STATUS ─────────────────────────────────────
  async getStatus(id: string, orgId: string) {
    const source = await this.findOne(id, orgId);
    return {
      id: source.id,
      name: source.name,
      status: source.status,
      chunkCount: source.chunkCount,
      tokenCount: source.tokenCount,
      errorMsg: source.errorMsg,
    };
  }

  // ── UPLOAD FILE and process ────────────────────────
  async processFile(
    orgId: string,
    file: Express.Multer.File,
    name: string,
  ) {
    // 1. Create DB record with PROCESSING status
    const source = await this.prisma.knowledgeSource.create({
      data: {
        orgId,
        name: name || file.originalname,
        type: this.getSourceType(file.mimetype),
        status: 'PROCESSING',
        filePath: file.path,
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      },
    });

    // 2. Process asynchronously — return immediately
    this.processAndEmbed(source.id, orgId, file.path, file.mimetype)
      .catch((error) => {
        this.logger.error(
          `Processing failed for ${source.id}: ${error.message}`,
        );
        this.markFailed(source.id, error.message);
      });

    return {
      id: source.id,
      name: source.name,
      status: 'PROCESSING',
      message:
        'File uploaded! Processing started. Check status in a few seconds.',
    };
  }

  // ── PROCESS plain TEXT directly ───────────────────
  async processText(orgId: string, dto: CreateKnowledgeDto) {
    if (!dto.textContent) {
      throw new BadRequestException(
        'textContent is required for TEXT type',
      );
    }

    const source = await this.prisma.knowledgeSource.create({
      data: {
        orgId,
        name: dto.name,
        type: 'TEXT',
        status: 'PROCESSING',
      },
    });

    // Process asynchronously
    this.embedAndStore(source.id, orgId, dto.textContent).catch(
      (error) => {
        this.markFailed(source.id, error.message);
      },
    );

    return {
      id: source.id,
      name: source.name,
      status: 'PROCESSING',
      message: 'Text received! Processing started.',
    };
  }

  // ── DELETE source + its vectors ───────────────────
  async remove(id: string, orgId: string) {
    const source = await this.findOne(id, orgId);

    // Delete vectors from Pinecone
    await this.pinecone.deleteBySource(orgId, id);

    // Delete file from disk if exists
    if (source.filePath && fs.existsSync(source.filePath)) {
      fs.unlinkSync(source.filePath);
    }

    // Delete from DB
    await this.prisma.knowledgeSource.delete({ where: { id } });

    return { message: 'Knowledge source deleted successfully' };
  }

  // ── PRIVATE: Parse file → embed → store ───────────
  private async processAndEmbed(
    sourceId: string,
    orgId: string,
    filePath: string,
    mimeType: string,
  ) {
    this.logger.log(`Parsing file for source ${sourceId}...`);

    // Parse file → raw text
    const text = await this.fileParser.parseFile(filePath, mimeType);

    if (!text || text.trim().length < 10) {
      throw new Error('Could not extract text from file');
    }

    await this.embedAndStore(sourceId, orgId, text);
  }

  // ── PRIVATE: Chunk → Embed → Store in Pinecone ────
  private async embedAndStore(
    sourceId: string,
    orgId: string,
    text: string,
  ) {
    // Get source details from DB
    const source = await this.prisma.knowledgeSource.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      throw new Error(`Knowledge source ${sourceId} not found`);
    }

    // Chunk the text
    this.logger.log(`Chunking text (${text.length} chars)...`);
    const chunks = this.chunker.chunkText(text);
    this.logger.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      throw new Error('No chunks generated from text');
    }

    // Embed all chunks with Gemini
    this.logger.log('Generating embeddings with Gemini...');
    const chunkTexts = chunks.map((c) => c.content);
    const embeddings = await this.gemini.embedBatch(chunkTexts);

    // Build vector records for Pinecone
    const vectors = chunks.map((chunk, i) => ({
      id: `${sourceId}_chunk_${i}`,
      values: embeddings[i],
      metadata: {
        orgId,
        sourceId,
        sourceName: source.name,
        sourceType: source.type as string,
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
      },
    }));

    // Store in Pinecone (org-isolated namespace)
    this.logger.log(
      `Storing ${vectors.length} vectors in Pinecone...`,
    );
    await this.pinecone.upsertVectors(orgId, vectors);

    // Calculate total tokens
    const totalTokens = chunks.reduce(
      (sum, c) => sum + c.tokenEstimate,
      0,
    );

    // Update DB record → READY
    await this.prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        status: 'READY',
        chunkCount: chunks.length,
        tokenCount: totalTokens,
      },
    });

    this.logger.log(
      `✅ Source ${sourceId} READY — ${chunks.length} chunks, ~${totalTokens} tokens`,
    );
  }

  // ── PRIVATE: Mark source as FAILED ────────────────
  private async markFailed(sourceId: string, errorMsg: string) {
    await this.prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: 'FAILED', errorMsg },
    });
  }

  // ── PRIVATE: Map mimetype to SourceType ───────────
  private getSourceType(mimeType: string): any {
    const map: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        'DOCX',
      'text/plain': 'TEXT',
      'application/octet-stream': 'TEXT',
    };
    return map[mimeType] || 'TEXT';
  }
}
