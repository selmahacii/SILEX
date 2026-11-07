import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DocumentCategory, NonConformitySeverity, NonConformityStatus } from '@prisma/client';

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

  async createDocument(data: {
    docNumber?: string;
    title: string;
    category?: DocumentCategory;
    projectId?: string;
    version?: string;
    author?: string;
    expiryDate?: Date;
    status?: string;
  }) {
    const count = await this.prisma.document.count();
    const docNumber = data.docNumber || `DOC-2026-${String(count + 1).padStart(3, '0')}`;
    const author = data.author || 'Direction Qualité SILEX';
    const category = data.category && Object.values(DocumentCategory).includes(data.category)
      ? data.category
      : DocumentCategory.PROCEDURE;

    return this.prisma.document.create({
      data: {
        docNumber,
        title: data.title,
        category,
        projectId: data.projectId || null,
        version: data.version || '1.0',
        author,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        status: data.status || 'VALIDE',
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
      },
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

  async createNonConformity(data: {
    ncNumber?: string;
    title: string;
    description: string;
    severity?: NonConformitySeverity | string;
    projectId?: string;
    detectedBy: string;
    rootCause?: string;
  }) {
    let ncNumber = data.ncNumber;
    if (!ncNumber) {
      const count = await this.prisma.nonConformity.count();
      ncNumber = `NC-2026-${String(count + 1).padStart(3, '0')}`;
    }
    const existing = await this.prisma.nonConformity.findUnique({ where: { ncNumber } });
    if (existing) {
      ncNumber = `${ncNumber}-${Date.now().toString().slice(-4)}`;
    }

    let severity: NonConformitySeverity = NonConformitySeverity.MINEURE;
    if (data.severity) {
      const s = String(data.severity).toUpperCase();
      if (s.includes('CRIT')) severity = NonConformitySeverity.CRITIQUE;
      else if (s.includes('MAJ') || s.includes('HIGH')) severity = NonConformitySeverity.MAJEURE;
      else severity = NonConformitySeverity.MINEURE;
    }

    return this.prisma.nonConformity.create({
      data: {
        ncNumber,
        title: data.title,
        description: data.description,
        severity,
        projectId: data.projectId || null,
        detectedBy: data.detectedBy || 'Inspecteur Qualité SILEX',
        rootCause: data.rootCause || null,
        status: NonConformityStatus.OPEN,
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
        actions: true,
      },
    });
  }

  async updateNonConformityStatus(id: string, data: NonConformityStatus | string | { status: NonConformityStatus | string; resolutionNotes?: string; closeType?: string }) {
    const nc = await this.prisma.nonConformity.findUnique({ where: { id } });
    if (!nc) throw new NotFoundException('Fiche de non-conformité introuvable');

    const statusInput = typeof data === 'object' && data !== null && 'status' in data ? data.status : data;
    let status: NonConformityStatus = NonConformityStatus.OPEN;
    const s = String(statusInput).toUpperCase();
    if (s.includes('CLOSE') || s.includes('CLOT')) status = NonConformityStatus.CLOSED;
    else if (s.includes('INVEST') || s.includes('PROG')) status = NonConformityStatus.UNDER_INVESTIGATION;
    else if (s.includes('CORR') || s.includes('PEND')) status = NonConformityStatus.CORRECTIVE_ACTION_PENDING;
    else status = NonConformityStatus.OPEN;

    let updatedRootCause = nc.rootCause;
    if (typeof data === 'object' && data !== null && data.resolutionNotes) {
      updatedRootCause = `${nc.rootCause ? nc.rootCause + ' | ' : ''}Résolution (${data.closeType || 'Visa Qualité'} le ${new Date().toLocaleDateString('fr-DZ')}): ${data.resolutionNotes}`.trim();
    }

    return this.prisma.nonConformity.update({
      where: { id },
      data: {
        status,
        rootCause: updatedRootCause,
      },
      include: {
        project: { select: { id: true, code: true, name: true } },
        actions: true,
      },
    });
  }

  async addCorrectiveAction(nonConformityId: string, data: {
    description?: string;
    responsible: string;
    dueDate?: Date | string;
  }) {
    const nc = await this.prisma.nonConformity.findUnique({ where: { id: nonConformityId } });
    if (!nc) throw new NotFoundException('Fiche de non-conformité introuvable');

    const desc = data.description || (data as any).actionDescription || 'Action corrective de reprise';
    const dueDateRaw = data.dueDate || (data as any).targetDate;
    let dueDate = new Date(Date.now() + 7 * 86400000);
    if (dueDateRaw) {
      const parsed = new Date(dueDateRaw);
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed;
      }
    }

    const action = await this.prisma.correctiveAction.create({
      data: {
        nonConformityId,
        description: desc,
        responsible: data.responsible || 'Responsable QHSE',
        dueDate,
        status: 'IN_PROGRESS',
      },
    });

    await this.prisma.nonConformity.update({
      where: { id: nonConformityId },
      data: { status: NonConformityStatus.UNDER_INVESTIGATION },
    });

    return action;
  }

  async updateDocument(id: string, data: any) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document introuvable');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.author !== undefined) updateData.author = data.author;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;

    return this.prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateNonConformity(id: string, data: any) {
    const nc = await this.prisma.nonConformity.findUnique({ where: { id } });
    if (!nc) throw new NotFoundException('Fiche de non-conformité introuvable');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.detectedBy !== undefined) updateData.detectedBy = data.detectedBy;
    if (data.rootCause !== undefined) updateData.rootCause = data.rootCause;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.nonConformity.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, code: true, name: true } },
        actions: true,
      },
    });
  }
}
