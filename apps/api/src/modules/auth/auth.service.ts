import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import { AuthResponseDto } from '@silex/contracts';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  private getRolePermissions(role: SystemRole): string[] {
    switch (role) {
      case SystemRole.DIRECTEUR_GENERAL:
        return [
          'dashboard:read',
          'projects:read',
          'projects:validate',
          'procurement:read',
          'procurement:approve',
          'inventory:read',
          'finance:read',
          'hr:read',
          'fleet:read',
          'quality:read',
          'audit:read',
          'reports:export',
        ];
      case SystemRole.RESPONSABLE_PROJET:
        return [
          'dashboard:read',
          'projects:read',
          'projects:create',
          'projects:update',
          'procurement:read',
          'procurement:create',
          'inventory:read',
        ];
      case SystemRole.RESPONSABLE_ACHATS:
        return [
          'procurement:read',
          'procurement:create',
          'procurement:update',
          'procurement:approve',
          'inventory:read',
          'reports:read',
        ];
      case SystemRole.RESPONSABLE_MAGASIN:
        return [
          'inventory:read',
          'inventory:create',
          'inventory:update',
          'procurement:read',
        ];
      case SystemRole.RESPONSABLE_RH:
        return ['hr:read', 'hr:create', 'hr:update', 'hr:export'];
      case SystemRole.RESPONSABLE_FINANCIER:
        return [
          'finance:read',
          'finance:create',
          'finance:update',
          'finance:validate',
          'projects:read',
          'reports:export',
        ];
      case SystemRole.RESPONSABLE_MAINTENANCE:
        return ['fleet:read', 'fleet:create', 'fleet:update'];
      case SystemRole.RESPONSABLE_QUALITE:
        return ['quality:read', 'quality:create', 'quality:update', 'quality:validate'];
      case SystemRole.ADMINISTRATEUR:
        return ['admin:all', 'audit:read', 'audit:export', 'users:manage'];
      default:
        return ['dashboard:read'];
    }
  }

  async generateTokenForUser(user: {
    id: string;
    email: string;
    name: string;
    role: SystemRole;
    departmentCode: any;
    assignedProjects?: { project: { code: string } }[];
  }): Promise<AuthResponseDto> {
    const assignedProjectCodes = user.assignedProjects?.map(p => p.project.code) || [];
    const permissions = this.getRolePermissions(user.role);

    const payload: UserSessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentCode: user.departmentCode,
      assignedProjectCodes,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        departmentCode: user.departmentCode,
        assignedProjectCodes,
        permissions,
      },
    };
  }

  async login(email: string, password?: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        assignedProjects: {
          select: { project: { select: { code: true } } },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Identifiants invalides ou compte inactif.');
    }

    if (password) {
      const isMatch = await argon2.verify(user.passwordHash, password);
      if (!isMatch) {
        throw new UnauthorizedException('Identifiants invalides.');
      }
    }

    await this.auditService.logAction({
      entityName: 'USER',
      entityId: user.id,
      action: 'LOGIN',
      performerId: user.id,
      performerName: user.name,
      performerRole: user.role as any,
      description: `Connexion réussie au portail SILEX ERP pour ${user.name} (${user.role}).`,
    });

    return this.generateTokenForUser(user as any);
  }

  async switchDemoRole(targetRole: SystemRole): Promise<AuthResponseDto> {
    if (process.env.DEMO_MODE !== 'true') {
      throw new BadRequestException('Le mode démonstration est désactivé sur cet environnement.');
    }

    const demoUser = await this.prisma.user.findFirst({
      where: { role: targetRole, active: true },
      include: {
        assignedProjects: {
          select: { project: { select: { code: true } } },
        },
      },
    });

    if (!demoUser) {
      throw new NotFoundException(`Aucun compte de démonstration configuré pour le rôle ${targetRole}.`);
    }

    await this.auditService.logAction({
      entityName: 'DEMO',
      entityId: demoUser.id,
      action: 'DEMO_ROLE_SWITCH',
      performerId: demoUser.id,
      performerName: demoUser.name,
      performerRole: demoUser.role as any,
      description: `Commutation de profil démo vers ${demoUser.name} (${demoUser.role}).`,
    });

    return this.generateTokenForUser(demoUser as any);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        assignedProjects: {
          include: { project: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      role: user.role,
      departmentCode: user.departmentCode,
      departmentName: user.department?.name,
      avatarUrl: user.avatarUrl,
      assignedProjects: user.assignedProjects.map(p => ({
        id: p.project.id,
        code: p.project.code,
        name: p.project.name,
      })),
      permissions: this.getRolePermissions(user.role as any),
    };
  }
}
