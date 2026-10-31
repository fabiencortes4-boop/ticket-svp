/* Ticket SVP ! — démarrage */
'use strict';

(function boot() {
  G.save = G.load();
  G.i18nData();
  G.i18nStart();
  G.Tester.init();
  G.Install.init();
  G.applyAccess();
  G.Analytics.init();
  G.Ads.init();
  const root = G.$('#game-root');
  root.innerHTML = '<div id="screens"></div><div id="toasts" aria-live="polite"></div>';
  // Le premier toucher n'importe où débloque le son (règle des navigateurs mobiles)
  const unlock = () => {
    G.Audio.init();
    if (G.Audio.pending) {
      G.Audio.play(G.Audio.pending);
      G.Audio.pending = null;
    }
  };
  document.addEventListener('pointerdown', unlock, { once: true });
  // Empêche le zoom par double toucher pendant le jeu
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch < 300 && e.target.closest('.game-screen')) e.preventDefault();
    lastTouch = now;
  }, { passive: false });
  G.UI.title();
  G.Cloud.init();
  if (!G.save.settings.consentAsked) setTimeout(G.UI.consent, 600);
})();
