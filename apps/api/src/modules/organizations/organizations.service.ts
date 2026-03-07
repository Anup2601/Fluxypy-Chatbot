import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  generateApiKey(): string {
    return `fpy_pub_${crypto.randomBytes(16).toString('hex')}`;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 60);
  }

  async create(name: string) {
    let slug = this.generateSlug(name);
    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });
    if (existing) {
      slug = `${slug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return this.prisma.organization.create({
      data: {
        name,
        slug,
        apiKey: this.generateApiKey(),
        settings: {
          primaryColor: '#6366F1',
          welcomeMessage: 'Hi! How can Fluxypy Bot help you today? 🤖',
          botName: 'Fluxypy Bot',
          position: 'bottom-right',
          showBranding: true,
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.organization.findUnique({ where: { id } });
  }

  async findByApiKey(apiKey: string) {
    return this.prisma.organization.findUnique({ where: { apiKey } });
  }
}