import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { token } = await params;

    const event = await prisma.event.findUnique({
      where: {
        adminToken: token,
      },
      include: {
        participants: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          error: 'Événement introuvable',
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: 'Erreur serveur',
      },
      {
        status: 500,
      }
    );
  }
}