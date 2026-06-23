import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params;

  return NextResponse.json({
    success: true,
    participantId: id,
    message: 'Fonction resend non implémentée',
  });
}