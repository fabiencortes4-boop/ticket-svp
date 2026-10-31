// Les anciens tests n'attendent pas la fenêtre de consentement du premier lancement
module.exports = (p) => p.addInitScript(() => {
  const g = Storage.prototype.getItem;
  Storage.prototype.getItem = function (k) {
    const v = g.call(this, k);
    if (k !== 'ticketsvp.save.v1') return v;
    const d = v ? JSON.parse(v) : {};
    if (!d.lang) d.lang = 'fr'; // les tests vérifient les textes français
    if (!d.seenVersion) d.seenVersion = '99.0.0'; // pas de fenêtre « Nouveautés » par-dessus les écrans testés
    d.settings = Object.assign({ music: true, sfx: true, vibe: true }, d.settings, { consentAsked: true });
    return JSON.stringify(d);
  };
});
