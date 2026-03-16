import { Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>FFCAM Auvergne-Rhône-Alpes</span>
            <span className="hidden sm:inline">·</span>
            <Link href="/a-propos" className="hover:text-gray-700 transition-colors">À propos</Link>
            <Link href="/politique-confidentialite" className="hover:text-gray-700 transition-colors">Confidentialité</Link>
            <a href="https://www.ffcam.fr/les-formations.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">
              Site FFCAM
            </a>
          </div>
          <a
            href="https://github.com/ffcam-aura/ffcam-formations"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Github size={16} />
            <span>Open source</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
