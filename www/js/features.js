/* Ticket SVP ! — histoire, événements saisonniers, missions du jour, défis entre amis,
   petites infractions, mécaniques de boss, mini-événements et fiches de règles lisibles */
'use strict';

/* ---------- Histoire : lettres du chef ---------- */
G.STORY = {
  intro: {
    bus: "Bienvenue dans la brigade ! On commence en douceur sur la ligne de campagne. Ouvre l'œil : même les vaches tentent leur chance.",
    paris: 'Bravo pour la campagne ! Direction Paris. Ici, ça va plus vite et les fraudeurs sont plus malins. Gaston, de la brigade concurrente, te surveille déjà…',
    london: "Paris est sous contrôle. Nos collègues de Londres demandent du renfort : chez eux, l'abonnement est nominatif. Mind the gap !",
    tokyo: "Tokyo à l'heure de pointe. Les rames sont pleines, le temps est compté. Gaston dit que tu n'y survivras pas. Prouve-lui le contraire.",
    moscou: "Moscou, ses stations-musées et ses cartes d'identité périmées. Vérifie bien les dates de validité.",
    nuit: 'Le train de nuit Paris-Venise. Les passagers dorment, pas les fraudeurs. Garde ta lampe à portée de main.',
    express: "Le Grand Express Paris-Istanbul. Velours, dorures et 1re classe… et quelque part dans ce train, un mystère. Résous-le, inspecteur.",
    ny: "Ta réputation a traversé l'Atlantique : New York te réclame ! Une liasse de tickets a été volée à Times Square. Garde l'œil sur les numéros.",
    berlin: "Direction Berlin. Ici, pas de portillons partout : les resquilleurs adorent ça. Les caméras de la station t'aideront.",
    venise: "Venise et son vaporetto. Le Grand Canal est magnifique… et la météo annonce une tempête. Accroche-toi.",
    mars: "Dernière frontière : la colonie de Mars. Gaston a tout misé sur ton échec. Le monorail t'attend, garde ton casque sur la tête.",
  },
  outro: {
    bus: 'Les Jumeaux sont derrière les barreaux. Même Gaston est impressionné. Tu montes à Paris !',
    paris: 'Le Gang des Moustaches est démantelé. Tu deviens la référence de la brigade.',
    london: "Le Faussaire est démasqué grâce à ta lampe UV. Londres t'offre une tasse de thé.",
    tokyo: "Tu as survécu à l'heure de pointe infernale. Gaston t'a envoyé un message : « Pas mal. »",
    moscou: 'Les Poupées gigognes sont rangées. Toutes les cinq.',
    nuit: 'Le Somnambule est réveillé et verbalisé. Le train de nuit retrouve son calme.',
    express: "Le crime du Grand Express est résolu. Un télégramme arrive de New York : on a besoin de toi de l'autre côté de l'océan !",
    ny: 'Les tickets volés sont tous retrouvés. Le maire de New York te remet les clés du métro.',
    berlin: 'Les sauteurs de portillons sont démasqués. Berlin te nomme contrôleur d\'honneur.',
    venise: 'Tu as tenu bon dans la tempête. Les gondoliers chantent ton nom sur le Grand Canal.',
    mars: "Le dôme est réparé et tout le monde respire. Tu es la première légende du rail interplanétaire. Gaston demande à rejoindre ta brigade !",
  },
};

/* ---------- Mécaniques propres à chaque boss ---------- */
G.BOSS_MECH = {
  bus: { id: 'wanted', title: 'Avis de recherche', desc: "L'un des jumeaux est recherché : verbalise-le même si ses papiers sont en règle. Son frère, lui, n'a rien fait. Un seul détail les différencie !" },
  paris: { id: 'mustache', title: 'Tire sur la moustache', desc: "Touche le visage d'un suspect pour tirer sur sa moustache (0,5 s). Une fausse moustache tombe toute seule. Une vraie fait « Aïe ! » et te coûte 1 seconde." },
  london: { id: 'uvfake', title: 'Faux parfaits', desc: "Les faux tampons du Faussaire sont identiques aux vrais. Seule la lampe UV les révèle : elle est illimitée pendant ce combat." },
  tokyo: { id: 'rush', title: 'Contre la montre', desc: "Pas de chrono par passager : tu as 75 secondes pour en contrôler au moins 18. Les erreurs coûtent toujours un bouclier." },
  moscou: { id: 'groups', title: 'Les sœurs voyagent ensemble', desc: 'Les passagers arrivent en groupes. Compte les têtes : le ticket doit couvrir tout le monde.' },
  nuit: { id: 'dark', title: 'Dans le noir', desc: "La rame est plongée dans le noir. Promène ton doigt sur les documents pour les éclairer à la lampe torche (le zoom ne marche pas dans le noir). Pour décider, utilise les boutons ou fais glisser le passager." },
  ny: { id: 'blacklist', title: 'Liste noire', desc: "Trois numéros de tickets volés sont affichés en haut. Lis le numéro (N°) en bas de chaque ticket : s'il est sur la liste, verbalise, même si tout le reste est en règle." },
  berlin: { id: 'memory', title: 'Caméras de surveillance', desc: "Mémorise les trois visages filmés par les caméras. S'ils montent, verbalise-les, même avec un ticket valable. Revoir les images pendant le service coûte 150 points." },
  venise: { id: 'sway', title: 'Ça tangue !', desc: 'Le vaporetto bouge dans tous les sens et les documents avec lui. Tu as un peu plus de temps pour lire.' },
  mars: { id: 'oxygen', title: 'Oxygène', desc: "Pas de chrono par passager : la jauge d'oxygène baisse sans arrêt. Bonne décision : +4 s. Erreur : −6 s. Termine la file avant qu'elle soit vide !" },
  express: { id: 'mystery', title: "L'enquête", desc: "Un coupable se cache parmi les passagers. Chaque bonne décision peut révéler un indice. À la fin, désigne le coupable parmi 4 suspects." },
};

/* ---------- Événements saisonniers ---------- */
G.EVENTS = [
  { id: 'halloween', name: 'La Ligne hantée', desc: 'Fantômes, vampires, zombies et momies envahissent la rame. Brrr…', from: [9, 15], to: [10, 5], specials: ['ghost', 'vampire', 'zombie', 'mummy', 'knight', 'magician'], deco: 'halloween', city: 5 },
  { id: 'noel', name: "L'Express de Noël", desc: 'Le Père Noël et ses lutins prennent le train. Tous en règle ? Pas sûr…', from: [11, 1], to: [11, 31], specials: ['santa', 'elf', 'bride', 'king', 'baby'], deco: 'noel', city: 6 },
  { id: 'avril', name: "Poisson d'avril", desc: "Aujourd'hui, tout est inversé : verbalise les passagers EN RÈGLE et laisse passer les fraudeurs !", from: [3, 1], to: [3, 1], specials: ['mime', 'clown', 'magician'], deco: 'avril', city: 1, inverted: true },
];
G.currentEvent = (d = G.today()) => {
  const md = d.getMonth() * 100 + d.getDate();
  return G.EVENTS.find((e) => md >= e.from[0] * 100 + e.from[1] && md <= e.to[0] * 100 + e.to[1]) || null;
};
G.eventConfig = (ev) => {
  let maxG = 0;
  for (let g = 0; g < G.TOTAL_LEVELS; g++) if (G.isLevelUnlocked(g)) maxG = g;
  const base = G.levelConfig(Math.min(Math.max(maxG, 6), 33));
  return Object.assign(base, {
    event: ev,
    boss: false,
    bossMech: null,
    city: G.CITIES[ev.city],
    cityIndex: ev.city,
    count: 10,
    time: Math.max(base.time, 7.5),
    specialRate: 0.35,
    specialPool: ev.specials,
    dayRule: null,
    newRule: null,
    inverted: !!ev.inverted,
    label: ev.name,
  });
};

/* ---------- Missions du jour ---------- */
G.MISSION_POOL = [
  { id: 'catch', n: 15, text: 'Attraper 15 fraudeurs', gold: 2 },
  { id: 'services', n: 3, text: 'Terminer 3 services', gold: 2 },
  { id: 'combo', n: 8, text: 'Enchaîner un combo de 8', gold: 3 },
  { id: 'ask', n: 5, text: 'Poser 5 questions', gold: 2 },
  { id: 'specials', n: 2, text: 'Bien gérer 2 passagers spéciaux', gold: 2 },
  { id: 'daily', n: 1, text: 'Faire le Contrôle du jour', gold: 2 },
  { id: 'stations', n: 5, text: 'Franchir 5 stations en Ligne infinie', gold: 3 },
  { id: 'stars3', n: 1, text: 'Obtenir 3 étoiles sur un service', gold: 3 },
  { id: 'warn', n: 3, text: 'Donner 3 avertissements', gold: 2 },
  { id: 'events', n: 2, text: 'Réussir 2 mini-événements', gold: 3 },
];
G.todayMissions = () => {
  const s = G.save;
  const key = G.dayKey();
  if (!s.missions || s.missions.day !== key) {
    const r = G.rng(Number(key) * 13);
    const picks = r.shuffle(G.MISSION_POOL).slice(0, 3).map((m) => ({ id: m.id, progress: 0, claimed: false }));
    s.missions = { day: key, list: picks };
    G.persist();
  }
  return s.missions.list.map((m) => Object.assign({}, G.MISSION_POOL.find((x) => x.id === m.id), m));
};
G.missionEvent = (id, amount = 1, mode = 'add') => {
  G.todayMissions();
  const m = G.save.missions.list.find((x) => x.id === id);
  if (!m) return;
  const def = G.MISSION_POOL.find((x) => x.id === id);
  const before = m.progress;
  m.progress = mode === 'max' ? Math.max(m.progress, amount) : m.progress + amount;
  m.progress = Math.min(m.progress, def.n);
  if (before < def.n && m.progress >= def.n) G.toast(`${G.icon('check')} Mission accomplie : ${def.text}`, 'good');
  G.persist();
};
G.missionsReady = () => G.todayMissions().filter((m) => m.progress >= m.n && !m.claimed).length;

/* ---------- Défi entre amis : un code rejoue exactement les mêmes passagers ---------- */
G.makeChallengeCode = (g, seed, score) => [g, seed, score].map((x) => Math.max(0, Math.round(x)).toString(36)).join('-').toUpperCase();
G.parseChallengeCode = (code) => {
  const parts = String(code || '').trim().toLowerCase().split('-');
  if (parts.length !== 3) return null;
  const [g, seed, score] = parts.map((x) => parseInt(x, 36));
  if ([g, seed, score].some((x) => !Number.isFinite(x)) || g < 0 || g >= G.TOTAL_LEVELS) return null;
  return { g, seed, score };
};

/* ---------- Petites infractions : un avertissement suffit ---------- */
G.MINOR = [
  { text: 'Musique trop forte', say: '♪ BOUM BOUM BOUM ♪', icon: 'sound' },
  { text: 'Pieds sur la banquette', say: 'Ahhh, je suis bien installé…', icon: 'hand' },
  { text: 'Sandwich au thon', say: 'Miam ! Du thon bien fort !', icon: 'fire' },
  { text: 'Téléphone en haut-parleur', say: 'ALLÔ ? ALLÔ ?! TU M\'ENTENDS ?', icon: 'talk' },
  { text: 'Bloque les portes', say: 'Attendez, mon ami arrive !', icon: 'cross' },
];

/* ---------- Enquête du Grand Express ---------- */
const CLUE_TESTS = [
  { has: (l) => l.glasses !== 'none' && l.glasses, yes: 'Le coupable porte des lunettes.', no: 'Le coupable ne porte pas de lunettes.' },
  { has: (l) => l.hat !== 'none' && l.hat, yes: 'Le coupable porte un chapeau.', no: "Le coupable n'a pas de chapeau." },
  { has: (l) => l.facial !== 'none' && l.facial, yes: 'Le coupable a une moustache ou une barbe.', no: 'Le coupable est rasé de près.' },
  { hair: true, has: (l) => ['#2b1b12', '#5a3a1e', '#1b1b25'].includes(l.hairColor) && l.hair !== 'none', yes: 'Le coupable a les cheveux foncés.', no: "Le coupable n'a pas les cheveux foncés." },
  { hair: true, has: (l) => l.hair === 'none' || l.hair === 'buzz', yes: 'Le coupable est presque chauve.', no: 'Le coupable a des cheveux.' },
];
G.buildMystery = (queue, r) => {
  const pool = queue.filter((q) => !q.special && q.look.kind === 'person');
  if (pool.length < 5) return null;
  const culprit = r.pick(pool.slice(2));
  const decoys = r.shuffle(pool.filter((q) => q !== culprit)).slice(0, 3);
  const clues = [];
  let left = decoys.slice();
  const anyHat = [culprit, ...decoys].some((q) => q.look.hat && q.look.hat !== 'none');
  for (const t of r.shuffle(CLUE_TESTS)) {
    if (t.hair && anyHat) continue; // cheveux cachés sous un chapeau : indice invérifiable
    const v = !!t.has(culprit.look);
    const out = left.filter((d) => !!t.has(d.look) !== v);
    if (out.length) {
      clues.push(v ? t.yes : t.no);
      left = left.filter((d) => !out.includes(d));
    }
    if (!left.length) break;
  }
  if (left.length) return null; // indices insuffisants : pas d'enquête cette fois
  culprit.culprit = true;
  return { culprit, suspects: r.shuffle([culprit, ...decoys]), clues, revealed: 0, solved: null };
};

/* ---------- Pickpocket : 3 suspects, 1 indice ---------- */
G.buildPickpocket = (r) => {
  for (let tries = 0; tries < 30; tries++) {
    const looks = [G.randomLook(r), G.randomLook(r), G.randomLook(r)].map((l) => Object.assign(l, { acc: 'none' }));
    const thief = r.int(0, 2);
    const anyHat = looks.some((l) => l.hat && l.hat !== 'none');
    for (const t of r.shuffle(CLUE_TESTS)) {
      if (t.hair && anyHat) continue;
      const v = !!t.has(looks[thief]);
      if (looks.every((l, i) => i === thief || !!t.has(l) !== v)) return { looks, thief, clue: (v ? t.yes : t.no).replace('Le coupable', 'Le voleur') };
    }
  }
  return null;
};

/* ---------- Fiches de règles lisibles (briefing) ---------- */
const big = (label, value, extra = '') => `<div class="rc-field"><span>${label}</span><b>${value}</b>${extra}</div>`;
G.ruleCard = (ruleId, cfg) => {
  const today = G.today();
  const y = today.getFullYear();
  const r = G.rng(4242 + ruleId.length);
  const face = G.randomLook(r);
  const pair = (good, bad, context) => `${context ? `<div class="rc-context">${context}</div>` : ''}<div class="rc-pair"><div class="rc-side ok"><div class="rc-tag">${G.icon('check')} Valable</div>${good}</div><div class="rc-side ko"><div class="rc-tag">${G.icon('cross')} Amende</div>${bad}</div></div>`;
  switch (ruleId) {
    case 'date':
      return pair(big('Valable le', G.fmtDate(today)), big('Valable le', G.fmtDate(G.addDays(today, -2))), `${G.icon('calendar')} Aujourd'hui : <b>${G.fmtDate(today)}</b>`);
    case 'zone':
      return pair(big('Zones', '1-3'), big('Zones', '1-2'), `${G.icon('zone')} La ligne va jusqu'en <b>zone 3</b>`);
    case 'photo': {
      const m = G.mutateLook(face, r, 'glasses');
      const faces = (a, b) => `<div class="rc-faces"><div>${G.drawPerson(a, { photo: true })}<span>Passager</span></div><div>${G.drawPerson(b, { photo: true })}<span>Photo</span></div></div>`;
      return pair(faces(face, face), faces(face, m.look), 'Compare coiffure, lunettes, moustache et chapeau');
    }
    case 'reduit':
      return pair(big('Étudiant · né(e) en', y - 21, `<em>= 21 ans ✓</em>`), big('Étudiant · né(e) en', y - 47, `<em>= 47 ans ✗</em>`), 'Étudiant : moins de 26 ans · Senior : 65 ans et plus');
    case 'stamp':
      return pair(`<div class="rc-stamp">${G.stampSvg('ok', cfg.city, '08:42', G.fmtDate(today).slice(0, 5))}</div>`, `<div class="rc-stamp">${G.stampSvg('fake', cfg.city, '08:42', '')}</div>`, 'Un vrai tampon est net. Pas de tampon, ou un tampon dessiné : amende !');
    case 'name':
      return pair(`${big('Abonnement', 'Gérard BAGUETTE')}${big('Carte', 'Gérard BAGUETTE')}`, `${big('Abonnement', 'Gérald BAGUETTE')}${big('Carte', 'Gérard BAGUETTE')}`, 'Le nom doit être exactement le même, lettre par lettre');
    case 'expiry':
      return pair(big('Carte valable jusqu\'au', G.fmtDate(G.addDays(today, 800))), big('Carte valable jusqu\'au', G.fmtDate(G.addDays(today, -120))), `${G.icon('calendar')} Aujourd'hui : <b>${G.fmtDate(today)}</b>`);
    case 'class':
      return pair(big('Billet', '1re classe'), big('Billet', '2e classe'), `${G.icon('star')} Voiture de <b>1re classe</b> (en 2e classe, tout billet passe)`);
    case 'group': {
      const heads = (n) => `<div class="rc-heads">${Array.from({ length: n }, () => '<i></i>').join('')}</div>`;
      return pair(`${heads(3)}${big('Ticket', '3 voyageurs')}`, `${heads(3)}${big('Ticket', '2 voyageurs')}`, 'Compte les têtes : le ticket doit couvrir tout le groupe');
    }
    default:
      return '';
  }
};

/* ---------- Décorations d'événement posées sur la scène ---------- */
G.eventDeco = (deco) => {
  const K = '#1e2a4a';
  if (deco === 'halloween') {
    const pumpkin = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="22" ry="17" fill="#ff8a1d" stroke="${K}" stroke-width="3"/><path d="M-8 -16 Q0 -2 -8 15 M8 -16 Q0 -2 8 15" stroke="#d96a00" stroke-width="2.5" fill="none"/><rect x="-3" y="-25" width="6" height="9" rx="2" fill="#4a7a2c" stroke="${K}" stroke-width="2"/><path d="M-11 -4 L-5 -8 L-3 -2Z M11 -4 L5 -8 L3 -2Z" fill="#ffe14d" stroke="${K}" stroke-width="1.5"/><path d="M-10 6 L-6 9 L-2 6 L2 9 L6 6 L10 9" stroke="#ffe14d" stroke-width="2.5" fill="none"/></g>`;
    const bat = (x, y) => `<g class="bat" transform="translate(${x} ${y})"><path d="M0 0 C-6 -8 -16 -8 -22 0 C-16 -2 -12 2 -10 6 C-6 2 -3 4 0 8 C3 4 6 2 10 6 C12 2 16 -2 22 0 C16 -8 6 -8 0 0Z" fill="#2b1b3a"/></g>`;
    return `<svg class="event-deco" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${pumpkin(40, 256, 1)}${pumpkin(362, 252, 1.2)}${pumpkin(318, 262, 0.7)}${bat(90, 60)}${bat(300, 48)}${bat(220, 80)}<path d="M0 34 Q30 54 60 34 T120 34" stroke="#ddd" stroke-width="1.5" fill="none" opacity=".7"/><path d="M280 34 Q310 50 340 34 T400 34" stroke="#ddd" stroke-width="1.5" fill="none" opacity=".7"/></svg>`;
  }
  if (deco === 'noel') {
    const ball = (x, y, c) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" stroke="${K}" stroke-width="2"/>`;
    return `<svg class="event-deco" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="M0 38 Q50 58 100 38 T200 38 T300 38 T400 38" stroke="#2e8b57" stroke-width="7" fill="none"/>${[30, 80, 130, 180, 230, 280, 330, 380].map((x, i) => ball(x, 48 + (i % 2) * 4, ['#e94f4f', '#ffd23f', '#3a86ff'][i % 3])).join('')}<g transform="translate(360 250)"><path d="M0 -50 L22 0 L-22 0Z M0 -30 L26 14 L-26 14Z" fill="#2e8b57" stroke="${K}" stroke-width="3"/><rect x="-5" y="14" width="10" height="10" fill="#7a5230"/><path d="M0 -58 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/></g></svg>`;
  }
  if (deco === 'avril') {
    const fish = (x, y, c) => `<g transform="translate(${x} ${y})"><path d="M-16 0 C-8 -10 10 -10 16 0 C10 10 -8 10 -16 0Z M16 0 L26 -8 L26 8Z" fill="${c}" stroke="${K}" stroke-width="2.5"/><circle cx="-8" cy="-2" r="2" fill="${K}"/></g>`;
    return `<svg class="event-deco" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${fish(60, 70, '#7fb7ff')}${fish(330, 60, '#ff8fab')}${fish(250, 100, '#ffd23f')}${fish(150, 54, '#2ec4b6')}</svg>`;
  }
  return '';
};

/* ---------- Passager du mois ----------
   Le même spécial pour tout le monde pendant un mois : il apparaît plus souvent et rapporte double. */
G.monthSpecial = (date = G.today()) => {
  const n = date.getFullYear() * 12 + date.getMonth();
  const h = Math.imul(n ^ 0x5bd1e995, 2654435761) >>> 0;
  return G.SPECIALS[h % G.SPECIALS.length];
};
