# Publier Ticket SVP ! — pas à pas

Ce guide part du dépôt tel qu'il est. Les étapes marquées **(toi)** demandent un compte ou un ordinateur avec Android Studio.

**Modèle économique (depuis la 1.5)** : aucune publicité, aucune donnée collectée. Le bus de campagne, Paris (20 services) et le Contrôle du jour sont gratuits ; un **achat unique** (« Jeu complet », 2,99 € conseillé) ouvre les 9 autres villes, la Ligne infinie, le défi de la semaine, les événements mensuels, le mode Cauchemar et toutes les tenues. Les joueurs d'avant la 1.5 gardent tout, sans payer.

## 1. Comptes à créer (toi)

| Compte | Coût | Pourquoi |
| --- | --- | --- |
| [Google Play Console](https://play.google.com/console) | 25 $, une fois | Publier l'appli |
| Profil de paiement Google (dans la Play Console) | Gratuit | Vendre le jeu complet et recevoir l'argent |
| Apple Developer (plus tard, pour iOS) | 99 $/an | App Store |

Le profil de paiement demande une identité et une adresse. Google peut afficher le nom et l'adresse du vendeur sur la fiche : beaucoup de développeurs seuls passent par une micro-entreprise avec domiciliation. Vérifie la règle en vigueur dans la Play Console.

## 2. Construire l'appli Android (toi)

Le projet Android est dans le dépôt (`android/`) : icônes, écran de démarrage, Google Play Billing (plugin `cordova-plugin-purchase`), cible Android 15 (API 35), Android 6 minimum.

```bash
cd ticket-svp
npm install
npm run android:apk     # APK de test, à installer à la main (voir store/INSTALLER-APK.md)
```

Version : dans `android/app/build.gradle`, augmente `versionCode` (entier) et `versionName` (`"1.5.0"`) à chaque envoi.

Clé de signature, à créer une seule fois et **à sauvegarder hors de l'ordinateur** :

```bash
keytool -genkey -v -keystore ticketsvp.jks -alias ticketsvp -keyalg RSA -keysize 2048 -validity 10000
```

Ensuite : `npm run android:open`, puis *Build › Generate Signed App Bundle* avec **cette** clé → fichier `.aab`.
(La clé `android/keystore/ticketsvp-test.jks` du dépôt ne sert qu'aux APK de test : ne l'envoie jamais à Google Play.)

Google relève régulièrement le niveau d'API cible exigé : si la Play Console refuse le `.aab`, augmente `targetSdkVersion` et `compileSdkVersion` dans `android/variables.gradle`.

## 3. Le produit « Jeu complet » (toi)

1. Play Console › *Monétiser avec Play › Produits › Produits intégrés à l'application* › **Créer un produit**.
2. Identifiant : **`jeu_complet`** (exactement, c'est `G.Store.PRODUCT_ID` dans `www/js/store.js`).
3. Nom : « Jeu complet » · Description : « Les 9 autres villes, tous les modes et toutes les tenues, sans pub. » · Prix : 2,99 €. Google convertit pour les autres pays.
4. Activer le produit. Il n'apparaît dans l'appli qu'une fois l'appli envoyée sur une piste de test (test interne ou fermé).
5. Pour essayer sans payer : Play Console › *Paramètres › Test des licences*, ajouter ton adresse Gmail. Les achats de ce compte sont alors fictifs.
6. Promotion de lancement (1,99 € pendant deux semaines par exemple) : *Monétiser › Promotions*.

Le jeu garde l'achat sur le téléphone et le redemande à Google Play à chaque lancement ; « Restaurer un achat » (boutique, onglet Jeu complet) le retrouve après un changement de téléphone, avec le même compte Google.

**Version web** (site GitHub Pages, lien claude.ai) : l'achat y est **simulé** tant que `G.Store.WEB_SIMULATED` vaut `true` dans `www/js/store.js`. Le jour de la sortie sur Google Play, passe-le à `false` : le site affichera alors « L'achat se fait dans l'appli Android ».

## 4. Fiche Play Store

- **Nom** : Ticket SVP ! — Contrôleur de métro
- **Description courte** (80 car.) : Contrôle les tickets, démasque les fraudeurs… et garde ton calme !
- **Description longue** : voir le document de conception. Mentionner : « Essai gratuit : le bus et Paris. Jeu complet en un seul achat, sans pub. »
- **Visuels** : `store/icon-512.png`, `store/feature-graphic-1024x500.png`, `store/screenshot-*.png` (et `store/en/`, `store/es/`, `store/de/` pour les fiches traduites).
- **Catégorie** : Jeux › Simulation (ou Puzzle). **Contient des annonces** : non. **Achats intégrés** : oui.
- **Politique de confidentialité** : `https://…/ticket-svp/privacy.html` (GitHub Pages). Remplir d'abord l'adresse e-mail de contact dans `www/privacy.html`.
- **Adresse e-mail de contact** : affichée publiquement, prends une adresse réservée au jeu.

### Questionnaire « Sécurité des données »

| Question | Réponse |
| --- | --- |
| Votre appli collecte-t-elle ou partage-t-elle des données utilisateur ? | **Non** |
| Chiffrement en transit | Sans objet (aucune donnée envoyée) |
| Suppression des données | Sans objet ; la progression locale s'efface depuis les Réglages |

L'achat passe par Google Play Billing : c'est Google qui traite le paiement, l'appli ne reçoit aucune donnée personnelle. Il n'a pas à être déclaré comme collecte par l'appli.

### Classification du contenu (IARC)

Pas de violence réelle (verbaliser = un tampon « AMENDE »), pas de jeu d'argent, pas de pub, pas de récompense aléatoire payante. Résultat attendu : PEGI 3 ou 7. Sans publicité ni collecte de données, le jeu peut viser tous les âges ; si tu coches un public de moins de 13 ans, Google applique le programme « Familles » (déclarations supplémentaires, mais rien à changer dans le jeu).

## 5. Test fermé obligatoire

Les nouveaux comptes personnels doivent faire tester l'appli par **au moins 12 personnes pendant 14 jours d'affilée** avant de pouvoir la publier.

1. Play Console › *Tests › Test fermé* › créer une version avec le `.aab`.
2. Ajouter les adresses Gmail des testeurs (une liste ou un groupe Google). Les ajouter aussi dans *Test des licences* pour qu'ils puissent essayer l'achat sans payer.
3. Envoyer le lien d'inscription. Chaque testeur doit l'accepter **et** installer l'appli.
4. **Testeurs qui avaient l'APK de test** : leur dire de copier leur code de sauvegarde (Réglages › Sauvegarde) **avant** de désinstaller l'APK, puis de le coller dans la version Play Store. Les deux versions ne sont pas signées par la même clé : Android refuse d'installer l'une par-dessus l'autre.
5. Demander aux testeurs d'envoyer leur **rapport de test** (Réglages › Données › Rapport de test) au bout de quelques jours : il dit quels niveaux font abandonner et quelles règles piègent le plus. Rien ne part automatiquement.
6. Après 14 jours : *Demander l'accès à la production*.

## 6. iOS (plus tard)

```bash
npm run ios:init && npm run ios:open   # nécessite un Mac avec Xcode
```

Créer le même produit non consommable `jeu_complet` dans App Store Connect, puis ajouter `Platform.APPLE_APPSTORE` à `store.initialize` dans `www/js/store.js`.
