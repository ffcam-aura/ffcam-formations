-- Table des disciplines
CREATE TABLE disciplines (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des lieux
CREATE TABLE lieux (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL UNIQUE,
    departement VARCHAR(3),  -- Code département (ex: 73)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des types d'hébergement
CREATE TABLE types_hebergement (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL UNIQUE, -- ex: GITE, REFUGE FFCAM, CENTRE ACTIVITE FFCAM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table principale des formations
CREATE TABLE formations (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(50) NOT NULL UNIQUE,  -- ex: 2025SNNAPIN84701
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

-- Table pour gérer les dates des formations
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

-- Table pour stocker les préférences de notifications des utilisateurs
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table pour stocker les disciplines sélectionnées par chaque utilisateur
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_preference_id INTEGER REFERENCES user_preferences(id) ON DELETE CASCADE,
    discipline_id INTEGER REFERENCES disciplines(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    last_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_preference_id, discipline_id)
);