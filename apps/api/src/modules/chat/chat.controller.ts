import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Ip,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
import { Public } from '../auth/decorators/public.decorator';

// Chat endpoints are PUBLIC — called by the widget on customer websites
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // GET /api/v1/chat/config?apiKey=fpy_pub_xxx
  // Widget calls this first to get org settings
  @Public()
  @Get('config')
  async getConfig(@Query('apiKey') apiKey: string) {
    if (!apiKey) throw new UnauthorizedException('API key required');
    const config = await this.chatService.getConfig(apiKey);
    if (!config) throw new UnauthorizedException('Invalid API key');
    return config;
  }

  // POST /api/v1/chat/message
  // Widget sends messages here
  @Public()
  @Post('message')
  async chat(
    @Body() dto: ChatDto,
    @Headers('x-api-key') apiKey: string,
    @Ip() ip: string,
  ) {
    if (!apiKey) throw new UnauthorizedException('API key required');

    // Resolve org from API key
    const config = await this.chatService.getConfig(apiKey);
    if (!config) throw new UnauthorizedException('Invalid API key');

    return this.chatService.chat(config.orgId, dto, ip);
  }
}