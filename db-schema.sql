-- Table des disciplines
CREATE TABLE disciplines (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lieux
CREATE TABLE lieux (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    departement VARCHAR(3),  -- Code département (ex: 73)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des types d'hébergement
CREATE TABLE types_hebergement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL, -- ex: GITE, REFUGE FFCAM, CENTRE ACTIVITE FFCAM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table principale des formations
CREATE TABLE formations (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(50) UNIQUE NOT NULL,  -- ex: 2025SNNAPIN84701
    titre VARCHAR(255) NOT NULL,
    discipline_id INTEGER REFERENCES disciplines(id),
    information_stagiaire TEXT,
    nombre_participants INTEGER NOT NULL,
    places_restantes INTEGER,
    hebergement_id INTEGER REFERENCES types_hebergement(id),
    tarif DECIMAL(10,2),
    lieu_id INTEGER REFERENCES lieux(id),
    organisateur VARCHAR(255) NOT NULL,
    responsable VARCHAR(255) NOT NULL,
    email_contact VARCHAR(255),
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',  -- active, cancelled, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour gérer les dates des formations (certaines formations ont plusieurs dates)
CREATE TABLE formations_dates (
    id SERIAL PRIMARY KEY,
    formation_id INTEGER REFERENCES formations(id),
    date_debut DATE NOT NULL,
    date_fin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les documents/fichiers liés aux formations
CREATE TABLE formations_documents (
    id SERIAL PRIMARY KEY,
    formation_id INTEGER REFERENCES formations(id),
    type VARCHAR(50), -- ex: inscription, cursus
    nom VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_formations_reference ON formations(reference);
CREATE INDEX idx_formations_discipline ON formations(discipline_id);
CREATE INDEX idx_formations_lieu ON formations(lieu_id);
CREATE INDEX idx_formations_dates_formation ON formations_dates(formation_id);
CREATE INDEX idx_formations_dates_debut ON formations_dates(date_debut);
CREATE INDEX idx_formations_documents_formation ON formations_documents(formation_id);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_formations_modtime
    BEFORE UPDATE ON formations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_formations_dates_modtime
    BEFORE UPDATE ON formations_dates
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_formations_documents_modtime
    BEFORE UPDATE ON formations_documents
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
-- Modifications des tables pour ajouter les contraintes UNIQUE nécessaires
ALTER TABLE disciplines ADD CONSTRAINT disciplines_nom_unique UNIQUE (nom);
ALTER TABLE lieux ADD CONSTRAINT lieux_nom_unique UNIQUE (nom);
ALTER TABLE types_hebergement ADD CONSTRAINT types_hebergement_nom_unique UNIQUE (nom);