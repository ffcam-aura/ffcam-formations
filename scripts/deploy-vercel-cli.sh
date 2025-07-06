#!/bin/bash

# Script de déploiement alternatif utilisant Vercel CLI
# Nécessite: npm i -g vercel
# Usage: ./scripts/deploy-vercel-cli.sh

set -e

echo "🚀 Déploiement vers Vercel avec Vercel CLI..."

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "💡 Pour l'installer: npm i -g vercel"
    echo "   Puis connectez-vous: vercel login"
    exit 1
fi

# Vérifier s'il y a des changements non commités
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Des changements non commités ont été détectés"
    git status --short
    echo "💡 Il est recommandé de commiter vos changements avant le déploiement"
fi

# Options de déploiement
PROD_FLAG=""
if [ "$1" == "--prod" ]; then
    PROD_FLAG="--prod"
    echo "📌 Déploiement en production"
else
    echo "📌 Déploiement en preview"
    echo "💡 Utilisez 'pnpm deploy:prod' pour déployer en production"
fi

# Déployer avec Vercel CLI
echo "🔄 Déploiement en cours..."
vercel $PROD_FLAG

echo "✅ Déploiement terminé!"