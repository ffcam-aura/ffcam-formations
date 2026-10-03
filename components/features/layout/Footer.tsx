import { Github, ExternalLink, MapPin, Users, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    // overflow-anchor: none : au retour d'une fiche, Chrome ne doit pas s'accrocher au pied de page
    // pendant que la liste s'insère au-dessus
    <footer className="bg-gray-50 border-t mt-8 [overflow-anchor:none]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              À propos
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src="/ffcam.png"
                    alt="Logo FFCAM"
                    width={40}
                    height={40}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Un projet créé par les bénévoles du Comité Régional Auvergne-Rhône-Alpes de la FFCAM
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Facilitons l&apos;accès aux formations de montagne pour tous ! 🏔️
              </p>
            </div>
          </div>

          {/* Liens rapides */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/a-propos"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/orgs/ffcam-aura/projects/1"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Liens utiles */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Ressources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://github.com/ffcam-aura/ffcam-formations"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} className="group-hover:text-primary-500" />
                  Code source sur GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.ffcam.fr/les-formations.html"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} className="group-hover:text-primary-500" />
                  Formations FFCAM officielles
                </a>
              </li>
              <li>
                <a
                  href="https://www.ffcam.fr/export/liste_des_actions.pdf"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={16} className="group-hover:text-primary-500" />
                  Cahier des formations (PDF)
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ffcam.fr/"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Users size={16} className="group-hover:text-primary-500" />
                  Site officiel FFCAM
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              FFCAM Auvergne-Rhône-Alpes
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-gray-600">
                <MapPin size={16} className="flex-shrink-0 mt-1" />
                <span>
                  Comité Régional FFCAM Auvergne-Rhône-Alpes
                </span>
              </li>
              <li>
                <a 
                  href="https://ffcam-aura.fr"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} className="group-hover:text-primary-500" />
                  ffcam-aura.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Open Source */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Projet open source sous licence MIT - Créé avec ❤️ par les bénévoles du FFCAM AURA
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/ffcam-aura/ffcam-formations"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary-500 transition-colors inline-flex items-center gap-2"
              >
                <Github size={20} />
                <span className="text-sm">Contribuer sur GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}