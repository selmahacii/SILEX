import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SystemRole } from '@silex/shared';

export interface CreateAuditEntryParams {
  entityName: string;
  entityId: string;
  action: string;
  performerId: string;
  performerName: string;
  performerRole: SystemRole;
  description: string;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(params: CreateAuditEntryParams) {
    return this.prisma.auditLog.create({
      data: {
        entityName: params.entityName,
        entityId: params.entityId,
        action: params.action,
        performerId: params.performerId,
        performerName: params.performerName,
        performerRole: params.performerRole,
        description: params.description,
        beforeState: params.beforeState ? JSON.stringify(params.beforeState) : null,
        afterState: params.afterState ? JSON.stringify(params.afterState) : null,
        ipAddress: params.ipAddress,
      },
    });
  }

  async getRecentLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        performer: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}
