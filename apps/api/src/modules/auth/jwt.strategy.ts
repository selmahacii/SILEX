import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserSessionPayload } from '@silex/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'silex_super_secret_jwt_key_industrial_erp_2026_demo',
    });
  }

  async validate(payload: UserSessionPayload): Promise<UserSessionPayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        assignedProjects: {
          select: { project: { select: { code: true } } },
        },
      },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Compte utilisateur inactif ou introuvable.');
    }

    const assignedProjectCodes = user.assignedProjects.map(p => p.project.code);

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      departmentCode: user.departmentCode as any,
      assignedProjectCodes,
      permissions: payload.permissions || [],
    };
  }
}
