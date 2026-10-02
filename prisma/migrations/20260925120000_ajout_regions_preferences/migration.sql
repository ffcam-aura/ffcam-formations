-- Filtre optionnel des notifications par comité régional organisateur (#12).
-- Codes région INSEE (ex. '84' = Auvergne-Rhône-Alpes) ; tableau vide = tous les comités.
-- Idempotent : peut être rejoué sans risque (prisma migrate deploy ou exécution manuelle).
ALTER TABLE "user_preferences" ADD COLUMN IF NOT EXISTS "regions" TEXT[] DEFAULT ARRAY[]::TEXT[];
