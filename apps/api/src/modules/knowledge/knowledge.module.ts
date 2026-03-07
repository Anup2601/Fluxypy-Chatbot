import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { GeminiService } from '../../common/services/gemini.service';
import { PineconeService } from '../../common/services/pinecone.service';
import { ChunkerService } from '../../common/services/chunker.service';
import { FileParserService } from '../../common/services/file-parser.service';

@Module({
  controllers: [KnowledgeController],
  providers: [
    KnowledgeService,
    GeminiService,
    PineconeService,
    ChunkerService,
    FileParserService,
  ],
  exports: [GeminiService, PineconeService],
})
export class KnowledgeModule {}