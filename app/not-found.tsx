import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page non trouvée',
  description: 'La page que vous recherchez n&apos;existe pas ou a été déplacée.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="flex-grow container mx-auto p-8">
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-gray-900">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700">Page non trouvée</h2>
          </div>

          <p className="text-gray-600">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/a-propos"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              En savoir plus
            </Link>
          </div>

          <div className="pt-8 border-t">
            <p className="text-sm text-gray-500">
              Vous pouvez également utiliser la recherche ou les filtres sur la page d&apos;accueil pour trouver une formation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}