/* Ticket SVP ! — utilitaires partagés (DOM, hasard, sauvegarde) */
'use strict';

const G = (window.G = window.G || {});

G.VERSION = '1.1.0';

G.$ = (sel, root = document) => root.querySelector(sel);
G.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

G.el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};

G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
G.wait = (ms) => new Promise((r) => setTimeout(r, ms));
G.fmt = (n) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');

/* Générateur pseudo-aléatoire déterministe (mulberry32) : même graine = mêmes passagers. */
G.rng = (seed) => {
  let a = seed >>> 0;
  const f = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.pick = (arr) => arr[Math.floor(f() * arr.length)];
  f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
  f.chance = (p) => f() < p;
  f.weighted = (entries) => {
    const total = entries.reduce((s, e) => s + e[1], 0);
    let x = f() * total;
    for (const e of entries) {
      x -= e[1];
      if (x <= 0) return e[0];
    }
    return entries[entries.length - 1][0];
  };
  f.shuffle = (arr) => {
    const a2 = arr.slice();
    for (let i = a2.length - 1; i > 0; i--) {
      const j = Math.floor(f() * (i + 1));
      [a2[i], a2[j]] = [a2[j], a2[i]];
    }
    return a2;
  };
  return f;
};

/* Dates du jeu : « aujourd'hui » est la vraie date du téléphone. */
G.today = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};
G.addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
G.pad2 = (n) => String(n).padStart(2, '0');
G.fmtDate = (d) => `${G.pad2(d.getDate())}/${G.pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
G.MONTHS = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
G.fmtMonth = (d) => `${G.MONTHS[d.getMonth()]} ${d.getFullYear()}`;
G.dayKey = (d = G.today()) => `${d.getFullYear()}${G.pad2(d.getMonth() + 1)}${G.pad2(d.getDate())}`;
G.dailyNumber = () => {
  const start = new Date(2026, 0, 1);
  return Math.max(1, Math.round((G.today() - start) / 864e5) + 1);
};

/* ---------- Sauvegarde locale ---------- */
const SAVE_KEY = 'ticketsvp.save.v1';

G.defaultSave = () => ({
  v: 1,
  coins: 0,
  gold: 5,
  xp: 0,
  levels: {}, // index global -> étoiles (0..3)
  best: {}, // index global -> meilleur score
  tools: { watch: 0, uv: 0, whistle: 0, badge: 0 },
  owned: ['classic'],
  uniform: 'classic',
  album: {}, // id spécial -> nombre de fois rencontré
  // analytics : consentement aux statistiques anonymes ; textSize m|l|xl ; cb = couleurs adaptées au daltonisme
  settings: { music: true, sfx: true, vibe: true, analytics: false, consentAsked: false, textSize: 'm', cb: false, slow: false, calm: false },
  daily: { last: null, streak: 0, result: null },
  chest: { last: null, extra: false },
  goldAds: { day: null, count: 0 },
  noAds: false,
  stats: { caught: 0, checked: 0, shifts: 0, specials: 0, bestCombo: 0, questionCatches: 0, coinsEarned: 0 },
  seenRules: {},
  lastInterstitial: 0,
  shiftsSinceAd: 0,
  tutorialDone: false,
  endless: { best: 0, bestStation: 0, runs: 0 },
  achievements: {},
});

/* Fusionne une sauvegarde brute (locale, en ligne ou code) avec les valeurs par défaut */
G.mergeSave = (data) => {
  const base = G.defaultSave();
  if (!data || typeof data !== 'object') return base;
  for (const k of Object.keys(base)) {
    if (data[k] === undefined) continue;
    if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) base[k] = Object.assign(base[k], data[k]);
    else base[k] = data[k];
  }
  base.updatedAt = data.updatedAt || 0;
  return base;
};

G.load = () => {
  let data = null;
  try {
    data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
  } catch (e) {
    data = null;
  }
  // Fusion superficielle pour accepter les anciennes sauvegardes
  return G.mergeSave(data);
};

G.persist = () => {
  G.save.updatedAt = Date.now();
  if (G.Cloud) G.Cloud.schedule();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(G.save));
  } catch (e) {
    /* stockage indisponible : le jeu continue sans sauvegarde */
  }
};

G.resetSave = () => {
  G.save = G.defaultSave();
  G.persist();
};

G.vibrate = (ms) => {
  if (!G.save || !G.save.settings.vibe) return;
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {
    /* non supporté */
  }
};

/* Petite notification en haut de l'écran */
G.toast = (html, kind = '') => {
  const host = G.$('#toasts');
  if (!host) return;
  const t = G.el('div', `toast ${kind}`, html);
  host.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2200);
  setTimeout(() => t.remove(), 2600);
};

/* Compteur animé (score, pièces) */
G.countTo = (el, from, to, ms = 500, fmt = G.fmt) => {
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

/* Accessibilité : taille du texte, couleurs, animations réduites */
G.applyAccess = () => {
  const s = G.save.settings;
  const h = document.documentElement;
  h.dataset.text = s.textSize || 'm';
  h.classList.toggle('cb', !!s.cb);
  h.classList.toggle('calm', !!s.calm);
};
/* Chrono plus lent (option d'accessibilité) */
G.timeScale = () => (G.save && G.save.settings.slow ? 1.5 : 1);
