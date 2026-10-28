# Publier Ticket SVP ! — pas à pas

Ce guide part du dépôt tel qu'il est. Les étapes marquées **(toi)** demandent un compte ou un ordinateur avec Android Studio.

## 1. Comptes à créer (toi)

| Compte | Coût | Pourquoi |
| --- | --- | --- |
| [Google Play Console](https://play.google.com/console) | 25 $, une fois | Publier l'appli |
| [AdMob](https://admob.google.com) | Gratuit | Vraies pubs et versement des revenus |
| [Firebase](https://console.firebase.google.com) (facultatif) | Gratuit | Statistiques anonymes en ligne |
| Apple Developer (plus tard, pour iOS) | 99 $/an | App Store |

## 2. AdMob

1. Dans AdMob : *Applications › Ajouter* « Ticket SVP ! » (Android). Note l'**identifiant d'application** `ca-app-pub-XXXX~YYYY`.
2. Crée deux blocs d'annonces : **Avec récompense** et **Interstitiel**. Note leurs identifiants `ca-app-pub-XXXX/ZZZZ`.
3. *Confidentialité et messages › RGPD* : crée un message de consentement (le jeu l'affiche tout seul au démarrage).
4. Dans `www/js/ads.js`, remplace les identifiants de `G.AD_CONFIG` et passe `TESTING` à `false` **seulement pour la version publiée** (en test, ne clique jamais sur tes propres pubs réelles : AdMob suspend les comptes).
5. Publie un fichier `app-ads.txt` sur le site indiqué dans la fiche Play, avec la ligne fournie par AdMob :
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`

## 3. Construire l'appli Android (toi)

```bash
cd ticket-svp
npm install
npm run android:init
```

Puis dans `android/app/src/main/AndroidManifest.xml`, à l'intérieur de `<application>` :

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXX~YYYY"/>
```

(En test, l'identifiant public de Google `ca-app-pub-3940256099942544~3347511713` fonctionne.)

Version : dans `android/app/build.gradle`, augmente `versionCode` (entier) et `versionName` (`"1.1.0"`) à chaque envoi.

Clé de signature, à créer une seule fois et **à sauvegarder hors de l'ordinateur** :

```bash
keytool -genkey -v -keystore ticketsvp.jks -alias ticketsvp -keyalg RSA -keysize 2048 -validity 10000
```

Ensuite : `npm run android:open`, puis *Build › Generate Signed App Bundle* avec cette clé → fichier `.aab`.

## 4. Fiche Play Store

- **Nom** : Ticket SVP ! — Contrôleur de métro
- **Description courte** (80 car.) : Contrôle les tickets, démasque les fraudeurs… et garde ton calme !
- **Description longue** : voir le document de conception.
- **Visuels** : `store/icon-512.png`, `store/feature-graphic-1024x500.png`, `store/screenshot-*.png`.
- **Catégorie** : Jeux › Simulation (ou Puzzle). **Contient des annonces** : oui.
- **Politique de confidentialité** : héberger `www/privacy.html` (GitHub Pages suffit) et coller son adresse. Remplir d'abord l'adresse e-mail de contact dans le fichier.

### Questionnaire « Sécurité des données »

| Question | Réponse |
| --- | --- |
| Données collectées | Oui : identifiant publicitaire (AdMob) ; interactions dans l'appli (statistiques, si acceptées) |
| Données partagées | Identifiant publicitaire avec Google (publicité) |
| Chiffrement en transit | Oui (géré par les SDK Google) |
| Suppression possible | Oui : réinitialisation dans les Réglages, retrait du consentement |
| Finalités | Publicité, statistiques |

### Classification du contenu (IARC)

Pas de violence réelle (verbaliser = un tampon « AMENDE »), pas de jeu d'argent : les tickets d'or s'achètent avec de l'argent réel mais ne donnent aucune récompense aléatoire payante. Résultat attendu : PEGI 3 ou 7. Public cible : 13 ans et plus (évite les règles strictes « Familles » sur les pubs).

## 5. Test fermé obligatoire

Les nouveaux comptes personnels doivent faire tester l'appli par **au moins 12 personnes pendant 14 jours d'affilée** avant de pouvoir la publier.

1. Play Console › *Tests › Test fermé* › créer une version avec le `.aab`.
2. Ajouter les adresses Gmail des testeurs (une liste ou un groupe Google).
3. Envoyer le lien d'inscription. Chaque testeur doit l'accepter **et** installer l'appli.
4. Demander aux testeurs d'envoyer leur **rapport de test** (Réglages › Données › Rapport de test) au bout de quelques jours : il dit quels niveaux font abandonner et quelles règles piègent le plus.
5. Après 14 jours : *Demander l'accès à la production*.

## 6. Achats (« Sans pub », tickets d'or)

Ils sont encore simulés dans `www/js/ui.js` (boutique). Avant de les ouvrir : créer les produits dans Play Console › *Monétiser › Produits*, puis brancher Google Play Billing (le plus simple : le plugin RevenueCat pour Capacitor, `@revenuecat/purchases-capacitor`). En attendant, la boutique réelle peut se limiter aux pubs.

## 7. Statistiques en ligne (facultatif)

Le jeu compte déjà tout sur l'appareil. Pour recevoir les chiffres de tous les joueurs :

1. Créer un projet Firebase, ajouter l'appli Android, placer `google-services.json` dans `android/app/`.
2. `npm install @capacitor-firebase/analytics firebase` puis `npx cap sync`.

`www/js/analytics.js` détecte le plugin tout seul et n'envoie rien sans l'accord du joueur.

## 8. iOS (plus tard)

```bash
npm run ios:init && npm run ios:open   # nécessite un Mac avec Xcode
```

Ajouter `GADApplicationIdentifier` (identifiant AdMob iOS) et le texte `NSUserTrackingUsageDescription` dans `ios/App/App/Info.plist`.
