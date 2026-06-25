'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CHECKED_IN';
  qrToken?: string | null;
};

type Event = {
  id: string;
  title: string;
  description?: string;
  location: string;
  capacity: number;
  participants: Participant[];
};

export default function AdminPage() {
  const params = useParams();

  const token =
    params.token as string;

  const [event, setEvent] =
    useState<Event | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const loadEvent = async () => {
    try {
      const response =
        await fetch(
          `/api/admin/${token}`
        );

      if (!response.ok) {
        throw new Error();
      }

      const data =
        await response.json();

      setEvent(data);
    } catch {
      setError(
        'Impossible de charger cet événement'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadEvent();
    }
  }, [token]);

  const approveParticipant =
    async (id: string) => {
      await fetch(
        `/api/admin/participants/${id}/approve`,
        {
          method: 'POST',
        }
      );

      loadEvent();
    };

  const rejectParticipant =
    async (id: string) => {
      await fetch(
        `/api/admin/participants/${id}/reject`,
        {
          method: 'POST',
        }
      );

      loadEvent();
    };

  const getBaseUrl = () =>
    typeof window !== 'undefined'
      ? window.location.origin
      : '';

  const getValidationUrl = (token: string) =>
    `${getBaseUrl()}/checkin/${token}`;

  const getEmailShareLink = (
    subject: string,
    body: string
  ) =>
    `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

  const getWhatsappShareLink = (text: string) =>
    `https://wa.me/?text=${encodeURIComponent(
      text
    )}`;

  const shareByEmail = (
    subject: string,
    body: string
  ) => {
    window.location.href = getEmailShareLink(
      subject,
      body
    );
  };

  const shareByWhatsapp = (text: string) => {
    window.open(getWhatsappShareLink(text), '_blank');
  };

  if (loading) {
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

  if (error || !event) {
    return (
      <Container
        maxWidth="md"
        sx={{ py: 6 }}
      >
        <Alert severity="error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{ py: 6 }}
    >
      <Typography
        variant="h4"
        gutterBottom
      >
        {event.title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        {event.description}
      </Typography>

      <Typography
        variant="h6"
        gutterBottom
      >
        Participants
      </Typography>

      <Stack spacing={2}>
        {event.participants.map(
          (participant) => (
            <Card
              key={participant.id}
            >
              <CardContent>
                <Typography
                  sx={{ fontWeight: 600 }}
                >
                  {
                    participant.firstName
                  }{' '}
                  {
                    participant.lastName
                  }
                </Typography>

                <Typography
                  variant="body2"
                >
                  {
                    participant.phone
                  }
                </Typography>

                <Typography
                  variant="body2"
                >
                  {participant.email}
                </Typography>

                <Divider
                  sx={{ my: 2 }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                  }}
                >
                  <Chip
                    label={
                      participant.status
                    }
                    color={
                      participant.status ===
                      'APPROVED'
                        ? 'success'
                        : participant.status ===
                            'REJECTED'
                          ? 'error'
                          : 'warning'
                    }
                  />

                  {participant.status ===
                    'PENDING' && (
                    <Stack
                      direction="row"
                      spacing={1}
                    >
                      <Button
                        color="success"
                        variant="contained"
                        onClick={() =>
                          approveParticipant(
                            participant.id
                          )
                        }
                      >
                        Approuver
                      </Button>

                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                          rejectParticipant(
                            participant.id
                          )
                        }
                      >
                        Refuser
                      </Button>
                    </Stack>
                  )}

                  {participant.status ===
                    'APPROVED' &&
                    participant.qrToken ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 2, flexWrap: 'wrap' }}
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        onClick={() =>
                          shareByEmail(
                            `Code QR de validation pour ${participant.firstName} ${participant.lastName}`,
                            `Bonjour ${participant.firstName},\n\nVoici votre code QR de validation pour l'entrée : ${getValidationUrl(
                              participant.qrToken
                            )}\n\nMerci !`
                          )
                        }
                      >
                        Mail
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<WhatsAppIcon />}
                        onClick={() =>
                          shareByWhatsapp(
                            `Bonjour ${participant.firstName}, voici votre code QR de validation pour l'entrée : ${getValidationUrl(
                              participant.qrToken
                            )}`
                          )
                        }
                      >
                        WhatsApp
                      </Button>
                    </Stack>
                  ) : participant.status === 'APPROVED' ? (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 2, display: 'block' }}
                    >
                      QR code non disponible.
                    </Typography>
                  ) : null}
                </Box>
              </CardContent>
            </Card>
          )
        )}
      </Stack>
    </Container>
  );
}