import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifySuperAdminToken, getSuperAdminCookieValue } from '@/lib/superadmin';
import { v4 as uuidv4 } from 'uuid';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const cookieValue = await getSuperAdminCookieValue();
  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const { id } = await params;
  const participant = await prisma.participant.update({
    where: { id },
    data: {
      status: 'APPROVED',
      qrToken: uuidv4(),
    },
  });

  return NextResponse.json(participant);
}
