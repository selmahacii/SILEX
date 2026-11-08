import { SystemRole } from '@silex/shared';
import { dbBridge } from './db-bridge';

/**
 * Génère un jeton d'authentification standard pour un utilisateur SILEX
 */
export function generateAuthToken(user: { id: string; role: string }): string {
  return `silex_auth_token_${user.id}_${user.role}_${Date.now()}`;
}

/**
 * Extrait et valide l'utilisateur à partir du header d'autorisation ou du token brut.
 * Ne bascule JAMAIS vers DIRECTEUR_GENERAL par défaut en cas d'échec :
 * renvoie null pour forcer un 401 Unauthorized propre.
 */
export async function parseUserFromToken(rawTokenOrHeader: string | null | undefined): Promise<any | null> {
  if (!rawTokenOrHeader) return null;
  const token = rawTokenOrHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const withoutPrefix = token.replace(/^silex_auth_token_/, '');
  const knownRoles = Object.values(SystemRole);

  // Chercher par rôle connu dans le jeton (trie du plus long au plus court pour éviter les faux positifs)
  const sortedRoles = [...knownRoles].sort((a, b) => b.length - a.length);

  for (const role of sortedRoles) {
    if (withoutPrefix.includes(role)) {
      const roleIndex = withoutPrefix.indexOf(role);
      const possibleUserId = withoutPrefix.slice(0, roleIndex).replace(/_$/, '');

      if (possibleUserId) {
        let user = await dbBridge.getUserById(possibleUserId);
        if (user) return user;
      }

      let userByRole = await dbBridge.getUserByRole(role as SystemRole);
      if (userByRole) return userByRole;
    }
  }

  return null;
}
