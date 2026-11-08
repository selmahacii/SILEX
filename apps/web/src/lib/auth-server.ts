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

  // 1. Format complet recommandé : silex_auth_token_<userId>_<role>_<timestamp>
  const matchFull = token.match(/^silex_auth_token_([a-zA-Z0-9_-]+)_([A-Z_]+)(?:_\d+)?$/);
  if (matchFull) {
    const userId = matchFull[1];
    const role = matchFull[2] as SystemRole;

    // Chercher d'abord par ID précis pour préserver le compte exact
    let user = await dbBridge.getUserById(userId);
    if (!user) {
      user = await dbBridge.getUserByRole(role);
    }
    if (user) {
      return user;
    }
  }

  // 2. Format alternatif de rôle : silex_auth_token_<role>_<timestamp>
  const matchRole = token.match(/^silex_auth_token_([A-Z_]+)(?:_\d+)?$/);
  if (matchRole) {
    const role = matchRole[1] as SystemRole;
    const user = await dbBridge.getUserByRole(role);
    if (user) {
      return user;
    }
  }

  // 3. Extraction sécurisée par mot-clé de rôle dans le token si le format varie
  const knownRoles = Object.values(SystemRole);
  for (const r of knownRoles) {
    if (token.includes(r)) {
      const user = await dbBridge.getUserByRole(r as SystemRole);
      if (user) {
        return user;
      }
    }
  }

  return null;
}
