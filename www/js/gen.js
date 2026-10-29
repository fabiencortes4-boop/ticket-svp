/* Ticket SVP ! — génération des passagers et arbitrage (fraudeur ou non) */
'use strict';

G.randomLook = (r) => {
  const hair = r.pick(G.HAIRS);
  return {
    kind: 'person',
    skin: r.pick(G.SKINS),
    head: r.pick(['round', 'round', 'oval', 'square']),
    hair,
    hairColor: r.chance(0.12) ? r.pick(G.HAIR_COLORS.slice(7)) : r.pick(G.HAIR_COLORS.slice(0, 7)),
    eyes: r.pick(['dot', 'iris', 'iris', 'big', 'sleepy', 'wide']),
    eyeColor: r.pick(['#5a3a1e', '#3a86ff', '#2e8b57', '#7a5230', '#4a4a5a']),
    lashes: r.chance(0.35),
    nose: r.pick(['round', 'long', 'small']),
    mouth: r.pick(['smile', 'smile', 'flat', 'grin']),
    glasses: r.pick(G.GLASSES),
    facial: r.pick(G.FACIALS),
    hat: hair === 'mohawk' || hair === 'afro' ? 'none' : r.pick(G.HATS),
    hatColor: r.pick(G.OUTFIT_COLORS),
    outfit: r.pick(G.OUTFITS),
    outfitColor: r.pick(G.OUTFIT_COLORS),
    build: r.pick(['normal', 'normal', 'slim', 'round']),
    acc: r.pick(G.ACCS),
    cheeks: r.chance(0.3),
  };
};

const PHOTO_LABELS = {
  hair: 'la coiffure est différente',
  hairColor: "la couleur des cheveux n'est pas la même",
  glasses: 'les lunettes ne correspondent pas',
  facial: 'la moustache ou la barbe ne correspond pas',
  hat: "le chapeau n'est pas le même",
};

/* Modifie un seul trait visible pour créer une fausse photo. */
G.mutateLook = (look, r, preferred) => {
  const l = Object.assign({}, look);
  const options = ['hair', 'glasses', 'facial', 'hat'];
  if (look.hair !== 'none') options.push('hairColor');
  const field = preferred && options.includes(preferred) ? preferred : r.pick(options);
  if (field === 'hair') {
    const short = ['none', 'short', 'spiky', 'mohawk', 'side', 'bun', 'curly', 'buzz'];
    l.hair = short.includes(look.hair) ? r.pick(['afro', 'long', 'bob']) : r.pick(['none', 'short', 'spiky']);
    if (l.hair === 'afro') l.hat = 'none';
  } else if (field === 'hairColor') {
    const idx = G.HAIR_COLORS.indexOf(look.hairColor);
    const far = G.HAIR_COLORS.filter((c, i) => Math.abs(i - idx) >= 3);
    l.hairColor = r.pick(far.length ? far : G.HAIR_COLORS);
  } else if (field === 'glasses') {
    l.glasses = look.glasses === 'none' ? r.pick(['round', 'square', 'sun']) : 'none';
  } else if (field === 'facial') {
    l.facial = look.facial === 'none' ? r.pick(['mustache', 'beard', 'curly']) : 'none';
  } else if (field === 'hat') {
    l.hat = look.hat === 'none' ? r.pick(['beret', 'cap', 'beanie', 'bowler', 'top']) : 'none';
    if (l.hat !== 'none' && look.hair === 'afro') l.hair = 'short';
  }
  return { look: l, label: PHOTO_LABELS[field] };
};

G.sameLook = (a, b) => ['hair', 'hairColor', 'glasses', 'facial', 'hat', 'skin'].every((k) => a[k] === b[k]);

G.hasMustache = (look) => look.facial === 'mustache' || look.facial === 'curly';

function makeName(r) {
  return { first: r.pick(G.FIRST_NAMES), last: r.pick(G.LAST_NAMES) };
}
const fullName = (n) => `${n.first} ${n.last.toUpperCase()}`;

function validTicket(cfg, r, ctx, kind, name) {
  const R = new Set(cfg.rules);
  return {
    kind,
    reducedType: null,
    dayOffset: 0,
    monthOffset: 0,
    zoneMax: R.has('zone') ? r.int(ctx.zoneReq, 5) : 5,
    stamp: 'ok',
    passName: name ? fullName(name) : null,
    stampTime: `${G.pad2(r.int(6, 22))}:${G.pad2(r.int(0, 59))}`,
    serial: String(r.int(100000, 999999)),
    cls: ctx.firstClass || r.chance(0.25) ? 1 : 2,
  };
}

/* ---------- Arbitrage : la seule source de vérité ---------- */
G.evaluate = (p, cfg, ctx) => {
  if (p.specialFixed) return { fraud: p.fraud, reason: p.reason, field: p.hint };
  const R = new Set(cfg.rules);
  const t = p.ticket;
  const day = cfg.dayRule;
  const free = G.FREE_DAY[day];
  if (free && free.test(p, ctx)) return { fraud: false, reason: free.reason, field: null };
  if (!t) return { fraud: true, reason: 'Aucun ticket.', field: 'ticket' };
  if (day === 'nopass' && t.kind === 'pass') return { fraud: true, reason: 'Panne des lecteurs : abonnements refusés aujourd\'hui.', field: 'day' };
  if (day === 'nosingle' && t.kind !== 'pass') return { fraud: true, reason: 'Travaux : seuls les abonnements passent aujourd\'hui.', field: 'day' };
  if (day === 'noreduit' && t.kind === 'reduced') return { fraud: true, reason: 'Grève des réductions : tarif réduit refusé aujourd\'hui.', field: 'day' };
  if (R.has('date')) {
    if (t.kind === 'pass' && t.monthOffset !== 0) return { fraud: true, reason: `Abonnement de ${G.fmtMonth(G.addMonths(ctx.today, t.monthOffset)).toLowerCase()}, pas de ce mois-ci.`, field: 'date' };
    if (t.kind !== 'pass' && t.dayOffset !== 0) return { fraud: true, reason: `Ticket daté du ${G.fmtDate(G.addDays(ctx.today, t.dayOffset))}.`, field: 'date' };
  }
  if (R.has('zone') && t.zoneMax < ctx.zoneReq) return { fraud: true, reason: `Ticket zones 1-${t.zoneMax}, la ligne va jusqu'en zone ${ctx.zoneReq}.`, field: 'zone' };
  if (R.has('stamp') && t.kind !== 'pass') {
    if (t.stamp === 'none') return { fraud: true, reason: 'Ticket non composté.', field: 'stamp' };
    if (t.stamp === 'fake') return { fraud: true, reason: 'Faux tampon dessiné à la main.', field: 'stamp' };
  }
  if (R.has('reduit') && t.kind === 'reduced') {
    const age = ctx.today.getFullYear() - p.birthYear;
    if (t.reducedType === 'etudiant' && age >= 26) return { fraud: true, reason: `Tarif étudiant, mais ${age} ans.`, field: 'age' };
    if (t.reducedType === 'senior' && age < 65) return { fraud: true, reason: `Tarif senior, mais seulement ${age} ans.`, field: 'age' };
  }
  if (R.has('name') && t.kind === 'pass' && t.passName !== p.idName) return { fraud: true, reason: `L'abonnement est au nom de ${t.passName}.`, field: 'name' };
  if (R.has('group') && (p.groupSize || 1) > 1) {
    if (t.kind === 'pass') return { fraud: true, reason: `Un abonnement est personnel : ils sont ${p.groupSize}.`, field: 'group' };
    if ((t.travelers || 1) < p.groupSize) return { fraud: true, reason: `Ils sont ${p.groupSize} pour un ticket de ${t.travelers || 1} voyageur${(t.travelers || 1) > 1 ? 's' : ''}.`, field: 'group' };
  }
  if (R.has('class') && ctx.firstClass && t.cls !== 1) return { fraud: true, reason: 'Billet de 2e classe dans une voiture de 1re classe.', field: 'class' };
  if (R.has('expiry') && p.expiryOffset < 0) return { fraud: true, reason: `Carte d'identité expirée depuis le ${G.fmtDate(G.addDays(ctx.today, p.expiryOffset))}.`, field: 'expiry' };
  if (R.has('photo') && !G.sameLook(p.look, p.photoLook)) return { fraud: true, reason: `Photo : ${p.photoLabel || 'ce n\'est pas la même personne'}.`, field: 'photo' };
  return { fraud: false, reason: 'Tout est en règle.', field: null };
};

G.addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/* ---------- Passager ordinaire ---------- */
G.makePassenger = (cfg, r, ctx) => {
  const R = new Set(cfg.rules);
  const look = G.randomLook(r);
  if (cfg.bossLook) Object.assign(look, cfg.bossLook);
  if (cfg.dayRule === 'mustache' && r.chance(0.2)) look.facial = r.pick(['mustache', 'curly']);
  // Ces jours-là, le trait gratuit doit rester minoritaire, sinon il n'y a presque plus de fraudeurs
  if (cfg.dayRule === 'glassesfree' && look.glasses !== 'none' && r.chance(0.45)) look.glasses = 'none';
  if (cfg.dayRule === 'hatfree' && look.hat !== 'none' && r.chance(0.5)) look.hat = 'none';
  const name = makeName(r);
  const p = { look, name, idName: fullName(name), special: null };

  // Type de titre
  let kind = r.weighted([['single', 6], ['reduced', R.has('reduit') ? 2.2 : 0], ['pass', R.has('name') ? 2.6 : 0]]);
  if (cfg.dayRule === 'nosingle') kind = 'pass';
  if (cfg.dayRule === 'noreduit' && kind === 'reduced') kind = 'single';
  if (cfg.dayRule === 'nopass' && kind === 'pass') kind = 'single';

  let age = r.int(19, 78);
  let reducedType = null;
  if (kind === 'reduced') {
    reducedType = r.chance(0.5) ? 'etudiant' : 'senior';
    age = reducedType === 'etudiant' ? r.int(17, 25) : r.int(65, 92);
  }
  p.ticket = validTicket(cfg, r, ctx, kind, name);
  p.ticket.reducedType = reducedType;
  if (cfg.groupRate && r.chance(cfg.groupRate)) {
    // Groupe : un seul ticket pour tout le monde
    p.groupSize = r.int(2, 4);
    p.companions = Array.from({ length: p.groupSize - 1 }, () => G.randomLook(r));
    if (p.ticket.kind === 'pass') {
      p.ticket.kind = 'single';
      p.ticket.passName = null;
    }
    p.ticket.travelers = p.groupSize;
  }
  if (cfg.dayRule === 'seniorfree' && kind !== 'reduced' && r.chance(0.3)) age = r.int(66, 90);
  p.birthYear = ctx.today.getFullYear() - age;
  p.expiryOffset = r.int(40, 3000);
  p.photoLook = Object.assign({}, look);

  let fraud = r.chance(cfg.fraudRate);
  const free = G.FREE_DAY[cfg.dayRule];
  if (free && free.test(p, ctx)) {
    // Consigne « gratuit pour… » : parfois même sans ticket, et c'est valable.
    fraud = false;
    if (r.chance(0.5)) p.ticket = null;
  }

  if (fraud) {
    const nr = cfg.newRule ? cfg.newRule.id : null;
    const bias = cfg.bias || {};
    const w = (id, base) => base * (nr === id ? 3 : 1) * (bias[id] || 1);
    const types = [['noticket', 1.1]];
    if (R.has('date')) types.push(['date', w('date', 3)]);
    if (R.has('zone')) types.push(['zone', w('zone', 3)]);
    if (R.has('photo')) types.push(['photo', w('photo', 3)]);
    if (R.has('reduit') && cfg.dayRule !== 'noreduit' && cfg.dayRule !== 'nosingle') types.push(['reduit', w('reduit', 3.5)]);
    if (R.has('stamp') && cfg.dayRule !== 'nosingle') types.push(['stamp', w('stamp', 3)]);
    if (R.has('name')) types.push(['name', w('name', 3.5)]);
    if (R.has('expiry')) types.push(['expiry', w('expiry', 3)]);
    if (R.has('group') && p.groupSize > 1) types.push(['group', w('group', 6) * (cfg.bossMech === 'groups' ? 3 : 1)]);
    if (R.has('class') && ctx.firstClass) types.push(['class', w('class', 3)]);
    if (cfg.dayRule === 'nosingle' || cfg.dayRule === 'noreduit' || (cfg.dayRule === 'nopass' && R.has('name'))) types.push(['day', 4]);
    const type = r.weighted(types);
    // Un fraudeur ne doit pas bénéficier d'une consigne « gratuit pour… »
    if (cfg.dayRule === 'mustache' && G.hasMustache(look)) {
      look.facial = 'none';
      p.photoLook.facial = 'none';
    }
    if (cfg.dayRule === 'glassesfree' && look.glasses !== 'none') {
      look.glasses = 'none';
      p.photoLook.glasses = 'none';
    }
    if (cfg.dayRule === 'hatfree' && look.hat !== 'none') {
      look.hat = 'none';
      p.photoLook.hat = 'none';
    }
    if (cfg.dayRule === 'seniorfree' && ctx.today.getFullYear() - p.birthYear >= 65) {
      p.birthYear = ctx.today.getFullYear() - r.int(25, 60);
      if (p.ticket.kind === 'reduced') p.ticket.kind = 'single';
    }
    const t = p.ticket;
    switch (type) {
      case 'noticket':
        p.ticket = null;
        break;
      case 'date':
        if (t.kind === 'pass') t.monthOffset = r.chance(0.8) ? -r.int(1, 3) : 1;
        else t.dayOffset = r.chance(0.75) ? -r.int(1, 40) : r.int(1, 6);
        break;
      case 'zone':
        t.zoneMax = r.int(1, ctx.zoneReq - 1 || 1);
        if (t.zoneMax >= ctx.zoneReq) t.zoneMax = ctx.zoneReq - 1;
        break;
      case 'photo': {
        const m = G.mutateLook(look, r, bias.photo && cfg.bossLook ? 'facial' : null);
        p.photoLook = m.look;
        p.photoLabel = m.label;
        break;
      }
      case 'reduit':
        t.kind = 'reduced';
        t.passName = null;
        t.reducedType = r.chance(0.5) ? 'etudiant' : 'senior';
        p.birthYear = ctx.today.getFullYear() - (t.reducedType === 'etudiant' ? r.int(28, 74) : r.int(24, 61));
        break;
      case 'stamp':
        if (t.kind === 'pass') {
          t.kind = 'single';
          t.passName = null;
        }
        t.stamp = r.chance(0.5) ? 'none' : 'fake';
        break;
      case 'name':
        t.kind = 'pass';
        t.reducedType = null;
        t.passName = r.chance(0.6) && G.NAME_TWINS[name.first] ? fullName({ first: G.NAME_TWINS[name.first], last: name.last }) : fullName({ first: name.first, last: r.pick(G.LAST_NAMES.filter((x) => x !== name.last)) });
        break;
      case 'expiry':
        p.expiryOffset = -r.int(3, 900);
        break;
      case 'group':
        t.travelers = p.groupSize - r.int(1, Math.min(2, p.groupSize - 1));
        break;
      case 'class':
        t.cls = 2;
        break;
      case 'day':
        if (cfg.dayRule === 'nopass') {
          t.kind = 'pass';
          t.reducedType = null;
          t.monthOffset = 0;
          t.passName = p.idName;
          break;
        }
        t.kind = cfg.dayRule === 'noreduit' ? 'reduced' : r.chance(0.7) ? 'single' : 'reduced';
        t.passName = null;
        if (t.kind === 'reduced') {
          t.reducedType = r.chance(0.5) ? 'etudiant' : 'senior';
          p.birthYear = ctx.today.getFullYear() - (t.reducedType === 'etudiant' ? r.int(17, 25) : r.int(66, 88));
        }
        break;
      default:
        break;
    }
  }

  const ev = G.evaluate(p, cfg, ctx);
  p.fraud = ev.fraud;
  p.reason = ev.reason;
  p.hint = ev.field;
  p.nervous = p.fraud ? r.chance(cfg.g < 8 ? 0.7 : 0.5) : r.chance(0.12);
  if (!p.fraud && p.ticket && cfg.g >= 4 && !cfg.daily && !cfg.inverted && r.chance(0.1)) p.minor = r.pick(G.MINOR);
  if (cfg.bossMech === 'mustache' && G.hasMustache(p.look) && !G.hasMustache(p.photoLook)) p.fakeMustache = true;
  const cityLines = G.CITY_LINES[cfg.city.id];
  p.line = !p.ticket ? r.pick(G.LINES.noticket) : p.minor ? p.minor.say : p.nervous ? r.pick(G.LINES.nervous) : cityLines && r.chance(0.3) ? r.pick(cityLines) : r.pick(G.LINES.greet);
  if (p.groupSize > 1 && p.ticket && !p.minor) p.line = r.pick(['On voyage ensemble !', 'Un ticket pour toute la famille.', 'Ce sont mes cousins.', 'On est une bande de copains !']);
  return p;
};

/* ---------- Passagers spéciaux ---------- */
const SPECIAL_LOOKS = {
  mime: { skin: '#fbfbfb', hair: 'short', hairColor: '#2b1b12', hat: 'beret', hatColor: '#1b1b25', outfit: 'stripes', outfitColor: '#1b1b25', facial: 'none', glasses: 'none', eyes: 'dot', mouth: 'flat', extras: ['mimepaint'], acc: 'none' },
  tourist: { hat: 'bucket', hatColor: '#ffd23f', glasses: 'sun', outfit: 'hawaii', acc: 'camera', facial: 'none', mouth: 'grin' },
  timetraveler: { hair: 'wild', hairColor: '#f2f2f2', glasses: 'goggles', outfit: 'foil', hat: 'none', facial: 'mustache', acc: 'none' },
  grandma: { hair: 'bun', hairColor: '#d6d6d6', glasses: 'ninja', outfit: 'ninja', hat: 'none', facial: 'none', eyes: 'dot', acc: 'none', cheeks: true },
  pirate: { hat: 'tricorn', hatColor: '#1c1c1c', glasses: 'patch', facial: 'beard', hairColor: '#2b1b12', hair: 'long', outfit: 'stripes', outfitColor: '#d62828', acc: 'parrot' },
  baby: { head: 'round', hair: 'none', hat: 'bonnet', facial: 'none', glasses: 'none', eyes: 'big', outfit: 'tee', outfitColor: '#ff8fab', acc: 'pacifier', extras: ['muscles'], cheeks: true, build: 'round' },
  influencer: { hair: 'long', hairColor: '#ff6fb5', hat: 'none', glasses: 'sun', facial: 'none', outfit: 'dress', outfitColor: '#ff8fab', acc: 'selfie', extras: ['ringlight'] },
  vampire: { skin: '#e3e8ef', hair: 'slick', hairColor: '#1b1b25', hat: 'none', glasses: 'none', facial: 'none', outfit: 'vampire', outfitColor: '#1b1b25', eyes: 'sleepy', extras: ['fangs'], acc: 'none' },
  king: { hat: 'crown', facial: 'beard', hairColor: '#9c5a2c', hair: 'curly', outfit: 'royalcape', outfitColor: '#c0262d', glasses: 'none', acc: 'none' },
  alien: { skin: '#8fe36b', hair: 'none', hat: 'none', glasses: 'none', facial: 'none', outfit: 'foil', extras: ['alieneyes', 'antennae'], acc: 'none', head: 'oval' },
  inspector: { hat: 'fedora', hatColor: '#5c677d', facial: 'mustache', hairColor: '#5a3a1e', outfit: 'suit', outfitColor: '#5c677d', glasses: 'none', acc: 'magnifier', extras: ['badge'] },
  astronaut: { hat: 'none', hair: 'short', facial: 'none', glasses: 'none', outfit: 'space', extras: ['helmet'], acc: 'none' },
  magician: { hat: 'top', hatColor: '#1b1b25', facial: 'curly', hairColor: '#2b1b12', outfit: 'cape', outfitColor: '#5a2a9b', acc: 'wand', glasses: 'none' },
  bee: { hair: 'bob', hairColor: '#2b1b12', hat: 'none', outfit: 'bee', extras: ['antennae'], glasses: 'none', facial: 'none', acc: 'none', cheeks: true },
  gardener: { hair: 'short', hat: 'straw', outfit: 'overalls', outfitColor: '#3a86ff', acc: 'plant', facial: 'beard', hairColor: '#9c5a2c', glasses: 'none' },
  chef: { hair: 'short', hat: 'toque', outfit: 'chef', facial: 'curly', hairColor: '#2b1b12', acc: 'pan', glasses: 'none' },
  accordion: { hair: 'short', hairColor: '#2b1b12', hat: 'beret', hatColor: '#1b1b25', outfit: 'stripes', outfitColor: '#1e2a4a', acc: 'accordion', facial: 'mustache', glasses: 'none' },
  pizza: { hair: 'short', hairColor: '#2b1b12', hat: 'cap', hatColor: '#d62828', outfit: 'tee', outfitColor: '#d62828', acc: 'pizza', facial: 'none', glasses: 'none' },
  detective: { hat: 'fedora', hatColor: '#7a5230', outfit: 'trench', acc: 'magnifier', glasses: 'none', hair: 'bob', hairColor: '#d9531e', facial: 'none' },
  rocker: { hair: 'mohawk', hairColor: '#ff4d6d', hat: 'none', glasses: 'sun', outfit: 'leather', acc: 'guitar', facial: 'goatee' },
  queen: { hat: 'tiara', hair: 'bun', hairColor: '#f2f2f2', outfit: 'royalcape', glasses: 'none', facial: 'none', acc: 'pearls' },
  dj: { hair: 'afro', hairColor: '#7b4bcf', hat: 'none', glasses: 'sun', outfit: 'hoodie', outfitColor: '#2ec4b6', extras: ['headphones'], facial: 'none', acc: 'none' },
  unicorn: { hat: 'unicorn', hair: 'none', outfit: 'onesie', outfitColor: '#ffb3d9', glasses: 'none', facial: 'none', acc: 'none', cheeks: true },
  hero: { hat: 'none', hair: 'slick', hairColor: '#2b1b12', outfit: 'hero', outfitColor: '#3a86ff', extras: ['mask'], back: ['cape'], glasses: 'none', facial: 'none', acc: 'none' },
  knight: { hair: 'none', hat: 'knight', outfit: 'armor', facial: 'beard', hairColor: '#9c5a2c', glasses: 'none', acc: 'none' },
  santa: { hat: 'santa', facial: 'beard', hairColor: '#f2f2f2', hair: 'short', outfit: 'santa', glasses: 'round', acc: 'none', cheeks: true, build: 'round' },
  zombie: { skin: '#9bb08a', hair: 'side', hairColor: '#4a4a3a', outfit: 'torn', outfitColor: '#6b7a5a', mouth: 'flat', eyes: 'sleepy', glasses: 'none', facial: 'none', hat: 'none', acc: 'none' },
  cowboy: { hair: 'short', hairColor: '#5a3a1e', hat: 'cowboy', hatColor: '#9c5a2c', facial: 'mustache', outfit: 'vest', outfitColor: '#7a5230', acc: 'none', glasses: 'none' },
  mummy: { skin: '#e9dfc4', hair: 'none', hat: 'none', outfit: 'mummy', extras: ['bandages'], glasses: 'none', facial: 'none', eyes: 'dot', acc: 'none' },
  diver: { hair: 'short', hat: 'none', outfit: 'wetsuit', extras: ['snorkel'], glasses: 'none', facial: 'none', acc: 'none' },
  elf: { hair: 'short', hairColor: '#d9531e', hat: 'elf', hatColor: '#2e8b57', outfit: 'tee', outfitColor: '#2e8b57', extras: ['elfears'], facial: 'none', glasses: 'none', acc: 'none', cheeks: true },
  fairy: { hair: 'bun', hairColor: '#ff6fb5', hat: 'none', outfit: 'dress', outfitColor: '#b39ddb', back: ['wings'], acc: 'wand', glasses: 'none', facial: 'none' },
  mermaid: { hair: 'long', hairColor: '#2fb5a8', outfit: 'scales', outfitColor: '#2ec4b6', hat: 'none', acc: 'trident', glasses: 'none', facial: 'none' },
  clown: { hair: 'afro', hairColor: '#ff6fb5', hat: 'none', skin: '#fbfbfb', extras: ['clownnose'], outfit: 'stripes', outfitColor: '#e94f4f', mouth: 'grin', glasses: 'none', facial: 'none', acc: 'balloon' },
  viking: { hat: 'viking', facial: 'beard', hairColor: '#d9531e', hair: 'long', outfit: 'fur', glasses: 'none', acc: 'none' },
  bride: { hair: 'long', hairColor: '#5a3a1e', hat: 'none', outfit: 'wedding', back: ['veil'], extras: ['flowercrown'], acc: 'bouquet', glasses: 'none', facial: 'none' },
  broker: { hair: 'slick', hairColor: '#2b1b12', hat: 'none', outfit: 'suit', outfitColor: '#1e2a4a', acc: 'phone', glasses: 'none', facial: 'none', mouth: 'grin' },
  liberty: { skin: '#8fd1b5', hair: 'long', hairColor: '#5fa88a', hat: 'tiara', outfit: 'royalcape', outfitColor: '#5fa88a', acc: 'coffee', glasses: 'none', facial: 'none', mouth: 'flat', eyes: 'dot' },
  hotdog: { hair: 'short', hairColor: '#2b1b12', hat: 'cap', hatColor: '#ffd23f', outfit: 'tee', outfitColor: '#e94f4f', acc: 'baguette', facial: 'mustache', glasses: 'none' },
  breakdancer: { hair: 'short', hat: 'cap', hatColor: '#2ec4b6', outfit: 'hoodie', outfitColor: '#ff6b35', extras: ['headphones'], glasses: 'sun', facial: 'none', acc: 'none' },
  taxi: { hair: 'short', hairColor: '#5a3a1e', hat: 'cap', hatColor: '#ffd23f', outfit: 'vest', outfitColor: '#2b2b38', facial: 'mustache', acc: 'newspaper', glasses: 'none' },
  gaston: { hair: 'short', hairColor: '#2b1b12', hat: 'kepi', hatColor: '#a8323a', outfit: 'suit', outfitColor: '#a8323a', facial: 'curly', glasses: 'sun', acc: 'newspaper' },
  techno: { hair: 'spiky', hairColor: '#ff6fb5', hat: 'none', glasses: 'sun', outfit: 'leather', extras: ['headphones'], facial: 'none', acc: 'none', eyes: 'sleepy' },
  philosopher: { hair: 'wild', hairColor: '#d6d6d6', hat: 'none', glasses: 'round', facial: 'beard', outfit: 'sweater', outfitColor: '#7a5230', acc: 'newspaper' },
  spy: { hat: 'fedora', hatColor: '#1b1b25', outfit: 'trench', glasses: 'sun', acc: 'newspaper', facial: 'mustache', hairColor: '#1b1b25' },
  cyclist: { hair: 'ponytail', hairColor: '#d9531e', hat: 'cap', hatColor: '#3a86ff', outfit: 'tee', outfitColor: '#2ec4b6', glasses: 'sun', facial: 'none', acc: 'none' },
  currywurst: { hair: 'short', hairColor: '#5a3a1e', hat: 'toque', outfit: 'chef', acc: 'pan', facial: 'mustache', glasses: 'none', build: 'round' },
  gondolier: { hair: 'short', hairColor: '#2b1b12', hat: 'straw', outfit: 'stripes', outfitColor: '#1e2a4a', facial: 'curly', glasses: 'none', acc: 'none', mouth: 'sing' },
  carnival: { hair: 'long', hairColor: '#1b1b25', hat: 'top', hatColor: '#5a2a9b', extras: ['mask'], outfit: 'cape', outfitColor: '#d62828', glasses: 'none', facial: 'none', acc: 'none' },
  pigeon: { skin: '#9aa5b1', hair: 'none', hat: 'none', back: ['wings'], outfit: 'tee', outfitColor: '#7d8a99', mouth: 'o', eyes: 'big', glasses: 'none', facial: 'none', acc: 'none' },
  painter: { hair: 'bob', hairColor: '#5a3a1e', hat: 'beret', hatColor: '#d62828', outfit: 'overalls', outfitColor: '#e9d7a8', acc: 'wand', glasses: 'none', facial: 'none' },
  casanova: { hair: 'curly', hairColor: '#f2f2f2', hat: 'none', outfit: 'royalcape', outfitColor: '#3a86ff', acc: 'bouquet', glasses: 'none', facial: 'none', mouth: 'grin' },
  martian: { skin: '#7fd36b', hair: 'none', hat: 'none', glasses: 'none', facial: 'none', outfit: 'foil', extras: ['alieneyes', 'antennae'], acc: 'none', head: 'oval' },
  colonist: { hair: 'bob', hairColor: '#2b1b12', hat: 'none', outfit: 'space', extras: ['helmet'], glasses: 'none', facial: 'none', acc: 'none' },
  astrocat: { skin: '#f2a93b', hair: 'none', hat: 'none', outfit: 'space', extras: ['helmet', 'elfears'], eyes: 'big', mouth: 'o', glasses: 'none', facial: 'none', acc: 'none' },
  emperor: { hat: 'crown', facial: 'beard', hairColor: '#d6d6d6', hair: 'long', outfit: 'royalcape', outfitColor: '#5a2a9b', acc: 'wand', glasses: 'none' },
  diva: { hair: 'diva', hairColor: '#e8c25a', hat: 'viking', glasses: 'none', facial: 'none', outfit: 'dress', outfitColor: '#c0262d', mouth: 'sing', acc: 'pearls', extras: ['notes'], build: 'round' },
};

G.makeSpecial = (sp, cfg, r, ctx) => {
  // Base : un passager ordinaire valide, puis on le déguise.
  const quiet = Object.assign({}, cfg, { fraudRate: sp.fraud === 'docs' ? cfg.fraudRate : 0, dayRule: sp.fraud === 'docs' ? cfg.dayRule : null, bossLook: null, groupRate: 0 });
  const p = G.makePassenger(quiet, r, ctx);
  p.special = sp.id;
  const year = ctx.today.getFullYear();
  if (sp.id === 'ghost') p.look = { kind: 'ghost' };
  else if (sp.id === 'robot' || sp.id === 'rover') p.look = { kind: 'robot' };
  else if (sp.id === 'dogs') p.look = { kind: 'dogs' };
  else if (sp.id === 'twin') p.look = G.conductorLook(G.save.uniform);
  else Object.assign(p.look, { extras: [], back: [] }, SPECIAL_LOOKS[sp.id] || {});
  p.photoLook = Object.assign({}, p.look);
  p.nervous = false;
  // Personnages récurrents : une réplique propre à chaque ville
  p.line = (G.RECURRING && G.RECURRING[sp.id] && G.RECURRING[sp.id][cfg.city.id]) || sp.say;

  if (sp.fraud === 'docs') {
    // L'influenceuse : papiers ordinaires, mais une erreur coûte double.
    const ev = G.evaluate(p, cfg, ctx);
    p.fraud = ev.fraud;
    p.reason = ev.reason;
    p.hint = ev.field;
    return p;
  }

  p.specialFixed = true;
  p.fraud = sp.fraud;
  p.reason = sp.reason;
  p.hint = null;
  if (!p.ticket) p.ticket = validTicket(cfg, r, ctx, 'single', p.name);
  // Les spéciaux ne sont pas prévisibles : un fraudeur notoire peut être en règle, et l'inverse.
  if (cfg.g >= 6 && r.chance(0.25)) {
    const t0 = p.ticket;
    Object.assign(t0, { kind: 'single', passName: null, reducedType: null, dayOffset: 0, variant: undefined, stamp: 'ok', travelers: p.groupSize || 1 });
    if (sp.fraud === true) {
      p.fraud = false;
      p.reason = `Surprise : ${sp.name.replace(/^(Le |La |L')/, (m) => m.toLowerCase())} est en règle cette fois-ci !`;
      p.hint = null;
    } else {
      p.fraud = true;
      t0.dayOffset = -r.int(2, 9);
      p.reason = `Même ${sp.name.replace(/^(Le |La |L')/, (m) => m.toLowerCase())} peut frauder : ticket daté du ${G.fmtDate(G.addDays(ctx.today, t0.dayOffset))}.`;
      p.hint = 'date';
    }
    p.surprise = true;
    return p;
  }
  const t = p.ticket;
  t.kind = t.kind === 'pass' ? 'single' : t.kind;
  t.passName = null;
  t.reducedType = null;
  t.dayOffset = 0;
  switch (sp.id) {
    case 'mime':
      t.variant = 'invisible';
      p.hint = 'ticket';
      break;
    case 'dogs':
      p.photoVariant = 'crayon';
      p.idName = 'MÉDOR HUMAIN';
      p.hint = 'photo';
      break;
    case 'ghost':
      p.photoVariant = 'blank';
      p.birthYear = 1874;
      break;
    case 'timetraveler':
      t.dateText = G.fmtDate(new Date(2087, ctx.today.getMonth(), ctx.today.getDate()));
      p.hint = 'date';
      break;
    case 'grandma':
      t.kind = 'reduced';
      t.reducedType = 'senior';
      p.birthYear = year - 25;
      p.hint = 'age';
      break;
    case 'pirate':
      t.variant = 'map';
      p.hint = 'ticket';
      break;
    case 'baby':
      p.ticket = null;
      p.birthYear = year - 2;
      break;
    case 'vampire':
      t.dateText = G.fmtDate(new Date(1897, ctx.today.getMonth(), ctx.today.getDate()));
      p.birthYear = 1431;
      p.hint = 'date';
      break;
    case 'robot':
      t.variant = 'barcode';
      p.idName = 'BIP-3000';
      p.birthYear = year - 3;
      break;
    case 'king':
      p.ticket = null;
      p.idName = 'SA MAJESTÉ LÉON XIV';
      p.hint = 'ticket';
      break;
    case 'alien':
      t.variant = 'alien';
      t.zoneMax = 99;
      p.idName = 'ZORG DE PROXIMA';
      break;
    case 'inspector':
      t.dayOffset = -3;
      p.hint = 'date';
      break;
    case 'magician':
      t.variant = 'card';
      p.hint = 'ticket';
      break;
    case 'twin':
      p.idName = 'TON SOSIE';
      break;
    case 'pizza':
      t.stamp = 'fake';
      p.hint = 'stamp';
      break;
    case 'rocker':
      t.kind = 'pass';
      t.passName = 'Jojo BATTERIE';
      p.hint = 'name';
      break;
    case 'queen':
      p.idName = 'SA MAJESTÉ GERTRUDE';
      t.kind = 'pass';
      t.passName = p.idName;
      break;
    case 'hero':
    case 'elf':
    case 'viking':
      p.ticket = null;
      p.hint = 'ticket';
      break;
    case 'knight':
      t.dateText = G.fmtDate(new Date(1347, ctx.today.getMonth(), ctx.today.getDate()));
      p.hint = 'date';
      break;
    case 'santa':
      t.dateText = G.fmtDate(new Date(year - 1, 11, 24));
      p.hint = 'date';
      break;
    case 'zombie':
      t.dateText = G.fmtDate(new Date(1998, ctx.today.getMonth(), ctx.today.getDate()));
      p.birthYear = 1951;
      p.hint = 'date';
      break;
    case 'mummy':
      p.birthYear = -1320;
      break;
    case 'diver':
      t.variant = 'wet';
      p.hint = 'ticket';
      break;
    case 'fairy':
      t.variant = 'leaf';
      p.hint = 'ticket';
      break;
    case 'clown':
      t.variant = 'balloon';
      p.hint = 'ticket';
      break;
    case 'broker':
      t.kind = 'pass';
      t.passName = 'M. BONUS';
      p.hint = 'name';
      break;
    case 'spy':
      t.kind = 'pass';
      t.passName = 'AGENT X';
      p.hint = 'name';
      break;
    case 'casanova':
      t.kind = 'pass';
      t.passName = 'Bella ROSSI';
      p.hint = 'name';
      break;
    case 'hotdog':
      t.stamp = 'fake';
      p.hint = 'stamp';
      break;
    case 'techno':
      t.dayOffset = -1;
      p.hint = 'date';
      break;
    case 'cyclist':
      t.kind = 'reduced';
      t.reducedType = 'etudiant';
      p.birthYear = year - 41;
      p.hint = 'age';
      break;
    case 'colonist':
      t.dateText = G.fmtDate(new Date(2150, ctx.today.getMonth(), ctx.today.getDate()));
      p.hint = 'date';
      break;
    case 'martian':
      t.variant = 'alien';
      t.zoneMax = 99;
      p.idName = 'GLOUBI DE PHOBOS';
      break;
    case 'rover':
      p.ticket = null;
      p.idName = 'ROVER-7';
      p.hint = 'ticket';
      break;
    case 'astrocat':
      p.idName = 'MINOU ORBITAL';
      break;
    case 'taxi':
    case 'gaston':
    case 'carnival':
    case 'pigeon':
    case 'emperor':
      p.ticket = null;
      p.hint = 'ticket';
      break;
    default:
      break;
  }
  return p;
};

/* Construit toute la file d'un service */
G.buildQueue = (cfg, seed) => {
  const r = G.rng(seed);
  const today = G.today();
  const ctx = { today, zoneReq: cfg.zoneReq, firstClass: !!cfg.firstClass };
  const queue = [];
  const usedSpecials = new Set();
  for (let k = 0; k < cfg.count; k++) {
    let p = null;
    if (cfg.specialRate && k > 0 && r.chance(cfg.specialRate)) {
      const pool = G.SPECIALS.filter((s) => (cfg.specialPool ? cfg.specialPool.includes(s.id) : s.city <= cfg.cityIndex) && !usedSpecials.has(s.id));
      if (pool.length) {
        // Priorité aux spéciaux jamais vus, pour remplir l'album.
        const unseen = pool.filter((s) => !G.save.album[s.id]);
        const star = G.monthSpecial && G.monthSpecial();
        const sp = star && pool.includes(star) && r.chance(0.3) ? star : unseen.length && r.chance(0.6) ? r.pick(unseen) : r.pick(pool);
        usedSpecials.add(sp.id);
        p = G.makeSpecial(sp, cfg, r, ctx);
      }
    }
    if (!p) p = G.makePassenger(cfg, r, ctx);
    queue.push(p);
  }
  // Garantit au moins un fraudeur et un innocent
  if (queue.every((q) => q.fraud) || queue.every((q) => !q.fraud)) {
    const idx = queue.findIndex((q) => !q.special);
    if (idx >= 0) {
      const want = !queue[0].fraud;
      for (let tries = 0; tries < 30; tries++) {
        const alt = G.makePassenger(Object.assign({}, cfg, { fraudRate: want ? 1 : 0 }), r, ctx);
        if (alt.fraud === want) {
          queue[idx] = alt;
          break;
        }
      }
    }
  }
  const extra = {};
  if (cfg.bossMech === 'wanted') {
    // Avis de recherche : le jumeau recherché (papiers en règle, mais à verbaliser) et son frère innocent
    const wanted = Object.assign(G.randomLook(r), { acc: 'none', hat: 'none' });
    const twin = G.mutateLook(wanted, r, r.pick(['glasses', 'facial', 'hairColor'])).look;
    const slots = r.shuffle(queue.map((_, i) => i).filter((i) => i > 0)).slice(0, 4);
    slots.forEach((idx, k) => {
      const p = G.makePassenger(Object.assign({}, cfg, { fraudRate: 0, groupRate: 0 }), r, ctx);
      const isWanted = k < 2;
      p.look = Object.assign({}, isWanted ? wanted : twin);
      p.photoLook = Object.assign({}, p.look);
      p.specialFixed = true;
      p.special = null;
      p.wanted = isWanted;
      p.fraud = isWanted;
      p.reason = isWanted ? "C'est le jumeau de l'avis de recherche !" : "C'est son frère jumeau : lui n'a rien fait.";
      p.hint = isWanted ? 'wanted' : null;
      p.nervous = isWanted;
      p.line = isWanted ? 'Je… je ne suis pas celui que vous croyez.' : "On me confond souvent avec mon frère…";
      queue[idx] = p;
    });
    extra.wanted = wanted;
    extra.twin = twin;
  }
  if (cfg.bossMech === 'mystery') extra.mystery = G.buildMystery(queue, r);
  if (cfg.bossMech === 'blacklist') {
    // Liste noire : trois numéros volés, posés sur des tickets par ailleurs parfaits
    const list = [];
    while (list.length < 3) {
      const s = String(r.int(100000, 999999));
      if (!list.includes(s)) list.push(s);
    }
    queue.forEach((q) => { if (q.ticket && list.includes(q.ticket.serial)) q.ticket.serial = String(r.int(100000, 999999)); });
    const free = r.shuffle(queue.map((_, i) => i).filter((i) => i > 0 && !queue[i].special));
    free.slice(0, 4).forEach((idx, k) => {
      const p = G.makePassenger(Object.assign({}, cfg, { fraudRate: 0, groupRate: 0 }), r, ctx);
      if (!p.ticket) return;
      p.ticket.serial = list[k % 3];
      p.specialFixed = true;
      p.fraud = true;
      p.reason = `Ticket volé : le N° ${p.ticket.serial} est sur la liste noire.`;
      p.hint = 'serial';
      queue[idx] = p;
    });
    // Leurres : un seul chiffre de différence avec un numéro volé
    free.slice(4, 6).forEach((idx, k) => {
      const t = queue[idx].ticket;
      if (!t) return;
      const s = list[k % 3];
      t.serial = s.slice(0, 5) + String((Number(s[5]) + 3) % 10);
    });
    extra.blacklist = list;
  }
  if (cfg.bossMech === 'memory') {
    // Caméras : trois visages filmés en train de sauter le portillon
    const faces = [0, 1, 2].map(() => Object.assign(G.randomLook(r), { acc: 'none' }));
    const slots = r.shuffle(queue.map((_, i) => i).filter((i) => i > 1 && !queue[i].special)).slice(0, 3);
    slots.forEach((idx, k) => {
      const p = G.makePassenger(Object.assign({}, cfg, { fraudRate: 0, groupRate: 0 }), r, ctx);
      p.look = Object.assign({}, faces[k]);
      p.photoLook = Object.assign({}, faces[k]);
      p.specialFixed = true;
      p.fraud = true;
      p.reason = "Il a sauté le portillon : les caméras l'ont filmé !";
      p.hint = 'memory';
      p.nervous = true;
      p.line = "Moi ? Je viens juste d'arriver…";
      queue[idx] = p;
    });
    extra.memory = faces;
  }
  return { queue, ctx, extra };
};

/* Exemples pour l'écran de briefing d'une nouvelle règle */
G.ruleExample = (ruleId, cfg) => {
  const r = G.rng(4242 + ruleId.length);
  const today = G.today();
  const ctx = { today, zoneReq: Math.max(3, cfg.zoneReq), firstClass: true };
  const base = Object.assign({}, cfg, { rules: cfg.rules, dayRule: null, newRule: null, bias: {}, bossLook: null });
  const good = G.makePassenger(Object.assign({}, base, { fraudRate: 0 }), r, ctx);
  const bad = JSON.parse(JSON.stringify(good));
  const t = bad.ticket;
  switch (ruleId) {
    case 'date':
      t.dayOffset = -2;
      break;
    case 'zone':
      t.zoneMax = ctx.zoneReq - 1;
      break;
    case 'reduit':
      t.kind = 'reduced';
      t.reducedType = 'etudiant';
      bad.birthYear = today.getFullYear() - 47;
      good.ticket.kind = 'reduced';
      good.ticket.reducedType = 'etudiant';
      good.ticket.passName = null;
      good.birthYear = today.getFullYear() - 21;
      break;
    case 'stamp':
      t.stamp = 'fake';
      break;
    case 'expiry':
      bad.expiryOffset = -120;
      break;
    case 'class':
      good.ticket.cls = 1;
      t.cls = 2;
      break;
    case 'name':
      good.ticket.kind = 'pass';
      good.ticket.passName = good.idName;
      t.kind = 'pass';
      t.passName = `${G.NAME_TWINS[good.name.first] || 'Robert'} ${good.name.last.toUpperCase()}`;
      break;
    default:
      break;
  }
  if (ruleId !== 'reduit' && ruleId !== 'name' && good.ticket.kind !== 'single') {
    for (const q of [good, bad]) {
      q.ticket.kind = 'single';
      q.ticket.passName = null;
      q.ticket.reducedType = null;
    }
  }
  if (ruleId === 'photo') {
    const m = G.mutateLook(good.look, r, 'glasses');
    bad.photoLook = m.look;
  }
  return { good, bad, ctx };
};
