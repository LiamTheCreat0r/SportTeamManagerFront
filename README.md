# Sport Team Manager — Frontend

Frontend React (Vite) de l'application de gestion d'équipe, qui remplace l'ancien frontend PHP.
Il consomme l'API Spring [API-R5.A05](https://github.com/LiamTheCreat0r/API-R5.A05).

## Fonctionnalités

- **Connexion** via l'API (`POST /auth/login`, JWT conservé dans le navigateur)
- **Tableau de bord** : victoires / nuls / défaites (nombre et %), statistiques par joueur
  (poste le plus performant, matchs consécutifs, titularisations, remplacements, moyenne des évaluations, % de victoires)
- **Joueurs** : liste avec recherche et filtre par statut, ajout, modification, suppression, commentaires
- **Rencontres** : liste, ajout, modification, suppression, saisie du résultat des matchs passés
- **Feuille de match** : assigner / modifier / retirer un titulaire ou remplaçant par poste
- **Évaluations** : noter (ou retirer la note de) chaque joueur après le match

## Lancer en local

```bash
npm install
npm run dev
```

En développement, les appels sont envoyés à `/api`, proxifié par Vite vers `http://localhost:8080`
(pas de souci de CORS). Lancez l'API en parallèle.

## Configuration de l'URL de l'API

L'URL de l'API est choisie dans cet ordre :

1. celle saisie dans « Paramètres de l'API » sur la page de connexion (sauvegardée dans le navigateur) ;
2. la variable `VITE_API_URL` au moment du build ;
3. `/api` en dev, `http://localhost:8080` sinon.

## Déploiement

Chaque push sur `main` déclenche le workflow `.github/workflows/deploy.yml`, qui build le projet
et le publie sur GitHub Pages.

- Dans **Settings → Pages**, choisir **Source : GitHub Actions** (à faire une seule fois).
- Optionnel : définir une variable de dépôt `VITE_API_URL` (**Settings → Secrets and variables → Actions → Variables**)
  pour fixer l'URL de l'API utilisée par la version en ligne.

> Le site en ligne appelle l'API directement depuis le navigateur : l'API doit donc autoriser
> l'origine GitHub Pages en CORS.
