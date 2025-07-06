import { Shield, Lock, UserCheck, Mail, Calendar, Database, Key, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Politique de confidentialité
        </h1>
        <p className="text-lg text-gray-600">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-8">
        {/* Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                <p className="text-gray-600 mb-3">
                  La protection de vos données personnelles est une priorité pour le Comité Régional FFCAM Auvergne-Rhône-Alpes. 
                  Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations 
                  lorsque vous utilisez notre plateforme de formations.
                </p>
                <p className="text-gray-600">
                  En utilisant ce site, vous acceptez les pratiques décrites dans cette politique de confidentialité.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Données collectées */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Database className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Données collectées</h2>
                <p className="text-gray-600 mb-4">
                  Nous collectons uniquement les données nécessaires au bon fonctionnement du service :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Données d&apos;authentification :</strong> Nom, prénom et adresse email (via Clerk)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Préférences de notification :</strong> Disciplines qui vous intéressent et fréquence de notification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Données de navigation :</strong> Pages visitées et interactions avec le site via Vercel Analytics (anonymisées)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilisation des données */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <UserCheck className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Utilisation des données</h2>
                <p className="text-gray-600 mb-4">
                  Vos données sont utilisées exclusivement pour :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Vous permettre de vous connecter et d&apos;accéder à votre compte</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Vous envoyer des notifications sur les nouvelles formations selon vos préférences</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Améliorer la plateforme et l&apos;expérience utilisateur grâce aux statistiques anonymes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Assurer la sécurité et prévenir les abus</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conservation des données */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Conservation des données</h2>
                <p className="text-gray-600 mb-3">
                  Vos données personnelles sont conservées pendant la durée de votre utilisation active du service.
                </p>
                <p className="text-gray-600">
                  Si vous n&apos;utilisez pas votre compte pendant une période de 3 ans, vos données seront automatiquement 
                  supprimées ou anonymisées, sauf obligation légale de conservation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partage des données */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Partage des données</h2>
                <p className="text-gray-600 mb-4">
                  Nous ne vendons ni ne louons vos données personnelles. Vos données peuvent être partagées uniquement avec :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Clerk :</strong> Notre fournisseur d&apos;authentification (conforme RGPD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Brevo :</strong> Pour l&apos;envoi des emails de notification (conforme RGPD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Vercel :</strong> Pour l&apos;hébergement de l&apos;application et les statistiques de visite anonymes (conforme RGPD)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Sentry :</strong> Pour le monitoring des erreurs (données anonymisées)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Les autorités compétentes :</strong> Si requis par la loi</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Key className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Sécurité des données</h2>
                <p className="text-gray-600 mb-4">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Chiffrement des données en transit (HTTPS)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Authentification sécurisée via Clerk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Accès restreint aux données personnelles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Surveillance continue de la sécurité</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Droits des utilisateurs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <UserCheck className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Vos droits</h2>
                <p className="text-gray-600 mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Droit d&apos;accès :</strong> Obtenir une copie de vos données personnelles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Droit de rectification :</strong> Corriger vos données inexactes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Statistiques et Analytics</h2>
                <p className="text-gray-600 mb-3">
                  Nous utilisons Vercel Analytics pour collecter des statistiques anonymes sur l&apos;utilisation de notre site :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Pages visitées et durée des visites</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Type d&apos;appareil et navigateur utilisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Localisation géographique approximative (pays/région)</span>
                  </li>
                </ul>
                <p className="text-gray-600 mt-3">
                  Ces données sont entièrement anonymes et ne permettent pas de vous identifier personnellement. 
                  Elles nous aident uniquement à améliorer l&apos;expérience utilisateur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Cookies</h2>
                <p className="text-gray-600 mb-3">
                  Notre site utilise uniquement des cookies strictement nécessaires au fonctionnement :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Cookies de session pour l&apos;authentification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>Cookies techniques pour le bon fonctionnement du site</span>
                  </li>
                </ul>
                <p className="text-gray-600 mt-3">
                  Nous n&apos;utilisons pas de cookies publicitaires ou de tracking marketing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Nous contacter</h2>
                <p className="text-gray-600 mb-3">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                  vous pouvez nous contacter :
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Comité Régional FFCAM Auvergne-Rhône-Alpes</strong><br />
                    Email : rgpd@ffcam-aura.fr<br />
                    Site web : <a href="https://ffcam-aura.fr" className="text-primary-500 hover:underline" target="_blank" rel="noopener noreferrer">ffcam-aura.fr</a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-3">Modifications de cette politique</h2>
                <p className="text-gray-600">
                  Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. 
                  Les modifications seront publiées sur cette page avec une date de mise à jour. 
                  Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques 
                  en matière de protection des données.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}