/* Ticket SVP ! — petits effets animés : pièces qui volent, étincelles, éclair rouge.
   Tout est en CSS (transform/opacity, peu coûteux) ; rien ne s'affiche si le joueur a choisi
   « Réduire les animations » ou si le téléphone demande moins de mouvement. */
'use strict';

G.FX = (() => {
  const calm = () => document.documentElement.classList.contains('calm') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const host = () => G.$('#game-root');
  const center = (el) => {
    const r = el.getBoundingClientRect();
    const h = host().getBoundingClientRect();
    return { x: r.left + r.width / 2 - h.left, y: r.top + r.height / 2 - h.top };
  };
  const layer = (cls, ms) => {
    const l = G.el('div', `fx-layer ${cls}`);
    host().appendChild(l);
    setTimeout(() => l.remove(), ms);
    return l;
  };

  return {
    /* Pièces qui volent de `from` vers `to` (amende encaissée) */
    coins(from, to, n = 4) {
      if (calm() || !from || !to) return;
      const a = center(from);
      const b = center(to);
      const l = layer('fx-coins', 1200);
      for (let i = 0; i < n; i++) {
        const c = G.el('i', 'fx-coin', G.icon('coin'));
        const sx = a.x + (Math.random() - 0.5) * 60;
        const sy = a.y + (Math.random() - 0.5) * 40;
        c.style.cssText = `left:${sx}px;top:${sy}px;--tx:${b.x - sx}px;--ty:${b.y - sy}px;--arc:${-40 - Math.random() * 50}px;animation-delay:${i * 70}ms`;
        l.appendChild(c);
      }
    },
    /* Étincelles autour d'un élément (bonne décision) */
    sparks(el, color = '#ffd23f', n = 10) {
      if (calm() || !el) return;
      const a = center(el);
      const l = layer('fx-sparks', 800);
      for (let i = 0; i < n; i++) {
        const s = G.el('i', 'fx-spark');
        const ang = (i / n) * Math.PI * 2 + Math.random() * 0.4;
        const d = 46 + Math.random() * 40;
        s.style.cssText = `left:${a.x}px;top:${a.y}px;background:${color};--tx:${Math.cos(ang) * d}px;--ty:${Math.sin(ang) * d}px;--s:${0.6 + Math.random() * 0.8}`;
        l.appendChild(s);
      }
    },
    /* Éclair rouge sur les bords de l'écran (erreur) */
    hurt() {
      if (calm()) return;
      layer('fx-hurt', 500);
    },
    /* Bouclier perdu : il éclate en morceaux */
    shieldBreak(el) {
      if (calm() || !el) return;
      const a = center(el);
      const l = layer('fx-shield', 700);
      const s = G.el('i', 'fx-shield-pop', G.icon('shield'));
      s.style.cssText = `left:${a.x}px;top:${a.y}px`;
      l.appendChild(s);
      this.sparks(el, '#9fb4ff', 6);
    },
  };
})();
