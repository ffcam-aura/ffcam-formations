import { PrismaClient } from "@prisma/client";
import seedData from "../data/formations-seed.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  for (const formation of seedData.formations) {
    // Upsert discipline
    const discipline = await prisma.disciplines.upsert({
      where: { nom: formation.discipline },
      create: { nom: formation.discipline },
      update: {},
    });

    // Upsert lieu
    const lieu = await prisma.lieux.upsert({
      where: { nom: formation.lieu },
      create: { nom: formation.lieu },
      update: {},
    });

    // Upsert hébergement
    let hebergement = null;
    if (formation.hebergement) {
      hebergement = await prisma.types_hebergement.upsert({
        where: { nom: formation.hebergement },
        create: { nom: formation.hebergement },
        update: {},
      });
    }

    // Upsert formation
    const f = await prisma.formations.upsert({
      where: { reference: formation.reference },
      create: {
        reference: formation.reference,
        titre: formation.titre,
        discipline_id: discipline.id,
        information_stagiaire: formation.informationStagiaire,
        nombre_participants: formation.nombreParticipants,
        places_restantes: formation.placesRestantes,
        hebergement_id: hebergement?.id ?? null,
        tarif: formation.tarif,
        lieu_id: lieu.id,
        organisateur: formation.organisateur,
        responsable: formation.responsable,
        email_contact: formation.emailContact,
        first_seen_at: new Date(formation.firstSeenAt),
        last_seen_at: new Date(formation.lastSeenAt),
        status: "active",
      },
      update: {
        titre: formation.titre,
        last_seen_at: new Date(formation.lastSeenAt),
      },
    });

    // Seed dates
    await prisma.formations_dates.deleteMany({ where: { formation_id: f.id } });
    for (const date of formation.dates) {
      await prisma.formations_dates.create({
        data: {
          formation_id: f.id,
          date_debut: new Date(date),
        },
      });
    }

    // Seed documents
    await prisma.formations_documents.deleteMany({ where: { formation_id: f.id } });
    for (const doc of formation.documents) {
      await prisma.formations_documents.create({
        data: {
          formation_id: f.id,
          type: doc.type,
          nom: doc.nom,
          url: doc.url,
        },
      });
    }

    console.log(`  ✓ ${formation.reference} - ${formation.titre}`);
  }

  console.log(`\nDone! ${seedData.formations.length} formations seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
