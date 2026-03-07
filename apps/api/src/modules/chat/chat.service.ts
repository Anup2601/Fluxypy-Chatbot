import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeminiService } from '../../common/services/gemini.service';
import { PineconeService } from '../../common/services/pinecone.service';
import { ChatDto } from './dto/chat.dto';
import { v4 as uuidv4 } from 'uuid';
import { RateLimitService } from '../../common/services/rate-limit.service'

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private gemini: GeminiService,
    private pinecone: PineconeService,
    private rateLimit: RateLimitService, // ✅ ADD

  ) { }

  async chat(orgId: string, dto: ChatDto, visitorIp?: string) {
    const sessionId = dto.sessionId || uuidv4();
    const startTime = Date.now();

    // 1. Get or create conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: { sessionId, orgId },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { orgId, sessionId, visitorIp },
      });
    }

    // After getting/creating conversation — ADD THIS
    // Rate limit check
    await this.rateLimit.checkAndIncrement(orgId, 'api_call');

    // New conversation hogi toh visitor + conversation bhi count karo
    if (!conversation) {
      await this.rateLimit.checkAndIncrement(orgId, 'visitor');
      await this.rateLimit.checkAndIncrement(orgId, 'conversation');
    }

    // 2. Save user message
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        orgId,
        role: 'USER',
        content: dto.message,
      },
    });

    // 3. Get org settings for bot name/personality
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true, settings: true },
    });

    // 4. Get last 5 messages for context
    const recentMessages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const history = recentMessages
      .reverse()
      .slice(0, -1) // exclude current message
      .map((m) => ({ role: m.role, content: m.content }));

    // 5. Embed the user's question
    this.logger.log(`Embedding query: "${dto.message}"`);
    const queryEmbedding = await this.gemini.embedText(dto.message);

    // 6. Search Pinecone for relevant chunks (org-isolated)
    const searchResults = await this.pinecone.search(
      orgId,
      queryEmbedding,
      5,
    );

    // 7. Build context from retrieved chunks
    let context = '';
    const sources: any[] = [];

    if (searchResults.length > 0) {
      context = searchResults
        .filter((r) => r.score > 0.3) // only relevant results
        .map((r, i) => {
          sources.push({
            sourceName: r.metadata?.sourceName,
            score: r.score,
            chunkIndex: r.metadata?.chunkIndex,
          });
          return `[Source ${i + 1}: ${r.metadata?.sourceName}]\n${r.metadata?.content}`;
        })
        .join('\n\n');
    }

    // 8. Build system prompt
    const settings = org?.settings as any;
    const botName = settings?.botName || 'Fluxypy Bot';
    const systemPrompt = `You are ${botName}, a helpful AI assistant for ${org?.name}.

STRICT RULES:
1. Answer ONLY based on the provided context below.
2. If the answer is not in the context, say: "I don't have information about that. Please contact our support team directly."
3. Never make up facts, prices, or policies.
4. Never reveal you are powered by Google Gemini or any AI.
5. Be friendly, concise, and professional.
6. If asked who you are, say you are ${botName}.`;

    // 9. Generate response with Gemini
    this.logger.log('Generating response with Gemini...');
    let answer: string;

    if (!context || context.trim() === '') {
      answer = `I don't have enough information in my knowledge base to answer that question. Please contact our support team for assistance.`;
    } else {
      answer = await this.gemini.generateResponse(
        systemPrompt,
        dto.message,
        context,
        history,
      );
    }

    // 10. Calculate tokens used (estimate)
    const tokensUsed = Math.ceil(
      (dto.message.length + context.length + answer.length) / 4,
    );

    // 11. Save assistant response
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        orgId,
        role: 'ASSISTANT',
        content: answer,
        tokensUsed,
        sources,
      },
    });

    const responseTime = Date.now() - startTime;
    this.logger.log(`Response generated in ${responseTime}ms`);

    return {
      sessionId,
      message: answer,
      sources: sources.slice(0, 3),
      responseTime,
    };
  }

  // Get chat config for the widget
  async getConfig(apiKey: string) {
    const org = await this.prisma.organization.findUnique({
      where: { apiKey },
      select: {
        id: true,
        name: true,
        settings: true,
        status: true,
      },
    });

    if (!org || org.status !== 'ACTIVE') {
      return null;
    }

    return {
      orgId: org.id,
      orgName: org.name,
      settings: org.settings,
    };
  }
}