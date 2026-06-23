import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifySuperAdminToken, SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import EventManager from '@/components/superadmin/EventManager';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SuperAdminEventPage({ params }: PageProps) {
  const cookieValue = (await cookies()).get(SUPERADMIN_COOKIE_NAME)?.value;
  if (!verifySuperAdminToken(cookieValue)) {
    redirect('/superadmin/login');
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    redirect('/superadmin/events');
  }

  return (
    <Container sx={{ py: 6 }} maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Gérer l'événement</Typography>
        <Button href="/superadmin/events" variant="outlined">
          Retour
        </Button>
      </Box>

      <EventManager eventId={id} />
    </Container>
  );
}
