'use client';

import { Mountain, FileText } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mountain className="w-6 h-6 text-primary-600" />
            Formations FFCAM
          </h1>
          <p className="text-gray-600 mt-1">
            Trouvez votre prochaine formation montagne
          </p>
        </div>
        <a
          href="https://www.ffcam.fr/export/liste_des_actions.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 hover:text-primary-600 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Télécharger le cahier des formations</span>
        </a>
      </div>
      {/* Version mobile */}
      <a
        href="https://www.ffcam.fr/export/liste_des_actions.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="sm:hidden inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        <FileText className="w-4 h-4" />
        Cahier des formations PDF
      </a>
    </div>
  );
}