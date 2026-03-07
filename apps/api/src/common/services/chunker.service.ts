import { Injectable } from '@nestjs/common';

export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenEstimate: number;
}

@Injectable()
export class ChunkerService {
  private readonly CHUNK_SIZE = 500;    // target words per chunk
  private readonly CHUNK_OVERLAP = 50;  // overlapping words

  // Main chunking function
  chunkText(text: string): TextChunk[] {
    // 1. Clean the text
    const cleaned = this.cleanText(text);

    // 2. Split into sentences
    const sentences = this.splitIntoSentences(cleaned);

    // 3. Group sentences into chunks
    const chunks = this.groupIntoChunks(sentences);

    return chunks.map((content, index) => ({
      content,
      chunkIndex: index,
      tokenEstimate: Math.ceil(content.split(' ').length * 1.3),
    }));
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')   // max 2 newlines
      .replace(/[ \t]{2,}/g, ' ')   // multiple spaces → one
      .replace(/[^\x20-\x7E\n]/g, ' ') // remove non-ASCII
      .trim();
  }

  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences
      .map((s) => s.trim())
      .filter((s) => s.length > 10); // remove tiny fragments
  }

  private groupIntoChunks(sentences: string[]): string[] {
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentWordCount = 0;

    for (const sentence of sentences) {
      const wordCount = sentence.split(' ').length;

      if (
        currentWordCount + wordCount > this.CHUNK_SIZE &&
        currentChunk.length > 0
      ) {
        // Save current chunk
        chunks.push(currentChunk.join(' '));

        // Keep last few sentences for overlap
        const overlapSentences = this.getOverlapSentences(currentChunk);
        currentChunk = [...overlapSentences, sentence];
        currentWordCount = currentChunk.join(' ').split(' ').length;
      } else {
        currentChunk.push(sentence);
        currentWordCount += wordCount;
      }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks.filter((c) => c.trim().length > 20);
  }

  private getOverlapSentences(sentences: string[]): string[] {
    let wordCount = 0;
    const overlap: string[] = [];

    for (let i = sentences.length - 1; i >= 0; i--) {
      wordCount += sentences[i].split(' ').length;
      overlap.unshift(sentences[i]);
      if (wordCount >= this.CHUNK_OVERLAP) break;
    }

    return overlap;
  }
}