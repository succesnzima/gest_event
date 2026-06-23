import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifySuperAdminToken, SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default async function SuperAdminEventsPage() {
  const cookieValue = (await cookies()).get(SUPERADMIN_COOKIE_NAME)?.value;
  if (!verifySuperAdminToken(cookieValue)) {
    redirect('/superadmin/login');
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      participants: {
        select: {
          id: true,
        },
      },
    },
  });

  return (
    <Container sx={{ py: 6 }} maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Événements</Typography>
        <Button href="/superadmin" variant="outlined">
          Retour
        </Button>
      </Box>

      <List>
        {events.map((event) => (
          <ListItem key={event.id} sx={{ borderBottom: '1px solid #e0e0e0' }}>
            <ListItemText
              primary={event.title}
              secondary={`Lieu: ${event.location} • Date: ${new Date(event.eventDate).toLocaleString('fr-FR')} • Participants: ${event.participants.length}`}
            />
            <Button href={`/superadmin/events/${event.id}`} variant="contained">
              Gérer
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}
