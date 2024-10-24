import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Formation } from "@/app/types/formation";
import { 
  faMountain, 
  faMapMarkerAlt, 
  faDumbbell, 
  faEuroSign, 
  faUsers, 
  faChair, 
  faCalendarAlt,
  faFileAlt,
  faDownload,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

export default function FormationCard({ formation }: { formation: Formation }) {
  const [showEmail, setShowEmail] = useState(false);
  const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy");

  return (
    <li className="border p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 bg-white">
      <h3 className="text-lg font-bold text-primary mb-3 flex items-center">
        <FontAwesomeIcon icon={faMountain} className="mr-2" />{formation.titre}
      </h3>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        <div className="flex items-center">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Lieu :</strong>
          <span>{formation.lieu}</span>
        </div>
        
        <div className="flex items-center">
          <FontAwesomeIcon icon={faChair} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Places :</strong>
          <span>{formation.placesRestantes !== null ? formation.placesRestantes : "Inconnu"}</span>
        </div>

        <div className="flex items-center">
          <FontAwesomeIcon icon={faDumbbell} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Type :</strong>
          <span>{formation.discipline}</span>
        </div>

        <div className="flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Dates :</strong>
          <span>{formation.dates.map(formatDate).join(", ")}</span>
        </div>

        <div className="flex items-center">
          <FontAwesomeIcon icon={faEuroSign} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Tarif :</strong>
          <span>{formation.tarif}€</span>
        </div>

        <div className="flex items-center">
          <span className="w-4 mr-2 flex-shrink-0"></span>
          <strong className="w-16 flex-shrink-0">Email :</strong>
          {showEmail ? (
            formation.emailContact ? (
              <a href={`mailto:${formation.emailContact}`} className="text-primary underline">
                {formation.emailContact}
              </a>
            ) : (
              "Non disponible"
            )
          ) : (
            <button
              onClick={() => setShowEmail(true)}
              className="text-primary underline"
            >
              Afficher l&apos;email
            </button>
          )}
        </div>

        <div className="flex items-center col-span-2">
          <FontAwesomeIcon icon={faUsers} className="w-4 mr-2 text-neutral-dark flex-shrink-0" />
          <strong className="w-16 flex-shrink-0">Org. :</strong>
          <span className="lowercase">{formation.organisateur}</span>
        </div>
      </div>

      {formation.informationStagiaire && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="font-semibold mb-1.5 flex items-center text-sm">
            <FontAwesomeIcon icon={faInfoCircle} className="w-4 mr-2 text-neutral-dark" />
            Information stagiaire
          </h4>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm whitespace-pre-wrap">{formation.informationStagiaire}</p>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-3">
        <p className="flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="w-3 mr-1" />
          <strong>Publiée le :</strong>&nbsp;{formatDate(formation.firstSeenAt)}
        </p>
      </div>

      {formation.documents && formation.documents.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="font-semibold mb-1.5 flex items-center text-sm">
            <FontAwesomeIcon icon={faFileAlt} className="w-4 mr-2 text-neutral-dark" />
            Documents
          </h4>
          <ul className="space-y-1">
            {formation.documents.map((doc, index) => (
              <li key={index} className="flex items-center text-sm">
                <FontAwesomeIcon icon={faDownload} className="w-4 mr-2 text-neutral-dark" />
                <a 
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex-1"
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