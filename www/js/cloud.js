/* Ticket SVP ! — sauvegarde en ligne et code de sauvegarde.
   Ouvert depuis un lien claude.ai par une personne connectée qui a le droit d'écrire, le jeu range la partie
   dans l'espace privé de ce joueur (personne d'autre ne peut la lire, pas même le propriétaire du lien) :
   elle le suit d'un appareil à l'autre. Sinon, la partie reste dans le navigateur, et le code de sauvegarde
   (Réglages) permet de la transporter à la main. */
'use strict';

G.Cloud = (() => {
  const DELAY = 2500; // regroupe les écritures rapprochées
  let doc = null; // document privé du joueur, quand la sauvegarde en ligne marche
  let state = 'local'; // 'local' | 'connecting' | 'online' | 'readonly'
  let timer = 0;
  let writing = false;
  let dirty = false;

  async function push() {
    timer = 0;
    if (!doc || writing) {
      dirty = !!doc;
      return;
    }
    writing = true;
    dirty = false;
    try {
      await doc.set({ save: JSON.parse(JSON.stringify(G.save)), t: G.save.updatedAt || Date.now(), v: G.VERSION });
    } catch (e) {
      if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) {
        // Ce visiteur ne peut pas écrire ici (lecture seule) : on reste sur l'appareil
        doc = null;
        state = 'readonly';
      } else dirty = true;
    }
    writing = false;
    if (dirty && doc) schedule();
  }

  function schedule() {
    if (!doc) return;
    clearTimeout(timer);
    timer = setTimeout(push, DELAY);
  }

  function flush() {
    if (timer) {
      clearTimeout(timer);
      push();
    }
  }

  /* Remplace la partie en cours par une autre et rafraîchit l'écran de menu affiché */
  function adopt(data) {
    G.save = G.mergeSave(data);
    try {
      localStorage.setItem('ticketsvp.save.v1', JSON.stringify(G.save));
    } catch (e) {
      /* rien */
    }
    G.applyAccess();
    G.Audio.applySettings();
    const cur = G.$('#screens') && G.$('#screens').firstElementChild;
    const cls = cur ? cur.className : '';
    if (/map-screen/.test(cls)) G.UI.map();
    else if (/settings-screen/.test(cls)) G.UI.settings();
    else if (/album-screen/.test(cls)) G.UI.album();
  }

  async function init() {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return;
    state = 'connecting';
    try {
      const [db, user] = await Promise.all([c.use('db'), c.use('user')]);
      const id = db && user ? await user.id() : null;
      if (!id) {
        state = 'local';
        return;
      }
      const ref = db.doc('data/users/' + id + '/save');
      const snap = await ref.get();
      const remote = snap.exists ? snap.data() : null;
      doc = ref;
      state = 'online';
      // L'expérience ne fait que monter : la partie la plus avancée gagne, puis la plus récente
      const localT = G.save.updatedAt || 0;
      const rs = remote && remote.save;
      const rxp = rs ? rs.xp || 0 : -1;
      const lxp = G.save.xp || 0;
      const remoteWins = rs && (rxp > lxp || (rxp === lxp && (remote.t || 0) > localT));
      if (remoteWins && !G.$('.game-screen')) {
        adopt(rs);
        G.toast(`${G.icon('check')} Partie récupérée depuis ta sauvegarde en ligne`, 'good');
      } else if (!remoteWins && (!rs || (remote.t || 0) !== localT)) {
        push(); // la partie de cet appareil est plus avancée : on la met en ligne
      }
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
    } catch (e) {
      doc = null;
      state = 'local';
    }
  }

  /* Code de sauvegarde : la partie entière en texte, à recopier sur un autre appareil */
  function exportCode() {
    const json = JSON.stringify(G.save);
    const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
    return 'TSVP1-' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function importCode(code) {
    const m = String(code || '').replace(/\s+/g, '').match(/^TSVP1-([A-Za-z0-9_-]+)$/);
    if (!m) return false;
    try {
      const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(b64 + '==='.slice((b64.length + 3) % 4)), (ch) => ch.charCodeAt(0));
      const data = JSON.parse(new TextDecoder().decode(bytes));
      if (!data || typeof data !== 'object' || !data.levels) return false;
      adopt(data);
      G.persist();
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    init,
    schedule,
    exportCode,
    importCode,
    status: () => state,
  };
})();
