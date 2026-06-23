import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifySuperAdminToken, getSuperAdminCookieValue } from '@/lib/superadmin';

export async function GET() {
  const cookieValue = await getSuperAdminCookieValue();

  if (!verifySuperAdminToken(cookieValue)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }

  const events = await prisma.event.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return NextResponse.json(events);
}
