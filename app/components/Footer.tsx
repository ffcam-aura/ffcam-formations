import { format, parseISO } from "date-fns";

type FooterProps = {
  lastSyncDate: string;
};

export default function Footer({ lastSyncDate }: FooterProps) {
  const formattedDate = lastSyncDate ? format(parseISO(lastSyncDate), "dd/MM/yyyy 'à' HH:mm") : "Non disponible";

  return (
    <footer className="bg-gray-800 p-4 text-white mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Club Alpin Français de Lyon-Villeurbanne - Tous droits réservés.</p>
        <p>Un projet créé par les bénévoles du Club Alpin de Lyon.</p>
        <p>Code source disponible sur <a href="https://github.com/Club-Alpin-Lyon-Villeurbanne/ffcam-formations" className="underline">GitHub</a>.</p>
        <p>Données issues de <a href="https://www.ffcam.fr/les-formations.html" className="underline">www.ffcam.fr</a></p>
        <p>À venir : abonnement et collecte des formations d&apos;autres clubs et comités.</p>
        <p>Dernière synchronisation : {formattedDate}</p>
      </div>
    </footer>
  );
}
