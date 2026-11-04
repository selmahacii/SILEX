import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserSessionPayload;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // La Direction Générale, les Finances et l'Administration ont une vue transverse sur tous les projets
    const unconstrainedRoles = [
      SystemRole.DIRECTEUR_GENERAL,
      SystemRole.ADMINISTRATEUR,
      SystemRole.RESPONSABLE_FINANCIER,
      SystemRole.RESPONSABLE_ACHATS,
      SystemRole.RESPONSABLE_MAGASIN,
      SystemRole.RESPONSABLE_QUALITE,
    ];

    if (unconstrainedRoles.includes(user.role)) {
      return true;
    }

    // Extraction du projectId ou code depuis les paramètres de route ou le corps de requête
    const projectId =
      request.params?.projectId ||
      request.params?.id ||
      request.body?.projectId ||
      request.query?.projectId;

    if (!projectId) {
      // Pas de filtre spécifique au niveau de la route
      return true;
    }

    // Vérifier si l'utilisateur est expressément affecté à ce projet
    const assignment = await this.prisma.userProjectAssignment.findFirst({
      where: {
        userId: user.userId,
        OR: [{ projectId: projectId }, { project: { code: projectId } }],
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        `Accès refusé : vous n'êtes pas affecté au projet spécifié (${projectId}).`,
      );
    }

    return true;
  }
}
