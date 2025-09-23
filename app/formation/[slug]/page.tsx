import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, MapPin, Users, Euro, User, Home, FileText, Clock } from 'lucide-react';
import { FormationRepository } from '@/repositories/FormationRepository';
import { FormationService } from '@/services/formation/formations.service';
import { Formation } from '@/types/formation';
import { extractReferenceFromSlug, getFormationUrl } from '@/utils/slug';
import { FormationStructuredData, BreadcrumbStructuredData } from '@/components/seo/StructuredData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ObfuscatedEmail from '@/components/features/formations/ObfuscatedEmail';
import ObfuscatedInscriptionButton from '@/components/features/formations/ObfuscatedInscriptionButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getFormation(slug: string): Promise<Formation | null> {
  const reference = extractReferenceFromSlug(slug);
  if (!reference) {
    return null;
  }

  const formationRepository = new FormationRepository();
  const formationService = new FormationService(formationRepository);

  try {
    const formation = await formationService.getFormationByReference(reference);

    // Si la formation existe, on la retourne
    // (on accepte tout slug tant que la référence est correcte)
    if (formation) {
      return formation;
    }

    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const formation = await getFormation(params.slug);

  if (!formation) {
    return {
      title: 'Formation non trouvée',
      description: 'Cette formation n&apos;existe pas ou n&apos;est plus disponible.',
    };
  }

  const startDate = formation.dates[0] ? new Date(formation.dates[0]).toLocaleDateString('fr-FR') : '';
  const endDate = formation.dates[formation.dates.length - 1]
    ? new Date(formation.dates[formation.dates.length - 1]).toLocaleDateString('fr-FR')
    : startDate;

  return {
    title: `${formation.titre} - ${formation.discipline}`,
    description: `Formation ${formation.discipline} du ${startDate} au ${endDate} à ${formation.lieu}. ${formation.placesRestantes ? `${formation.placesRestantes} places disponibles.` : ''} Tarif: ${formation.tarif}€`,
    openGraph: {
      title: formation.titre,
      description: `Formation ${formation.discipline} organisée par ${formation.organisateur}`,
      type: 'website',
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: formation.titre,
      description: `Formation ${formation.discipline} du ${startDate} au ${endDate}`,
    },
  };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateRange(dates: string[]): string {
  if (dates.length === 0) return 'Dates non définies';
  if (dates.length === 1) return formatDate(dates[0]);

  const firstDate = formatDate(dates[0]);
  const lastDate = formatDate(dates[dates.length - 1]);

  return `Du ${firstDate} au ${lastDate}`;
}

export default async function FormationPage({ params }: PageProps) {
  const formation = await getFormation(params.slug);

  if (!formation) {
    notFound();
  }

  const breadcrumbItems = [
    { name: 'Accueil', url: 'https://formations.ffcam-aura.fr' },
    { name: 'Formations', url: 'https://formations.ffcam-aura.fr' },
    { name: formation.discipline, url: `https://formations.ffcam-aura.fr?discipline=${encodeURIComponent(formation.discipline)}` },
    { name: formation.titre },
  ];

  // Récupérer des formations similaires
  const formationRepository = new FormationRepository();
  const formationService = new FormationService(formationRepository);
  let similarFormations: Formation[] = [];

  try {
    const allFormations = await formationService.getAllFormations();
    similarFormations = allFormations
      .filter(f =>
        f.reference !== formation.reference &&
        (f.discipline === formation.discipline || f.lieu === formation.lieu)
      )
      .slice(0, 3);
  } catch (error) {
    console.error('Erreur lors de la récupération des formations similaires:', error);
  }

  return (
    <>
      <FormationStructuredData formation={formation} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb responsive */}
        <nav className="flex mb-6 text-sm overflow-x-auto pb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap">
            <li className="inline-flex items-center">
              <Link href="/" className="inline-flex items-center text-gray-700 hover:text-primary-600">
                <Home className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
            </li>
            <li className="hidden sm:flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/" className="text-gray-700 hover:text-primary-600">
                Formations
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href={`/?discipline=${encodeURIComponent(formation.discipline)}`}
                className="text-gray-700 hover:text-primary-600"
              >
                {formation.discipline}
              </Link>
            </li>
            <li aria-current="page" className="hidden md:flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500 truncate max-w-xs lg:max-w-none">{formation.titre}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {formation.discipline}
                </span>
                <span className="text-sm text-gray-500">Réf: {formation.reference}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {formation.titre}
              </h1>
            </div>

            {/* Informations principales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations pratiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Dates</p>
                      <p className="font-medium">{formatDateRange(formation.dates)}</p>
                      <p className="text-sm text-gray-500">{formation.dates.length} jour(s)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Lieu</p>
                      <p className="font-medium">{formation.lieu}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Places</p>
                      <p className="font-medium">
                        {formation.placesRestantes !== null
                          ? `${formation.placesRestantes} / ${formation.nombreParticipants} places disponibles`
                          : `${formation.nombreParticipants} participants max`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Euro className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Tarif</p>
                      <p className="font-medium">{formation.tarif}€</p>
                    </div>
                  </div>
                </div>

                {formation.hebergement && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Hébergement</p>
                        <p className="font-medium">{formation.hebergement}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations stagiaires */}
            {formation.informationStagiaire && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations pour les stagiaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {formation.informationStagiaire}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Encadrement */}
            <Card>
              <CardHeader>
                <CardTitle>Encadrement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Responsable</p>
                    <p className="font-medium">{formation.responsable}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Organisateur</p>
                    <p className="font-medium">{formation.organisateur}</p>
                  </div>
                </div>

                {formation.emailContact && (
                  <ObfuscatedEmail email={formation.emailContact} />
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            {formation.documents && formation.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {formation.documents.map((doc, index) => (
                      <li key={index}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                        >
                          <FileText className="w-4 h-4" />
                          {doc.nom}
                          <span className="text-xs text-gray-500">({doc.type})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Sticky */}
            <div className="sticky top-6">
              <Card className="border-primary-200 bg-primary-50/50">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{formation.tarif}€</p>
                    {formation.placesRestantes !== null && (
                      <p className={`text-sm mt-1 ${formation.placesRestantes > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formation.placesRestantes > 0
                          ? `${formation.placesRestantes} places restantes`
                          : 'Complet'}
                      </p>
                    )}
                  </div>

                  {formation.emailContact ? (
                    <ObfuscatedInscriptionButton
                      email={formation.emailContact}
                      formationTitle={formation.titre}
                      disabled={formation.placesRestantes === 0}
                    />
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={formation.placesRestantes === 0}
                      asChild
                    >
                      <a
                        href={`https://www.ffcam.fr/les-formations.html`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {formation.placesRestantes === 0 ? 'Formation complète' : 'Demande d\'inscription'}
                      </a>
                    </Button>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Dernière mise à jour : {formatDate(formation.lastSeenAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Alerte si peu de places */}
              {formation.placesRestantes && formation.placesRestantes > 0 && formation.placesRestantes <= 3 && (
                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    ⚠️ Attention : il ne reste que {formation.placesRestantes} place{formation.placesRestantes > 1 ? 's' : ''} !
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Formations similaires */}
        {similarFormations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Formations similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarFormations.map((f) => (
                <Card key={f.reference} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                          {f.discipline}
                        </span>
                        {f.placesRestantes !== null && f.placesRestantes > 0 && (
                          <span className="text-xs text-green-600">
                            {f.placesRestantes} places
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        <Link
                          href={getFormationUrl(f)}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {f.titre}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {f.lieu}
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {f.tarif}€
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}