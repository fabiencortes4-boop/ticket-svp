/* Ticket SVP ! — gestion des publicités.
   Dans l'application Android (Capacitor + @capacitor-community/admob), les vraies pubs AdMob sont utilisées,
   précédées du formulaire de consentement RGPD de Google (UMP).
   Dans un navigateur, des pubs de DÉMONSTRATION s'affichent (fausses marques, aucun réseau contacté).
   Le reste du jeu attend juste une promesse qui renvoie true quand la récompense est méritée. */
'use strict';

G.Ads = {
  INTERSTITIAL_MIN_LEVEL: 8, // jamais avant le niveau 8
  INTERSTITIAL_GAP_MS: 180000, // au plus une toutes les 3 minutes
  INTERSTITIAL_EVERY: 2, // au plus une tous les 2 services
  lastRewardedAt: 0,
  native: null, // plugin AdMob quand le jeu tourne dans l'appli
};

/* Identifiants AdMob. Ceux-ci sont les identifiants de TEST publics de Google :
   les remplacer par les vôtres (console AdMob) avant la publication, et passer TESTING à false.
   L'identifiant d'application (ca-app-pub-…~…) se met dans android/app/src/main/AndroidManifest.xml. */
G.AD_CONFIG = {
  TESTING: true,
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

G.Ads.init = async () => {
  const cap = window.Capacitor;
  const plugin = cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.AdMob;
  if (!plugin) return;
  try {
    await plugin.initialize({ initializeForTesting: G.AD_CONFIG.TESTING });
    // Formulaire de consentement RGPD (obligatoire dans l'UE), affiché seulement si nécessaire
    const info = await plugin.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === 'REQUIRED') await plugin.showConsentForm();
    G.Ads.native = plugin;
  } catch (e) {
    G.Ads.native = null; // on retombe sur les pubs de démonstration
  }
};

/* Pub récompensée native : true seulement si AdMob confirme la récompense */
function nativeRewarded() {
  const ad = G.Ads.native;
  return new Promise((resolve) => {
    let rewarded = false;
    const handles = [];
    const done = (ok) => {
      handles.forEach((h) => h.then((x) => x.remove()).catch(() => {}));
      G.Audio.duck(false);
      resolve(ok);
    };
    handles.push(ad.addListener('onRewardedVideoAdReward', () => { rewarded = true; }));
    handles.push(ad.addListener('onRewardedVideoAdDismissed', () => done(rewarded)));
    handles.push(ad.addListener('onRewardedVideoAdFailedToLoad', () => done(false)));
    handles.push(ad.addListener('onRewardedVideoAdFailedToShow', () => done(false)));
    G.Audio.duck(true);
    ad.prepareRewardVideoAd({ adId: G.AD_CONFIG.rewarded, isTesting: G.AD_CONFIG.TESTING })
      .then(() => ad.showRewardVideoAd())
      .catch(() => done(false));
  });
}

async function nativeInterstitial() {
  const ad = G.Ads.native;
  try {
    G.Audio.duck(true);
    await ad.prepareInterstitial({ adId: G.AD_CONFIG.interstitial, isTesting: G.AD_CONFIG.TESTING });
    await ad.showInterstitial();
  } catch (e) {
    /* pas de pub disponible : on continue */
  }
  G.Audio.duck(false);
}

function adOverlay({ rewarded, placement }) {
  return new Promise((resolve) => {
    const cr = G.AD_CREATIVES[Math.floor(Math.random() * G.AD_CREATIVES.length)];
    const total = rewarded ? 5 : 4;
    const ov = G.el('div', 'ad-overlay');
    ov.innerHTML = `
      <div class="ad-top"><span class="ad-tag">${G.icon('ad')} Publicité de démonstration</span><span class="ad-count"><b>${total}</b> s</span></div>
      <div class="ad-creative" style="--ad:${cr.color}">
        <div class="ad-brand">${cr.brand}</div>
        <div class="ad-line">${cr.line}</div>
        <div class="ad-fake-btn">Découvrir</div>
      </div>
      <div class="ad-foot">${rewarded ? `Récompense : <b>${placement}</b>` : 'Pause café du contrôleur'}<br><small>Emplacement réservé au réseau publicitaire (AdMob / AppLovin) dans la version Play Store.</small></div>
      <button class="ad-close" hidden>${rewarded ? 'Récupérer la récompense' : 'Fermer'}</button>`;
    G.$('#game-root').appendChild(ov);
    G.Audio.duck(true);
    let left = total;
    const cnt = G.$('.ad-count b', ov);
    const close = G.$('.ad-close', ov);
    const timer = setInterval(() => {
      left--;
      cnt.textContent = Math.max(0, left);
      if (left <= 0) {
        clearInterval(timer);
        G.$('.ad-count', ov).textContent = 'Terminé';
        close.hidden = false;
      }
    }, 1000);
    close.addEventListener('click', () => {
      G.Audio.sfx('click');
      G.Audio.duck(false);
      ov.classList.add('out');
      setTimeout(() => ov.remove(), 250);
      resolve(true);
    });
  });
}

/* Pub récompensée : renvoie true si le joueur l'a regardée en entier. */
G.Ads.showRewarded = async (placement) => {
  const ok = G.Ads.native ? await nativeRewarded() : await adOverlay({ rewarded: true, placement });
  if (ok) G.Ads.lastRewardedAt = Date.now();
  else if (G.Ads.native) G.toast('Aucune pub disponible pour le moment. Réessaie plus tard.');
  G.Analytics.ad('rewarded', placement, ok);
  return ok;
};

/* Interstitielle : uniquement entre deux services, avec plafonds de fréquence. */
G.Ads.maybeInterstitial = async (levelIndex) => {
  const s = G.save;
  s.shiftsSinceAd = (s.shiftsSinceAd || 0) + 1;
  G.persist();
  if (s.noAds) return;
  if (levelIndex < G.Ads.INTERSTITIAL_MIN_LEVEL) return;
  if (s.shiftsSinceAd < G.Ads.INTERSTITIAL_EVERY) return;
  if (Date.now() - (s.lastInterstitial || 0) < G.Ads.INTERSTITIAL_GAP_MS) return;
  if (Date.now() - G.Ads.lastRewardedAt < 60000) return; // pas juste après une pub récompensée
  s.shiftsSinceAd = 0;
  s.lastInterstitial = Date.now();
  G.persist();
  G.Analytics.ad('interstitial');
  if (G.Ads.native) await nativeInterstitial();
  else await adOverlay({ rewarded: false });
};
