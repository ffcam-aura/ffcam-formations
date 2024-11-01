// app/a-propos/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête avec bannière attractive */}
        <div className="text-center space-y-6 py-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-blue-600">
            À Propos de FFCAM Formations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            🏔️ Votre portail des formations de montagne, créé par des passionnés
            pour des passionnés !
          </p>
        </div>

        {/* Notre mission */}
        <Card className="border-t-4 border-t-primary-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              ✨ Notre Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg leading-relaxed">
            <p>
              Simplifier votre accès aux formations FFCAM ! Nous sommes une équipe
              de bénévoles passionnés du Comité Régional Auvergne Rhône-Alpes qui
              a créé cet outil pour vous aider à trouver la formation parfaite
              pour votre prochaine aventure en montagne.
            </p>
          </CardContent>
        </Card>

        {/* Comment ça marche */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🔄 Mise à jour quotidienne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Chaque nuit, nous synchronisons les dernières formations
                disponibles. Vous avez toujours accès aux informations les plus
                récentes !
              </p>
            </CardContent>
          </Card>

          <Card className="transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🔍 Recherche simplifiée
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Trouvez facilement la formation idéale avec nos filtres intuitifs :
                activité, lieu, date... C&apos;est simple comme bonjour !
              </p>
            </CardContent>
          </Card>

          <Card className="transform transition-all hover:scale-105">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🔔 Alertes personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Ne manquez plus aucune formation ! Créez vos alertes et recevez une
                notification dès qu&apos;une formation vous correspond.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ce que vous pouvez faire */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🎯 Ce que vous pouvez faire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pour les débutants 🌱</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Découvrir toutes les formations disponibles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Filtrer par niveau et type d&apos;activité
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Créer des alertes pour vos activités préférées
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Pour les confirmés 🏔️</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Suivre les nouvelles formations avancées
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Recevoir des alertes ciblées
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Partager les formations avec votre club
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* En développement */}
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🚀 En constante évolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Nous améliorons constamment l&apos;application pour mieux répondre à
              vos besoins !
            </p>
            <a
              href="https://github.com/orgs/ffcam-aura/projects/1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-primary-500 hover:text-primary-600"
            >
              <Github size={20} />
              Découvrir les prochaines améliorations
            </a>
            <p className="text-sm text-gray-600">
              💡 Une idée ? N&apos;hésitez pas à nous en faire part !
            </p>
          </CardContent>
        </Card>

        {/* Participer */}
        <Card className="border-t-4 border-t-blue-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              🤝 Rejoignez l&apos;aventure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Passionné(e) de montagne et de développement ? Notre projet est open
              source et nous accueillons avec plaisir toute contribution !
            </p>
            <a
              href="https://github.com/ffcam-aura/ffcam-formations"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
            >
              <Github size={20} />
              Contribuer au projet
            </a>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}