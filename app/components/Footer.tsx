import { Github, ExternalLink } from "lucide-react";
import Image from "next/image";


export default function Footer() {

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
              Un projet créé par les bénévoles du Comité Régional Auverge-Rhone-Alpes de la FFCAM.
              </p>
            </div>
          </div>

          {/* Liens */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Liens utiles</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://github.com/ffcam-aura/ffcam-formations"
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
        </div>
      </div>
    </footer>
  );
}