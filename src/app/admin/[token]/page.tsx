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

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

type Participant = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  email?: string | null;

  qrToken?: string | null;
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CHECKED_IN';
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

  const [qrDialogOpen, setQrDialogOpen] =
    useState(false);

  const [qrDataUrl, setQrDataUrl] =
    useState('');

  const [selectedParticipant,
    setSelectedParticipant] =
    useState<Participant | null>(null);

  const showQrCode = async (participant: Participant) => {
    const response = await fetch(`/api/participants/${participant.id}/qr`);
    const data = await response.json();

    setQrDataUrl(data.qrDataUrl);

    setSelectedParticipant(participant);

    setQrDialogOpen(true);
  };

  const downloadQr = () => {
    if (!qrDataUrl || !selectedParticipant) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    const safeName = (selectedParticipant.firstName || 'participant').replace(/[^a-z0-9_-]/gi, '_');
    link.download = `qr_${safeName}_${selectedParticipant.id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const shareWhatsApp = () => {
    if (!selectedParticipant || !event) return;
    const base = window.location.origin;
    const inscriptionUrl = `${base}/inscription/${event.id}`;
    const text = `QR pour ${selectedParticipant.firstName} ${selectedParticipant.lastName ?? ''} - ${event.title} \n${inscriptionUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const resendEmail = async () => {
    if (!selectedParticipant) return;
    try {
      const res = await fetch(`/api/admin/participants/${selectedParticipant.id}/resend`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de l\'envoi');
      }
      window.alert('Email renvoyé');
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Erreur');
    }
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
                  {
                    (() => {
                      switch (participant.status) {
                        case 'PENDING':
                          return (
                            <Stack direction="row" spacing={1}>
                              <Button
                                color="success"
                                variant="contained"
                                onClick={() =>
                                  approveParticipant(participant.id)
                                }
                              >
                                Approuver
                              </Button>

                              <Button
                                color="error"
                                variant="outlined"
                                onClick={() =>
                                  rejectParticipant(participant.id)
                                }
                              >
                                Refuser
                              </Button>
                            </Stack>
                          );

                        case 'APPROVED':
                        case 'CHECKED_IN':
                          return (
                            <Button variant="outlined" onClick={() => showQrCode(participant)}>
                              Voir QR
                            </Button>
                          );

                        default:
                          return null;
                      }
                    })()
                  }
                </Box>
              </CardContent>
            </Card>
          )
        )}
      </Stack>

      <Dialog
        open={qrDialogOpen}
        onClose={() =>
            setQrDialogOpen(false)
        }
        maxWidth="sm"
        fullWidth
        >
        <DialogTitle>
            QR Code Participant
        </DialogTitle>

        <DialogContent>
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 3,
            }}
            >
            {qrDataUrl && (
                <img
                src={qrDataUrl}
                alt="QR Code"
                width={300}
                height={300}
                />
            )}
            </Box>

            {selectedParticipant && (
            <Typography
                align="center"
            >
                {
                selectedParticipant.firstName
                }{' '}
                {
                selectedParticipant.lastName
                }
            </Typography>
            )}
            {selectedParticipant && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Button variant="contained" size="small" onClick={downloadQr}>
                  Télécharger QR
                </Button>
                <Button variant="outlined" size="small" onClick={shareWhatsApp}>
                  Partager WhatsApp
                </Button>
                <Button variant="outlined" size="small" onClick={resendEmail}>
                  Envoyer Email
                </Button>
              </Box>
            )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}