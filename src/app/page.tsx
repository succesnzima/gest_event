'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import EventIcon from '@mui/icons-material/Event';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useRouter } from 'next/navigation';

const features = [
  {
    icon: <EventIcon fontSize="large" color="primary" />,
    title: 'Créez votre événement',
    desc: 'Configurez votre événement en quelques minutes, sans créer de compte.',
  },
  {
    icon: <PeopleIcon fontSize="large" color="secondary" />,
    title: 'Gérez les inscriptions',
    desc: 'Recevez, acceptez ou refusez les demandes depuis votre espace privé.',
  },
  {
    icon: <QrCodeIcon fontSize="large" sx={{ color: 'success.main' }} />,
    title: 'QR Code automatique',
    desc: 'Chaque participant accepté reçoit un QR Code unique et sécurisé.',
  },
  {
    icon: <SecurityIcon fontSize="large" sx={{ color: 'warning.main' }} />,
    title: "Contrôle d'accès",
    desc: 'Scannez les QR Codes avec un smartphone pour valider les entrées.',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565C0 0%, #00897B 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: 2,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Gérez vos événements avec des QR Codes
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontWeight: 400,
            }}
          >
            Plateforme simple et rapide pour organiser vos inscriptions et
            contrôler l&apos;accès de vos participants au Gabon.
          </Typography>

          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => router.push('/creer-evenement')}
            sx={{
              bgcolor: 'white',
              color: 'primary.dark',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            Créer un événement
          </Button>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Tout ce dont vous avez besoin
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid
              key={feature.title}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 1,
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>

                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            Prêt à commencer ?
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Créez votre premier événement gratuitement, sans inscription.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/creer-evenement')}
            sx={{
              px: 5,
              py: 1.5,
            }}
          >
            Créer mon événement
          </Button>
        </Box>
      </Container>
    </Box>
  );
}