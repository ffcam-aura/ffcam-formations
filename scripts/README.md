# Scripts de déploiement

Ce dossier contient les scripts pour faciliter le déploiement sur Vercel.

## Options de déploiement

### 1. Via Git Remote (Recommandé)

```bash
# Déploiement standard
pnpm deploy

# Force push (attention !)
pnpm deploy:force
```

Cette méthode utilise le remote Git `vercel` configuré dans votre projet.

### 2. Via Vercel CLI

Si vous préférez utiliser Vercel CLI directement :

```bash
# Installation de Vercel CLI (une seule fois)
npm i -g vercel

# Connexion à votre compte Vercel (une seule fois)
vercel login

# Déploiement en preview
pnpm deploy:cli
# ou
pnpm deploy:preview

# Déploiement en production
pnpm deploy:prod

# Voir le statut des déploiements
pnpm deploy:status
```

## Configuration

### Méthode Git Remote

1. Ajouter le remote Vercel si ce n'est pas déjà fait :
```bash
git remote add vercel https://github.com/[VOTRE-USERNAME]/ffcam-formations.git
```

2. Vérifier les remotes :
```bash
git remote -v
```

### Méthode Vercel CLI

1. Installer Vercel CLI :
```bash
npm i -g vercel
```

2. Se connecter :
```bash
vercel login
```

3. Lier le projet (dans le dossier du projet) :
```bash
vercel link
```

## Workflow recommandé

1. Développer et tester localement
2. Commiter vos changements
3. Pousser vers le repo principal : `git push origin main`
4. Déployer sur Vercel : `pnpm deploy`

## Avantages de chaque méthode

### Git Remote
- ✅ Simple et direct
- ✅ Pas de dépendance supplémentaire
- ✅ Historique Git complet sur Vercel
- ❌ Nécessite de maintenir deux remotes

### Vercel CLI
- ✅ Plus de contrôle sur le déploiement
- ✅ Déploiements preview/production séparés
- ✅ Pas besoin de maintenir un remote Git séparé
- ❌ Nécessite Vercel CLI installé globalement