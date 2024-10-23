import { z } from 'zod';

export const formationSchema = z.object({
  reference: z.string(),
  titre: z.string(),
  dates: z.array(z.string()),
  lieu: z.string(),
  informationStagiaire: z.string(),
  nombreParticipants: z.number(),
  placesRestantes: z.number().nullable(),
  hebergement: z.string(),
  tarif: z.number(),
  discipline: z.string(),
  organisateur: z.string(),
  responsable: z.string(),
  emailContact: z.string().nullable(),
});

export type Formation = z.infer<typeof formationSchema>;