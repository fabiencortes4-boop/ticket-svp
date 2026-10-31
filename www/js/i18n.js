/* Ticket SVP ! — traduction (anglais, espagnol, allemand).
   Le jeu est écrit en français. Chaque texte affiché est traduit au moment où il apparaît à l'écran :
   d'abord par correspondance exacte, puis par gabarit (« Score à battre : {0} »), les parties variables
   étant elles-mêmes traduites. Les dictionnaires sont dans js/lang-*.js. */
'use strict';

G.LANGS = { fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch' };
G.I18N_DATA = G.I18N_DATA || {};

G.lang = (() => {
  let saved = null;
  try {
    saved = (JSON.parse(localStorage.getItem('ticketsvp.save.v1') || 'null') || {}).lang;
  } catch (e) {
    saved = null;
  }
  if (saved && G.LANGS[saved]) return saved;
  const nav = String((navigator.languages && navigator.languages[0]) || navigator.language || 'fr').slice(0, 2).toLowerCase();
  return G.LANGS[nav] ? nav : 'en';
})();

(() => {
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  let exact = null;
  let patterns = [];
  const cache = new Map();
  const produced = new Set(); // textes déjà traduits : jamais retraduits (évite les boucles)

  function build() {
    const d = G.I18N_DATA[G.lang];
    exact = null;
    patterns = [];
    cache.clear();
    if (!d || G.lang === 'fr') return;
    exact = new Map();
    for (const [fr, tr] of Object.entries(d)) {
      if (!tr) continue;
      if (/\{\d+\}/.test(fr)) {
        const order = [];
        const src = fr.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\\?\{(\d+)\\?\}/g, (m, k) => {
          order.push(Number(k));
          return '([\\s\\S]*?)';
        });
        patterns.push({ re: new RegExp(`^${src}$`), order, tr, weight: fr.replace(/\{\d+\}/g, '').length });
      } else exact.set(norm(fr), tr);
    }
    patterns.sort((a, b) => b.weight - a.weight);
  }

  function core(text, depth) {
    if (!/[A-Za-zÀ-ÿ]{2,}/.test(text)) return text;
    const hit = exact.get(text);
    if (hit) return hit;
    // « le Mime », « la DJ » : nom propre écrit en minuscule au milieu d'une phrase
    if (/^(le |la |l')/.test(text)) {
      const up = exact.get(text[0].toUpperCase() + text.slice(1));
      if (up) return up[0].toLowerCase() + up.slice(1);
    }
    if (depth > 3) return text;
    for (const p of patterns) {
      const m = p.re.exec(text);
      if (!m) continue;
      return p.tr.replace(/\{(\d+)\}/g, (x, k) => {
        const i = p.order.indexOf(Number(k));
        return i < 0 ? '' : core(norm(m[i + 1]), depth + 1);
      });
    }
    return text;
  }

  /* Traduit un texte (en gardant ses espaces de début et de fin) */
  G.tr = (text) => {
    if (!exact || typeof text !== 'string' || !text.trim() || produced.has(text)) return text;
    const c = cache.get(text);
    if (c !== undefined) return c;
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    const out = m[1] + core(norm(m[2]), 0) + m[3];
    if (cache.size > 4000) {
      cache.clear();
      produced.clear();
    }
    cache.set(text, out);
    produced.add(out);
    return out;
  };

  /* ---------- Traduction de l'écran au fil de l'eau ---------- */
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, PRE: 1 };
  const ATTRS = ['placeholder', 'title', 'aria-label'];
  function textNode(n) {
    const p = n.parentNode;
    if (!p || SKIP[p.nodeName] || (p.closest && p.closest('[data-notr]'))) return;
    const v = n.nodeValue;
    const t = G.tr(v);
    if (t !== v) n.nodeValue = t;
  }
  function element(el) {
    if (SKIP[el.nodeName]) return;
    for (const a of ATTRS) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) {
        const t = G.tr(v);
        if (t !== v) el.setAttribute(a, t);
      }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) return textNode(root);
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    element(root);
    const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = it.nextNode();
    while (n) {
      if (n.nodeType === 3) textNode(n);
      else element(n);
      n = it.nextNode();
    }
  }

  G.i18nStart = () => {
    build();
    document.documentElement.lang = G.lang;
    if (!exact) return;
    walk(document.body);
    new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'characterData') textNode(m.target);
        else if (m.type === 'attributes') element(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };

  /* Tableaux de données utilisés pour composer des phrases (mois…) */
  G.i18nData = () => {
    const d = G.I18N_DATA[G.lang];
    if (!d || G.lang === 'fr' || !G.MONTHS) return;
    G.MONTHS = G.MONTHS.map((m) => d[m] || m);
  };
})();
