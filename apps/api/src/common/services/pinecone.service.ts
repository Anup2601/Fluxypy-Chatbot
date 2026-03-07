import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    orgId: string;
    sourceId: string;
    sourceName: string;
    sourceType: string;
    content: string;
    chunkIndex: number;
  };
}

@Injectable()
export class PineconeService implements OnModuleInit {
  private readonly logger = new Logger(PineconeService.name);
  private client: Pinecone;
  private indexName: string;

  constructor(private config: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.config.get<string>('PINECONE_API_KEY');
    this.indexName = this.config.get<string>('PINECONE_INDEX') || '';

    if (!apiKey || !this.indexName) {
      throw new Error(
        'PINECONE_API_KEY or PINECONE_INDEX not set in .env',
      );
    }

    this.client = new Pinecone({ apiKey });
    this.logger.log('✅ Pinecone connected');
  }

  // Store vectors — each org gets its own namespace
  async upsertVectors(
    orgId: string,
    vectors: VectorRecord[],
  ): Promise<void> {
    const index = this.client.index(this.indexName);
    const namespace = index.namespace(`org_${orgId}`);

    // Upsert in batches of 100
    for (let i = 0; i < vectors.length; i += 100) {
      const batch = vectors.slice(i, i + 100);

      // ✅ Pinecone v7 requires { records: [...] }
      await namespace.upsert({
        records: batch.map((v) => ({
          id: v.id,
          values: v.values,
          metadata: v.metadata,
        })),
      } as any);
    }

    this.logger.log(
      `Upserted ${vectors.length} vectors for org ${orgId}`,
    );
  }

  // Search for similar vectors — ONLY within org's namespace
  async search(
    orgId: string,
    queryVector: number[],
    topK: number = 5,
  ): Promise<any[]> {
    const index = this.client.index(this.indexName);
    const namespace = index.namespace(`org_${orgId}`);

    const results = await namespace.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });

    return results.matches || [];
  }

  // Delete all vectors for a specific source
  // ✅ Fix: use filter with correct Pinecone v3 syntax
  async deleteBySource(orgId: string, sourceId: string): Promise<void> {
    try {
      const index = this.client.index(this.indexName);
      const namespace = index.namespace(`org_${orgId}`);

      // Pinecone v3 deleteMany uses filter object
      await namespace.deleteMany({
        filter: { sourceId: { $eq: sourceId } },
      } as any);

      this.logger.log(
        `Deleted vectors for source ${sourceId} in org ${orgId}`,
      );
    } catch (error) {
      // Log but don't throw — deletion is best-effort
      this.logger.warn(`Could not delete vectors: ${error.message}`);
    }
  }

  // Delete ALL vectors for an org
  async deleteOrgNamespace(orgId: string): Promise<void> {
    try {
      const index = this.client.index(this.indexName);
      const namespace = index.namespace(`org_${orgId}`);
      await namespace.deleteAll();
    } catch (error) {
      this.logger.warn(`Could not delete namespace: ${error.message}`);
    }
  }
}