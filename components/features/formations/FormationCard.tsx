import Link from "next/link";
import { Formation } from "@/types/formation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getFormationUrl } from "@/utils/slug";
import { CalendarDays, MapPin, Euro, ChevronRight, AlertCircle } from "lucide-react";

export default function FormationCard({ formation }: { formation: Formation }) {
  // Format de date court : "15-17 mars" ou "15 mars"
  const formatDateRange = (dates: string[]): string => {
    if (!dates || dates.length === 0) return "Dates à confirmer";

    const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    if (sortedDates.length === 1) {
      return format(firstDate, "d MMMM", { locale: fr });
    }

    // Si même mois
    if (firstDate.getMonth() === lastDate.getMonth()) {
      return `${format(firstDate, "d")}-${format(lastDate, "d MMMM", { locale: fr })}`;
    }

    // Mois différents
    return `${format(firstDate, "d MMM", { locale: fr })} - ${format(lastDate, "d MMM", { locale: fr })}`;
  };

  const isUrgent = formation.placesRestantes !== null && formation.placesRestantes > 0 && formation.placesRestantes <= 3;
  const isComplete = formation.placesRestantes === 0;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header avec discipline et badges */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {formation.discipline}
          </span>

          {/* Badges de statut */}
          <div className="flex gap-2">
            {isComplete && (
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Complet
              </span>
            )}
            {isUrgent && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full animate-pulse">
                {formation.placesRestantes} places
              </span>
            )}
          </div>
        </div>

        {/* Titre - hauteur fixe */}
        <h3 className="text-lg font-bold text-gray-900 mb-4 min-h-[3.5rem] line-clamp-2">
          <Link
            href={getFormationUrl(formation)}
            className="hover:text-primary-600 transition-colors"
          >
            {formation.titre}
          </Link>
        </h3>
      </div>

      {/* Corps de la carte - flex-grow pour occuper l'espace disponible */}
      <div className="flex-grow flex flex-col px-5">
        {/* Infos essentielles */}
        <div className="space-y-2.5">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formation.lieu}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{formatDateRange(formation.dates)}</span>
          </div>

          <div className="flex items-center text-sm">
            <Euro className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{formation.tarif}€</span>
          </div>
        </div>

        {/* Alerte si peu de places - toujours à la même position */}
        <div className="mt-4 mb-4">
          {isUrgent && (
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-xs text-orange-700">
                <AlertCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span className="font-medium">Attention : dernières places disponibles !</span>
              </div>
            </div>
          )}
          {formation.placesRestantes !== null && !isComplete && !isUrgent && (
            <div className="text-xs text-gray-500 text-center">
              {formation.placesRestantes} places disponibles
            </div>
          )}
        </div>
      </div>

      {/* Bouton CTA - toujours en bas avec zone de tap mobile-friendly */}
      <div className="p-5 pt-0 mt-auto">
        <Link
          href={getFormationUrl(formation)}
          className="inline-flex items-center justify-center w-full px-4 py-3 sm:py-2.5 min-h-[44px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors group touch-manipulation"
        >
          Plus de détails
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}