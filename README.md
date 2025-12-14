# FFCAM Formations

[![Keyway Secrets](https://www.keyway.sh/badge.svg?repo=ffcam-aura/ffcam-formations)](https://www.keyway.sh/vaults/ffcam-aura/ffcam-formations)
![Vercel Deploy](https://deploy-badge.vercel.app/vercel/ffcam-formations)
![License](https://img.shields.io/badge/license-MIT-blue)

Application web pour afficher et filtrer les formations du FFCAM (Fédération Française des Clubs Alpins et de Montagne). Cet outil a été construit par des développeurs bénévoles du Comité Régional Auvergne Rhone-Alpes.

**Production** : [https://formations.ffcam-aura.fr](https://formations.ffcam-aura.fr)

## Fonctionnalités

- **Affichage des formations** : Visualisez les formations avec les détails (lieu, discipline, tarifs, dates, places disponibles)
- **Filtrage avancé** : Filtrez par lieu, discipline, dates et disponibilités
- **Notifications par email** : Recevez des alertes pour les nouvelles formations de vos disciplines favorites
- **Protection des emails** : Les adresses email des contacts sont masquées (anti-scraping)
- **Synchronisation automatique** : Mise à jour quotidienne des formations depuis le site FFCAM

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SOURCES DE DONNÉES                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────────┐         ┌──────────────────┐                       │
│    │   Site FFCAM     │         │      Clerk       │                       │
│    │ (formations.html)│         │ (Authentification)│                       │
│    └────────┬─────────┘         └────────┬─────────┘                       │
│             │                            │                                  │
└─────────────┼────────────────────────────┼──────────────────────────────────┘
              │                            │
              ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS APPLICATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CRON JOBS (Vercel)                          │   │
│  │  ┌─────────────────────┐    ┌──────────────────────────────────┐   │   │
│  │  │ /api/sync (4h UTC)  │    │ /api/notifications/send (6h UTC)│   │   │
│  │  │                     │    │                                  │   │   │
│  │  │  • Scrape FFCAM     │    │  • Trouve nouvelles formations  │   │   │
│  │  │  • Parse HTML       │    │  • Match préférences users      │   │   │
│  │  │  • Upsert DB        │    │  • Envoie emails                │   │   │
│  │  │  • Ping healthcheck │    │  • Ping healthcheck email       │   │   │
│  │  └─────────────────────┘    └──────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            API ROUTES                                │   │
│  │  ┌──────────────────┐  ┌────────────────┐  ┌────────────────────┐   │   │
│  │  │ GET /formations  │  │ GET/POST /users│  │ GET /sync/last     │   │   │
│  │  │ (rate limited)   │  │ (auth Clerk)   │  │                    │   │   │
│  │  └──────────────────┘  └────────────────┘  └────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          SERVICES                                    │   │
│  │  ┌────────────────┐ ┌─────────────────┐ ┌────────────────────────┐  │   │
│  │  │ SyncService    │ │ FormationService│ │ NotificationService    │  │   │
│  │  │ • synchronize  │ │ • upsert        │ │ • notifyBatchFormations│  │   │
│  │  │ • pingHealth   │ │ • getRecent     │ │ • matchPreferences     │  │   │
│  │  │ • sendReport   │ │ • getAll        │ │                        │  │   │
│  │  └────────────────┘ └─────────────────┘ └────────────────────────┘  │   │
│  │  ┌────────────────┐ ┌─────────────────┐                              │   │
│  │  │ EmailService   │ │ UserService     │                              │   │
│  │  │ • sendEmail    │ │ • getPreferences│                              │   │
│  │  │ (via SMTP)     │ │ • updatePrefs   │                              │   │
│  │  └────────────────┘ └─────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         REPOSITORIES                                 │   │
│  │  ┌──────────────────────┐  ┌──────────────────┐                     │   │
│  │  │ FormationRepository  │  │ UserRepository   │                     │   │
│  │  │ • upsertFormations   │  │ • findPreferences│                     │   │
│  │  │ • findAll            │  │ • upsertPrefs    │                     │   │
│  │  │ • findRecent         │  │ • findUsersToNotify│                   │   │
│  │  └──────────────────────┘  └──────────────────┘                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INFRASTRUCTURE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────────┐    │
│  │   PostgreSQL     │  │     Brevo        │  │    Healthchecks.io     │    │
│  │   (Neon DB)      │  │   (SMTP Email)   │  │    (Monitoring)        │    │
│  │                  │  │                  │  │                        │    │
│  │ • formations     │  │ • Notifications  │  │ • Ping sync status     │    │
│  │ • disciplines    │  │ • Error reports  │  │ • Email delivery check │    │
│  │ • user_prefs     │  │ • Healthchecks   │  │ • Dead man's switch    │    │
│  │ • lieux          │  │                  │  │                        │    │
│  └──────────────────┘  └──────────────────┘  └────────────────────────┘    │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                                │
│  │     Sentry       │  │  Vercel Analytics │                               │
│  │   (Errors)       │  │   (Usage stats)   │                               │
│  └──────────────────┘  └──────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Next.js 15, React 19, TypeScript |
| **Base de données** | PostgreSQL (Neon) + Prisma ORM |
| **Authentification** | Clerk |
| **UI** | Tailwind CSS, Radix UI |
| **Email** | Nodemailer + Brevo SMTP |
| **Monitoring** | Sentry, Healthchecks.io, Vercel Analytics |
| **Secrets** | [Keyway](https://keyway.sh) |
| **Tests** | Vitest, React Testing Library |

## Monitoring & Alerting

L'application utilise plusieurs systèmes de monitoring :

### Healthchecks.io (Dead Man's Switch)

- **Sync healthcheck** : Ping quotidien après synchronisation
  - ✅ Succès : formations synchronisées
  - ⚠️ Partiel : erreurs sur certaines formations → email d'alerte
  - ❌ Échec : erreur critique → email + ping /fail

- **Email healthcheck** : Email quotidien pour vérifier la délivrabilité
  - Envoyé à une adresse `@hc-ping.com` qui attend un email régulier

### Sentry

- Capture automatique des erreurs frontend et backend
- Monitoring des performances
- Source maps pour debug en production

### Alertes Email

| Événement | Destinataire | Contenu |
|-----------|--------------|---------|
| Erreur critique sync | Admin | Stack trace + état avant erreur |
| Erreurs partielles sync | Admin | Liste des formations en échec |
| Nouvelle formation | Utilisateurs | Formations matchant leurs préférences |

## Variables d'Environnement

Les secrets de ce projet sont gérés via [Keyway](https://keyway.sh), qui synchronise automatiquement les variables d'environnement avec Vercel. Cela permet de :
- Centraliser la gestion des secrets pour toute l'équipe
- Versionner les changements de configuration
- Éviter de partager des `.env` par Slack ou email

```bash
# Base de données
POSTGRES_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Authentification Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Email (Brevo SMTP)
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASSWORD="..."
EMAIL_FROM="noreply@xxxxx"
EMAIL_SENDER_NAME="FFCAM Formations"
SYNC_NOTIFICATION_EMAIL="admin@xxxxx"

# Sécurité CRON (minimum 32 caractères)
CRON_SECRET="your-very-long-secret-at-least-32-chars"

# Monitoring (optionnel)
HEALTHCHECK_SYNC_URL="https://hc-ping.com/your-uuid"
HEALTHCHECK_NOTIFICATIONS_EMAIL="your-uuid@hc-ping.com"
```

## Développement

### Prérequis

- Node.js 20+
- pnpm
- PostgreSQL (ou Docker)

### Installation

```bash
# Cloner le projet
git clone git@github.com:ffcam-aura/ffcam-formations.git
cd ffcam-formations

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Lancer la base de données (optionnel, si Docker)
docker run --name ffcam-postgres \
  -e POSTGRES_DB=ffcam_formations \
  -e POSTGRES_USER=ffcam_user \
  -e POSTGRES_PASSWORD=ffcam_password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Appliquer les migrations
pnpm prisma migrate dev

# Lancer le serveur de développement
pnpm dev
```

### Commandes utiles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build production
pnpm test         # Tests unitaires
pnpm test:watch   # Tests en mode watch
pnpm test:coverage # Couverture de tests
pnpm lint         # Linting
pnpm prisma studio # Interface graphique DB
```

### Hooks Git

Husky vérifie automatiquement avant chaque push :
- `pnpm lint` - Linting
- `pnpm build` - Build sans erreurs

## API

### Endpoints publics

| Endpoint | Description | Rate Limit |
|----------|-------------|------------|
| `GET /api/formations` | Liste des formations | 60 req/min |
| `GET /api/sync/last` | Date dernière sync | - |

### Endpoints protégés (CRON)

```bash
# Synchronisation manuelle
curl -X GET "https://formations.ffcam-aura.fr/api/sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Envoi notifications
curl -X GET "https://formations.ffcam-aura.fr/api/notifications/send" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Endpoints utilisateur (Auth Clerk)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/users` | GET | Récupérer préférences |
| `/api/users` | POST | Mettre à jour préférences |

**Corps de la requête POST :**
```json
{
  "disciplines": ["Alpinisme", "Escalade"]
}
```

## Déploiement

L'application est déployée automatiquement sur Vercel à chaque push sur `main`.

### CRON Jobs (Vercel)

Configurés dans `vercel.json` :

| Job | Schedule | Description |
|-----|----------|-------------|
| `/api/sync` | 4h UTC | Synchronisation FFCAM |
| `/api/notifications/send` | 6h UTC | Envoi notifications |

## Contribuer

1. Forkez ce dépôt
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez vos modifications (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## License

Ce projet est sous licence [MIT License](./LICENSE).
