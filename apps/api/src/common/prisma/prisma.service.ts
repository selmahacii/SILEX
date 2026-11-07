import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      console.error('⚠️ [PrismaService] Impossible de se connecter immédiatement à la base de données PostgreSQL:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
