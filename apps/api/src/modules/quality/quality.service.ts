import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class QualityService {
  constructor(private prisma: PrismaService) {}

  async getDocuments() {
    return this.prisma.document.findMany({
      include: {
        project: { select: { id: true, code: true, name: true } },
      },
      orderBy: { issueDate: 'desc' },
    });
  }

  async getNonConformities() {
    return this.prisma.nonConformity.findMany({
      include: {
        project: { select: { id: true, code: true, name: true } },
        actions: true,
      },
      orderBy: { detectedDate: 'desc' },
    });
  }
}
