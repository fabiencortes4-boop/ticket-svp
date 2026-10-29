/* Ticket SVP ! — installation sur l'écran d'accueil (Android et iPhone), hors ligne, et mode testeur. */
'use strict';

G.Install = (() => {
  let deferred = null; // invite d'installation Android/Chrome, gardée pour le bouton
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const topLevel = (() => {
    try {
      return window.top === window;
    } catch (e) {
      return false;
    }
  })();
  const standalone = () => window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

  function init() {
    // Hors ligne : uniquement sur le vrai site (pas dans un aperçu intégré ni un fichier local)
    const native = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    if ('serviceWorker' in navigator && topLevel && !native && /^https?:$/.test(location.protocol)) {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register('sw.js').then((reg) => {
        // Une appli installée reste ouverte longtemps : on cherche une mise à jour à chaque retour au premier plan
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
      }).catch(() => {});
      // Nouvelle version installée : on recharge dès que le joueur n'est pas en plein service
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController) return;
        if (G.$('.game-screen')) G.Install.pendingReload = true;
        else location.reload();
      });
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferred = e;
      document.dispatchEvent(new Event('ticketsvp-installable'));
    });
    window.addEventListener('appinstalled', () => {
      deferred = null;
      G.Analytics.screen('installed');
      G.toast(`${G.icon('check')} Ticket SVP ! est installé sur ton écran d'accueil`, 'good');
      G.$$('[data-install]').forEach((b) => b.remove());
    });
  }

  const canOffer = () => topLevel && !standalone() && (!!deferred || isIOS);

  function iosHelp() {
    const share = '<svg viewBox="0 0 24 24" class="ios-ic" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10.5H6v10h12v-10h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
    const add = '<svg viewBox="0 0 24 24" class="ios-ic" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    G.modal(`<div class="install-help"><h2>Installer sur ton iPhone</h2>
      <p>Le jeu s'ouvrira en plein écran, marchera hors ligne et gardera ta partie.</p>
      <ol>
        <li><span class="ios-step">${share}</span><div><b>Appuie sur Partager</b><small>En bas de Safari (en haut sur iPad), ou dans le menu de Chrome</small></div></li>
        <li><span class="ios-step">${add}</span><div><b>Choisis «&nbsp;Sur l'écran d'accueil&nbsp;»</b><small>Fais défiler la liste si tu ne le vois pas</small></div></li>
        <li><span class="ios-step ios-app"><img src="apple-touch-icon.png" alt=""></span><div><b>Touche «&nbsp;Ajouter&nbsp;»</b><small>Puis lance Ticket SVP ! depuis son icône</small></div></li>
      </ol></div>`, { cls: 'modal-install' });
  }

  async function prompt() {
    G.Audio.sfx('click');
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      deferred = null;
      if (choice && choice.outcome === 'accepted') G.$$('[data-install]').forEach((b) => b.remove());
    } else if (isIOS) iosHelp();
  }

  /* Bouton à glisser dans un écran ; il apparaît aussi plus tard si Chrome devient prêt à installer */
  function button(cls = '') {
    return `<button class="btn btn-ghost btn-install ${cls}" data-install ${canOffer() ? '' : 'hidden'}>${G.icon('chest')} Installer l'appli</button>`;
  }
  function bind(root) {
    G.$$('[data-install]', root).forEach((b) => b.addEventListener('click', prompt));
    const show = () => G.$$('[data-install]', root).forEach((b) => { b.hidden = !canOffer(); });
    document.addEventListener('ticketsvp-installable', show);
  }

  return { init, canOffer, button, bind, prompt, isIOS, standalone };
})();

/* ---------- Mode testeur ----------
   Le lien …/?testeur débloque toutes les villes, les boss et la Ligne infinie, et offre de quoi essayer la
   boutique, pour qu'un testeur voie tout le jeu sans jouer les 70 services. ?testeur=off le désactive. */
G.Tester = {
  init() {
    const q = new URLSearchParams(location.search);
    if (!q.has('testeur')) return;
    const s = G.save;
    if (q.get('testeur') === 'off') {
      if (s.tester) {
        s.tester = false;
        G.persist();
      }
    } else if (!s.tester) {
      s.tester = true;
      if (!s.testerGift) {
        s.testerGift = true;
        s.coins += 5000;
        s.gold += 50;
      }
      s.tutorialDone = true;
      G.persist();
      setTimeout(() => G.toast(`${G.icon('star')} Mode testeur activé : tout est débloqué`, 'gold'), 900);
    }
    // Retire ?testeur de l'adresse : l'appli installée ensuite démarre sur la page normale
    try {
      history.replaceState(null, '', location.pathname + location.hash);
    } catch (e) {
      /* rien */
    }
  },
  on: () => !!(G.save && G.save.tester),
  badge: () => (G.save && G.save.tester ? `<span class="tester-badge">${G.icon('star')} Mode testeur</span>` : ''),
};
