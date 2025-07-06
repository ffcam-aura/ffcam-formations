#!/bin/bash

# Script de déploiement vers Vercel
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Démarrage du déploiement vers Vercel..."

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Attention: Vous n'êtes pas sur la branche main (actuellement sur: $CURRENT_BRANCH)"
    read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

# Vérifier s'il y a des changements non commités
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Des changements non commités ont été détectés"
    git status --short
    read -p "Voulez-vous continuer sans ces changements ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Déploiement annulé"
        exit 1
    fi
fi

# Vérifier que le remote vercel existe
if ! git remote | grep -q "^vercel$"; then
    echo "❌ Le remote 'vercel' n'existe pas"
    echo "💡 Pour l'ajouter: git remote add vercel <URL_DU_REPO_VERCEL>"
    exit 1
fi

# Synchroniser avec le remote principal d'abord (optionnel)
echo "📥 Récupération des dernières modifications du repo principal..."
git fetch origin

# Vérifier si nous sommes à jour avec origin/main
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse origin/main)
if [ $LOCAL != $REMOTE ]; then
    echo "⚠️  Votre branche locale n'est pas à jour avec origin/main"
    read -p "Voulez-vous pull les derniers changements ? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git pull origin main
    fi
fi

# Pousser vers Vercel
echo "🔄 Push vers Vercel..."
git push vercel main

echo "✅ Déploiement lancé avec succès!"
echo "📊 Vous pouvez suivre le déploiement sur: https://vercel.com/dashboard"