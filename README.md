# Ticket SVP !

Jeu mobile en français : tu es contrôleur de métro et tu as quelques secondes par passager pour démasquer les fraudeurs. Il est gratuit et se finance par la publicité, selon le document de conception.

- **100 % original et libre de droits** : personnages, décors, icônes et musique sont générés par le code (SVG + synthé 8 bits WebAudio). Aucun fichier image ni son externe.
- **Sans dépendance** : HTML, CSS et JavaScript, prêt à être empaqueté en application Android avec Capacitor.

## Contenu de la version 1.1

| Élément | Détail |
| --- | --- |
| Villes | Bus de campagne (tutoriel), Paris, Londres, Tokyo, Moscou, Train de nuit, Le Grand Express : 70 services, dont 7 boss, chacune avec son décor, son paysage et sa musique |
| Modes | Campagne, Contrôle du jour, Ligne infinie (stations sans fin, un bonus au choix parmi 3 toutes les 2 stations, record personnel), défi d'un ami par code, événements saisonniers (Halloween, Noël, 1er avril à l'envers) |
| Boss | Une mécanique unique par ville : avis de recherche, fausses moustaches à arracher, faux tampons parfaits sous UV, heure de pointe chronométrée, groupes, wagon dans le noir à la lampe, enquête à indices (qui a volé le collier ?) |
| Imprévus | Mini-événements en cours de service (course-poursuite, pickpocket, inspecteur qui observe), passagers spéciaux surprises, mode Fièvre tous les 10 combos, avertissement des petites infractions |
| Histoire | Une lettre du chef de réseau avant et après chaque ville |
| Missions | 3 missions du jour avec récompenses |
| Interrogatoire | Une question par passager (coûte 1 s) : le fraudeur interrogé sur ce qui cloche ment ou hésite, et sa réponse contredit ses papiers |
| Objectifs | 1re étoile : terminer le service ; 2e et 3e : deux objectifs tirés selon les passagers (combo, faux tampons à attraper, aucun innocent verbalisé…) |
| Règles de contrôle | 10 règles au maximum, introduites une à une avec une fiche « Valable / Amende » lisible et un service plus facile à chaque nouveauté : date, zones, photo d'identité, tarif réduit (âge), compostage, abonnement nominatif, consigne du jour, validité de la carte d'identité, billets de groupe, 1re classe, et 7 consignes du jour (travaux, grève des réductions, panne des lecteurs, journées de la moustache, des lunettes, du chapeau et des aînés) |
| Passagers | Générés à la volée (13 coiffures, 11 chapeaux, 10 tenues, 14 accessoires, lunettes, moustaches, yeux), plus 41 passagers spéciaux pour l'album |
| Outils | Montre (+temps), lampe UV (révèle les vrais tampons), sifflet (fige le chrono), badge (+1 erreur), question, caméra |
| Rétention | Contrôle du jour identique pour tous avec partage du score en emojis, série de jours, coffre quotidien, album, passager du mois (points doublés), 26 succès récompensés, rangs, 12 uniformes |
| Accessibilité | Taille du texte (3 niveaux), couleurs pour daltoniens (bleu et orange), chrono plus lent (+50 %), animations réduites |
| Mesures | Statistiques anonymes avec consentement au premier lancement : réussites et abandons par niveau, erreurs par type, pubs. Rapport de test copiable dans les Réglages |
| Sauvegarde | Automatique sur l'appareil ; en ligne et privée pour chaque joueur quand le jeu est ouvert depuis un lien claude.ai par une personne connectée qui a le droit d'écrire ; code de sauvegarde à copier pour changer d'appareil |
| Formats | Téléphone vertical et horizontal, tablette, pliables (Fold ouvert, format « passeport » quasi carré), ordinateur |
| HUD | Score avec multiplicateur de combo, boucliers de réputation, progression du service, amendes encaissées, date et zones du jour, chrono par passager, règles actives, outils |
| Audio | 7 musiques (titre, carte, service, boss, valse de Moscou, berceuse du train de nuit, air oriental du Grand Express), 2 jingles, une vingtaine de bruitages |
| Monétisation | Pubs récompensées (faire appel, doubler les gains, caméra, renfort, 2e coffre, ticket d'or), interstitielles plafonnées, achats « Sans pub » et tickets d'or |

Dans l'application Android, les **vraies pubs AdMob** et le formulaire de consentement RGPD de Google sont branchés (identifiants de test par défaut). Dans un navigateur, des pubs de démonstration s'affichent. Les achats sont encore **simulés**. Le guide complet de publication est dans [`store/PUBLIER.md`](store/PUBLIER.md).

## Jouer en ligne

**https://fabiencortes4-boop.github.io/ticket-svp/** — le site est republié automatiquement à chaque envoi sur `main` (`.github/workflows/pages.yml`).

## Lancer le jeu

```bash
cd ticket-svp
npm start          # sert www/ sur http://localhost:8080
```

Ou n'importe quel serveur statique pointé sur `www/`. Sur ordinateur : flèche gauche = verbaliser, flèche droite = valider, Q = questionner, U = lampe UV, Échap = pause.

## Structure

```
www/
  index.html
  privacy.html       Politique de confidentialité (à héberger pour la fiche Play)
  css/style.css      Mise en page, HUD, animations, accessibilité
  css/fonts.css      Polices locales (le jeu marche hors ligne)
  fonts/             Lilita One, Nunito, Press Start 2P (licence OFL)
  js/util.js         Hasard déterministe, dates, sauvegarde locale, accessibilité
  js/analytics.js    Statistiques anonymes, rapport de test, envoi Firebase si accepté
  js/cloud.js        Sauvegarde en ligne (lien claude.ai) et code de sauvegarde entre appareils
  js/data.js         Villes, règles, passagers spéciaux, boutique, configuration des niveaux
  js/art.js          Dessin SVG des personnages, décors, icônes, logo
  js/art-extra.js    Chapeaux, tenues, accessoires, costumes et paysages supplémentaires
  js/gen.js          Génération des passagers et arbitrage (fraudeur ou non)
  js/modes.js        Interrogatoire, objectifs, Ligne infinie, succès
  js/features.js     Mécaniques de boss, histoire, événements saisonniers, missions, codes de défi, enquête
  js/docs.js         Rendu des tickets, abonnements, cartes d'identité
  js/audio.js        Moteur audio 8 bits : séquenceur, musiques, bruitages
  js/ads.js          Publicités : AdMob dans l'appli, démonstration dans le navigateur
  js/ui.js           Écrans : titre, carte, défi du jour, album, boutique, réglages, résultats
  js/game.js         Boucle d'un service, HUD, outils, tutoriel
  js/main.js         Démarrage
tools/store-assets.js  Génère l'icône, la bannière et les captures Play Store
store/                 Visuels Play Store et guide de publication (PUBLIER.md)
```

`G.evaluate` (dans `gen.js`) est la seule source de vérité pour décider si un passager fraude. Le générateur l'appelle sur chaque passager, et la même fonction explique l'erreur au joueur.

## Publier sur Google Play (Android) et l'App Store

Tout est détaillé pas à pas dans [`store/PUBLIER.md`](store/PUBLIER.md) : comptes, identifiants AdMob, construction du `.aab`, signature, fiche, questionnaire de sécurité des données, test fermé de 14 jours, achats, statistiques Firebase et iOS.

En résumé :

```bash
npm install
npm run android:init    # une fois
npm run android:open    # Android Studio > Build > Generate Signed App Bundle
```

## Publicités et statistiques

- `www/js/ads.js` : `G.AD_CONFIG` contient les identifiants AdMob (ceux de test de Google par défaut, à remplacer). `G.Ads.showRewarded(placement)` renvoie `true` quand AdMob confirme la récompense. `G.Ads.maybeInterstitial(levelIndex)` applique les plafonds : jamais avant le niveau 8, au plus une toutes les 3 minutes et tous les 2 services, jamais juste après une pub récompensée, aucune si « Sans pub » a été acheté.
- `www/js/analytics.js` : tout est compté sur l'appareil. L'envoi vers Firebase Analytics (ou vers `ENDPOINT`) n'a lieu que si le joueur a accepté.

## Régénérer les visuels du Store

```bash
python3 -m http.server 8765 --directory www &
node tools/store-assets.js     # nécessite Playwright
```

## Pistes pour la suite

- Équilibrer la difficulté à partir des rapports des testeurs.
- 60 passagers spéciaux au lancement (41 aujourd'hui) et 5 à 10 nouveaux par mois.
- Classements en ligne pour le défi du jour et la Ligne infinie (Google Play Jeux) : le record est aujourd'hui seulement local.
- Achats réels avec Google Play Billing.
- Davantage d'événements saisonniers (Pâques, été, nouvel an lunaire).
