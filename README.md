# FFCAM Formations
![Vercel Deploy](https://deploy-badge.vercel.app/vercel/ffcam-formations)
 ![License](https://img.shields.io/badge/license-MIT-blue)

Cette application permet d'afficher et de filtrer les formations du FFCAM (Fédération Française des Clubs Alpins et de Montagne).
Voila ce que fait l'appli:
- aller récuperer les données sur la page de formations du FFCAM
- nettoyer ces données
- les stocker dans une base de données
- les mettre à dispo via une API
- les afficher sur la page d'accueil

L'appli est déployée sur [https://ffcam.tech](https://ffcam.tech) grâce à Vercel. Pour le moment, le compte Vercel utilisé est gratuit et lié à mon compte perso.

## Fonctionnalités

- **Affichage des formations** : Visualisez les formations avec les détails tels que le lieu, la discipline, les tarifs, et les dates.
- **Filtrage avancé** : Filtrez par lieu, discipline, dates et disponibilités.
- **Protection des emails** : Les adresses email des contacts sont masquées et ne sont révélées que sur action de l'utilisateur.
- **Automatisation pré-déploiement** : Grâce à Husky, le code est automatiquement vérifié avec `pnpm lint` et `pnpm build` avant chaque push pour garantir un déploiement sans erreur sur Vercel.

## Technologies

- **Next.js**, **React**, **Tailwind CSS**, **TypeScript**, **Date-fns**
  
## Installation

1. Clonez le projet :

   ```bash
   git clone git@github.com:Club-Alpin-Lyon-Villeurbanne/ffcam-formations.git
   ```

2. Installez les dépendances :

   ```bash
   pnpm install
   ```

## Développement local

Lancez le projet en mode développement :

```bash
pnpm run dev
```

## Pré-déploiement avec Husky

Avant chaque push, **Husky** s'assure que votre code passe les tests de linting et build :

- **Linting** : `pnpm lint`
- **Build** : `pnpm build`

Cela garantit que vous ne poussiez jamais de code qui ne passe pas les lint et le build et vous fasse perdre du temps sur **Vercel**.

## Contribuer

1. **Forkez** ce dépôt.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/new-feature`).
3. **Commitez** vos modifications (`git commit -m 'Add some feature'`).
4. **Poussez** vers la branche (`git push origin feature/new-feature`).
5. Ouvrez une **Pull Request**.

Merci 🙏🏼

## License

Ce projet est sous licence [MIT License](./LICENSE).
