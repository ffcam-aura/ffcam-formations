import FormationCard from "@/app/components/FormationCard";
import { Formation } from "@/app/types/formation";

export default function FormationList({ formations }: { formations: Formation[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {formations.map((formation) => (
        <FormationCard key={formation.reference} formation={formation} />
      ))}
    </ul>
  );
}
