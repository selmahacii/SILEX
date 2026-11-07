import { Injectable, ForbiddenException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, DepartmentCode, UserSessionPayload } from '@silex/shared';
import { CreateUserDto } from '@silex/contracts';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async listUsers(user: UserSessionPayload, page = 1, limit = 50) {
    const allowedRoles = [
      SystemRole.ADMINISTRATEUR,
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.RESPONSABLE_RH,
    ];

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Accès refusé : la consultation de la liste des utilisateurs est restreinte à la Direction et aux RH.',
      );
    }

    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        title: true,
        role: true,
        departmentCode: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        assignedProjects: {
          select: {
            project: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async resetDemoData(user: UserSessionPayload) {
    if (user.role !== SystemRole.ADMINISTRATEUR) {
      throw new ForbiddenException('Seul l’administrateur système peut réinitialiser les données de démonstration.');
    }

    if (process.env.DEMO_MODE !== 'true') {
      throw new ForbiddenException('La réinitialisation est strictement interdite hors du mode démonstration.');
    }

    // Réinitialisation transactionnelle des tables dynamiques
    await this.prisma.$transaction(async tx => {
      await tx.goodsReceiptLine.deleteMany();
      await tx.goodsReceipt.deleteMany();
      await tx.stockMovement.deleteMany();
      await tx.projectMaterialAllocation.deleteMany();
      await tx.projectCostEntry.deleteMany();
      await tx.supplierQuoteLine.deleteMany();
      await tx.supplierQuote.deleteMany();
      await tx.purchaseOrderLine.deleteMany();
      await tx.purchaseOrder.deleteMany();
      await tx.purchaseRequestLine.deleteMany();
      await tx.purchaseRequest.deleteMany();

      // Rétablir les stocks d'origine
      await tx.item.updateMany({
        where: { code: 'ART-001' },
        data: { currentStock: 25 },
      });

      // Rétablir les coûts du projet PRJ-2026-001
      await tx.project.updateMany({
        where: { code: 'PRJ-2026-001' },
        data: {
          committedCost: 24800000,
          actualCost: 19650000,
        },
      });
    });

    await this.auditService.logAction({
      entityName: 'SYSTEM',
      entityId: 'demo-reset',
      action: 'RESET_DEMO_DATA',
      performerId: user.userId,
      performerName: user.name,
      performerRole: user.role,
      description: `Réinitialisation complète des flux dynamiques de démonstration (DA, Commandes, Réceptions, Sorties).`,
    });

    return { success: true, message: 'Données de démonstration réinitialisées avec succès.' };
  }

  async createUser(dto: CreateUserDto, performer: UserSessionPayload) {
    const allowedRoles = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL];
    if (!allowedRoles.includes(performer.role)) {
      throw new ForbiddenException(
        'Accès refusé : la création de comptes utilisateurs est réservée à l’Administrateur Système et à la Direction Générale.',
      );
    }

    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Le nom complet de l’utilisateur est requis.');
    }

    if (!dto.email || !dto.email.includes('@')) {
      throw new BadRequestException('Une adresse email valide est requise.');
    }

    if (!dto.role || !Object.values(SystemRole).includes(dto.role)) {
      throw new BadRequestException('Un rôle système valide est requis.');
    }

    if (!dto.departmentCode || !Object.values(DepartmentCode).includes(dto.departmentCode)) {
      throw new BadRequestException('Un département valide est requis.');
    }

    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException(`Un utilisateur avec l’adresse "${normalizedEmail}" existe déjà.`);
    }

    const defaultTitle = dto.title?.trim() || this.getDefaultTitleForRole(dto.role);
    const password = dto.password && dto.password.trim().length >= 6 ? dto.password.trim() : 'SilexDemo2026!';
    const passwordHash = await argon2.hash(password);

    // Résolution du département
    let department = await this.prisma.department.findUnique({
      where: { code: dto.departmentCode },
    });

    if (!department) {
      department = await this.prisma.department.create({
        data: {
          code: dto.departmentCode,
          name: this.getDefaultDepartmentName(dto.departmentCode),
        },
      });
    }

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: normalizedEmail,
        title: defaultTitle,
        role: dto.role,
        departmentCode: dto.departmentCode,
        departmentId: department.id,
        passwordHash,
        active: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        title: true,
        role: true,
        departmentCode: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.logAction({
      entityName: 'USER',
      entityId: newUser.id,
      action: 'USER_CREATE',
      performerId: performer.userId,
      performerName: performer.name,
      performerRole: performer.role,
      description: `Création du compte utilisateur "${newUser.name}" (${newUser.email}) - Rôle: ${newUser.role}, Département: ${newUser.departmentCode}.`,
    });

    return newUser;
  }

  async updateUser(id: string, dto: any, performer: UserSessionPayload) {
    const allowedRoles = [SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL];
    if (!allowedRoles.includes(performer.role)) {
      throw new ForbiddenException(
        'Accès refusé : la mise à jour des comptes utilisateurs est réservée à l’Administrateur Système et à la Direction Générale.',
      );
    }

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`Utilisateur avec l'identifiant "${id}" introuvable.`);
    }

    const dataToUpdate: any = {};
    if (dto.name !== undefined && dto.name.trim()) dataToUpdate.name = dto.name.trim();
    if (dto.title !== undefined && dto.title.trim()) dataToUpdate.title = dto.title.trim();
    if (dto.role !== undefined && Object.values(SystemRole).includes(dto.role)) {
      dataToUpdate.role = dto.role;
    }
    if (dto.active !== undefined) {
      dataToUpdate.active = Boolean(dto.active);
    }

    if (dto.departmentCode !== undefined && Object.values(DepartmentCode).includes(dto.departmentCode)) {
      dataToUpdate.departmentCode = dto.departmentCode;
      let dept = await this.prisma.department.findUnique({ where: { code: dto.departmentCode } });
      if (!dept) {
        dept = await this.prisma.department.create({
          data: {
            code: dto.departmentCode,
            name: this.getDefaultDepartmentName(dto.departmentCode),
          },
        });
      }
      dataToUpdate.departmentId = dept.id;
    }

    if (dto.password && dto.password.trim().length >= 6) {
      dataToUpdate.passwordHash = await argon2.hash(dto.password.trim());
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        title: true,
        role: true,
        departmentCode: true,
        avatarUrl: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    await this.auditService.logAction({
      entityName: 'USER',
      entityId: updatedUser.id,
      action: 'USER_UPDATE',
      performerId: performer.userId,
      performerName: performer.name,
      performerRole: performer.role,
      description: `Mise à jour du profil utilisateur "${updatedUser.name}" (${updatedUser.email}) - Rôle: ${updatedUser.role}, Statut: ${updatedUser.active ? 'Actif' : 'Inactif'}.`,
    });

    return updatedUser;
  }

  private getDefaultTitleForRole(role: SystemRole): string {
    switch (role) {
      case SystemRole.DIRECTEUR_GENERAL:
        return 'Directeur Général';
      case SystemRole.RESPONSABLE_PROJET:
        return 'Chef de Projets Industriels';
      case SystemRole.RESPONSABLE_ACHATS:
        return 'Responsable Approvisionnements & Achats';
      case SystemRole.RESPONSABLE_MAGASIN:
        return 'Gestionnaire Magasin Central';
      case SystemRole.RESPONSABLE_RH:
        return 'Responsable RH & Compétences';
      case SystemRole.RESPONSABLE_FINANCIER:
        return 'Directeur Financier & Contrôle de Gestion';
      case SystemRole.RESPONSABLE_MAINTENANCE:
        return 'Responsable Matériel & Parc Engins';
      case SystemRole.RESPONSABLE_QUALITE:
        return 'Responsable Qualité & Sécurité QHSE';
      case SystemRole.ADMINISTRATEUR:
        return 'Administrateur Système ERP';
      default:
        return 'Collaborateur SILEX';
    }
  }

  private getDefaultDepartmentName(code: DepartmentCode): string {
    switch (code) {
      case DepartmentCode.DIRECTION_GENERALE:
        return 'Direction Générale';
      case DepartmentCode.OPERATIONS_PROJETS:
        return 'Opérations & Projets';
      case DepartmentCode.ACHATS_LOGISTIQUE:
        return 'Achats & Approvisionnements';
      case DepartmentCode.MAGASIN_STOCKS:
        return 'Magasins & Stocks';
      case DepartmentCode.RESSOURCES_HUMAINES:
        return 'Ressources Humaines';
      case DepartmentCode.FINANCE_COMPTABILITE:
        return 'Finance & Contrôle de Gestion';
      case DepartmentCode.PARC_MAINTENANCE:
        return 'Parc Matériel & Maintenance';
      case DepartmentCode.QHSE:
        return 'QHSE & Conformité';
      case DepartmentCode.INFORMATIQUE_ADMIN:
        return 'Informatique & Administration';
      default:
        return 'Administration Générale';
    }
  }
}
