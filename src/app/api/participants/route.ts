import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      eventId,
      firstName,
      lastName,
      phone,
      email,
    } = body;

    if (
      !eventId ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      return NextResponse.json(
        {
          error: 'Données manquantes',
        },
        {
          status: 400,
        }
      );
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        participants: {
          select: {
            id: true,
            status: true,
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

    const approvedCount = event.participants.filter(
      (participant) =>
        participant.status === 'APPROVED' ||
        participant.status === 'CHECKED_IN'
    ).length;

    if (approvedCount >= event.capacity) {
      return NextResponse.json(
        {
          error:
            'Le nombre maximum de participants est atteint',
        },
        {
          status: 400,
        }
      );
    }

    const existingParticipant =
      await prisma.participant.findFirst({
        where: {
          eventId,
          phone,
        },
      });

    if (existingParticipant) {
      return NextResponse.json(
        {
          error:
            'Ce numéro est déjà inscrit à cet événement',
        },
        {
          status: 400,
        }
      );
    }

    const participant =
      await prisma.participant.create({
        data: {
          firstName,
          lastName,
          phone,
          email: email || null,

          status: 'PENDING',

          eventId,
        },
      });

    return NextResponse.json(
      {
        success: true,

        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
          status: participant.status,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Erreur lors de l'inscription",
      },
      {
        status: 500,
      }
    );
  }
}