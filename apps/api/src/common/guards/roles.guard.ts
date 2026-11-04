import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserSessionPayload;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Le DIRECTEUR_GENERAL et l'ADMINISTRATEUR ont accès aux opérations d'administration et de supervision
    if (user.role === SystemRole.ADMINISTRATEUR || user.role === SystemRole.DIRECTEUR_GENERAL) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Accès refusé : votre rôle (${user.role}) ne dispose pas des droits requis pour cette opération.`,
      );
    }

    return true;
  }
}
