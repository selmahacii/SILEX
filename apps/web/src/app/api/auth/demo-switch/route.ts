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
    // 1. Règle de sécurité P0 : Interdiction formelle en production
    const isProduction = process.env.NODE_ENV === 'production';
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isProduction || !isDemoMode) {
      return NextResponse.json(
        {
          error: 'Le basculement direct de profil est strictement désactivé sur cet environnement de production.',
          code: 'SECURITY_DEMO_DISABLED',
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    // 2. Traçabilité de l'appelant
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const callingUser = await parseUserFromToken(authHeader);

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // body empty or invalid json
    }

    const email = (body.email || '').toLowerCase().trim();
    const role = (body.role || SystemRole.DIRECTEUR_GENERAL) as SystemRole;

    // Règle de sécurité SoD : Seul un ADMINISTRATEUR authentifié est habilité à utiliser l'impersonation en environnement de test
    if (!callingUser || callingUser.role !== SystemRole.ADMINISTRATEUR) {
      await dbBridge.logAudit(
        'UNAUTHORIZED_ROLE_SWITCH_ATTEMPT',
        'SECURITY_ALERT',
        callingUser?.id || 'anonymous',
        `Tentative non autorisée de basculement de profil vers ${role} par l'utilisateur ${callingUser?.email || 'visiteur non authentifié'} (rôle actuel: ${callingUser?.role || 'aucun'}). Action bloquée.`,
        callingUser
      );
      return NextResponse.json(
        {
          error: 'Accès refusé : Seul un Administrateur Système authentifié est habilité à basculer de profil en environnement de qualification.',
          code: 'FORBIDDEN_ROLE_SWITCH',
        },
        { status: 403, headers: corsHeaders() }
      );
    }

    let targetUser: any = null;
    if (email) {
      targetUser = await dbBridge.getUserByEmail(email);
    }
    if (!targetUser) {
      targetUser = await dbBridge.getUserByRole(role);
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: `Aucun compte de test configuré pour le rôle ${role}.`, code: 'USER_NOT_FOUND' },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Audit obligatoire de l'action de commutation en environnement de test
    await dbBridge.logAudit(
      'DEMO_ROLE_SWITCH',
      'SECURITY',
      targetUser.id,
      `Commutation de profil démo vers ${targetUser.name} (${targetUser.role}) demandée par ${callingUser?.email || 'visiteur de test'}.`,
      targetUser
    );

    const token = generateAuthToken(targetUser);
    const payload = {
      accessToken: token,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        departmentCode: targetUser.departmentCode,
        title: targetUser.title,
        avatarUrl: targetUser.avatarUrl || targetUser.avatar || null,
        assignedProjects: targetUser.assignedProjects || [],
        permissions: targetUser.role === SystemRole.DIRECTEUR_GENERAL || targetUser.role === SystemRole.ADMINISTRATEUR
          ? ['*']
          : ['READ', 'WRITE'],
      },
    };

    return NextResponse.json(payload, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    console.error('[API AUTH DEMO SWITCH ERROR]', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur interne bascule profil démo' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
