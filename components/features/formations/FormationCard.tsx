'use client';

import { memo } from "react";
import Link from "next/link";
import { Formation } from "@/types/formation";
import { getFormationUrl } from "@/utils/slug";
import { CalendarDays, MapPin, Euro, AlertCircle, ArrowRight } from "lucide-react";
import { formatDateRange } from "@/utils/dateUtils";
import { isUrgentFormation, isCompleteFormation } from "@/utils/formationStatus";
import { useNavigation } from "@/contexts/NavigationContext";

function FormationCardComponent({ formation }: { formation: Formation }) {
  const isUrgent = isUrgentFormation(formation);
  const isComplete = isCompleteFormation(formation);
  const { startNavigation } = useNavigation();

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-150 overflow-hidden">
      {/* Header avec discipline et badges */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {formation.discipline}
          </span>

          {/* Badges de statut */}
          <div className="flex gap-2">
            {isComplete && (
              <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
                Complet
              </span>
            )}
            {isUrgent && (
              <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                {formation.placesRestantes} places
              </span>
            )}
          </div>
        </div>

        {/* Titre */}
        <h3 className="text-base font-semibold text-gray-900 mb-4 min-h-[3rem] line-clamp-2">
          <Link
            href={getFormationUrl(formation)}
            onClick={startNavigation}
            className="hover:text-primary-600 transition-colors"
          >
            {formation.titre}
          </Link>
        </h3>
      </div>

      {/* Corps de la carte */}
      <div className="flex-grow flex flex-col px-5">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{formation.lieu}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span>{formatDateRange(formation.dates, 'long')}</span>
          </div>

          <div className="flex items-center text-sm">
            <Euro className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900">{formation.tarif}€</span>
          </div>
        </div>

        {/* Alerte si peu de places */}
        <div className="mt-4 mb-4">
          {isUrgent && (
            <div className="p-2 bg-orange-50 border border-orange-100 rounded-md">
              <div className="flex items-center text-xs text-orange-700">
                <AlertCircle className="w-3 h-3 mr-1.5 flex-shrink-0" />
                <span className="font-medium">Dernières places disponibles</span>
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

      {/* Lien discret */}
      <div className="p-5 pt-0 mt-auto">
        <Link
          href={getFormationUrl(formation)}
          onClick={startNavigation}
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors min-h-[44px] touch-manipulation"
        >
          Voir la formation
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    </div>
  );
}

const FormationCard = memo(FormationCardComponent);
export default FormationCard;
