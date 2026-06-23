import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { verifySuperAdminToken, SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin';

export default async function SuperAdminPage() {
  const cookieValue = (await cookies()).get(SUPERADMIN_COOKIE_NAME)?.value;

  if (!verifySuperAdminToken(cookieValue)) {
    redirect('/superadmin/login');
  }

  return (
    <Container sx={{ py: 6 }} maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Tableau de bord super-admin
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Vous êtes connecté en tant que superadministrateur. Vous pouvez gérer les événements et les participants.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button href="/superadmin/events" variant="contained">
          Voir les événements
        </Button>

        <Box component="form" action="/api/superadmin/logout" method="post">
          <Button type="submit" variant="outlined">
            Déconnexion
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
