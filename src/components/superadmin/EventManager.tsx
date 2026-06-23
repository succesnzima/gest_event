'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  status: string;
};

type EventDetails = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  eventDate: string;
  capacity: number;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string | null;
  participants: Participant[];
};

type EventForm = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  capacity: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
};

type ParticipantForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

function toLocalDateTime(value: string) {
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function EventManager({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm | null>(null);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [participantForm, setParticipantForm] = useState<ParticipantForm>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const loadEvent = async () => {
    setError('');
    const response = await fetch(`/api/superadmin/events/${eventId}`);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Impossible de charger l\'événement');
      return;
    }
    const data = await response.json();
    setEvent(data);
  };

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event && !editingEvent) {
      setEventForm({
        title: event.title,
        description: event.description ?? '',
        location: event.location,
        eventDate: toLocalDateTime(event.eventDate),
        capacity: String(event.capacity),
        organizerName: event.organizerName,
        organizerEmail: event.organizerEmail,
        organizerPhone: event.organizerPhone ?? '',
      });
    }
  }, [event, editingEvent]);

  const handleAction = async (participantId: string, action: 'approve' | 'reject' | 'resend') => {
    setSuccess('');
    setError('');
    setLoading(true);
    const response = await fetch(`/api/superadmin/participants/${participantId}/${action}`, {
      method: 'POST',
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Erreur');
      return;
    }

    if (action === 'resend') {
      setSuccess('Email renvoyé.');
    } else {
      setSuccess(`Participant ${action} avec succès.`);
    }

    loadEvent();
  };

  const handleEventChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventForm((current) =>
      current ? { ...current, [event.target.name]: event.target.value } : current
    );
  };

  const saveEvent = async (eventSubmit: React.FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();
    if (!eventForm) return;

    setError('');
    setSuccess('');
    setLoading(true);

    const response = await fetch(`/api/superadmin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        eventDate: eventForm.eventDate,
        capacity: Number(eventForm.capacity),
        organizerName: eventForm.organizerName,
        organizerEmail: eventForm.organizerEmail,
        organizerPhone: eventForm.organizerPhone || null,
      }),
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Impossible de mettre à jour l\'événement');
      return;
    }

    setSuccess('Événement mis à jour.');
    setEditingEvent(false);
    loadEvent();
  };

  const deleteEvent = async () => {
    if (!confirm('Supprimer définitivement cet événement ?')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    const response = await fetch(`/api/superadmin/events/${eventId}`, {
      method: 'DELETE',
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Impossible de supprimer l\'événement');
      return;
    }

    router.push('/superadmin/events');
  };

  const startEditParticipant = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setParticipantForm({
      firstName: participant.firstName,
      lastName: participant.lastName,
      phone: participant.phone,
      email: participant.email ?? '',
    });
    setError('');
    setSuccess('');
  };

  const cancelParticipantEdit = () => {
    setEditingParticipantId(null);
    setParticipantForm({ firstName: '', lastName: '', phone: '', email: '' });
  };

  const handleParticipantChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const saveParticipant = async (participantId: string) => {
    if (!participantForm) return;

    setError('');
    setSuccess('');
    setLoading(true);

    const response = await fetch(`/api/superadmin/participants/${participantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantForm),
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Impossible de mettre à jour le participant');
      return;
    }

    setSuccess('Participant mis à jour.');
    setEditingParticipantId(null);
    loadEvent();
  };

  const deleteParticipant = async (participantId: string) => {
    if (!confirm('Supprimer définitivement ce participant ?')) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const response = await fetch(`/api/superadmin/participants/${participantId}`, {
      method: 'DELETE',
    });

    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || 'Impossible de supprimer le participant');
      return;
    }

    setSuccess('Participant supprimé.');
    loadEvent();
  };

  if (!event) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>{event.title}</Typography>
            <Typography>{event.description}</Typography>
            <Typography sx={{ mt: 2 }}>Lieu : {event.location}</Typography>
            <Typography>Date : {new Date(event.eventDate).toLocaleString('fr-FR')}</Typography>
            <Typography>Capacité : {event.capacity}</Typography>
            <Typography>Organisateur : {event.organizerName} ({event.organizerEmail})</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant={editingEvent ? 'outlined' : 'contained'}
              onClick={() => setEditingEvent((current) => !current)}
            >
              {editingEvent ? 'Annuler' : 'Modifier l\'événement'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={deleteEvent}
              disabled={loading}
            >
              Supprimer l\'événement
            </Button>
          </Box>
        </Box>

        {editingEvent && eventForm && (
          <Box component="form" onSubmit={saveEvent} sx={{ display: 'grid', gap: 2, mt: 3 }}>
            <TextField
              label="Titre"
              name="title"
              value={eventForm.title}
              onChange={handleEventChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={eventForm.description}
              onChange={handleEventChange}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Lieu"
              name="location"
              value={eventForm.location}
              onChange={handleEventChange}
              required
              fullWidth
            />
            <TextField
              label="Date et heure"
              name="eventDate"
              type="datetime-local"
              value={eventForm.eventDate}
              onChange={handleEventChange}
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Capacité"
              name="capacity"
              type="number"
              value={eventForm.capacity}
              onChange={handleEventChange}
              required
              fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
            />
            <TextField
              label="Nom de l'organisateur"
              name="organizerName"
              value={eventForm.organizerName}
              onChange={handleEventChange}
              required
              fullWidth
            />
            <TextField
              label="Email de l'organisateur"
              name="organizerEmail"
              type="email"
              value={eventForm.organizerEmail}
              onChange={handleEventChange}
              required
              fullWidth
            />
            <TextField
              label="Téléphone de l'organisateur"
              name="organizerPhone"
              value={eventForm.organizerPhone}
              onChange={handleEventChange}
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              Enregistrer
            </Button>
          </Box>
        )}
      </Paper>

      <Typography variant="h6" gutterBottom>Participants</Typography>

      <Stack spacing={2}>
        {event.participants.map((participant) => (
          <Paper key={participant.id} sx={{ p: 2 }}>
            {editingParticipantId === participant.id ? (
              <Box component="form" onSubmit={(e) => { e.preventDefault(); saveParticipant(participant.id); }} sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Prénom"
                  name="firstName"
                  value={participantForm.firstName}
                  onChange={handleParticipantChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Nom"
                  name="lastName"
                  value={participantForm.lastName}
                  onChange={handleParticipantChange}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={participantForm.email}
                  onChange={handleParticipantChange}
                  fullWidth
                />
                <TextField
                  label="Téléphone"
                  name="phone"
                  value={participantForm.phone}
                  onChange={handleParticipantChange}
                  required
                  fullWidth
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button type="submit" variant="contained" disabled={loading}>
                    Enregistrer
                  </Button>
                  <Button variant="outlined" onClick={cancelParticipantEdit} disabled={loading}>
                    Annuler
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography sx={{ fontWeight: 600 }}>{participant.firstName} {participant.lastName}</Typography>
                <Typography>Email : {participant.email ?? '—'}</Typography>
                <Typography>Téléphone : {participant.phone}</Typography>
                <Typography>Status : {participant.status}</Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    disabled={loading}
                    onClick={() => handleAction(participant.id, 'approve')}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    disabled={loading}
                    onClick={() => handleAction(participant.id, 'reject')}
                  >
                    Refuser
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={loading}
                    onClick={() => handleAction(participant.id, 'resend')}
                  >
                    Envoyer Email
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => startEditParticipant(participant)}
                    disabled={loading}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => deleteParticipant(participant.id)}
                    disabled={loading}
                  >
                    Supprimer
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
