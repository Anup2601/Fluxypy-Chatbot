import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  async parseFile(filePath: string, mimeType: string): Promise<string> {
    const ext = path.extname(filePath).toLowerCase();
    this.logger.log(`Parsing file ext: ${ext}, mime: ${mimeType}`);

    try {
      if (ext === '.pdf' || mimeType === 'application/pdf') {
        return await this.parsePdf(filePath);
      } else if (
        ext === '.docx' ||
        mimeType?.includes('wordprocessingml')
      ) {
        return await this.parseDocx(filePath);
      } else {
        return this.parseTxt(filePath);
      }
    } catch (error) {
      this.logger.error(`Parse failed: ${error.message}`);
      throw error;
    }
  }

  private async parsePdf(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    this.logger.log(
      `PDF parsed: ${data.numpages} pages, ${data.text.length} chars`,
    );
    return data.text;
  }

  private async parseDocx(filePath: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    this.logger.log(`DOCX parsed: ${result.value.length} chars`);
    return result.value;
  }

  private parseTxt(filePath: string): string {
    const text = fs.readFileSync(filePath, 'utf-8');
    this.logger.log(`TXT parsed: ${text.length} chars`);
    return text;
  }
}
