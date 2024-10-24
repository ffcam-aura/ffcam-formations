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
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";


export default function FormationCard({ formation }: { formation: Formation }) {
  const [showEmail, setShowEmail] = useState(false);
  const formatDate = (dateString: string) => format(new Date(dateString), "dd/MM/yyyy");

  return (
    <li className="border p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white">
      <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
        <FontAwesomeIcon icon={faMountain} className="mr-2" />{formation.titre}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="mb-2">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-neutral-dark" />
            <strong>Lieu :</strong> {formation.lieu}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faDumbbell} className="mr-2 text-neutral-dark" />
            <strong>Discipline :</strong> {formation.discipline}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faEuroSign} className="mr-2 text-neutral-dark" />
            <strong>Tarif :</strong> {formation.tarif}€
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faUsers} className="mr-2 text-neutral-dark" />
            <strong>Organisateur :</strong> {formation.organisateur}
          </p>
        </div>
        <div>
          <p className="mb-2">
            <FontAwesomeIcon icon={faChair} className="mr-2 text-neutral-dark" />
            <strong>Places restantes :</strong> {formation.placesRestantes !== null ? formation.placesRestantes : "Inconnu"}
          </p>
          <p className="mb-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-neutral-dark" />
            <strong>Dates :</strong> {formation.dates.map(formatDate).join(", ")}
          </p>
          <p className="mb-2">
            <strong>Email :</strong>{" "}
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
          </p>
        </div>
      </div>

      {/* Nouvelle section pour afficher la date first_seen_at */}
      <div className="text-sm text-gray-500 mb-4">
        <p>
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
          <strong>Formation publiée initialement le :</strong> {formatDate(formation.firstSeenAt)}
        </p>
      </div>

      {formation.documents && formation.documents.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-semibold mb-2 flex items-center">
            <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-neutral-dark" />
            Documents
          </h4>
          <ul className="space-y-2">
            {formation.documents.map((doc, index) => (
              <li key={index} className="flex items-center">
                <FontAwesomeIcon icon={faDownload} className="mr-2 text-neutral-dark" />
                <a 
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex-1"
                  title={`Télécharger ${doc.nom}`}
                >
                  {doc.nom}
                  <span className="text-sm text-gray-500 ml-2">({doc.type})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
