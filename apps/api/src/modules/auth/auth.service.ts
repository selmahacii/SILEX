import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SystemRole, UserSessionPayload, DEMO_PROFILES } from '@silex/shared';
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

  private failedAttempts = new Map<string, { count: number; lockedUntil?: number }>();

  private recordFailedAttempt(email: string) {
    const current = this.failedAttempts.get(email) || { count: 0 };
    current.count += 1;
    if (current.count >= 5) {
      current.lockedUntil = Date.now() + 15 * 60 * 1000; // Verrouillage 15 minutes
    }
    this.failedAttempts.set(email, current);
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    // Validation stricte des paramètres d'entrée
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Protection anti-force brute : vérification de verrouillage
    const attempt = this.failedAttempts.get(normalizedEmail);
    if (attempt && attempt.lockedUntil && attempt.lockedUntil > Date.now()) {
      const remainingMinutes = Math.ceil((attempt.lockedUntil - Date.now()) / (60 * 1000));
      throw new HttpException(
        `Compte temporairement verrouillé suite à de multiples tentatives échouées. Réessayez dans ${remainingMinutes} minute(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        assignedProjects: {
          select: { project: { select: { code: true } } },
        },
      },
    });

    if (!user || !user.active) {
      this.recordFailedAttempt(normalizedEmail);
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const isMatch = await argon2.verify(user.passwordHash, password);
    if (!isMatch) {
      this.recordFailedAttempt(normalizedEmail);
      throw new UnauthorizedException('Identifiants invalides.');
    }

    // Réinitialisation des tentatives échouées en cas de succès
    this.failedAttempts.delete(normalizedEmail);

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

    const targetEmail = DEMO_PROFILES[targetRole]?.email;
    const demoUser = await this.prisma.user.findFirst({
      where: targetEmail ? { email: targetEmail } : { role: targetRole, active: true },
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
