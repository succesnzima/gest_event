import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import MuiProvider from '@/components/providers/MuiProvider';

import Navbar from '@/components/layout/Navbar';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gest Event',
  description: 'Gestion des événements avec QR Code',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head />
      <body>
        <MuiProvider>
          <Navbar />
          {children}
        </MuiProvider>
      </body>
    </html>
  );
}