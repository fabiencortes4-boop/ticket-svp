# Tests automatiques

Chaque fichier `*.test.js` ouvre le jeu dans Chromium (Playwright), le joue comme un joueur, et vérifie qu'aucune erreur
n'apparaît. Les captures d'écran sont rangées dans `tests/shots/` (ignoré par Git).

```bash
npm install
npx playwright install chromium   # une seule fois
npm test                          # tous les tests (environ 15 minutes)
./tests/run.sh cauchemar          # seulement certains tests
```

| Test | Ce qu'il vérifie |
| --- | --- |
| regles-coherence-110-services | Sur les 110 services, chaque fraudeur est vraiment en faute et chaque innocent en règle |
| cauchemar-coherence | Même vérification en mode Cauchemar, papiers possédés compris |
| menus-boutique-album | Carte, album, boutique, réglages, défi du jour, un service complet |
| formats-ecran | Téléphone vertical et horizontal, tablette, pliables, ordinateur |
| hors-ligne-installation-testeur | Mode hors ligne, bouton d'installation iPhone/Android, lien `?testeur` |
| sauvegarde-en-ligne-et-code | Sauvegarde claude.ai simulée sur plusieurs appareils, code de sauvegarde |
| … | Voir le nom de chaque fichier |
