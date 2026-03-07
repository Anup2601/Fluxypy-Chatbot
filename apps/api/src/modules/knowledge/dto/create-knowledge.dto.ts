import {
  IsString,
  IsEnum,
  IsOptional,
  IsUrl,
  MinLength,
} from 'class-validator';

export enum SourceType {
  PDF = 'PDF',
  DOCX = 'DOCX',
  TEXT = 'TEXT',
  URL = 'URL',
  FAQ = 'FAQ',
}

export class CreateKnowledgeDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(SourceType)
  type: SourceType;

  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  textContent?: string;
}