import { Github, RefreshCw, Search, Bell } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          À propos
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          Un outil créé par des bénévoles pour faciliter l&apos;accès aux formations de montagne.
        </p>

        <div className="space-y-10">
          {/* Mission */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              Ce site centralise les formations publiées sur le site de la FFCAM
              par le Comité Régional Auvergne-Rhône-Alpes. L&apos;objectif : vous aider
              à trouver la bonne formation sans parcourir des dizaines de pages.
            </p>
          </section>

          {/* Comment ça marche */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Comment ça marche
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <RefreshCw size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Synchronisation quotidienne</p>
                  <p className="text-sm text-gray-500">Chaque nuit, les formations sont récupérées depuis le site fédéral.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Search size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Recherche et filtres</p>
                  <p className="text-sm text-gray-500">Filtrez par discipline, lieu, date ou organisateur en quelques clics.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Bell size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Alertes email</p>
                  <p className="text-sm text-gray-500">Créez un compte pour recevoir une notification dès qu&apos;une formation vous correspond.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contribuer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Contribuer
            </h2>
            <p className="text-gray-600 mb-4">
              Le projet est open source. Signalez un problème, proposez une idée
              ou contribuez directement au code.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/ffcam-aura/ffcam-formations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Github size={16} />
                Code source
              </a>
              <a
                href="https://github.com/orgs/ffcam-aura/projects/1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Roadmap
              </a>
            </div>
          </section>

          {/* Liens utiles */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Liens utiles
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.ffcam.fr/les-formations.html" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  Formations FFCAM officielles
                </a>
              </li>
              <li>
                <a href="https://www.ffcam.fr/export/liste_des_actions.pdf" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  Cahier des formations (PDF)
                </a>
              </li>
              <li>
                <a href="https://ffcam-aura.fr" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  FFCAM Auvergne-Rhône-Alpes
                </a>
              </li>
            </ul>
          </section>

          <p className="text-sm text-gray-400 pt-4 border-t">
            <Link href="/" className="hover:underline">Retour à l&apos;accueil</Link>
            {" · "}
            <Link href="/politique-confidentialite" className="hover:underline">Politique de confidentialité</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
