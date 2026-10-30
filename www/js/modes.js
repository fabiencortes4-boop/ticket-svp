/* Ticket SVP ! — interrogatoire, objectifs par service, mode Ligne infinie */
'use strict';

/* Stations de chaque ligne, de la zone 1 à la zone 5 (pour les réponses des passagers) */
G.STATIONS = {
  bus: ['Le Lavoir', 'La Ferme Dupneu', 'Le Silo', 'Trou-sur-Marne Église', 'Les Vaches (terminus)'],
  paris: ['Châtelet', 'Barbès', 'Porte de Clignancourt', 'Saint-Ouen', 'Les Puces (terminus)'],
  london: ['Oxford Circus', 'Holborn', 'Bank', 'Stratford', 'Epping (terminus)'],
  tokyo: ['Shinjuku', 'Shibuya', 'Ikebukuro', 'Ueno', 'Akihabara (terminus)'],
  moscou: ['Place Rouge', 'Komsomolskaïa', 'Kievskaïa', 'Park Pobedy', 'Les Bouleaux (terminus)'],
  nuit: ['Paris-Gare de Lyon', 'Dijon', 'Lausanne', 'Milan', 'Venise (terminus)'],
  express: ['Paris-Est', 'Munich', 'Vienne', 'Budapest', 'Istanbul (terminus)'],
  ny: ['Times Square', 'Grand Central', 'Queensboro Plaza', 'Jackson Heights', 'Flushing (terminus)'],
  berlin: ['Alexanderplatz', 'Potsdamer Platz', 'Gleisdreieck', 'Wittenbergplatz', 'Ruhleben (terminus)'],
  venise: ['Piazzale Roma', 'Rialto', 'San Marco', 'Giardini', 'Lido (terminus)'],
  mars: ['Dôme 1', 'Olympus Mons', 'Valles Marineris', 'Cratère Gale', 'Base Phobos (terminus)'],
};

/* ---------- Interrogatoire ----------
   Un fraudeur interrogé sur le point qui cloche ment, et sa réponse contredit ses papiers.
   Sinon il peut simplement hésiter. Les innocents répondent juste (et hésitent rarement). */
G.ASK_FROM = 3; // disponible à partir du service 4
G.askAvailable = (cfg) => cfg.endless || cfg.daily || cfg.g >= G.ASK_FROM;

G.interrogate = (p, cfg, ctx, r) => {
  const R = new Set(cfg.rules);
  const t = p.ticket;
  const age = ctx.today.getFullYear() - p.birthYear;
  if (p.special && p.specialFixed) {
    const sp = G.SPECIALS.find((s) => s.id === p.special);
    return { q: 'Vous avez quelque chose à déclarer ?', a: sp.quote.replace(/[«»]/g, '').trim(), tell: false };
  }
  if (!t) {
    if (!p.fraud) return { q: "Votre ticket, s'il vous plaît ?", a: "C'est gratuit pour moi aujourd'hui, c'est la consigne !", tell: false };
    return { q: "Votre ticket, s'il vous plaît ?", a: r.pick(G.LINES.noticket), tell: true };
  }
  const topics = ['date', 'age'];
  if (R.has('zone')) topics.push('zone');
  if (R.has('photo')) topics.push('photo');
  if (R.has('stamp') && t.kind !== 'pass') topics.push('stamp');
  if (R.has('name') && t.kind === 'pass') topics.push('name');
  if (R.has('expiry')) topics.push('expiry');
  if (R.has('class') && ctx.firstClass) topics.push('class');
  if (R.has('group') && p.groupSize > 1) topics.push('group');
  const topic = p.fraud && topics.includes(p.hint) && r.chance(0.6) ? p.hint : r.pick(topics);
  const lying = p.fraud && topic === p.hint;
  const hesitate = !lying && (p.fraud ? r.chance(0.4) : r.chance(0.1));
  let q = '';
  let a = '';
  switch (topic) {
    case 'date':
      q = 'Vous avez acheté ce ticket quand ?';
      if (lying) a = r.pick(['Ce matin ! Enfin… je crois.', "Aujourd'hui, juré craché !", "Hier soir. Ou ce matin. C'est pareil, non ?"]);
      else a = t.kind === 'pass' ? "Au début du mois, comme d'habitude." : r.pick(['Ce matin, au guichet.', "Tout à l'heure, à l'automate.", 'Il y a dix minutes.']);
      break;
    case 'age': {
      q = 'Quel âge avez-vous ?';
      if (lying && t.kind === 'reduced') a = `J'ai… ${t.reducedType === 'etudiant' ? r.int(19, 24) : r.int(66, 79)} ans. Pile.`;
      else a = `J'ai ${age} ans.`;
      break;
    }
    case 'zone': {
      q = 'Vous descendez où ?';
      const names = G.STATIONS[cfg.city.id] || G.STATIONS.paris;
      const z = lying ? ctx.zoneReq : r.int(1, Math.max(1, Math.min(t.zoneMax, ctx.zoneReq)));
      a = `À ${names[z - 1]}, en zone ${z}.`;
      break;
    }
    case 'photo':
      q = "C'est bien vous, sur la photo ?";
      a = lying ? r.pick(["Oui oui… j'ai juste un peu changé.", "C'est mon jumeau. Enfin, c'est moi.", "On m'a mal photographié."]) : r.pick(["Oui, c'est moi !", 'Oui, une vieille photo, hein.', 'Évidemment !']);
      break;
    case 'stamp':
      q = 'Vous avez bien composté ?';
      a = lying ? r.pick(['Le composteur était en panne !', 'Bien sûr ! Enfin… à la main.', "Composter ? C'est obligatoire ?"]) : 'Oui, en montant.';
      break;
    case 'name':
      q = `Vous êtes bien ${t.passName} ?`;
      a = lying ? r.pick(["Euh… oui. C'est moi. Enfin, mon cousin.", 'Plus ou moins.', "Disons que c'est un prête-nom."]) : "Oui, c'est bien moi.";
      break;
    case 'expiry':
      q = "Votre carte d'identité est encore valable ?";
      a = lying ? r.pick(['Bien sûr ! Enfin… je crois.', "Une carte, ça ne périme pas, si ?", "Elle est comme le bon vin : elle vieillit bien."]) : 'Oui, je l\'ai refaite récemment.';
      break;
    case 'group':
      q = 'Vous êtes combien, en tout ?';
      a = lying ? r.pick([`Euh… ${t.travelers || 1}. Enfin, ${p.groupSize} avec le petit.`, `${t.travelers || 1} ! Lui, il ne compte pas, il est petit.`, 'On compte les cousins ?']) : `On est ${p.groupSize}, comme sur le ticket.`;
      break;
    case 'class':
      q = 'Vous avez bien un billet de 1re classe ?';
      a = lying ? r.pick(['Évidemment, je suis très chic !', "La 2e classe, c'est presque pareil, non ?", "J'ai l'air de voyager en 2e ?"]) : 'Oui, place 42, côté fenêtre.';
      break;
    default:
      break;
  }
  if (hesitate) a = `Euh… ${a.charAt(0).toLowerCase()}${a.slice(1)}`;
  return { q, a, tell: lying || hesitate };
};

/* ---------- Objectifs par service ----------
   1re étoile : terminer le service. 2e et 3e : deux objectifs tirés selon les passagers du service. */
const CATCH_TXT = {
  stamp: ['faux tampon', 'faux tampons'],
  photo: ['fausse photo', 'fausses photos'],
  age: ['faux tarif réduit', 'faux tarifs réduits'],
  date: ['ticket périmé', 'tickets périmés'],
  zone: ['ticket hors zone', 'tickets hors zone'],
  name: ['abonnement emprunté', 'abonnements empruntés'],
  ticket: ['passager sans ticket', 'passagers sans ticket'],
  expiry: ['carte expirée', 'cartes expirées'],
  group: ['groupe resquilleur', 'groupes resquilleurs'],
  class: ['faux billet de 1re classe', 'faux billets de 1re classe'],
};

G.makeObjectives = (cfg, queue) => {
  const r = G.rng(cfg.g * 97 + queue.length * 7 + queue.filter((q) => q.fraud).length);
  const counts = {};
  queue.forEach((q) => {
    if (q.fraud && !q.specialFixed && CATCH_TXT[q.hint]) counts[q.hint] = (counts[q.hint] || 0) + 1;
  });
  const skill = [
    cfg.g < 8 ? { id: 'max1', text: 'Au plus 1 erreur' } : { id: 'noerr', text: 'Aucune erreur' },
    { id: 'notimeout', text: 'Aucun passager trop lent' },
    { id: 'noinnocent', text: 'Aucun innocent verbalisé' },
  ];
  const task = [];
  Object.keys(counts).forEach((k) => {
    const n = Math.min(2, counts[k]);
    task.push({ id: 'catch', type: k, n, text: `Attraper ${n} ${CATCH_TXT[k][n > 1 ? 1 : 0]}` });
  });
  const cn = Math.min(queue.length - 1, 4 + Math.floor(cfg.g / 6));
  task.push({ id: 'combo', n: cn, text: `Enchaîner un combo de ${cn}` });
  if (G.askAvailable(cfg)) task.push({ id: 'question', n: 1, text: 'Démasquer un fraudeur après l\'avoir questionné' });
  const X = Math.round((queue.length * 125) / 50) * 50;
  task.push({ id: 'score', n: X, text: `Marquer ${G.fmt(X)} points` });
  return [r.pick(skill), r.pick(task)].map((o) => Object.assign({ done: false }, o));
};

G.objectiveDone = (o, s) => {
  switch (o.id) {
    case 'max1': return s.errors <= 1;
    case 'noerr': return s.errors === 0;
    case 'notimeout': return s.timeouts === 0;
    case 'noinnocent': return s.wrongFines === 0;
    case 'catch': return (s.caughtBy[o.type] || 0) >= o.n;
    case 'combo': return s.bestCombo >= o.n;
    case 'question': return s.questionCatches >= o.n;
    case 'score': return s.score >= o.n;
    case 'mystery': return !!s.mysterySolved;
    default: return false;
  }
};
/* Objectifs qui peuvent être validés en cours de service (les autres se jugent à la fin) */
G.objectiveLive = (o) => ['catch', 'combo', 'question', 'score'].includes(o.id);
G.objectiveProgress = (o, s) => {
  switch (o.id) {
    case 'catch': return `${Math.min(s.caughtBy[o.type] || 0, o.n)}/${o.n}`;
    case 'combo': return `${Math.min(s.bestCombo, o.n)}/${o.n}`;
    case 'question': return `${Math.min(s.questionCatches, o.n)}/${o.n}`;
    case 'score': return `${G.fmt(Math.min(s.score, o.n))}/${G.fmt(o.n)}`;
    case 'max1': return s.errors <= 1 ? 'en cours' : 'raté';
    case 'noerr': return s.errors === 0 ? 'en cours' : 'raté';
    case 'notimeout': return s.timeouts === 0 ? 'en cours' : 'raté';
    case 'noinnocent': return s.wrongFines === 0 ? 'en cours' : 'raté';
    default: return '';
  }
};

/* ---------- Ligne infinie ---------- */
G.ENDLESS_UNLOCK = 5; // débloquée après le service 6 du bus
G.STATION_SIZE = 5;
G.PERK_EVERY = 2; // un bonus au choix toutes les 2 stations
G.isEndlessUnlocked = () => G.save.tester || (G.save.levels[G.ENDLESS_UNLOCK] || 0) > 0;

G.endlessConfig = (n) => {
  const cityIndex = Math.floor((n - 1) / 3) % G.CITIES.length;
  const city = G.CITIES[cityIndex];
  const r = G.rng((Math.random() * 1e9) | 0);
  const rules = ['date', 'zone'];
  if (n >= 2) rules.push('photo');
  if (n >= 3) rules.push('reduit');
  if (n >= 4) rules.push('stamp');
  if (n >= 6) rules.push('name');
  if (n >= 8) rules.push('expiry');
  if (n >= 10) rules.push('class');
  if (n >= 12) rules.push('group');
  const intro = { 2: 'photo', 3: 'reduit', 4: 'stamp', 6: 'name', 8: 'expiry', 10: 'class', 12: 'group' }[n];
  return {
    g: 10 + n,
    endless: true,
    station: n,
    cityIndex,
    city,
    i: 0,
    boss: false,
    count: G.STATION_SIZE,
    time: G.clamp(9.5 - n * 0.35, 4.6, 9.5),
    fraudRate: Math.min(0.6, 0.4 + n * 0.015),
    rules,
    newRule: intro ? G.RULES.find((x) => x.id === intro) : null,
    dayRule: n >= 7 && n % 3 === 1 ? r.pick(G.DAY_RULES).id : null,
    zoneReq: r.int(2, 4),
    firstClass: n >= 10 && r.chance(0.7),
    groupRate: n >= 12 ? 0.16 : 0,
    specialRate: 0.1,
    bias: {},
    bossLook: null,
    label: `Ligne infinie · Station ${n}`,
  };
};

G.PERKS = [
  { id: 'shield', icon: 'shield', name: 'Bouclier en plus', desc: '+1 bouclier de réputation' },
  { id: 'heal', icon: 'star', name: 'Pause café', desc: 'Récupère tous tes boucliers' },
  { id: 'slow', icon: 'clock', name: 'Montre réglée', desc: '+1,5 s par passager' },
  { id: 'flair', icon: 'bolt', name: 'Flair du contrôleur', desc: 'Les fraudeurs transpirent presque toujours, les innocents jamais', unique: true },
  { id: 'cam', icon: 'camera', name: 'Caméras gratuites', desc: '+2 caméras sans pub' },
  { id: 'combo', icon: 'fire', name: 'Échauffement', desc: 'Ton multiplicateur ne retombe jamais sous x1,5', unique: true },
  { id: 'uv', icon: 'uv', name: 'Piles neuves', desc: '+3 utilisations de la lampe UV' },
  { id: 'whistle', icon: 'whistle', name: 'Sifflet de rechange', desc: '+2 coups de sifflet' },
  { id: 'coins', icon: 'coin', name: 'Prime de rendement', desc: 'Les amendes rapportent le double', unique: true },
  { id: 'ask', icon: 'talk', name: 'Bagout', desc: 'Questionner ne coûte plus de temps', unique: true },
];

G.pickPerks = (owned, r) => {
  const pool = G.PERKS.filter((p) => !(p.unique && owned.includes(p.id)));
  return r.shuffle(pool).slice(0, 3);
};

/* ---------- Succès ----------
   Vérifiés à la fin de chaque partie ; chacun rapporte des tickets d'or une seule fois. */
const totalStars = () => Object.values(G.save.levels).reduce((a, b) => a + (b || 0), 0);
const bossBeaten = (ci) => (G.save.levels[ci * G.LEVELS_PER_CITY + G.LEVELS_PER_CITY - 1] || 0) > 0;
const albumCount = () => G.SPECIALS.filter((sp) => G.save.album[sp.id]).length;

G.ACHIEVEMENTS = [
  { id: 'first', icon: 'ticket', name: 'Premier jour', desc: 'Terminer un service', gold: 2, test: () => G.save.stats.shifts >= 1 },
  { id: 'catch10', icon: 'hand', name: 'Œil de lynx', desc: 'Attraper 10 fraudeurs', gold: 2, test: () => G.save.stats.caught >= 10 },
  { id: 'catch100', icon: 'hand', name: 'Terreur des fraudeurs', desc: 'Attraper 100 fraudeurs', gold: 5, test: () => G.save.stats.caught >= 100 },
  { id: 'catch500', icon: 'hand', name: 'Légende vivante', desc: 'Attraper 500 fraudeurs', gold: 10, test: () => G.save.stats.caught >= 500 },
  { id: 'checked1000', icon: 'ticket', name: 'Mille tickets', desc: 'Contrôler 1 000 passagers', gold: 8, test: () => G.save.stats.checked >= 1000 },
  { id: 'combo10', icon: 'fire', name: 'En feu', desc: 'Enchaîner un combo de 10', gold: 4, test: () => (G.save.stats.bestCombo || 0) >= 10 },
  { id: 'combo25', icon: 'fire', name: 'Inarrêtable', desc: 'Enchaîner un combo de 25', gold: 8, test: () => (G.save.stats.bestCombo || 0) >= 25 },
  { id: 'perfect', icon: 'star', name: 'Service parfait', desc: 'Obtenir 3 étoiles sur un service', gold: 2, test: () => Object.values(G.save.levels).some((v) => v >= 3) },
  { id: 'stars60', icon: 'star', name: 'Constellation', desc: 'Cumuler 60 étoiles', gold: 5, test: () => totalStars() >= 60 },
  { id: 'stars150', icon: 'star', name: 'Voie lactée', desc: 'Cumuler 150 étoiles', gold: 10, test: () => totalStars() >= 150 },
  ...G.CITIES.map((c, ci) => ({ id: `boss_${c.id}`, icon: 'skull', name: c.boss.name, desc: `Battre le boss de ${c.name}`, gold: 3 + ci, test: () => bossBeaten(ci) })),
  { id: 'album10', icon: 'album', name: 'Collectionneur', desc: 'Rencontrer 10 passagers spéciaux', gold: 3, test: () => albumCount() >= 10 },
  { id: 'album25', icon: 'album', name: 'Encyclopédie', desc: 'Rencontrer 25 passagers spéciaux', gold: 6, test: () => albumCount() >= 25 },
  { id: 'albumall', icon: 'album', name: 'Album complet', desc: 'Rencontrer tous les passagers spéciaux', gold: 15, test: () => albumCount() >= G.SPECIALS.length },
  { id: 'streak7', icon: 'calendar', name: 'Fidèle au poste', desc: 'Faire le Contrôle du jour 7 jours de suite', gold: 5, test: () => G.save.daily.streak >= 7 },
  { id: 'endless5', icon: 'trophy', name: 'Grand voyageur', desc: 'Franchir 5 stations en Ligne infinie', gold: 3, test: () => G.save.endless.bestStation >= 5 },
  { id: 'endless15', icon: 'trophy', name: 'Bout de la ligne', desc: 'Franchir 15 stations en Ligne infinie', gold: 8, test: () => G.save.endless.bestStation >= 15 },
  { id: 'ask25', icon: 'talk', name: 'Interrogateur', desc: 'Démasquer 25 fraudeurs après les avoir questionnés', gold: 5, test: () => (G.save.stats.questionCatches || 0) >= 25 },
  { id: 'wardrobe', icon: 'shop', name: 'Garde-robe', desc: 'Posséder 4 uniformes', gold: 4, test: () => G.save.owned.length >= 4 },
  { id: 'rich', icon: 'coin', name: 'Prime de fin d\'année', desc: 'Encaisser 5 000 amendes au total', gold: 6, test: () => (G.save.stats.coinsEarned || 0) >= 5000 },
  { id: 'atlantic', icon: 'map', name: 'Outre-Atlantique', desc: 'Vaincre le boss de New York', gold: 5, test: () => (G.save.levels[79] || 0) > 0 },
  { id: 'mars', icon: 'trophy', name: 'Légende interplanétaire', desc: 'Vaincre le boss de Mars', gold: 10, test: () => (G.save.levels[109] || 0) > 0 },
  { id: 'collector', icon: 'album', name: 'Collectionneur', desc: "Compléter 3 collections de l'album", gold: 5, test: () => Object.keys(G.save.collections || {}).length >= 3 },
  { id: 'stylist', icon: 'brush', name: 'Styliste', desc: 'Posséder 5 objets de la boutique Style', gold: 3, test: () => (G.save.cos && G.save.cos.owned.length) >= 5 },
  { id: 'insomnia', icon: 'moon', name: 'Insomniaque', desc: 'Terminer les 10 services d\'une ville en mode Cauchemar', gold: 5, test: () => G.CITIES.some((_, ci) => Array.from({ length: G.LEVELS_PER_CITY }, (__, i) => (G.save.nightmare.levels[ci * G.LEVELS_PER_CITY + i] || 0) > 0).every(Boolean)) },
  { id: 'nightking', icon: 'skull', name: 'Roi des cauchemars', desc: 'Vaincre le boss de Mars en mode Cauchemar', gold: 15, test: () => (G.save.nightmare.levels[109] || 0) > 0 },
  { id: 'weekly', icon: 'trophy', name: 'Habitué du dimanche', desc: 'Réussir un défi de la semaine', gold: 2, test: () => !!(G.save.weekly && G.save.weekly.rewarded) },
];

/* Débloque les succès atteints et renvoie ceux qui sont nouveaux */
G.checkAchievements = () => {
  const s = G.save;
  s.achievements = s.achievements || {};
  const fresh = [];
  G.ACHIEVEMENTS.forEach((a) => {
    if (!s.achievements[a.id] && a.test()) {
      s.achievements[a.id] = Date.now();
      s.gold += a.gold;
      fresh.push(a);
    }
  });
  if (fresh.length) G.persist();
  return fresh;
};
