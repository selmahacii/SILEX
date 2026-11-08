import { NextRequest, NextResponse } from 'next/server';
import { SystemRole } from '@silex/shared';
import { dbBridge } from '@/lib/db-bridge';

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const rawToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    let user: any = null;

    // 1. Tenter l'extraction avec id : silex_auth_token_<userId>_<role>_<timestamp>
    const matchFull = rawToken.match(/^silex_auth_token_([a-zA-Z0-9_-]+)_([A-Z_]+)_\d+$/);
    if (matchFull) {
      const userId = matchFull[1];
      const role = matchFull[2] as SystemRole;
      user = await dbBridge.getUserById(userId);
      if (!user) {
        user = await dbBridge.getUserByRole(role);
      }
    } else {
      // 2. Format historique : silex_auth_token_<role>_<timestamp>
      const matchRole = rawToken.match(/silex_auth_token_([A-Z_]+)/);
      const role = (matchRole ? matchRole[1] : SystemRole.DIRECTEUR_GENERAL) as SystemRole;
      user = await dbBridge.getUserByRole(role);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Session introuvable' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(user, { status: 200, headers: corsHeaders() });
  } catch (err: any) {
    console.error('[API AUTH ME ERROR]', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur session utilisateur' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
