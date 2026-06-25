'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import QRCode from 'qrcode';


type Event = {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  eventDate: string;
  capacity: number;
  organizerName: string;
  organizerEmail: string;
  organizerPhone?: string | null;
  adminToken: string;
};

type CreatedEvent = Event & {
  inscriptionUrl: string;
  adminUrl: string;
  qrDataUrl: string;
};

export default function CreerEvenement() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedEvent | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    date: '',
    heure: '',
    lieu: '',
    max_participants: '100',
    nom_organisateur: '',
    email_organisateur: '',
    telephone_organisateur: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
        const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
        });

        if (!response.ok) {
        const err = await response.json();
        throw new Error(
            err.error || 'Erreur lors de la création'
        );
        }

        const data = await response.json();

        const base =
        process.env.NEXT_PUBLIC_APP_URL ??
        window.location.origin;

        const inscriptionUrl =
        `${base}/inscription/${data.id}`;

        const adminUrl =
        `${base}/admin/${data.adminToken}`;

        const qrDataUrl = await QRCode.toDataURL(
        inscriptionUrl,
        {
            width: 300,
            margin: 2,
        }
        );

        setCreated({
        ...data,
        inscriptionUrl,
        adminUrl,
        qrDataUrl,
        });
    } catch (e) {
        setError(
        e instanceof Error
            ? e.message
            : 'Une erreur est survenue'
        );
    } finally {
        setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getEmailShareLink = (subject: string, body: string) =>
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const getWhatsappShareLink = (text: string) =>
    `https://wa.me/?text=${encodeURIComponent(text)}`;

  const shareByEmail = (subject: string, body: string) => {
    window.location.href = getEmailShareLink(subject, body);
  };

  const shareByWhatsapp = (text: string) => {
    window.open(getWhatsappShareLink(text), '_blank');
  };

  const downloadQrCode = () => {
    if (!created) return;
    const a = document.createElement('a');
    a.href = created.qrDataUrl;
    a.download = 'qr-inscription.png';
    a.click();
  };

  if (created) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Événement créé !
          </Typography>
          <Typography color="text.secondary">
            Conservez précieusement les liens ci-dessous.
          </Typography>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              QR CODE D&apos;INSCRIPTION
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <img src={created.qrDataUrl} alt="QR Code inscription" style={{ width: 200, height: 200 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
              Partagez ce QR Code pour les inscriptions
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() =>
                  shareByEmail(
                    `Invitation à s'inscrire : ${created.title}`,
                    `Bonjour,

Scannez le QR code ci-dessous ou utilisez ce lien pour vous inscrire : ${created.inscriptionUrl}

À bientôt !`
                  )
                }
              >
                Envoyer par mail
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                onClick={() =>
                  shareByWhatsapp(
                    `Inscrivez-vous à ${created.title} : ${created.inscriptionUrl}`
                  )
                }
              >
                WhatsApp
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadQrCode}
              >
                Télécharger QR
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              LIEN D&apos;INSCRIPTION (PUBLIC)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all', bgcolor: 'grey.50', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {created.inscriptionUrl}
              </Typography>
              <Tooltip title={copied === 'inscription' ? 'Copié !' : 'Copier'}>
                <IconButton onClick={() => copyToClipboard(created.inscriptionUrl, 'inscription')} size="small">
                  {copied === 'inscription' ? <CheckCircleIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() =>
                  shareByEmail(
                    `Lien d'inscription : ${created.title}`,
                    `Bonjour,

Cliquez sur ce lien pour inscrire un participant : ${created.inscriptionUrl}

À bientôt !`
                  )
                }
              >
                Envoyer par mail
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<WhatsAppIcon />}
                onClick={() =>
                  shareByWhatsapp(
                    `Inscrivez-vous à ${created.title} : ${created.inscriptionUrl}`
                  )
                }
              >
                WhatsApp
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'warning.main' }}>
          <CardContent>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              LIEN PRIVÉ D&apos;ADMINISTRATION (NE PAS PARTAGER)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all', bgcolor: 'orange.50', p: 1, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}>
                {created.adminUrl}
              </Typography>
              <Tooltip title={copied === 'admin' ? 'Copié !' : 'Copier'}>
                <IconButton onClick={() => copyToClipboard(created.adminUrl, 'admin')} size="small">
                  {copied === 'admin' ? <CheckCircleIcon color="success" fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="outlined"
              color="warning"
              size="small"
              endIcon={<OpenInNewIcon />}
              sx={{ mt: 2 }}
              onClick={() => router.push(`/admin/${created.adminToken}`)}
            >
              Accéder au tableau de bord
            </Button>
          </CardContent>
        </Card>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Important :</strong> Sauvegardez le lien d&apos;administration. Il est le seul moyen d&apos;accéder à la gestion de votre événement.
        </Alert>

        <Button variant="outlined" fullWidth onClick={() => { setCreated(null); setForm({ nom: '', description: '', date: '', heure: '', lieu: '', max_participants: '100', nom_organisateur: '', email_organisateur: '', telephone_organisateur: '' }); }}>
          Créer un autre événement
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom align="center">
        Créer un événement
      </Typography>
      <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
        Remplissez les informations ci-dessous. Aucun compte requis.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} method="POST">
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Informations de l&apos;événement
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField label="Nom de l'événement" name="nom" value={form.nom} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={3} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Date" name="date" type="date" value={form.date} onChange={handleChange} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Heure" name="heure" type="time" value={form.heure} onChange={handleChange} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={12}>
                <TextField label="Lieu" name="lieu" value={form.lieu} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid size={12}>
                <TextField label="Nombre max. de participants" name="max_participants" type="number" value={form.max_participants} onChange={handleChange} required fullWidth slotProps={{ htmlInput: { min: 1 } }} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Informations de l&apos;organisateur
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField label="Nom de l'organisateur" name="nom_organisateur" value={form.nom_organisateur} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" name="email_organisateur" type="email" value={form.email_organisateur} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Téléphone" name="telephone_organisateur" value={form.telephone_organisateur} onChange={handleChange} required fullWidth />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 4 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer l\'événement'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
