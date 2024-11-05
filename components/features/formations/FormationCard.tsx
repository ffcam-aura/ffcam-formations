import { useState } from "react";
import { Formation } from "@/types/formation";
import { format } from "date-fns";
import { formatName } from "@/utils/formation-parser";

export default function FormationCard({ formation }: { formation: Formation }) {
  const [showEmail, setShowEmail] = useState(false);
  const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy");

  return (
    <li className="border p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white">
      <h3 className="text-base sm:text-lg font-bold text-primary mb-2 sm:mb-3 flex items-center">
        <span className="mr-2">🏔️</span>
        {formation.titre}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-x-6 sm:gap-y-1.5">
        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">📍</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Lieu :</strong>
            <span className="sm:ml-0">{formation.lieu}</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">💺</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Places restantes:</strong>
            <span>{formation.placesRestantes !== null ? formation.placesRestantes : "Inconnu"}</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">🎯</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Type :</strong>
            <span>{formation.discipline}</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">📅</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Dates :</strong>
            <span className="break-words">{formation.dates.map(formatDate).join(", ")}</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">💰</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Tarif :</strong>
            <span>{formation.tarif}€</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center">
          <span className="w-4 mr-2 flex-shrink-0 mt-1 sm:mt-0">📧</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Email :</strong>
            {showEmail ? (
              formation.emailContact ? (
                <a href={`mailto:${formation.emailContact}`} className="text-primary underline break-all">
                  {formation.emailContact}
                </a>
              ) : (
                "Non disponible"
              )
            ) : (
              <button
                onClick={() => setShowEmail(true)}
                className="text-primary underline text-left"
              >
                Afficher l&apos;email
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start sm:items-center col-span-1 sm:col-span-2">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">🏢</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Org. :</strong>
            <span className="lowercase">{formation.organisateur}</span>
          </div>
        </div>

        <div className="flex items-start sm:items-center col-span-1 sm:col-span-2">
          <span className="w-4 mr-2 text-neutral-dark flex-shrink-0 mt-1 sm:mt-0">👤</span>
          <div className="flex flex-col sm:flex-row sm:items-center flex-1">
            <strong className="w-16 flex-shrink-0">Resp. :</strong>
            <span>{formatName(formation.responsable)}</span>
          </div>
        </div>
      </div>

      {formation.informationStagiaire && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="font-semibold mb-1.5 flex items-center text-sm">
            <span className="w-4 mr-2 text-neutral-dark">ℹ️</span>
            Information stagiaire
          </h4>
          <div className="bg-gray-50 p-2 sm:p-3 rounded">
            <p className="text-xs sm:text-sm whitespace-pre-wrap">{formation.informationStagiaire}</p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        <p className="flex items-center">
          <span className="w-3 mr-1">📅</span>
          <strong>Publiée le :</strong>&nbsp;{formatDate(formation.firstSeenAt)}
        </p>
      </div>

      {formation.documents && formation.documents.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="font-semibold mb-1.5 flex items-center text-sm">
            <span className="w-4 mr-2 text-neutral-dark">📄</span>
            Documents
          </h4>
          <ul className="space-y-1">
            {formation.documents.map((doc, index) => (
              <li key={index} className="flex items-center text-xs sm:text-sm">
                <span className="w-4 mr-2 text-neutral-dark">⬇️</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex-1 break-all"
                  title={`Télécharger ${doc.nom}`}
                >
                  {doc.nom}
                  <span className="text-xs text-gray-500 ml-1">({doc.type})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}