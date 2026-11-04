import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload, ProjectStatus, ServiceOrderType, ServiceOrderStatus, WorkSituationStatus } from '@silex/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(user: UserSessionPayload, filters?: { status?: ProjectStatus; sector?: any }) {
    const where: Prisma.ProjectWhereInput = {};

    // Restriction chef de projet
    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      where.assignedUsers = {
        some: { userId: user.userId },
      };
    }

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.sector) {
      where.sector = filters.sector;
    }

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            milestones: true,
            purchaseRequests: true,
            serviceOrders: true,
            nonConformities: true,
          },
        },
      },
    });
  }

  async findByCode(code: string, user: UserSessionPayload) {
    const project = await this.prisma.project.findFirst({
      where: { OR: [{ code }, { id: code }] },
      include: {
        manager: {
          select: { id: true, name: true, email: true, title: true },
        },
        milestones: {
          orderBy: { orderIndex: 'asc' },
          include: { tasks: true },
        },
        serviceOrders: {
          orderBy: { issueDate: 'desc' },
        },
        workSituations: {
          orderBy: { createdAt: 'desc' },
        },
        purchaseRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: { select: { id: true, name: true } },
            lines: { include: { item: true } },
          },
        },
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          include: {
            supplier: true,
            lines: { include: { item: true } },
          },
        },
        allocations: {
          orderBy: { allocatedAt: 'desc' },
          include: { item: true, warehouse: true },
        },
        costEntries: {
          orderBy: { recordedAt: 'desc' },
        },
        documents: {
          orderBy: { issueDate: 'desc' },
        },
        nonConformities: {
          orderBy: { detectedDate: 'desc' },
          include: { actions: true },
        },
        assignedUsers: {
          include: { user: { select: { id: true, name: true, role: true, email: true } } },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Projet introuvable (${code}).`);
    }

    // Vérification d'accès si responsable projet
    if (user.role === SystemRole.RESPONSABLE_PROJET) {
      const isAssigned = project.assignedUsers.some(a => a.userId === user.userId);
      if (!isAssigned) {
        throw new ForbiddenException(`Vous n'avez pas l'autorisation d'accéder au projet ${project.code}.`);
      }
    }

    return project;
  }

  async getExecutiveKPIs() {
    const projects = await this.prisma.project.findMany();

    const activeCount = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const completedCount = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const delayedCount = projects.filter(p => {
      const isPast = new Date(p.contractEndDate) < new Date();
      return isPast && p.status === ProjectStatus.IN_PROGRESS;
    }).length;

    let totalTurnover = new Prisma.Decimal(0);
    let totalBudgets = new Prisma.Decimal(0);
    let totalCommitted = new Prisma.Decimal(0);
    let totalActual = new Prisma.Decimal(0);

    for (const p of projects) {
      totalTurnover = totalTurnover.plus(p.contractAmount);
      totalBudgets = totalBudgets.plus(p.budgetAmount);
      totalCommitted = totalCommitted.plus(p.committedCost);
      totalActual = totalActual.plus(p.actualCost);
    }

    const pendingApprovalsCount = await this.prisma.purchaseRequest.count({
      where: { status: 'PENDING_APPROVAL' },
    });

    const marginRate = totalTurnover.gt(0)
      ? totalTurnover.minus(totalBudgets).dividedBy(totalTurnover).times(100).toNumber()
      : 0;

    return {
      activeProjectsCount: activeCount,
      completedProjectsCount: completedCount,
      delayedProjectsCount: delayedCount,
      totalTurnover: totalTurnover.toString(),
      totalProjectBudgets: totalBudgets.toString(),
      totalCommittedCosts: totalCommitted.toString(),
      totalActualCosts: totalActual.toString(),
      projectedMarginRate: Math.round(marginRate * 10) / 10,
      clientReceivables: '14200000.00',
      supplierPayables: '8650000.00',
      monthlyExpenditure: '12400000.00',
      pendingApprovalsCount,
    };
  }

  async createServiceOrder(
    projectId: string,
    dto: { type: ServiceOrderType; issueDate: string; description: string; delayImpactDays?: number; costImpactAmount?: number },
    user: UserSessionPayload,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const count = await this.prisma.serviceOrder.count({ where: { projectId } });
    const orderNumber = `ODS-${project.code}-${String(count + 1).padStart(2, '0')}`;

    const ods = await this.prisma.serviceOrder.create({
      data: {
        orderNumber,
        projectId,
        type: dto.type,
        issueDate: new Date(dto.issueDate),
        description: dto.description,
        delayImpactDays: dto.delayImpactDays || 0,
        costImpactAmount: dto.costImpactAmount || 0,
        status: ServiceOrderStatus.ACCEPTED,
      },
    });

    await this.auditService.logAction({
      entityName: 'SERVICE_ORDER',
      entityId: ods.id,
      action: 'CREATE_ODS',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Émission de l'ODS ${ods.orderNumber} (${dto.type}) sur le projet ${project.code}.`,
    });

    return ods;
  }

  async createWorkSituation(
    projectId: string,
    dto: { periodStart: string; periodEnd: string; amountHT: number; notes?: string },
    user: UserSessionPayload,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const count = await this.prisma.workSituation.count({ where: { projectId } });
    const situationNumber = `SIT-${project.code}-${String(count + 1).padStart(2, '0')}`;

    // Calcul cumulé
    const previousSituations = await this.prisma.workSituation.findMany({
      where: { projectId },
    });
    let cumulative = new Prisma.Decimal(dto.amountHT);
    for (const s of previousSituations) {
      cumulative = cumulative.plus(s.amountHT);
    }

    const situation = await this.prisma.workSituation.create({
      data: {
        situationNumber,
        projectId,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        amountHT: dto.amountHT,
        cumulativeAmountHT: cumulative,
        status: WorkSituationStatus.SUBMITTED,
        submittedAt: new Date(),
        notes: dto.notes,
      },
    });

    await this.auditService.logAction({
      entityName: 'WORK_SITUATION',
      entityId: situation.id,
      action: 'CREATE_SITUATION',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création de la situation de travaux ${situationNumber} d'un montant de ${dto.amountHT} DA.`,
    });

    return situation;
  }
}
