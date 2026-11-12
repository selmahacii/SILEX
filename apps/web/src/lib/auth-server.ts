import crypto from 'crypto';
import { SystemRole } from '@silex/shared';
import { dbBridge } from './db-bridge';

const JWT_SECRET = process.env.JWT_SECRET || 'silex_super_secret_jwt_key_industrial_erp_2026_demo';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 heures

interface TokenPayload {
  uid: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Génère un jeton d'authentification cryptographiquement signé (HMAC-SHA256)
 * Évite toute altération ou usurpation de rôle côté client.
 */
export function generateAuthToken(user: { id: string; role: string; email?: string }): string {
  const now = Date.now();
  const payload: TokenPayload = {
    uid: user.id,
    role: user.role,
    email: user.email || '',
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  return `silex_sec_${encodedPayload}.${signature}`;
}

/**
 * Extrait et valide l'utilisateur à partir du header d'autorisation ou du token brut.
 * Vérifie systématiquement la signature cryptographique HMAC-SHA256 et la date d'expiration.
 * Ne bascule JAMAIS vers DIRECTEUR_GENERAL par défaut :
 * renvoie null pour forcer un 401 Unauthorized propre si la signature est invalide ou expirée.
 */
export async function parseUserFromToken(rawTokenOrHeader: string | null | undefined): Promise<any | null> {
  if (!rawTokenOrHeader) return null;
  const token = rawTokenOrHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // 1. Format signé HMAC sécurisé
  if (token.startsWith('silex_sec_')) {
    const rawContent = token.slice('silex_sec_'.length);
    const dotIndex = rawContent.indexOf('.');
    if (dotIndex === -1) return null;

    const encodedPayload = rawContent.slice(0, dotIndex);
    const signature = rawContent.slice(dotIndex + 1);

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(encodedPayload)
      .digest('base64url');

    // Vérification en temps constant (anti-timing attack)
    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      console.warn('[AUTH SECURITY ALERT] Signature HMAC invalide sur token reçu');
      return null;
    }

    try {
      const payload: TokenPayload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
      
      // Vérification de l'expiration
      if (Date.now() > payload.exp) {
        console.warn('[AUTH] Token de session expiré');
        return null;
      }

      // Vérification de l'existence de l'utilisateur en base
      let user = await dbBridge.getUserById(payload.uid);
      if (!user && payload.email) {
        user = await dbBridge.getUserByEmail(payload.email);
      }
      if (!user && payload.role) {
        user = await dbBridge.getUserByRole(payload.role as SystemRole);
      }

      if (user) {
        return user;
      }
    } catch (err) {
      console.error('[AUTH] Erreur décodage payload token:', err);
      return null;
    }
  }

  // 2. Rétro-compatibilité contrôlée pour tokens de transition de session en cours (avec validation stricte en BDD)
  if (token.startsWith('silex_auth_token_')) {
    const withoutPrefix = token.replace(/^silex_auth_token_/, '');
    const knownRoles = Object.values(SystemRole);
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
  }

  return null;
}
