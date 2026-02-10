import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
      ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(join(process.cwd(), 'certs', 'ca.pem')).toString(),
      },
    });
    super({ adapter });
  }
}
