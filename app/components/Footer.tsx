import { format, parseISO } from "date-fns";
import { Github, ExternalLink, RefreshCcw } from "lucide-react";
import Image from "next/image";

type FooterProps = {
  lastSyncDate: string | null;
};

export default function Footer({ lastSyncDate }: FooterProps) {
  let syncText = "En cours de chargement...";
  
  if (lastSyncDate) {
    syncText = format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm");
  } else if (lastSyncDate === null) {
    syncText = "Non disponible";
  }

  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* À propos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">À propos</h3>
            <div className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/ffcam.png"
                  alt="Logo FFCAM"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <p className="text-sm text-gray-600">
              Un projet créé par les bénévoles du Club Alpin Français de Lyon-Villeurbanne.
              </p>
            </div>
          </div>

          {/* Liens */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Liens utiles</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://github.com/Club-Alpin-Lyon-Villeurbanne/ffcam-formations"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  Code source sur GitHub
                </a>
              </li>
              <li>
                <a 
                  href="https://www.ffcam.fr/les-formations.html"
                  className="text-gray-600 hover:text-primary-500 inline-flex items-center gap-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  Formations FFCAM officielles
                </a>
              </li>
            </ul>
          </div>

          {/* Statut */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Statut</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <RefreshCcw size={16} />
                <span>Dernière synchronisation :</span>
              </div>
              <p className="text-primary-500 font-medium">{syncText}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}