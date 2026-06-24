'use client';

import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function Navbar() {
  const router = useRouter();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          Gest Event
        </Typography>

        <Button
          color="inherit"
          onClick={() => router.push('/')}
        >
          Accueil
        </Button>

        <Button
          color="inherit"
          onClick={() => router.push('/creer-evenement')}
        >
          Créer un événement
        </Button>
      </Toolbar>
    </AppBar>
  );
}