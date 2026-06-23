import { prisma } from '@/lib/prisma';
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

  const participant =
    await prisma.participant.update({
      where: {
        id,
      },
      data: {
        status: 'REJECTED',
      },
    });

  return NextResponse.json(
    participant
  );
}