import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/template-engine.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Invitations — Cinematic Digital Invitations',
  description: 'Create cinematic digital invitations for weddings and celebrations. Customize your theme, add every event, and share a personal link with your guests.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
