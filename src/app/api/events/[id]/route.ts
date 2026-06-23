import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Context
) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }

  const approvedCount =
    event.participants.filter(
      (p) => p.status === 'APPROVED'
    ).length;

  return NextResponse.json({
    ...event,
    approvedCount,
  });
}