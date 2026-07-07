# Waqt

Horaires de prière, qibla et tasbih — PWA React déployable sur Vercel, structurée
pour être portée plus tard vers React Native / Capacitor (App Store, Play Store).

Stage 1 (fondations) : redesign complet, thème clair/sombre/auto, FR/EN/AR + RTL,
geocoding réel (Nominatim), couche IA agnostique (Gemini par défaut) via une
fonction serverless. Stage 2 (à venir) : notifications, calendrier, favoris,
mode hors-ligne, météo, partage, historique étendu.

## Démarrage local

```bash
npm install
cp .env.example .env.local   # puis renseigne GEMINI_API_KEY
npm run dev
```

`npm run dev` sert aussi `/api/*` localement (via `vite-plugins/vercelApiDev.js`,
qui reproduit l'environnement des fonctions serverless Vercel) — pas besoin de
`vercel dev`.

Sans `GEMINI_API_KEY`, tout fonctionne sauf la recherche de mosquées et la
vérification caméra (ce sont les deux seules fonctionnalités qui appellent l'IA) ;
elles échouent proprement avec un message d'erreur au lieu de planter.

## Déploiement (Vercel)

1. Importer le repo dans Vercel (framework détecté automatiquement : Vite).
2. Dans les réglages du projet Vercel → Environment Variables, ajouter :
   - `AI_PROVIDER=gemini`
   - `GEMINI_API_KEY=<ta clé, depuis https://aistudio.google.com/apikey>`
3. Déployer. `api/ai.js` et `api/geocode.js` deviennent des fonctions serverless
   automatiquement (dossier `api/` détecté par Vercel).

## Changer de fournisseur IA

La couche IA est agnostique au fournisseur : `api/ai.js` délègue à
`api/_lib/providers/index.js`, qui choisit le provider via la variable
d'environnement `AI_PROVIDER` (défaut `gemini`). Pour ajouter un autre
fournisseur (Anthropic, OpenAI…) :

1. Créer `api/_lib/providers/<nom>.js` exportant `{ generateJSON, verifyImage }`
   avec la même signature que `gemini.js`.
2. L'enregistrer dans `api/_lib/providers/index.js`.
3. Mettre `AI_PROVIDER=<nom>` dans les variables d'environnement.

Aucun changement côté frontend (`src/lib/aiClient.js` n'appelle que `/api/ai`).

## Avant publication sur les stores

- Remplacer `public/icons/icon.svg` par de vraies icônes PNG 192/512
  (+ variante maskable) — c'est un placeholder pour l'instant.
- Renseigner un vrai contact dans le `User-Agent` de `api/geocode.js`
  (obligatoire par la politique d'usage de Nominatim).
- Le calcul du fuseau horaire suit celui de l'appareil, pas celui du lieu
  choisi (limitation connue, documentée dans le plan Stage 1).
