import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CompareProvider } from '@/lib/compare-context';
import CompareTray from '@/components/CompareTray';
import CompareModal from '@/components/CompareModal';

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
    default: 'NutriDive - Malaysia NPRA Pharmaceutical & Supplement Verification Engine',
    template: '%s | NutriDive NPRA Verification',
  },
  description:
    'Official Malaysian Ministry of Health (KKM) & NPRA pharmaceutical verification directory. Check 28,000+ approved MAL registration numbers, active ingredients, and generic drug alternatives in Malaysia.',
  keywords: [
    'Semakan status pendaftaran KKM',
    'Semakan NPRA',
    'Bahan aktif ubat',
    'Generic brand alternative Malaysia',
    'Pengganti ubat darah tinggi',
    'Pengganti ubat kencing manis',
    'Nombor MAL berdaftar',
    'NPRA Malaysia medicine directory',
    'KKM drug search',
    'Meditag FarmaChecker hologram',
  ],
  authors: [{ name: 'NutriDive Open Data Project', url: 'https://nutridive.net' }],
  creator: 'NutriDive',
  metadataBase: new URL('https://nutridive.net'),
  alternates: {
    canonical: '/',
    languages: {
      'en-MY': '/',
      'ms-MY': '/',
    },
  },
  openGraph: {
    title: 'NutriDive - Malaysia NPRA Pharmaceutical & Supplement Verification Engine',
    description:
      'Verify 28,000+ Malaysian approved drugs, supplements (MAL-N), and traditional health products (MAL-T) with instant generic alternatives.',
    url: 'https://nutridive.net',
    siteName: 'NutriDive Malaysia',
    locale: 'en_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriDive - Malaysia NPRA Pharmaceutical Engine',
    description: 'Instant MAL number status, active ingredients, and generic brand alternatives.',
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
  other: {
    'geo.region': 'MY',
    'geo.placename': 'Malaysia',
    'geo.position': '4.2105;101.9758',
    'ICBM': '4.2105, 101.9758',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Geographic target tags for Malaysia */}
        <meta name="geo.region" content="MY" />
        <meta name="geo.placename" content="Malaysia" />
        <meta name="geo.position" content="4.2105;101.9758" />
        <meta name="ICBM" content="4.2105, 101.9758" />
        <link rel="alternate" hrefLang="en-MY" href="https://nutridive.net" />
        <link rel="alternate" hrefLang="ms-MY" href="https://nutridive.net" />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-teal-100 dark:selection:bg-teal-900/60 selection:text-teal-900 dark:selection:text-teal-100">
        <CompareProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
          <CompareModal />
        </CompareProvider>
      </body>
    </html>
  );
}
