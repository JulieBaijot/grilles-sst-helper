## Plan : fluidifier la saisie dans Grilles SST

Refacto ciblée sur `src/components/GrillesSST.tsx`, sans changer le rendu visuel ni la logique métier (mêmes données, même localStorage `sst-v3`).

### 1. Débouncer la persistance localStorage
- Remplacer le `useEffect` qui appelle `localStorage.setItem` à chaque keystroke par un effet débounce ~400 ms (timer `setTimeout` + cleanup).
- Garder un `setItem` synchrone uniquement sur `beforeunload` pour ne rien perdre.

### 2. Mémoïser les lignes de la grille
- Extraire un sous-composant `Row` (une ligne d'item : texte + 3 radios Acquis/En cours/Non acquis + commentaire) en dehors de `Grille` et l'envelopper de `React.memo`.
- Lui passer uniquement `item`, `value`, `comment`, et des callbacks stables créés via `useCallback` dans `Grille`.
- Même traitement pour une ligne CC (`CCRow` mémoïsé).

### 3. Garder les onglets stagiaires montés
- Au lieu de ne rendre que `students[tab]`, rendre les N grilles et masquer les inactives via `hidden` / `display:none`.
- Évite de remonter ~50 inputs au changement d'onglet et préserve le focus.

### 4. Textarea de commentaire en édition locale
- Le `<textarea>` de commentaire d'item bascule en `defaultValue` + `onBlur` (ou `useDeferredValue`) pour ne pas remonter dans `students` à chaque touche.
- Idem pour `note_role`, `note_juridique`, `cc1_s`, `cc2_s` (champs texte longs).
- Les champs courts (nom, prénom, entreprise) restent contrôlés — l'onglet doit afficher le nom en live.

### 5. Stabiliser les styles
- Extraire les objets `style={{...}}` les plus chauds (cellules de table, boutons radio, lignes) en constantes au niveau module pour qu'ils ne soient pas recréés à chaque render et que `React.memo` fonctionne bien.
- Pas de réécriture en classes Tailwind : on garde l'apparence exacte.

### Hors-scope (proposé séparément si tu veux)
- Remplacement de `confirm()` par un `<Dialog>` shadcn.
- Refonte visuelle / passage aux tokens du design system.

### Vérification
- Charger la preview, créer une session 8 stagiaires, taper rapidement dans plusieurs champs et commentaires, changer d'onglet, recharger la page → données persistées, pas de jank.
