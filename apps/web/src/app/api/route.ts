import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'SILEX ERP Demo Engine',
    version: '1.0.0',
    mode: 'autonomous',
    timestamp: new Date().toISOString(),
  });
}
