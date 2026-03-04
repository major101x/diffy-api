import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Logger } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    if (!process.env.AIVEN_SSL_CERT_BASE64) {
      throw new Error('AIVEN_SSL_CERT_BASE64 is not defined');
    }
    const SSL_CERT = Buffer.from(
      process.env.AIVEN_SSL_CERT_BASE64,
      'base64',
    ).toString('utf-8');
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: SSL_CERT,
      },
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    const version = await this.$queryRaw<
      { version: string }[]
    >`SELECT VERSION();`;
    this.logger.log(version[0].version);
  }
}
