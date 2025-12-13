# FFCAM Formations

[![Keyway Secrets](https://www.keyway.sh/badge.svg?repo=ffcam-aura/ffcam-formations)](https://www.keyway.sh/vaults/ffcam-aura/ffcam-formations)

![Vercel Deploy](https://deploy-badge.vercel.app/vercel/ffcam-formations)
 ![License](https://img.shields.io/badge/license-MIT-blue)

Cette application permet d'afficher et de filtrer les formations du FFCAM (Fédération Française des Clubs Alpins et de Montagne).
Voila ce que fait l'appli:
- aller récuperer les données sur la page de formations du FFCAM
- nettoyer ces données
- les stocker dans une base de données
- les mettre à dispo via une API
- les afficher sur la page d'accueil

L'appli est déployée sur [https://formations.ffcam-aura.fr](https://formations.ffcam-aura.fr) grâce à Vercel. Pour le moment, le compte Vercel utilisé est gratuit et lié à mon compte perso.

## Fonctionnalités

- **Affichage des formations** : Visualisez les formations avec les détails tels que le lieu, la discipline, les tarifs, et les dates.
- **Filtrage avancé** : Filtrez par lieu, discipline, dates et disponibilités.
- **Protection des emails** : Les adresses email des contacts sont masquées et ne sont révélées que sur action de l'utilisateur.
- **Automatisation pré-déploiement** : Grâce à Husky, le code est automatiquement vérifié avec `pnpm lint` et `pnpm build` avant chaque push pour garantir un déploiement sans erreur sur Vercel.

## Technologies

- **Frontend** : Next.js, React, Tailwind CSS, TypeScript
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : Clerk
- **Autres** : Date-fns, Sentry, Vercel Analytics

## Environnements

### Développement local
- **Base de données** : Supabase
- **Authentification** : Clerk (clés de test)
- **Email** : Brevo SMTP

### Production
- **Hébergement** : Vercel
- **Base de données** : Neon PostgreSQL (via Vercel Marketplace)
- **Authentification** : Clerk (clés de production)
- **Email** : Brevo SMTP
  
## Installation

1. Clonez le projet :

   ```bash
   git clone git@github.com:ffcam-aura/ffcam-formations.git
   ```

2. Installez les dépendances :

   ```bash
   pnpm install
   ```

## Développement local

Lancez le projet en mode développement :

```bash
pnpm dev
```

## Pré-déploiement avec Husky

Avant chaque push, **Husky** s'assure que votre code passe les tests de linting et build :

- **Linting** : `pnpm lint`
- **Build** : `pnpm build`

Cela garantit que vous ne poussiez jamais de code qui ne passe pas les lint et le build et vous fasse perdre du temps sur **Vercel**.

## API

L'application expose plusieurs endpoints API :

### Formations

#### `GET /api/formations`
Récupère la liste des formations avec pagination et filtrage.

**Paramètres de requête :**
- `page` (optionnel) : Numéro de page (défaut: 1)
- `limit` (optionnel) : Nombre d'éléments par page (défaut: 12)
- `discipline` (optionnel) : Filtrer par discipline
- `lieu` (optionnel) : Filtrer par lieu
- `organisateur` (optionnel) : Filtrer par organisateur
- `dateDebut` (optionnel) : Date de début (YYYY-MM-DD)
- `dateFin` (optionnel) : Date de fin (YYYY-MM-DD)
- `disponibilite` (optionnel) : Formations avec places disponibles (true/false)
- `searchQuery` (optionnel) : Recherche textuelle

**Réponse :**
```json
{
  "formations": [...],
  "total": 150,
  "totalPages": 13,
  "page": 1,
  "limit": 12
}
```

### Synchronisation

#### `GET /api/sync`
Lance la synchronisation manuelle des formations depuis le site FFCAM.

**Authentification requise :**
```bash
curl -X GET "http://localhost:3000/api/sync" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**Réponse :**
```json
{
  "success": true,
  "message": "Synchronisation terminée",
  "stats": {
    "totalFormations": 150,
    "newFormations": 5,
    "updatedFormations": 12,
    "disciplines": 8,
    "lieux": 25
  }
}
```

#### `GET /api/sync/last`
Récupère la date de dernière synchronisation.

**Réponse :**
```json
"2024-01-15T04:00:00.000Z"
```

### Notifications

#### `GET /api/notifications/send`
Envoie les notifications email pour les nouvelles formations (24h).

**Authentification requise :**
```bash
curl -X GET "http://localhost:3000/api/notifications/send" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Utilisateurs

#### `GET /api/users`
Récupère les préférences de notification de l'utilisateur connecté.
*Authentification Clerk requise.*

#### `POST /api/users`
Met à jour les préférences de notification de l'utilisateur.
*Authentification Clerk requise.*

**Corps de la requête :**
```json
{
  "disciplines": ["Alpinisme", "Escalade"]
}
```

## Contribuer

1. **Forkez** ce dépôt.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/new-feature`).
3. **Commitez** vos modifications (`git commit -m 'Add some feature'`).
4. **Poussez** vers la branche (`git push origin feature/new-feature`).
5. Ouvrez une **Pull Request**.

Merci 🙏🏼

## License

Ce projet est sous licence [MIT License](./LICENSE).
