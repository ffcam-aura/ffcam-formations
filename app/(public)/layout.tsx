import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formations FFCAM - Alpinisme, Escalade, Ski',
  description: 'Trouvez et inscrivez-vous aux formations montagne FFCAM : alpinisme, escalade, ski de randonnée, canyoning. Alertes personnalisées.',
  keywords: ['FFCAM', 'formations', 'alpinisme', 'escalade', 'ski de randonnée', 'CAF', 'montagne'],
  openGraph: {
    title: 'Formations FFCAM - Alpinisme, Escalade, Ski',
    description: 'Toutes les formations montagne du Club Alpin Français. Inscription facile et alertes personnalisées.',
    url: 'https://formations.ffcam-aura.fr',
    siteName: 'Formations FFCAM',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Formations FFCAM',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Formations FFCAM',
    description: 'Trouvez votre prochaine formation montagne',
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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}