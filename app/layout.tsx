import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'NutriDive SafeStack - Medication, Supplement & Food Interaction Checker',
    template: '%s | NutriDive SafeStack',
  },
  description:
    'Evidence-based interaction screening engine for medications, dietary supplements, and foods. Check drug-supplement conflicts and nutrient depletions backed by clinical literature.',
  keywords: [
    'Drug supplement interactions',
    'Medication food interactions',
    'Nutrient depletion checker',
    'Supplement conflict checker',
    'Drug interaction checker',
    'SafeStack',
    'NutriDive',
    'Clinical interaction rules',
  ],
  authors: [{ name: 'NutriDive SafeStack', url: 'https://nutridive.net' }],
  creator: 'NutriDive',
  metadataBase: new URL('https://nutridive.net'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'NutriDive SafeStack - Medication, Supplement & Food Interaction Checker',
    description:
      'Evidence-based interaction screening engine for medications, dietary supplements, and foods backed by clinical literature.',
    url: 'https://nutridive.net',
    siteName: 'NutriDive SafeStack',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriDive SafeStack - Interaction Checker',
    description: 'Evidence-based medication, supplement, and food interaction screening engine.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-teal-100 dark:selection:bg-teal-900/60 selection:text-teal-900 dark:selection:text-teal-100">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
