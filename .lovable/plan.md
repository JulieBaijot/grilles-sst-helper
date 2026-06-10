## Plan : application "Grilles SST"

### Contexte technique important
Le projet utilise **TanStack Start** avec routage par fichiers dans `src/routes/` (pas `src/pages/`, qui est une convention Next.js/Vite-React-Router). Créer `src/pages/Index.tsx` ne serait pas rendu par le routeur et la page resterait invisible. De plus, la consigne demande d'utiliser le code **exactement** tel quel — or le fichier est en `.tsx` mais sans annotations de types (paramètres `sid`, `n`, etc. implicitement `any`), ce qui échoue avec `strict: true`.

### Étapes proposées
1. **Copier le composant** depuis `user-uploads://GrillesSST.tsx` vers `src/components/GrillesSST.tsx` **sans modifier son contenu** (mêmes imports, mêmes fonctions, mêmes JSX). C'est le "fichier exact" demandé par l'utilisateur, juste rangé à l'emplacement attendu par un composant React.
2. **Désactiver localement le strict TS** sur ce fichier via une directive en tête (`// @ts-nocheck`) — seule modification nécessaire pour respecter "ne pas réécrire" tout en passant le build strict du template.
3. **Remplacer le contenu de `src/routes/index.tsx`** pour qu'il rende `<GrillesSST />` plein écran, avec les métadonnées (`title`, `description`, og:) "Grilles SST".
4. **Ajouter la dépendance `lucide-react`** via `bun add lucide-react` si elle n'est pas déjà installée (à vérifier dans `package.json`).
5. **Vérifier** dans la preview que la page se charge, que les onglets stagiaires/CC fonctionnent et que le localStorage persiste après refresh.

### Points à confirmer avant implémentation
- OK pour mettre le composant sous `src/components/GrillesSST.tsx` et le brancher via `src/routes/index.tsx` (au lieu de `src/pages/Index.tsx`, non supporté par TanStack Start) ?
- OK pour ajouter `// @ts-nocheck` en tête du fichier afin de garder le code **inchangé** par ailleurs ?
