'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type EventData = {
  id: string;
  title: string;
  description: string | null;

  location: string;
  eventDate: string;

  capacity: number;

  organizerName: string;
  organizerEmail: string;
  organizerPhone: string | null;

  approvedCount: number;
};

export default function InscriptionPage() {
  const params = useParams();

  const eventId = params.id as string;

  const [event, setEvent] = useState<EventData | null>(null);

  const [loadingEvent, setLoadingEvent] =
    useState(true);

  const [loadingSubmit, setLoadingSubmit] =
    useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] =
    useState(false);

  const [participantCount, setParticipantCount] =
    useState(0);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
  });

  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      try {
        const response = await fetch(
          `/api/events/${eventId}`
        );

        if (!response.ok) {
          throw new Error();
        }

        const data = await response.json();

        setEvent(data);

        setParticipantCount(
          data.approvedCount ?? 0
        );
      } catch {
        setEvent(null);
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!event) return;

    setError('');
    setLoadingSubmit(true);

    try {
      if (
        participantCount >= event.capacity
      ) {
        throw new Error(
          'Le nombre maximum de participants est atteint.'
        );
      }

      const response = await fetch(
        '/api/participants',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            eventId,

            firstName: form.prenom,
            lastName: form.nom,

            phone: form.telephone,

            email:
              form.email.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.error ||
            "Erreur d'inscription"
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue'
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingEvent) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 8,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!event) {
    return (
      <Container
        maxWidth="sm"
        sx={{ py: 6 }}
      >
        <Alert severity="error">
          Événement introuvable ou lien
          invalide.
        </Alert>
      </Container>
    );
  }

  if (success) {
    return (
      <Container
        maxWidth="sm"
        sx={{ py: 6 }}
      >
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 2,
            }}
          />

          <Typography
            variant="h5"
            gutterBottom
          >
            Demande enregistrée !
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Votre demande
            d&apos;inscription a été
            enregistrée.
          </Typography>

          <Chip
            label="STATUT : EN ATTENTE"
            color="warning"
          />
        </Box>
      </Container>
    );
  }

  const isFull =
    participantCount >= event.capacity;

  const formattedDate =
    new Date(
      event.eventDate
    ).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Paris',
    });

  const formattedTime =
    new Date(
      event.eventDate
    ).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Paris',
    });

  return (
    <Container
      maxWidth="sm"
      sx={{ py: 6 }}
    >
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            {event.title}
          </Typography>

          {event.description && (
            <Typography
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {event.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid
            container
            spacing={2}
          >
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CalendarMonthIcon
                  fontSize="small"
                  color="primary"
                />

                <Typography variant="body2">
                  {formattedDate}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <AccessTimeIcon
                  fontSize="small"
                  color="primary"
                />

                <Typography variant="body2">
                  {formattedTime}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <LocationOnIcon
                  fontSize="small"
                  color="secondary"
                />

                <Typography variant="body2">
                  {event.location}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <PersonIcon
                  fontSize="small"
                  color="secondary"
                />

                <Typography variant="body2">
                  {event.organizerName}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {isFull && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          Désolé, le nombre maximum de
          participants est atteint.
        </Alert>
      )}

      {!isFull && (
        <>
          <Typography
            variant="h6"
            gutterBottom
          >
            Formulaire d&apos;inscription
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
              >
                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <TextField
                      label="Nom"
                      name="nom"
                      value={form.nom}
                      onChange={
                        handleChange
                      }
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <TextField
                      label="Prénom"
                      name="prenom"
                      value={form.prenom}
                      onChange={
                        handleChange
                      }
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="Téléphone"
                      name="telephone"
                      value={
                        form.telephone
                      }
                      onChange={
                        handleChange
                      }
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ mt: 3 }}
                  disabled={
                    loadingSubmit
                  }
                >
                  {loadingSubmit ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
}