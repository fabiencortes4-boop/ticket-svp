/* Ticket SVP ! — mesures d'audience anonymes.
   Les événements sont toujours comptés sur l'appareil (aucun identifiant, rien ne sort du téléphone) :
   ils servent au rapport que les testeurs peuvent copier depuis les Réglages.
   Ils ne partent vers un service (Firebase Analytics via Capacitor, ou ENDPOINT) que si le joueur a accepté. */
'use strict';

G.Analytics = (() => {
  const KEY = 'ticketsvp-analytics-v1';
  const MAX_LOG = 400;
  // URL de votre propre serveur de collecte (POST JSON). null = aucun envoi hors Firebase.
  const ENDPOINT = null;
  let data = null;
  let sessionStart = Date.now();
  let current = null; // service en cours

  function load() {
    try {
      data = JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch (e) {
      data = null;
    }
    if (!data || typeof data !== 'object') data = {};
    data = Object.assign({ sessions: 0, playMs: 0, log: [], levels: {}, mistakes: {}, screens: {}, ads: {}, quits: {} }, data);
  }
  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* stockage plein ou indisponible */
    }
  }
  const consent = () => !!(G.save && G.save.settings.analytics);
  const inc = (obj, k, n = 1) => { obj[k] = (obj[k] || 0) + n; };

  function send(name, props) {
    if (!consent()) return;
    const fb = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.FirebaseAnalytics;
    if (fb && fb.logEvent) fb.logEvent({ name, params: props }).catch(() => {});
    if (ENDPOINT && navigator.sendBeacon) navigator.sendBeacon(ENDPOINT, JSON.stringify({ name, props, t: Date.now(), v: G.VERSION }));
  }

  function track(name, props = {}) {
    if (!data) load();
    data.log.push([Date.now(), name, props]);
    if (data.log.length > MAX_LOG) data.log.splice(0, data.log.length - MAX_LOG);
    persist();
    send(name, props);
  }

  function levelKey(cfg) {
    if (cfg.daily) return 'daily';
    if (cfg.endless) return 'endless';
    if (cfg.event) return 'event';
    return String(cfg.g);
  }
  function lv(k) {
    return (data.levels[k] = data.levels[k] || { starts: 0, wins: 0, fails: 0, quits: 0, stars: 0, errors: 0, ms: 0 });
  }

  return {
    init() {
      load();
      data.sessions++;
      sessionStart = Date.now();
      track('session_start', { n: data.sessions });
      const close = () => {
        if (!data) return;
        data.playMs += Date.now() - sessionStart;
        sessionStart = Date.now();
        if (current) {
          const k = levelKey(current.cfg);
          lv(k).quits++;
          inc(data.quits, 'app_closed_in_' + (current.cfg.endless ? 'endless' : 'level'));
          track('level_abandon', { level: k, at: current.idx, how: 'app_closed' });
          current = null;
        }
        persist();
      };
      window.addEventListener('pagehide', close);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          data.playMs += Date.now() - sessionStart;
          persist();
        } else sessionStart = Date.now();
      });
    },
    screen(name) {
      if (!data) return;
      inc(data.screens, name);
      track('screen', { name });
    },
    levelStart(cfg) {
      const k = levelKey(cfg);
      lv(k).starts++;
      current = { cfg, idx: 0, t: Date.now() };
      track('level_start', { level: k, city: cfg.city && cfg.city.id, rules: (cfg.rules || []).length });
    },
    progress(idx) {
      if (current) current.idx = idx;
    },
    mistake(kind) {
      inc(data.mistakes, kind || 'autre');
      if (current) inc(data.mistakes, (current.cfg.g != null ? 'L' + current.cfg.g : '?') + ':' + (kind || 'autre'));
      persist();
    },
    levelEnd(cfg, r) {
      const k = levelKey(cfg);
      const L = lv(k);
      if (r.success) L.wins++;
      else L.fails++;
      L.stars = Math.max(L.stars, r.stars || 0);
      L.errors += r.errors || 0;
      if (current) L.ms += Date.now() - current.t;
      current = null;
      track('level_end', { level: k, success: !!r.success, stars: r.stars || 0, errors: r.errors || 0, score: r.score || 0, acc: r.acc || 0 });
    },
    levelQuit(cfg, idx) {
      const k = levelKey(cfg);
      lv(k).quits++;
      inc(data.quits, 'menu');
      current = null;
      track('level_abandon', { level: k, at: idx, how: 'menu' });
    },
    ad(kind, placement, ok) {
      inc(data.ads, kind + (ok === false ? '_skipped' : ''));
      track('ad_' + kind, { placement: placement || '', ok: ok !== false });
    },
    /* Rapport lisible que le testeur peut copier-coller */
    report() {
      if (!data) load();
      const lines = [`Ticket SVP ! ${G.VERSION} — rapport de test`, `Sessions : ${data.sessions} · temps de jeu : ${Math.round((data.playMs + Date.now() - sessionStart) / 60000)} min`];
      const keys = Object.keys(data.levels).sort((a, b) => (+a) - (+b));
      if (keys.length) {
        lines.push('', 'Niveau : essais / réussis / ratés / abandons · étoiles max · erreurs moy. · durée moy.');
        keys.forEach((k) => {
          const L = data.levels[k];
          const name = isNaN(+k) ? k : `${+k + 1}`;
          const done = L.wins + L.fails || 1;
          lines.push(`${name} : ${L.starts} / ${L.wins} / ${L.fails} / ${L.quits} · ${'★'.repeat(L.stars) || '-'} · ${(L.errors / done).toFixed(1)} · ${Math.round(L.ms / done / 1000)} s`);
        });
      }
      const mk = Object.entries(data.mistakes).filter(([k]) => !k.includes(':')).sort((a, b) => b[1] - a[1]);
      if (mk.length) lines.push('', 'Erreurs par type : ' + mk.map(([k, n]) => `${k} ${n}`).join(', '));
      const ad = Object.entries(data.ads);
      if (ad.length) lines.push('Pubs : ' + ad.map(([k, n]) => `${k} ${n}`).join(', '));
      const q = Object.entries(data.quits);
      if (q.length) lines.push('Abandons : ' + q.map(([k, n]) => `${k} ${n}`).join(', '));
      lines.push('Appareil : ' + `${window.innerWidth}×${window.innerHeight}` + (G.Install.standalone() ? ' · appli installée' : '') + (G.Tester.on() ? ' · mode testeur' : ''));
      return lines.join('\n');
    },
    reset() {
      try {
        localStorage.removeItem(KEY);
      } catch (e) {
        /* rien */
      }
      load();
    },
  };
})();
