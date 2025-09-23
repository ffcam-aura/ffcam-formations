import { Analytics } from "@vercel/analytics/react";
import {
  ClerkProvider
} from '@clerk/nextjs';
import { frFR } from '@clerk/localizations';
import type { Metadata } from "next";
import { Source_Sans_3 } from 'next/font/google';
import "./globals.css";
import Navbar from '@/components/features/layout/Navbar';
import Footer from '@/components/features/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { OrganizationStructuredData, WebSiteStructuredData } from '@/components/seo/StructuredData';
import NavigationLoader from '@/components/ui/navigation-loader';
import { NavigationProvider } from '@/contexts/NavigationContext';

// Configuration de Source Sans 3
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-source-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://formations.ffcam-aura.fr'),
  title: {
    template: '%s | Formations FFCAM',
    default: 'Formations FFCAM - Alpinisme, Escalade, Ski',
  },
  description: 'Formations FFCAM : alpinisme, escalade, ski de randonnée. Inscriptions en ligne et alertes personnalisées.',
  keywords: ['FFCAM', 'formations', 'montagne', 'alpinisme', 'escalade', 'ski de randonnée', 'canyoning', 'Auvergne-Rhône-Alpes', 'CAF', 'Club Alpin Français'],
  authors: [{ name: 'FFCAM Auvergne-Rhône-Alpes' }],
  creator: 'FFCAM Auvergne-Rhône-Alpes',
  publisher: 'FFCAM Auvergne-Rhône-Alpes',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Formations FFCAM - Alpinisme, Escalade, Ski',
    description: 'Formations montagne FFCAM : inscriptions en ligne et alertes personnalisées.',
    url: 'https://formations.ffcam-aura.fr',
    siteName: 'Formations FFCAM',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formations FFCAM Auvergne-Rhône-Alpes',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formations FFCAM Auvergne-Rhône-Alpes',
    description: 'Découvrez toutes les formations montagne FFCAM en Auvergne-Rhône-Alpes',
    images: ['/og-image.jpg'],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html lang="fr">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0066CC" />
          <link rel="apple-touch-icon" href="/ffcam.png" />
          <OrganizationStructuredData />
          <WebSiteStructuredData />
        </head>
        <body
          className={`${sourceSans3.variable} font-sans antialiased bg-background`}
        >
          <NavigationProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <NavigationLoader />
              {children}
              <Analytics />
              <Footer />
              <Toaster />
            </div>
          </NavigationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}