import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';
import { generateAuthToken, parseUserFromToken } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body empty or invalid json
    }

    const email = (body.email || '').toLowerCase().trim();
    const role = (body.role || SystemRole.DIRECTEUR_GENERAL) as SystemRole;

    // Définition des utilisateurs cibles pour la démonstration client
    const roleEmailMap: Record<string, string> = {
      [SystemRole.DIRECTEUR_GENERAL]: 'dg@silex-services.dz',
      [SystemRole.RESPONSABLE_PROJET]: 'projets@silex-services.dz',
      [SystemRole.RESPONSABLE_ACHATS]: 'achats@silex-services.dz',
      [SystemRole.RESPONSABLE_RH]: 'rh@silex-services.dz',
      [SystemRole.RESPONSABLE_FINANCIER]: 'finance@silex-services.dz',
      [SystemRole.RESPONSABLE_MAGASIN]: 'magasin@silex-services.dz',
      [SystemRole.RESPONSABLE_MAINTENANCE]: 'maintenance@silex-services.dz',
      [SystemRole.RESPONSABLE_QUALITE]: 'qualite@silex-services.dz',
      [SystemRole.ADMINISTRATEUR]: 'admin@silex-services.dz',
    };

    let targetUser: any = null;
    if (email) {
      targetUser = await dbBridge.getUserByEmail(email);
    }
    if (!targetUser) {
      const mappedEmail = roleEmailMap[role];
      if (mappedEmail) {
        targetUser = await dbBridge.getUserByEmail(mappedEmail);
      }
    }
    if (!targetUser) {
      targetUser = await dbBridge.getUserByRole(role);
    }

    // Si l'utilisateur n'existe pas encore en base, initialiser un profil propre conforme
    if (!targetUser) {
      targetUser = {
        id: `usr-demo-${role.toLowerCase().replace(/_/g, '-')}`,
        email: email || roleEmailMap[role] || `${role.toLowerCase()}@silex-services.dz`,
        name: role === SystemRole.DIRECTEUR_GENERAL ? 'Amine Benali' :
              role === SystemRole.RESPONSABLE_PROJET ? 'Karim Mansouri' :
              role === SystemRole.RESPONSABLE_ACHATS ? 'Farouk Brahimi' :
              role === SystemRole.RESPONSABLE_RH ? 'Sabrina Haddad' :
              role === SystemRole.RESPONSABLE_FINANCIER ? 'Réda Bouzid' : 'Collaborateur SILEX',
        role: role,
        title: role === SystemRole.DIRECTEUR_GENERAL ? 'Directeur Général' :
               role === SystemRole.RESPONSABLE_PROJET ? 'Chef de Projets Industriels' :
               role === SystemRole.RESPONSABLE_ACHATS ? 'Responsable Achats & Logistique' :
               role === SystemRole.RESPONSABLE_RH ? 'Responsable Ressources Humaines' :
               role === SystemRole.RESPONSABLE_FINANCIER ? 'Directeur Financier' : 'Responsable Métier',
        departmentCode: role === SystemRole.DIRECTEUR_GENERAL ? 'DIRECTION_GENERALE' :
                        role === SystemRole.RESPONSABLE_PROJET ? 'OPERATIONS_PROJETS' :
                        role === SystemRole.RESPONSABLE_ACHATS ? 'ACHATS_LOGISTIQUE' :
                        role === SystemRole.RESPONSABLE_RH ? 'RESSOURCES_HUMAINES' :
                        role === SystemRole.RESPONSABLE_FINANCIER ? 'FINANCE_COMPTABILITE' : 'OPERATIONS_PROJETS',
        active: true,
      };
    }

    const token = generateAuthToken(targetUser);
    const payload = {
      accessToken: token,
      token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        departmentCode: targetUser.departmentCode,
        title: targetUser.title,
        avatarUrl: targetUser.avatarUrl,
      },
    };

    const res = NextResponse.json(payload, { status: 200, headers: corsHeaders() });
    res.cookies.set('silex_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 7,
    });

    return res;
  } catch (error: any) {
    console.error('[API] Erreur basculement rôle démo :', error);
    return NextResponse.json(
      { error: 'Erreur interne lors du basculement de profil.', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
