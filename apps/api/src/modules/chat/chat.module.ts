import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GeminiService } from '../../common/services/gemini.service';
import { PineconeService } from '../../common/services/pinecone.service';
import { RateLimitService } from 'src/common/services/rate-limit.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, GeminiService, PineconeService,ChatService, RateLimitService],
})
export class ChatModule {}

