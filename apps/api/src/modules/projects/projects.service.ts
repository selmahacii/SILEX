import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload, ProjectStatus, ServiceOrderType, ServiceOrderStatus, WorkSituationStatus, PurchaseRequestStatus } from '@silex/shared';
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

    const [pendingPRCount, pendingWSCount] = await Promise.all([
      this.prisma.purchaseRequest.count({
        where: {
          status: {
            in: [PurchaseRequestStatus.PENDING_APPROVAL, PurchaseRequestStatus.SUBMITTED],
          },
        },
      }),
      this.prisma.workSituation.count({
        where: {
          status: WorkSituationStatus.SUBMITTED,
        },
      }),
    ]);
    const pendingApprovalsCount = pendingPRCount + pendingWSCount;

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
    const orderNumber = (dto as any).orderNumber || `ODS-${project.code}-${String(count + 1).padStart(2, '0')}`;

    let resolvedType: any = dto.type;
    if (resolvedType === 'COMMENCEMENT' || resolvedType === 'START') resolvedType = ServiceOrderType.DEMARRAGE;
    else if (resolvedType === 'STOP' || resolvedType === 'SUSPENSION') resolvedType = ServiceOrderType.ARRET;
    else if (resolvedType === 'RESUME') resolvedType = ServiceOrderType.REPRISE;
    else if (!Object.values(ServiceOrderType).includes(resolvedType)) {
      resolvedType = ServiceOrderType.DEMARRAGE;
    }

    const rawDate = dto.issueDate || (dto as any).issuedDate || new Date();
    const parsedDate = isNaN(new Date(rawDate).getTime()) ? new Date() : new Date(rawDate);

    const ods = await this.prisma.serviceOrder.create({
      data: {
        orderNumber,
        projectId,
        type: resolvedType,
        issueDate: parsedDate,
        description: dto.description || 'Ordre de Service contractuel',
        delayImpactDays: Number(dto.delayImpactDays) || 0,
        costImpactAmount: Number(dto.costImpactAmount) || 0,
        status: ServiceOrderStatus.ACCEPTED,
      },
    });

    // Interconnexion : Mise à jour automatique des délais contractuels et avenants financiers du projet
    if (dto.delayImpactDays && dto.delayImpactDays !== 0) {
      const currentEnd = project.contractEndDate ? new Date(project.contractEndDate) : new Date();
      const newEnd = new Date(currentEnd.getTime() + dto.delayImpactDays * 24 * 60 * 60 * 1000);
      await this.prisma.project.update({
        where: { id: projectId },
        data: { contractEndDate: newEnd },
      });
    }

    if (dto.costImpactAmount && dto.costImpactAmount !== 0) {
      const currentContract = new Prisma.Decimal(project.contractAmount || 0);
      const newContract = currentContract.plus(new Prisma.Decimal(dto.costImpactAmount));
      await this.prisma.project.update({
        where: { id: projectId },
        data: { contractAmount: newContract },
      });
    }

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

  async updateWorkSituation(
    projectId: string,
    situationId: string,
    dto: { status?: WorkSituationStatus | string; notes?: string; rejectionReason?: string },
    user: UserSessionPayload,
  ) {
    const sit = await this.prisma.workSituation.findUnique({
      where: { id: situationId },
      include: { project: true },
    });
    if (!sit || sit.projectId !== projectId) {
      throw new NotFoundException('Situation de travaux introuvable');
    }

    let nextStatus = sit.status;
    let approvedAt = sit.approvedAt;
    let verifiedAt = sit.verifiedAt;

    if (dto.status) {
      const s = String(dto.status).toUpperCase();
      if (s.includes('APPROV') || s.includes('VAL')) {
        nextStatus = WorkSituationStatus.APPROVED;
        approvedAt = new Date();
      } else if (s.includes('REJECT') || s.includes('REFUS')) {
        nextStatus = WorkSituationStatus.REJECTED;
      } else if (s.includes('VERIF')) {
        nextStatus = WorkSituationStatus.VERIFIED;
        verifiedAt = new Date();
      } else if (s.includes('INVOIC') || s.includes('FACT')) {
        nextStatus = WorkSituationStatus.INVOICED;
      } else {
        nextStatus = WorkSituationStatus.SUBMITTED;
      }
    }

    const updatedNotes = dto.rejectionReason
      ? `${sit.notes || ''} [Arbitrage: ${dto.rejectionReason}]`.trim()
      : (dto.notes !== undefined ? dto.notes : sit.notes);

    const updated = await this.prisma.workSituation.update({
      where: { id: situationId },
      data: {
        status: nextStatus,
        notes: updatedNotes,
        approvedAt,
        verifiedAt,
      },
    });

    await this.auditService.logAction({
      entityName: 'WORK_SITUATION',
      entityId: updated.id,
      action: 'UPDATE_SITUATION_STATUS',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour situation ${updated.situationNumber} (Statut: ${updated.status}) sur le projet ${sit.project.code}. ${dto.rejectionReason ? 'Motif: ' + dto.rejectionReason : ''}`,
    });

    return updated;
  }

  async updateServiceOrder(
    projectId: string,
    orderId: string,
    dto: { status?: ServiceOrderStatus | string; clientSignatory?: string; notes?: string },
    user: UserSessionPayload,
  ) {
    const ods = await this.prisma.serviceOrder.findUnique({
      where: { id: orderId },
      include: { project: true },
    });
    if (!ods || ods.projectId !== projectId) {
      throw new NotFoundException('Ordre de service introuvable');
    }

    let nextStatus = ods.status;
    if (dto.status) {
      const s = String(dto.status).toUpperCase();
      if (s.includes('ACCEPT') || s.includes('SIGN')) {
        nextStatus = ServiceOrderStatus.ACCEPTED;
      } else if (s.includes('REJECT') || s.includes('CANCEL') || s.includes('ANNUL')) {
        nextStatus = ServiceOrderStatus.REJECTED;
      } else if (s.includes('ISSUE')) {
        nextStatus = ServiceOrderStatus.ISSUED;
      }
    }

    let updatedDesc = ods.description;
    if (dto.clientSignatory) {
      updatedDesc = `${ods.description} | Visa contradictoire client : Signé par ${dto.clientSignatory} le ${new Date().toLocaleDateString('fr-DZ')}`;
    }

    const updated = await this.prisma.serviceOrder.update({
      where: { id: orderId },
      data: {
        status: nextStatus,
        description: updatedDesc,
      },
    });

    await this.auditService.logAction({
      entityName: 'SERVICE_ORDER',
      entityId: updated.id,
      action: 'UPDATE_ODS_STATUS',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour ODS ${updated.orderNumber} (Statut: ${updated.status}) sur le projet ${ods.project.code}.`,
    });

    return updated;
  }

  async createProject(data: {
    code?: string;
    name: string;
    description: string;
    clientName: string;
    sector: any;
    managerId?: string;
    siteLocation: string;
    startDate: string | Date;
    contractEndDate: string | Date;
    contractAmount: number;
    budgetAmount: number;
  }, user: UserSessionPayload) {
    let managerId = data.managerId;
    if (!managerId) {
      const defaultManager = await this.prisma.user.findFirst({
        where: { role: { in: [SystemRole.RESPONSABLE_PROJET, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR] } },
      });
      managerId = defaultManager ? defaultManager.id : user.userId;
    }

    const count = await this.prisma.project.count();
    const code = data.code || `PRJ-2026-${String(count + 1).padStart(3, '0')}`;

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const contractEndDateRaw = data.contractEndDate || (data as any).endDate;
    const contractEndDate = contractEndDateRaw ? new Date(contractEndDateRaw) : new Date(Date.now() + 180 * 86400000);

    const project = await this.prisma.project.create({
      data: {
        code,
        name: data.name,
        description: data.description || data.name,
        clientName: data.clientName,
        sector: data.sector || 'AUTRE_INDUSTRIE',
        managerId,
        siteLocation: data.siteLocation || '',
        startDate,
        contractEndDate,
        contractAmount: data.contractAmount || 0,
        budgetAmount: data.budgetAmount || 0,
        status: ProjectStatus.IN_PROGRESS,
      },
    });

    await this.prisma.userProjectAssignment.create({
      data: {
        userId: user.userId,
        projectId: project.id,
      },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: project.id,
      action: 'CREATE_PROJECT',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création du nouveau projet industriel ${project.code} - ${project.name} pour le client ${project.clientName}.`,
    });

    return project;
  }

  async createMilestone(projectId: string, data: {
    title: string;
    description?: string;
    targetDate: string | Date;
  }, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const count = await this.prisma.projectMilestone.count({ where: { projectId } });

    const created = await this.prisma.projectMilestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description,
        targetDate: new Date(data.targetDate),
        orderIndex: count + 1,
        status: 'PENDING',
      },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT_MILESTONE',
      entityId: created.id,
      action: 'CREATE_MILESTONE',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Création du jalon "${created.title}" sur le projet ${project.code}.`,
    });

    return created;
  }

  async updateMilestone(
    projectId: string,
    milestoneId: string,
    data: { status?: string; completedDate?: string | Date; title?: string; description?: string; targetDate?: string | Date },
    user: UserSessionPayload,
  ) {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { project: true },
    });
    if (!milestone || milestone.projectId !== projectId) {
      throw new NotFoundException('Jalon introuvable pour ce projet');
    }

    const updated = await this.prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.completedDate !== undefined && { completedDate: data.completedDate ? new Date(data.completedDate) : null }),
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.targetDate && { targetDate: new Date(data.targetDate) }),
      },
    });

    // Interconnexion : Recalcul automatique de l'avancement physique du projet
    if (data.status === 'COMPLETED') {
      const allMilestones = await this.prisma.projectMilestone.findMany({ where: { projectId } });
      const completedCount = allMilestones.filter(m => m.id === milestoneId || m.status === 'COMPLETED').length;
      if (allMilestones.length > 0) {
        const calculatedProgress = Math.round((completedCount / allMilestones.length) * 100);
        await this.prisma.project.update({
          where: { id: projectId },
          data: { physicalProgress: calculatedProgress },
        });
      }
    }

    await this.auditService.logAction({
      entityName: 'PROJECT_MILESTONE',
      entityId: milestone.id,
      action: 'UPDATE_MILESTONE',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour du jalon "${updated.title}" (Statut: ${updated.status}) sur le projet ${milestone.project.code}.`,
    });

    return updated;
  }

  async updateProgress(projectId: string, data: {
    physicalProgress?: number;
    financialProgress?: number;
  }, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        physicalProgress: data.physicalProgress !== undefined ? data.physicalProgress : undefined,
        financialProgress: data.financialProgress !== undefined ? data.financialProgress : undefined,
      },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: project.id,
      action: 'UPDATE_PROGRESS',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour de l'avancement physique (${updated.physicalProgress}%) et financier (${updated.financialProgress}%) sur le projet ${project.code}.`,
    });

    return updated;
  }

  async updateContract(projectId: string, data: {
    contractAmount?: number;
    budgetAmount?: number;
    contractAmountDelta?: number;
    budgetAmountDelta?: number;
    contractEndDate?: Date | string;
    amendmentNote?: string;
    notes?: string;
  }, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const updateData: any = {};
    if (data.contractAmount !== undefined) {
      updateData.contractAmount = new Prisma.Decimal(data.contractAmount);
    } else if (data.contractAmountDelta !== undefined) {
      updateData.contractAmount = new Prisma.Decimal(Number(project.contractAmount || 0) + Number(data.contractAmountDelta));
    }

    if (data.budgetAmount !== undefined) {
      updateData.budgetAmount = new Prisma.Decimal(data.budgetAmount);
    } else if (data.budgetAmountDelta !== undefined) {
      updateData.budgetAmount = new Prisma.Decimal(Number(project.budgetAmount || 0) + Number(data.budgetAmountDelta));
    }

    if (data.contractEndDate !== undefined) updateData.contractEndDate = new Date(data.contractEndDate);
    const noteText = data.notes || data.amendmentNote;
    if (noteText) {
      updateData.description = `${project.description || ''} | Avenant (${new Date().toLocaleDateString('fr-DZ')}): ${noteText}`;
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: projectId,
      action: 'UPDATE_CONTRACT',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Avenant contractuel appliqué au projet ${project.code}. Nouveau montant contractuel: ${updated.contractAmount} DA.`,
    });

    return updated;
  }

  async updateProject(id: string, data: any, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.clientName !== undefined) updateData.clientName = data.clientName;
    if (data.sector !== undefined) updateData.sector = data.sector;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.riskLevel !== undefined) updateData.riskLevel = data.riskLevel;
    if (data.objectives !== undefined) updateData.objectives = data.objectives;
    if (data.contractAmount !== undefined) updateData.contractAmount = new Prisma.Decimal(data.contractAmount);
    if (data.budgetAmount !== undefined) updateData.budgetAmount = new Prisma.Decimal(data.budgetAmount);
    if (data.contractStartDate !== undefined) updateData.contractStartDate = new Date(data.contractStartDate);
    if (data.contractEndDate !== undefined) updateData.contractEndDate = new Date(data.contractEndDate);
    if (data.actualStartDate !== undefined) updateData.actualStartDate = data.actualStartDate ? new Date(data.actualStartDate) : null;
    if (data.actualEndDate !== undefined) updateData.actualEndDate = data.actualEndDate ? new Date(data.actualEndDate) : null;
    if (data.managerId !== undefined) updateData.managerId = data.managerId;

    const updated = await this.prisma.project.update({
      where: { id },
      data: updateData,
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: id,
      action: 'UPDATE_PROJECT',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Mise à jour des informations du projet ${project.code} (${updated.name}).`,
    });

    return updated;
  }

  async addProjectMember(projectId: string, userId: string, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const member = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!member) throw new NotFoundException('Utilisateur introuvable');

    const existing = await this.prisma.userProjectAssignment.findFirst({
      where: { projectId, userId },
    });
    if (existing) return existing;

    const created = await this.prisma.userProjectAssignment.create({
      data: { projectId, userId },
      include: { user: { select: { id: true, name: true, role: true, email: true, title: true } } },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: projectId,
      action: 'ADD_MEMBER',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Assignation de ${member.name} (${member.role}) au chantier ${project.code}.`,
    });

    return created;
  }

  async removeProjectMember(projectId: string, userId: string, user: UserSessionPayload) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    await this.prisma.userProjectAssignment.deleteMany({
      where: { projectId, userId },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: projectId,
      action: 'REMOVE_MEMBER',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Retrait du collaborateur du chantier ${project.code}.`,
    });

    return { success: true };
  }

  async addCostEntry(
    projectId: string,
    dto: { category: string; amount: number; description: string; sourceModule?: string },
    user: UserSessionPayload,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Projet introuvable');

    const costDecimal = new Prisma.Decimal(dto.amount);
    const entry = await this.prisma.projectCostEntry.create({
      data: {
        projectId,
        category: dto.category || 'AUTRE',
        amount: costDecimal,
        description: dto.description,
        sourceModule: dto.sourceModule || 'MANUAL',
      },
    });

    // Mettre à jour le coût réel du projet
    const newActualCost = new Prisma.Decimal(project.actualCost).plus(costDecimal);
    await this.prisma.project.update({
      where: { id: projectId },
      data: { actualCost: newActualCost },
    });

    await this.auditService.logAction({
      entityName: 'PROJECT',
      entityId: projectId,
      action: 'ADD_COST_ENTRY',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Imputation de frais chantier (${dto.category}): ${dto.amount} DA sur ${project.code}.`,
    });

    return entry;
  }
}
