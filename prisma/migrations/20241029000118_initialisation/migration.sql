-- CreateTable
CREATE TABLE "disciplines" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations" (
    "id" SERIAL NOT NULL,
    "reference" VARCHAR(50) NOT NULL,
    "titre" VARCHAR(255) NOT NULL,
    "discipline_id" INTEGER,
    "information_stagiaire" TEXT,
    "nombre_participants" INTEGER NOT NULL,
    "places_restantes" INTEGER,
    "hebergement_id" INTEGER,
    "tarif" DECIMAL(10,2),
    "lieu_id" INTEGER,
    "organisateur" VARCHAR(255) NOT NULL,
    "responsable" VARCHAR(255) NOT NULL,
    "email_contact" VARCHAR(255),
    "first_seen_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations_dates" (
    "id" SERIAL NOT NULL,
    "formation_id" INTEGER,
    "date_debut" DATE NOT NULL,
    "date_fin" DATE,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formations_documents" (
    "id" SERIAL NOT NULL,
    "formation_id" INTEGER,
    "type" VARCHAR(50),
    "nom" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formations_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lieux" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "departement" VARCHAR(3),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lieux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "types_hebergement" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "types_hebergement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_preference_id" INTEGER,
    "discipline_id" INTEGER,
    "enabled" BOOLEAN DEFAULT true,
    "last_notified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disciplines_nom_unique" ON "disciplines"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "formations_reference_key" ON "formations"("reference");

-- CreateIndex
CREATE INDEX "idx_formations_discipline" ON "formations"("discipline_id");

-- CreateIndex
CREATE INDEX "idx_formations_lieu" ON "formations"("lieu_id");

-- CreateIndex
CREATE INDEX "idx_formations_reference" ON "formations"("reference");

-- CreateIndex
CREATE INDEX "idx_formations_dates_debut" ON "formations_dates"("date_debut");

-- CreateIndex
CREATE INDEX "idx_formations_dates_formation" ON "formations_dates"("formation_id");

-- CreateIndex
CREATE INDEX "idx_formations_documents_formation" ON "formations_documents"("formation_id");

-- CreateIndex
CREATE UNIQUE INDEX "lieux_nom_unique" ON "lieux"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "types_hebergement_nom_unique" ON "types_hebergement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_user_preference_id_discipline_key" ON "user_notification_preferences"("user_preference_id", "discipline_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_hebergement_id_fkey" FOREIGN KEY ("hebergement_id") REFERENCES "types_hebergement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formations" ADD CONSTRAINT "formations_lieu_id_fkey" FOREIGN KEY ("lieu_id") REFERENCES "lieux"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formations_dates" ADD CONSTRAINT "formations_dates_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "formations_documents" ADD CONSTRAINT "formations_documents_formation_id_fkey" FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_discipline_id_fkey" FOREIGN KEY ("discipline_id") REFERENCES "disciplines"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_user_preference_id_fkey" FOREIGN KEY ("user_preference_id") REFERENCES "user_preferences"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
