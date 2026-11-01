/* Ticket SVP ! — déblocage du jeu complet (achat unique, sans pub).
   Gratuit : le bus de campagne, Paris (20 services) et le Contrôle du jour.
   Jeu complet : les 9 autres villes, la Ligne infinie, le défi de la semaine, le mode Cauchemar,
   les événements mensuels et toutes les tenues.

   Dans l'appli Android, l'achat passe par Google Play Billing (cordova-plugin-purchase) :
   produit « non consommable » d'identifiant PRODUCT_ID, à créer dans la Play Console
   (Monétiser › Produits › Produits intégrés à l'application). Le prix vient de Google Play.
   Dans un navigateur, l'achat est SIMULÉ tant que WEB_SIMULATED vaut true (version de test). */
'use strict';

G.FREE_LEVELS = 20; // services 1 à 20 : bus + Paris
G.FREE_UNIFORM_MAX = 20; // tenues à 20 tickets d'or au plus : gratuites ; les autres demandent le jeu complet

G.Store = {
  PRODUCT_ID: 'jeu_complet',
  PRICE: '2,99 €', // affiché tant que Google Play n'a pas donné le prix local
  WEB_SIMULATED: true, // à passer à false le jour où le site ne doit plus offrir l'achat simulé
  native: null, // CdvPurchase.store dans l'appli
  price: null,
};

/* Le jeu complet est ouvert : acheté, joueur d'avant la version 1.5, ou lien testeur */
G.isFull = () => !!(G.save && (G.save.full || G.save.tester));
G.needsFull = (g) => g >= G.FREE_LEVELS && !G.isFull();

/* Joueurs d'avant la 1.5 (jeu gratuit avec pubs) : ils gardent tout, sans payer */
G.Store.grandfather = () => {
  const s = G.save;
  if (s.fullChecked) return;
  if (Object.values(s.levels || {}).some((v) => v > 0)) s.full = s.full || 'ancien';
  s.fullChecked = true;
  G.persist();
};

G.Store.priceLabel = () => G.Store.price || G.Store.PRICE;

function grant(how) {
  const s = G.save;
  if (s.full === true) return;
  const first = !s.full;
  s.full = true;
  G.persist();
  if (first && how !== 'silent') {
    G.Audio.sfx('levelup');
    G.toast(`${G.icon('check')} Jeu complet débloqué. Merci !`, 'good');
    G.Analytics.event('full_unlocked', { how });
    if (G.UI.refresh) G.UI.refresh();
  }
}

G.Store.init = () => {
  const start = () => {
    const C = window.CdvPurchase;
    if (!C || !C.store) return;
    const { store, ProductType, Platform } = C;
    try {
      store.register([{ id: G.Store.PRODUCT_ID, type: ProductType.NON_CONSUMABLE, platform: Platform.GOOGLE_PLAY }]);
      store.when()
        .productUpdated((p) => {
          if (p.id !== G.Store.PRODUCT_ID) return;
          const offer = p.getOffer && p.getOffer();
          const ph = offer && offer.pricingPhases && offer.pricingPhases[0];
          if (ph && ph.price) G.Store.price = ph.price;
          if (p.owned) grant('silent');
        })
        .approved((t) => t.finish())
        .finished((t) => { if (t.products.some((x) => x.id === G.Store.PRODUCT_ID)) grant('achat'); });
      store.initialize([Platform.GOOGLE_PLAY]).then(() => {
        G.Store.native = store;
        if (store.owned(G.Store.PRODUCT_ID)) grant('silent');
      });
    } catch (e) {
      G.Store.native = null;
    }
  };
  // Les plugins Cordova sont prêts après « deviceready » (appli Android uniquement)
  if (window.cordova) document.addEventListener('deviceready', start, { once: true });
};

/* Achat : true quand le jeu complet est ouvert */
G.Store.buy = async () => {
  if (G.isFull()) return true;
  const store = G.Store.native;
  if (store) {
    const p = store.get(G.Store.PRODUCT_ID);
    const offer = p && p.getOffer();
    if (!offer) {
      G.toast('Google Play ne répond pas. Vérifie ta connexion et réessaie.', 'bad');
      return false;
    }
    const err = await offer.order();
    if (err && err.code !== window.CdvPurchase.ErrorCode.PAYMENT_CANCELLED) G.toast("L'achat n'a pas abouti. Aucun paiement n'a été fait.", 'bad');
    return G.isFull(); // l'accès arrive par « finished », parfois après la fermeture de Google Play
  }
  if (window.cordova) {
    G.toast("Google Play n'est pas disponible sur cet appareil.", 'bad');
    return false;
  }
  if (!G.Store.WEB_SIMULATED) {
    G.toast("L'achat se fait dans l'appli Android, sur Google Play.", 'info');
    return false;
  }
  return new Promise((resolve) => {
    const m = G.modal(`<div class="sim-buy"><h2>Achat simulé</h2>
      <p>Version de test : aucun paiement n'est demandé. Sur Google Play, cet écran sera celui de Google.</p>
      <button class="btn btn-primary" data-yes>Simuler l'achat (${G.Store.priceLabel()})</button>
      <button class="btn btn-ghost" data-no>Annuler</button></div>`, { cls: 'modal-sim' });
    m.onDismiss = () => { m.close(); resolve(false); };
    G.$('[data-yes]', m.el).addEventListener('click', () => { m.close(); grant('simulé'); resolve(true); });
    G.$('[data-no]', m.el).addEventListener('click', () => { m.close(); resolve(false); });
  });
};

/* Changement de téléphone : Google Play rend l'achat au même compte */
G.Store.restore = async () => {
  const store = G.Store.native;
  if (!store) return G.toast(G.isFull() ? 'Le jeu complet est déjà ouvert.' : "La restauration se fait dans l'appli Android, avec ton compte Google.", 'info');
  try {
    await store.restorePurchases();
  } catch (e) {
    /* rien */
  }
  if (store.owned(G.Store.PRODUCT_ID)) grant('restauré');
  G.toast(G.isFull() ? `${G.icon('check')} Achat retrouvé : jeu complet ouvert.` : 'Aucun achat trouvé sur ce compte Google.', G.isFull() ? 'good' : 'info');
};

/* Fenêtre « Jeu complet » : contenu, prix, achat, restauration */
G.Store.offer = (why = '') => {
  if (G.$('.modal-full')) return;
  if (G.isFull()) return G.toast(`${G.icon('check')} Tu as déjà le jeu complet.`, 'good');
  G.Analytics.event('full_offer', { why });
  const m = G.modal(`<div class="full-offer">
      <div class="wn-badge">${G.icon('star')} Jeu complet</div>
      <h2>Continue l'aventure !</h2>
      ${why ? `<p class="fo-why">${why}</p>` : ''}
      <ul class="fo-list">
        <li>${G.icon('map')}<span><b>9 villes de plus</b><br>Londres, Tokyo, Moscou, le Train de nuit, le Grand Express, New York, Berlin, Venise et Mars, avec leurs boss</span></li>
        <li>${G.icon('play')}<span>Ligne infinie, défi de la semaine et événements chaque mois</span></li>
        <li>${G.icon('moon')}<span>Mode Cauchemar et ses trésors</span></li>
        <li>${G.icon('star')}<span>Toutes les tenues de la boutique</span></li>
        <li>${G.icon('check')}<span>Un seul achat, sans pub, pour toujours</span></li>
      </ul>
      <button class="btn btn-primary btn-xl" data-buy-full>Débloquer · ${G.Store.priceLabel()}</button>
      <button class="btn btn-ghost" data-later>Plus tard</button>
      <button class="link-btn fo-restore" data-restore>Déjà acheté ? Restaurer l'achat</button>
    </div>`, { cls: 'modal-full' });
  G.$('[data-buy-full]', m.el).addEventListener('click', async (ev) => {
    G.Audio.sfx('click');
    ev.currentTarget.disabled = true;
    const ok = await G.Store.buy();
    if (ok) m.close();
    else if (m.el.isConnected) G.$('[data-buy-full]', m.el).disabled = false;
  });
  G.$('[data-later]', m.el).addEventListener('click', () => m.close());
  G.$('[data-restore]', m.el).addEventListener('click', async () => {
    await G.Store.restore();
    if (G.isFull()) m.close();
  });
};
