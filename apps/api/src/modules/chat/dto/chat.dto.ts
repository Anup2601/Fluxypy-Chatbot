import { IsString, MinLength, IsOptional } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}