/* Ticket SVP ! — écrans de menu : titre, carte, défi du jour, album, boutique, réglages, résultats */
'use strict';

const UI = (G.UI = {});

/* ---------- Socle : écrans et fenêtres ---------- */
// Redessine l'écran de menu affiché (après l'achat du jeu complet, par exemple)
UI.refresh = () => {
  const cur = G.$('#screens') && G.$('#screens').lastElementChild;
  const cls = cur ? cur.className : '';
  if (/map-screen/.test(cls)) UI.map();
  else if (/shop-screen/.test(cls)) UI.shop('full');
  else if (/settings-screen/.test(cls)) UI.settings();
};

G.showScreen = (el) => {
  // Mise à jour reçue pendant un service : on l'applique au retour dans les menus
  if (G.Install && G.Install.pendingReload && !el.classList.contains('game-screen')) return location.reload();
  if (el.classList.contains('map-screen')) G.healthy = true;
  const host = G.$('#screens');
  // Tous les écrans déjà là sortent, pas seulement le premier : deux ouvertures rapprochées
  // (double appui, écran ouvert pendant une transition) laissaient sinon des menus empilés pour toujours
  const olds = [...host.children].filter((c) => c !== el);
  const nmNew = [...el.classList].find((c) => c.endsWith('-screen'));
  const cur = olds.filter((o) => !o.classList.contains('screen-out')).pop();
  // Même écran redessiné (achat, onglet, réglage) : remplacement net, sans fondu, en gardant le défilement
  if (cur && nmNew && cur.classList.contains(nmNew)) {
    const pos = [...cur.querySelectorAll('*')].filter((n) => n.scrollTop > 0).map((n) => [n.className, [...cur.getElementsByClassName(n.className)].indexOf(n), n.scrollTop]);
    olds.forEach((o) => o.remove());
    host.appendChild(el);
    pos.forEach(([c, i, top]) => {
      const n = typeof c === 'string' && c ? el.getElementsByClassName(c)[i] : null;
      if (n) n.scrollTop = top;
    });
    G.$$('.modal').forEach((m) => m.remove());
    return;
  }
  host.appendChild(el);
  el.classList.remove('screen-out');
  el.classList.add('screen-in');
  const nm = [...el.classList].find((c) => c.endsWith('-screen'));
  if (nm) G.Analytics.screen(nm.replace('-screen', ''));
  olds.forEach((old) => {
    if (old.classList.contains('screen-out')) return; // déjà en train de partir
    old.classList.add('screen-out');
    old.setAttribute('aria-hidden', 'true');
    old.inert = true;
    setTimeout(() => old.remove(), 220);
  });
  G.$$('.modal').forEach((m) => m.remove());
};

G.modal = (html, opts = {}) => {
  const wrap = G.el('div', `modal ${opts.cls || ''}`);
  wrap.innerHTML = `<div class="modal-back"></div><div class="modal-card" role="dialog" aria-modal="true">${html}</div>`;
  G.$('#game-root').appendChild(wrap);
  const api = {
    el: wrap,
    onDismiss: null,
    close() {
      wrap.classList.add('out');
      setTimeout(() => wrap.remove(), 200);
    },
  };
  if (opts.dismissable !== false) {
    G.$('.modal-back', wrap).addEventListener('click', () => {
      if (api.onDismiss) api.onDismiss();
      else api.close();
    });
  }
  return api;
};

function topBar(opts = {}) {
  const s = G.save;
  const rk = G.rankOf(s.xp);
  const pct = rk.next ? Math.round(((s.xp - rk.from) / (rk.to - rk.from)) * 100) : 100;
  return `<header class="topbar">
    ${opts.back ? `<button class="hud-btn" data-nav="map" aria-label="Retour">${G.icon('back')}</button>` : `<div class="tb-avatar">${G.drawPerson(G.conductorLook(s.uniform), { photo: true })}</div>`}
    <div class="tb-rank">
      <div class="tb-rank-name">${opts.title || rk.name}</div>
      ${opts.title ? `<div class="tb-rank-sub">${rk.name}</div>` : `<div class="xpbar"><i style="width:${pct}%"></i></div><div class="tb-rank-sub">${rk.next ? `${G.fmt(s.xp)} / ${G.fmt(rk.to)} XP` : 'Rang maximum'}</div>`}
    </div>
    <div class="wallet">
      <span class="money coins" title="Amendes encaissées">${G.icon('coin')}<b data-coins>${G.fmt(s.coins)}</b></span>
      <span class="money gold" title="Tickets d'or">${G.icon('gold')}<b data-gold>${G.fmt(s.gold)}</b></span>
    </div>
  </header>`;
}

function bottomNav(active) {
  const daily = G.save.daily.last === G.dayKey();
  const items = [
    ['map', 'map', 'Carte'],
    ['daily', 'calendar', 'Défi'],
    ['album', 'album', 'Album'],
    ['shop', 'shop', 'Boutique'],
    ['settings', 'gear', 'Réglages'],
  ];
  return `<nav class="bottomnav">${items.map(([id, ic, label]) => `<button class="nav-btn ${active === id ? 'on' : ''}" data-nav="${id}">${G.icon(ic)}<span>${label}</span>${id === 'daily' && !daily ? '<i class="dot-new"></i>' : ''}</button>`).join('')}</nav>`;
}

function bindNav(root) {
  root.addEventListener('click', (ev) => {
    const n = ev.target.closest('[data-nav]');
    if (!n) return;
    G.Audio.sfx('click');
    const to = n.dataset.nav;
    if (UI[to]) UI[to]();
  });
}

function refreshWallet() {
  const c = G.$('[data-coins]');
  const g = G.$('[data-gold]');
  if (c) c.textContent = G.fmt(G.save.coins);
  if (g) g.textContent = G.fmt(G.save.gold);
}

/* ---------- Écran titre ---------- */
UI.title = () => {
  const root = G.el('div', 'screen title-screen');
  root.innerHTML = `
    <div class="title-sky"><div class="title-sun"></div><i class="title-cloud c1"></i><i class="title-cloud c2"></i><i class="title-cloud c3"></i></div>
    <div class="title-city">${skylineSvg()}</div>
    <div class="title-logo">${G.drawLogo()}</div>
    <p class="title-tag">Le jeu du contrôleur de métro</p>
    <div class="title-hero">${G.drawPerson(G.conductorLook(G.save.uniform), { mood: 'happy' })}</div>
    <div class="title-train"><div class="train">${trainSvg()}</div></div>
    <div class="title-actions">
      <button class="btn btn-primary btn-xl" data-play>${G.icon('play')} Jouer</button>
      ${G.Install.button()}
      <div class="title-save" data-titlesave></div>
      <p class="title-hint">${G.Tester.badge()}Le son démarre au premier toucher</p>
    </div>
    <footer class="title-foot">v${G.VERSION} · Graphismes et musique 8 bits créés par le code</footer>`;
  G.showScreen(root);
  G.Install.bind(root);
  const showSave = () => {
    const box = G.$('[data-titlesave]', root);
    if (box) box.innerHTML = saveWarnHtml();
  };
  showSave();
  document.addEventListener('ticketsvp-save-status', showSave);
  G.$('[data-play]', root).addEventListener('click', () => {
    G.Audio.init();
    G.Audio.sfx('door');
    G.Audio.play('map');
    UI.map();
    if (!whatsNew()) maybeLoginChest();
  });
};

/* Nouveautés : affichées une fois après chaque mise à jour (pas pour un tout nouveau joueur) */
function whatsNew() {
  const s = G.save;
  const seen = s.seenVersion;
  s.seenVersion = G.VERSION;
  G.persist();
  const veteran = Object.keys(s.levels).length > 0;
  if (!veteran || seen === G.VERSION) return false;
  const news = G.WHATS_NEW.filter((n) => !seen || G.versionNewer(n.v, seen)).slice(0, 2);
  if (!news.length) return false;
  const m = G.modal(`<div class="whats-new"><div class="wn-badge">${G.icon('star')} Version ${G.VERSION}</div><h2>Quoi de neuf ?</h2>
    ${news.map((n) => `<div class="wn-block"><h3>${n.title}</h3><ul>${n.items.map((it) => `<li>${G.icon(it[0])}<span>${it[1]}</span></li>`).join('')}</ul></div>`).join('')}
    <button class="btn btn-primary" data-ok>C'est parti !</button></div>`, { cls: 'modal-wn' });
  G.$('[data-ok]', m.el).addEventListener('click', () => {
    m.close();
    maybeLoginChest();
  });
  return true;
}

function skylineSvg() {
  // Silhouette de ville : immeubles, une tour en treillis, fenêtres allumées
  const b = (x, w, h, c) => {
    let win = '';
    for (let yy = 214 - h + 12; yy < 200; yy += 16) for (let xx = x + 8; xx < x + w - 8; xx += 14) if ((xx * 7 + yy * 3) % 5 !== 0) win += `<rect x="${xx}" y="${yy}" width="6" height="8" rx="1" fill="#fff6c9" opacity=".75"/>`;
    return `<rect x="${x}" y="${214 - h}" width="${w}" height="${h}" fill="${c}" stroke="#1e2a4a" stroke-width="2.5"/>${win}`;
  };
  return `<svg viewBox="0 0 480 214" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g opacity=".55">${b(-4, 60, 90, '#8fb3d9')}${b(60, 46, 130, '#7fa3cc')}${b(300, 54, 110, '#8fb3d9')}${b(420, 64, 140, '#7fa3cc')}</g>
    <path d="M220 214 L240 40 L260 214 M226 160 L254 160 M231 110 L249 110 M236 70 L244 70 M220 214 Q240 170 260 214" fill="none" stroke="#5f7fa8" stroke-width="5" stroke-linejoin="round"/>
    ${b(110, 70, 100, '#a9c6e6')}${b(186, 44, 70, '#9dbbe0')}${b(266, 40, 84, '#a9c6e6')}${b(350, 66, 76, '#9dbbe0')}
  </svg>`;
}

function trainSvg() {
  const car = (x, c) => `<g transform="translate(${x} 0)"><rect x="4" y="10" width="150" height="58" rx="14" fill="${c}" stroke="#1e2a4a" stroke-width="4"/><rect x="18" y="22" width="34" height="22" rx="5" fill="#bfe9ff" stroke="#1e2a4a" stroke-width="3"/><rect x="62" y="22" width="34" height="22" rx="5" fill="#bfe9ff" stroke="#1e2a4a" stroke-width="3"/><rect x="106" y="22" width="34" height="22" rx="5" fill="#bfe9ff" stroke="#1e2a4a" stroke-width="3"/><rect x="4" y="52" width="150" height="6" fill="#ffd23f"/><circle cx="34" cy="72" r="8" fill="#1e2a4a"/><circle cx="124" cy="72" r="8" fill="#1e2a4a"/></g>`;
  return `<svg viewBox="0 0 640 84" aria-hidden="true">${car(0, '#e94f4f')}${car(160, '#3a86ff')}${car(320, '#2ec4b6')}${car(480, '#8338ec')}</svg>`;
}

/* Petits monuments dessinés dans l'en-tête de chaque ville */
function landmarkSvg(id) {
  const o = 'stroke="#1e2a4a" stroke-width="3" stroke-linejoin="round"';
  const art = {
    bus: `<path d="M10 70 L10 40 L34 22 L58 40 L58 70Z" fill="#d9534f" ${o}/><rect x="26" y="48" width="16" height="22" fill="#fff6dc" ${o}/><path d="M26 48 L42 70 M42 48 L26 70" stroke="#1e2a4a" stroke-width="2"/><rect x="64" y="20" width="22" height="50" rx="10" fill="#c9d3dd" ${o}/><path d="M64 34 L86 34 M64 48 L86 48" stroke="#1e2a4a" stroke-width="2"/><ellipse cx="108" cy="62" rx="14" ry="8" fill="#fff" ${o}/><circle cx="104" cy="60" r="3" fill="#1e2a4a"/><circle cx="114" cy="62" r="2.5" fill="#1e2a4a"/>`,
    paris: `<path d="M60 4 L66 30 L72 50 L84 74 L70 74 Q60 58 50 74 L36 74 L48 50 L54 30Z" fill="#c9a46a" ${o}/><path d="M52 30 L68 30 M46 50 L74 50" stroke="#1e2a4a" stroke-width="3"/><path d="M56 36 L64 46 M64 36 L56 46" stroke="#1e2a4a" stroke-width="1.6"/><path d="M60 4 L60 -4" stroke="#1e2a4a" stroke-width="3"/>`,
    london: `<path d="M44 74 L44 26 L60 8 L76 26 L76 74Z" fill="#c9a46a" ${o}/><circle cx="60" cy="34" r="10" fill="#fff6dc" ${o}/><path d="M60 34 L60 27 M60 34 L65 36" stroke="#1e2a4a" stroke-width="2.5" stroke-linecap="round"/><path d="M50 52 L70 52 M50 62 L70 62" stroke="#1e2a4a" stroke-width="2"/><rect x="86" y="44" width="26" height="30" rx="4" fill="#dc241f" ${o}/><rect x="90" y="50" width="18" height="8" fill="#fff6dc" stroke="#1e2a4a" stroke-width="1.5"/>`,
    moscou: `<path d="M20 74 L20 44 L48 44 L48 74Z M72 74 L72 34 L100 34 L100 74Z" fill="#f6ecd2" ${o}/><path d="M18 44 C18 26 34 22 34 10 C34 22 50 26 50 44Z" fill="#d62828" ${o}/><path d="M70 34 C70 14 86 10 86 -4 C86 10 102 14 102 34Z" fill="#2e8b57" ${o}/><path d="M86 -4 L86 -8 M34 10 L34 6" stroke="#1e2a4a" stroke-width="3"/><path d="M50 74 L50 56 L70 56 L70 74Z" fill="#e0b35a" ${o}/><path d="M48 56 C48 46 60 42 60 36 C60 42 72 46 72 56Z" fill="#3a86ff" ${o}/>`,
    nuit: `<circle cx="70" cy="30" r="22" fill="#fff6c9" ${o}/><circle cx="82" cy="22" r="18" fill="#5b6ee1"/>${[[20, 20], [40, 50], [104, 14], [112, 52], [10, 60]].map(([x, y]) => `<path d="M${x} ${y - 6} L${x + 2} ${y - 2} L${x + 6} ${y} L${x + 2} ${y + 2} L${x} ${y + 6} L${x - 2} ${y + 2} L${x - 6} ${y} L${x - 2} ${y - 2}Z" fill="#fff6c9"/>`).join('')}`,
    express: `<rect x="40" y="34" width="56" height="30" rx="6" fill="#2b2b38" ${o}/><rect x="14" y="40" width="30" height="24" rx="4" fill="#8c1c2c" ${o}/><rect x="74" y="18" width="12" height="18" fill="#2b2b38" ${o}/><path d="M74 14 C70 4 86 0 90 8 C100 2 110 10 104 16" fill="#fff" stroke="#1e2a4a" stroke-width="2.5"/><circle cx="54" cy="68" r="8" fill="#e0b35a" ${o}/><circle cx="80" cy="68" r="8" fill="#e0b35a" ${o}/><circle cx="26" cy="68" r="6" fill="#e0b35a" ${o}/><rect x="96" y="48" width="10" height="16" fill="#e0b35a" ${o}/>`,
    tokyo: `<path d="M0 74 L36 26 L52 40 L60 32 L96 74Z" fill="#e6eef8" ${o}/><path d="M28 36 L36 26 L44 34 L38 38 L32 34Z" fill="#fff" stroke="#1e2a4a" stroke-width="2"/><path d="M74 74 L74 50 M98 74 L98 50" stroke="#1e2a4a" stroke-width="4"/><path d="M64 46 Q86 38 108 46 L104 52 Q86 46 68 52Z" fill="#d6457a" ${o}/><path d="M68 58 L104 58" stroke="#d6457a" stroke-width="5"/>`,
  };
  return `<svg viewBox="-4 -8 124 84" class="city-landmark" aria-hidden="true">${art[id] || (G.EXTRA_LANDMARKS && G.EXTRA_LANDMARKS[id]) || ''}</svg>`;
}

/* ---------- Carte du monde ---------- */
UI.map = () => {
  const s = G.save;
  const nm = s.nightmare.on && G.nightmareUnlocked();
  const mopt = nm ? { tempo: 0.82, pitch: 0.89 } : {};
  if (G.Audio.current && G.Audio.current.name === 'map' && (G.Audio.pitchMul || 1) !== (mopt.pitch || 1)) mopt.restart = true;
  G.Audio.play('map', mopt);
  const root = G.el('div', `screen map-screen${nm ? ' nightmare-map' : ''}`);
  const dailyDone = s.daily.last === G.dayKey();
  const chestReady = s.chest.last !== G.dayKey();
  const cities = G.CITIES.map((city, ci) => {
    const first = ci * G.LEVELS_PER_CITY;
    const unlocked = G.isLevelUnlocked(first);
    const stars = G.cityStars(ci);
    const nodes = Array.from({ length: G.LEVELS_PER_CITY }, (_, i) => {
      const g = first + i;
      const st = (nm ? s.nightmare.levels[g] : s.levels[g]) || 0;
      const open = G.isLevelUnlocked(g);
      const boss = i === G.LEVELS_PER_CITY - 1;
      // Ville du jeu complet : cadenas cliquable qui présente l'offre
      const cur = open && !st;
      return `<button class="node ${boss ? 'boss' : ''} ${open ? 'open' : 'locked'} ${cur ? 'current' : ''}" data-level="${g}" ${open ? '' : 'disabled'} aria-label="Service ${i + 1}">
        <span class="node-n">${open ? (boss ? G.icon('skull') : i + 1) : G.icon('lock')}</span>
        <span class="node-stars">${[1, 2, 3].map((k) => `<i class="${st >= k ? 'on' : ''}">${G.icon(nm ? 'moon' : 'star')}</i>`).join('')}</span>
      </button>`;
    }).join('');
    return `<section class="city ${unlocked ? '' : 'city-locked'}" style="--line:${city.lineColor};--city-bg:${city.theme.wall};--city-ink:${city.ticket.ink}">
      <div class="city-head">
        ${landmarkSvg(city.id)}
        <div class="city-badge">${ci + 1}</div>
        <div class="city-names"><h2>${city.name}</h2><p>${city.line}</p></div>
        <div class="city-stars">${G.icon(nm ? 'moon' : 'star')}<b>${nm ? Array.from({ length: G.LEVELS_PER_CITY }, (_, i) => s.nightmare.levels[first + i] || 0).reduce((a, b) => a + b, 0) : stars}</b>/30</div>
      </div>
      ${unlocked ? `<div class="track"><div class="rail"></div>${nodes}</div>` : G.needsFull(first) ? `<button class="city-lock city-full" data-full>${G.icon('star')}<span><b>Jeu complet</b> · ${G.Store.priceLabel()}<br><small>Débloque cette ville et 8 autres</small></span></button>` : `<div class="city-lock">${G.icon('lock')}<span>Bats le boss de ${G.CITIES[ci - 1].name} pour débloquer cette ville</span></div>`}
    </section>`;
  }).join('');
  root.innerHTML = `${topBar()}
    <div class="map-scroll">
      <div class="daily-row">
        <button class="daily-card ${dailyDone ? 'done' : ''}" data-nav="daily">
          <div class="dc-icon">${G.icon('calendar')}</div>
          <div class="dc-txt"><b>Contrôle du jour #${G.dailyNumber()}</b><span>${dailyDone ? `Fait · série de ${s.daily.streak} jour${s.daily.streak > 1 ? 's' : ''}` : 'Le même défi pour tout le monde'}</span></div>
          <div class="dc-streak">${G.icon('fire')}<b>${s.daily.streak}</b></div>
        </button>
        <button class="chest-card ${chestReady ? 'ready' : ''}" data-chest>
          ${G.drawChest(false)}
          <span>${chestReady ? 'Coffre du jour' : 'Demain !'}</span>
        </button>
      </div>
      ${nightmareSwitch(nm)}
      ${eventCard()}
      ${weeklyCard()}
      ${endlessCard()}
      <div class="mini-row">
        <button class="mini-card-btn" data-missions>${G.icon('check')}<span><b>Missions du jour</b><small>${missionsSummary()}</small></span>${G.missionsReady() ? '<i class="dot-new"></i>' : ''}</button>
        <button class="mini-card-btn" data-code>${G.icon('share')}<span><b>Défi d'un ami</b><small>Entrer un code</small></span></button>
      </div>
      ${cities}
      <p class="map-foot">${G.CITIES.length} villes · ${G.TOTAL_LEVELS} services · ${G.SPECIALS.length} passagers spéciaux à collectionner</p>
    </div>
    ${bottomNav('map')}`;
  G.showScreen(root);
  bindNav(root);
  root.addEventListener('click', (ev) => {
    const n = ev.target.closest('[data-level]');
    if (n && !n.disabled) {
      G.Audio.sfx('click');
      G.Game.start(nm ? G.nightmareConfig(Number(n.dataset.level)) : G.levelConfig(Number(n.dataset.level)));
    }
    if (ev.target.closest('[data-full]')) {
      G.Audio.sfx('click');
      return G.Store.offer();
    }
    if (ev.target.closest('[data-nightmare]')) toggleNightmare();
    if (ev.target.closest('[data-chest]')) openChest();
    if (ev.target.closest('[data-event]')) {
      G.Audio.sfx('click');
      if (!G.isFull()) return G.Store.offer('Les événements du mois font partie du jeu complet.');
      const evn = G.currentEvent();
      if (evn) G.Game.start(G.eventConfig(evn));
    }
    if (ev.target.closest('[data-weekly]')) {
      G.Audio.sfx('click');
      if (!G.isFull()) return G.Store.offer('Le défi de la semaine fait partie du jeu complet.');
      if (!G.isLevelUnlocked(G.WEEKLY_UNLOCK)) return G.toast(`${G.icon('lock')} Le défi de la semaine s'ouvre après le service ${G.WEEKLY_UNLOCK} (Paris).`);
      G.Game.start(G.weeklyConfig());
    }
    if (ev.target.closest('[data-missions]')) missionsModal();
    if (ev.target.closest('[data-code]')) codeModal();
    if (ev.target.closest('[data-endless]')) {
      G.Audio.sfx('click');
      if (!G.isFull()) return G.Store.offer('La Ligne infinie fait partie du jeu complet.');
      if (!G.isEndlessUnlocked()) return G.toast(`${G.icon('lock')} Termine le service ${G.ENDLESS_UNLOCK + 1} du bus pour débloquer la Ligne infinie.`);
      G.Game.start(G.endlessConfig(1));
    }
  });
  const cur = G.$('.node.current', root) || G.$$('.node.open', root).pop();
  if (cur) setTimeout(() => cur.scrollIntoView({ block: 'center', behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' }), 30);
};

function eventCard() {
  const ev = G.currentEvent();
  if (!ev) return '';
  const done = G.save.eventDone && G.save.eventDone[ev.id + G.dayKey()];
  return `<button class="event-card ev-${ev.id}" data-event>
    <span class="ec-icon">${G.icon('star')}</span>
    <span class="ec-txt"><b>${ev.name}</b><span>${!G.isFull() ? 'Jeu complet' : done ? "Réussi aujourd'hui · rejouable" : "Événement · +5 tickets d'or par jour"}</span></span>
    <span class="ec-go">${G.icon(G.isFull() ? 'play' : 'lock')}</span>
  </button>`;
}

function missionsSummary() {
  const list = G.todayMissions();
  return `${list.filter((m) => m.claimed).length}/${list.length} récupérées`;
}

function missionsModal() {
  G.Audio.sfx('click');
  const list = G.todayMissions();
  const m = G.modal(`<div class="missions"><h2>Missions du jour</h2><p>Trois nouvelles missions chaque jour, à récupérer contre des tickets d'or.</p>
    <ul class="obj-list">${list.map((x) => `<li class="obj ${x.claimed ? 'done' : ''}"><i>${G.icon(x.claimed ? 'check' : 'star')}</i><span>${x.text}<em class="ms-prog">${x.progress}/${x.n}</em></span>${x.claimed ? '<em>récupérée</em>' : x.progress >= x.n ? `<button class="btn btn-small btn-primary" data-claim="${x.id}">+${x.gold} ${G.icon('gold')}</button>` : `<em>+${x.gold} ${G.icon('gold')}</em>`}</li>`).join('')}</ul>
    <button class="btn btn-ghost" data-ok>Fermer</button></div>`, { cls: 'modal-missions' });
  G.$('[data-ok]', m.el).addEventListener('click', () => {
    m.close();
    UI.map();
  });
  G.$$('[data-claim]', m.el).forEach((b) => b.addEventListener('click', () => {
    const it = G.save.missions.list.find((x) => x.id === b.dataset.claim);
    const def = G.MISSION_POOL.find((x) => x.id === it.id);
    if (it.claimed) return;
    it.claimed = true;
    G.save.gold += def.gold;
    G.persist();
    G.Audio.sfx('buy');
    m.close();
    missionsModal();
  }));
}

function codeModal() {
  G.Audio.sfx('click');
  const m = G.modal(`<div class="code-modal"><h2>Défi d'un ami</h2><p>Colle le code reçu pour jouer exactement les mêmes passagers et tenter de battre son score.</p>
    <form data-form><input id="challenge-code" class="code-input" placeholder="ex. 1F-3K9ZQ2-17C" autocomplete="off" autocapitalize="characters" spellcheck="false"><p class="code-err" data-err hidden></p>
    <button class="btn btn-primary" type="submit">${G.icon('play')} Relever le défi</button></form>
    <button class="btn btn-ghost" data-ok>Annuler</button></div>`, { cls: 'modal-code' });
  G.$('[data-ok]', m.el).addEventListener('click', () => m.close());
  G.$('[data-form]', m.el).addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = G.$('#challenge-code', m.el).value.trim().toUpperCase();
    const err = G.$('[data-err]', m.el);
    const wk = /^S-([0-9A-Z]+)-([0-9A-Z]+)$/.exec(raw);
    if (wk) {
      const week = parseInt(wk[1], 36);
      const score = parseInt(wk[2], 36);
      err.hidden = false;
      if (week !== G.weekKey()) return (err.textContent = 'Ce défi de la semaine est terminé. Demande à ton ami le code de cette semaine !');
      if (!G.isFull()) {
        m.close();
        return G.Store.offer('Le défi de la semaine fait partie du jeu complet.');
      }
      if (!G.isLevelUnlocked(G.WEEKLY_UNLOCK)) return (err.textContent = `Le défi de la semaine s'ouvre après le service ${G.WEEKLY_UNLOCK} (Paris).`);
      m.close();
      return G.Game.start(Object.assign(G.weeklyConfig(), { challengeScore: score }));
    }
    const c = G.parseChallengeCode(raw);
    if (!c) {
      err.hidden = false;
      err.textContent = 'Ce code ne ressemble pas à un code défi. Il doit avoir la forme 1F-3K9ZQ2-17C.';
      return;
    }
    if (G.needsFull(c.g)) {
      m.close();
      return G.Store.offer(`Ce défi se joue dans une ville du jeu complet (${G.levelConfig(c.g).label}).`);
    }
    if (!G.isLevelUnlocked(c.g)) {
      err.hidden = false;
      err.textContent = `Ce défi se joue sur un service que tu n'as pas encore débloqué (${G.levelConfig(c.g).label}).`;
      return;
    }
    m.close();
    G.Game.start(Object.assign(G.levelConfig(c.g), { seed: c.seed, challengeScore: c.score }));
  });
}

function copyText(txt, preview) {
  G.Audio.sfx('click');
  txt = txt.split('\n').map((l) => G.tr(l)).join('\n');
  const fallback = () => {
    if (preview) {
      preview.hidden = false;
      preview.textContent = txt;
      const range = document.createRange();
      range.selectNodeContents(preview);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    G.toast('Sélectionne le texte ci-dessous pour le copier.');
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(() => G.toast(`${G.icon('check')} Défi copié, envoie-le à un ami !`, 'good'), fallback);
    else fallback();
  } catch (e) {
    fallback();
  }
}

function nightmareSwitch(nm) {
  const open = G.nightmareUnlocked();
  return `<button class="nm-switch ${nm ? 'on' : ''} ${open ? '' : 'locked'}" data-nightmare role="switch" aria-checked="${nm}">
    <span class="nm-icon">${G.icon(open ? 'moon' : 'lock')}</span>
    <span class="nm-txt"><b>Mode Cauchemar</b><small>${open ? (nm ? `Activé · ${G.nightmareMoons()} lune${G.nightmareMoons() > 1 ? 's' : ''} rouge${G.nightmareMoons() > 1 ? 's' : ''}` : 'Fais glisser pour plonger dans le cauchemar') : `S'ouvre après le service ${G.NIGHTMARE_UNLOCK + 1} (Grand Express)`}</small></span>
    <span class="nm-track"><i></i></span>
  </button>`;
}

function toggleNightmare() {
  const s = G.save;
  if (!G.nightmareUnlocked()) {
    G.Audio.sfx('click');
    return G.toast(`${G.icon('lock')} Apprends toutes les règles d'abord : termine le service ${G.NIGHTMARE_UNLOCK + 1}, au Grand Express.`);
  }
  s.nightmare.on = !s.nightmare.on;
  G.persist();
  G.Audio.sfx(s.nightmare.on ? 'alarm' : 'click');
  G.vibrate(s.nightmare.on ? [40, 60, 40] : 20);
  if (s.nightmare.on && !s.nightmare.seen) {
    s.nightmare.seen = true;
    G.persist();
    UI.map();
    const m = G.modal(`<div class="nm-intro"><div class="nm-intro-icon">${G.icon('moon')}</div><h2>Bienvenue dans le cauchemar</h2>
      <ul class="obj-list">
        <li class="obj"><i>${G.icon('clock')}</i><span>8 secondes au plus par passager, 6 dans les dernières villes</span></li>
        <li class="obj"><i>${G.icon('shield')}</i><span>2 erreurs permises, pas une de plus</span></li>
        <li class="obj"><i>${G.icon('lock')}</i><span>Montre, badge, sifflet, café et loupe n'ont aucun effet. Seuls la lampe UV et le ticket double gain fonctionnent.</span></li>
        <li class="obj"><i>${G.icon('ticket')}</i><span>Toutes les règles dès le premier service, et des fraudes à un détail près</span></li>
        <li class="obj"><i>${G.icon('skull')}</i><span>Papiers possédés : une date peut changer sous tes yeux. Vérifie jusqu'au bout !</span></li>
        <li class="obj"><i>${G.icon('moon')}</i><span>Des lunes rouges à gagner, et des objets introuvables ailleurs. Pièces doublées.</span></li>
      </ul><button class="btn btn-primary" data-ok>J'ose</button></div>`, { cls: 'modal-nm' });
    G.$('[data-ok]', m.el).addEventListener('click', () => m.close());
    return;
  }
  UI.map();
}

function weeklyCard() {
  const full = G.isFull();
  const on = full && G.isLevelUnlocked(G.WEEKLY_UNLOCK);
  const wk = G.weekKey();
  const w = G.save.weekly.week === wk ? G.save.weekly : null;
  const th = G.weeklyTheme(wk);
  return `<button class="endless-card weekly-card ${on ? '' : 'locked'}" data-weekly>
    <span class="ec-icon">${G.icon('trophy')}</span>
    <span class="ec-txt"><b>Défi de la semaine · ${th.name}</b><span>${!full ? 'Jeu complet' : !on ? `S'ouvre après le service ${G.WEEKLY_UNLOCK}` : w ? `Ton record : ${G.fmt(w.best)} pts${w.rewarded ? '' : " · +3 tickets d'or à gagner"}` : "Nouveau ! +3 tickets d'or à la 1re réussite"}</span></span>
    <span class="ec-go">${G.icon(on ? 'play' : 'lock')}</span>
  </button>`;
}

function endlessCard() {
  const full = G.isFull();
  const on = full && G.isEndlessUnlocked();
  const e = G.save.endless;
  return `<button class="endless-card ${on ? '' : 'locked'}" data-endless>
    <span class="ec-icon">∞</span>
    <span class="ec-txt"><b>Ligne infinie</b><span>${on ? (e.runs ? `Record : ${G.fmt(e.best)} pts · station ${e.bestStation}` : 'Enchaîne les stations, choisis tes bonus') : !full ? 'Jeu complet' : `Termine le service ${G.ENDLESS_UNLOCK + 1} pour débloquer`}</span></span>
    <span class="ec-go">${G.icon(on ? 'play' : 'lock')}</span>
  </button>`;
}

/* ---------- Coffre du jour ---------- */
function maybeLoginChest() {
  if (G.save.chest.last !== G.dayKey()) setTimeout(() => G.toast(`${G.icon('chest')} Ton coffre du jour t'attend sur la carte !`, 'gold'), 900);
}

async function openChest() {
  const s = G.save;
  const today = G.dayKey();
  const viaAd = false; // plus de 2e coffre contre une pub
  if (s.chest.last === today) return G.toast('Reviens demain pour un nouveau coffre.');
  const r = G.rng(Number(today) * (viaAd ? 7 : 3));
  const coins = r.int(15, 40);
  const gold = r.chance(0.45) ? r.int(1, 2) : 0;
  s.coins += coins;
  s.gold += gold;
  if (viaAd) s.chest.extra = true;
  else {
    s.chest.last = today;
    s.chest.extra = false;
  }
  G.persist();
  G.Audio.sfx('open');
  const m = G.modal(`<div class="chest-open">${G.drawChest(true)}<h2>Coffre ouvert !</h2>
    <div class="loot"><span class="money coins">${G.icon('coin')}<b>+${coins}</b></span>${gold ? `<span class="money gold">${G.icon('gold')}<b>+${gold}</b></span>` : ''}</div>
    <button class="btn btn-primary" data-ok>Super !</button></div>`, { cls: 'modal-chest' });
  G.$('[data-ok]', m.el).addEventListener('click', () => {
    m.close();
    UI.map();
  });
  const more = G.$('[data-more]', m.el);
  if (more) more.addEventListener('click', () => {
    m.close();
    openChest();
  });
}

/* ---------- Défi du jour ---------- */
UI.daily = () => {
  const s = G.save;
  const done = s.daily.last === G.dayKey();
  const res = done ? s.daily.result : null;
  const cfg = G.dailyConfig();
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const mins = Math.max(0, Math.round((tomorrow - now) / 60000));
  const root = G.el('div', 'screen daily-screen');
  root.innerHTML = `${topBar({ title: 'Contrôle du jour' })}
    <div class="page">
      <div class="daily-hero" style="--line:${cfg.city.lineColor}">
        <div class="dh-num">#${G.dailyNumber()}</div>
        <div class="dh-date">${G.fmtDate(G.today())}</div>
        <div class="dh-city">${cfg.city.name} · ${cfg.count} passagers · un seul essai</div>
        <div class="dh-streak">${G.icon('fire')} Série : <b>${s.daily.streak}</b> jour${s.daily.streak > 1 ? 's' : ''}<small>3 tickets d'or tous les 7 jours</small></div>
      </div>
      ${res ? `<div class="daily-result">
          <h3>Ton résultat</h3>
          <div class="grid-emoji">${res.grid.split('').map((c) => `<i class="g-${c}">${c === 'X' ? G.icon('cross') : c === 'S' ? G.icon('star') : G.icon('check')}</i>`).join('')}</div>
          <p><b>${res.correct}/${res.total}</b> bonnes décisions · <b>${G.fmt(res.score)}</b> points</p>
          <button class="btn btn-primary" data-share>${G.icon('share')} Partager mon score</button>
          <p class="share-preview" data-preview hidden></p>
        </div>` : done ? `<div class="daily-result"><h3>Défi abandonné</h3><p>Reviens demain pour un nouveau contrôle.</p></div>` : `
        <div class="daily-rules"><h3>Règles du jour</h3><ul>${cfg.rules.map((id) => { const ru = G.RULES.find((x) => x.id === id); return `<li>${G.icon(ru.icon)}${ru.title}</li>`; }).join('')}</ul></div>
        <button class="btn btn-primary btn-xl" data-play>${G.icon('play')} Commencer le défi</button>`}
      <p class="daily-next">Prochain défi dans ${Math.floor(mins / 60)} h ${G.pad2(mins % 60)}</p>
    </div>
    ${bottomNav('daily')}`;
  G.showScreen(root);
  bindNav(root);
  const play = G.$('[data-play]', root);
  if (play) play.addEventListener('click', () => {
    G.Audio.sfx('click');
    G.Game.start(G.dailyConfig());
  });
  const share = G.$('[data-share]', root);
  if (share) share.addEventListener('click', () => shareDaily(G.$('[data-preview]', root)));
};

function shareText() {
  const r = G.save.daily.result;
  const grid = r.grid.split('').map((c) => (c === 'X' ? '❌' : c === 'S' ? '⭐' : '✅')).join('');
  return `🎫 Ticket SVP ! · Contrôle du jour #${G.dailyNumber()}\n${grid}\n${r.correct}/${r.total} · ${G.fmt(r.score)} pts · série ${G.save.daily.streak} 🔥${r.slow ? ' 🐢' : ''}`;
}

function shareDaily(preview) {
  const txt = shareText();
  G.Audio.sfx('click');
  const done = () => G.toast(`${G.icon('check')} Résultat copié, colle-le où tu veux !`, 'good');
  const fallback = () => {
    if (preview) {
      preview.hidden = false;
      preview.textContent = txt;
      const range = document.createRange();
      range.selectNodeContents(preview);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
    G.toast('Sélectionne le texte ci-dessous pour le copier.');
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fallback);
    else fallback();
  } catch (e) {
    fallback();
  }
}

/* ---------- Album ---------- */
UI.album = (tab = 'pax') => {
  const s = G.save;
  if (tab === 'ach') return achievementsPage();
  if (tab === 'col') return collectionsPage();
  const got = G.SPECIALS.filter((sp) => s.album[sp.id]).length;
  const root = G.el('div', 'screen album-screen');
  root.innerHTML = `${topBar({ title: 'Album des passagers' })}
    <div class="page">
      ${albumTabs('pax')}
      <div class="album-progress"><b>${got}</b> / ${G.SPECIALS.length} passagers spéciaux<div class="xpbar"><i style="width:${Math.round((got / G.SPECIALS.length) * 100)}%"></i></div></div>
      <div class="month-star">${G.icon('star')}<span><b>Passager du mois : ${s.album[G.monthSpecial().id] ? G.monthSpecial().name : '???'}</b><small>Il passe plus souvent en ${G.fmtMonth(G.today()).toLowerCase()} et rapporte double.</small></span></div>
      <div class="album-grid">${G.SPECIALS.map((sp) => {
        const have = s.album[sp.id];
        const look = previewLook(sp);
        return `<button class="album-card ${have ? 'have' : 'missing'}" data-sp="${sp.id}">
          <div class="ac-portrait">${have ? G.drawPerson(look, { photo: true }) : `<div class="ac-shadow">${G.drawPerson(look, { photo: true })}</div><span class="ac-q">?</span>`}</div>
          <div class="ac-name">${have ? sp.name : '???'}</div>
          <div class="ac-city">${G.CITIES[sp.city].name}</div>
        </button>`;
      }).join('')}</div>
    </div>
    ${bottomNav('album')}`;
  G.showScreen(root);
  bindNav(root);
  root.addEventListener('click', (ev) => {
    const tb = ev.target.closest('[data-atab]');
    if (tb) {
      G.Audio.sfx('tap');
      return UI.album(tb.dataset.atab);
    }
    const c = ev.target.closest('[data-sp]');
    if (!c) return;
    const sp = G.SPECIALS.find((x) => x.id === c.dataset.sp);
    G.Audio.sfx('tap');
    if (!s.album[sp.id]) return G.toast(`Rencontre-le à ${G.CITIES[sp.city].name} et prends la bonne décision.`);
    G.modal(`<div class="sp-card"><div class="sp-portrait">${G.drawPerson(previewLook(sp), { mood: 'happy' })}</div>
      <h2>${sp.name}</h2><p class="sp-quote">${sp.quote}</p><p>${sp.bio}</p>
      <div class="sp-file"><div><span>Casier</span><b>${sp.fraud === true ? 'Fraudeur' : sp.fraud === 'docs' ? 'Ça dépend' : 'En règle'}</b></div><div><span>Rencontré</span><b>${s.album[sp.id]} fois</b></div><div><span>Ville</span><b>${G.CITIES[sp.city].name}</b></div></div></div>`, { cls: 'modal-sp' });
  });
};

function albumTabs(active) {
  const a = G.save.achievements || {};
  const done = G.ACHIEVEMENTS.filter((x) => a[x.id]).length;
  const ready = G.COLLECTIONS.filter((c) => { const x = G.collectionState(c); return x.done && !x.claimed; }).length;
  return `<div class="tabs tabs2"><button class="tab ${active === 'pax' ? 'on' : ''}" data-atab="pax">Passagers</button><button class="tab ${active === 'col' ? 'on' : ''}" data-atab="col">Collections${ready ? ' <i class="dot-new"></i>' : ''}</button><button class="tab ${active === 'ach' ? 'on' : ''}" data-atab="ach">Succès ${done}/${G.ACHIEVEMENTS.length}</button></div>`;
}

function achievementsPage() {
  G.checkAchievements();
  const a = G.save.achievements || {};
  const root = G.el('div', 'screen album-screen');
  root.innerHTML = `${topBar({ title: 'Succès' })}
    <div class="page">
      ${albumTabs('ach')}
      <div class="ach-list">${G.ACHIEVEMENTS.map((x) => `<div class="ach ${a[x.id] ? 'done' : ''}">
        <span class="ach-ic">${G.icon(a[x.id] ? x.icon : 'lock')}</span>
        <span class="ach-txt"><b>${x.name}</b><small>${x.desc}</small></span>
        <span class="ach-gold">${a[x.id] ? G.icon('check') : `+${x.gold} ${G.icon('gold')}`}</span>
      </div>`).join('')}</div>
    </div>
    ${bottomNav('album')}`;
  G.showScreen(root);
  bindNav(root);
  refreshWallet();
  root.addEventListener('click', (ev) => {
    const tb = ev.target.closest('[data-atab]');
    if (tb) {
      G.Audio.sfx('tap');
      UI.album(tb.dataset.atab);
    }
  });
}

function achievementsBlock(list) {
  if (!list || !list.length) return '';
  return `<div class="res-ach"><b>${G.icon('trophy')} Succès débloqué${list.length > 1 ? 's' : ''}</b>${list.map((x) => `<span>${x.name} · +${x.gold} ${G.icon('gold')}</span>`).join('')}</div>`;
}

function previewLook(sp) {
  const r = G.rng(sp.id.length * 977 + sp.id.charCodeAt(0));
  const fakeCfg = Object.assign(G.levelConfig(Math.min(sp.city * 10 + 5, G.TOTAL_LEVELS - 1)), { specialRate: 0 });
  const p = G.makeSpecial(sp, fakeCfg, r, { today: G.today(), zoneReq: 3 });
  return p.look;
}

/* ---------- Boutique ---------- */
UI.shop = (tab = 'tools', sub = 'stamp') => {
  const s = G.save;
  const root = G.el('div', 'screen shop-screen');
  const tabs = [['tools', 'Outils'], ['boosts', 'Bonus'], ['style', 'Style'], ['uniforms', 'Tenues'], ['full', 'Jeu complet']];
  let body = '';
  if (tab === 'style') body = styleShop(sub);
  else if (tab === 'boosts') {
    body = `<p class="shop-intro">À usage unique : active-les au début d'un service, sur l'écran de briefing.</p>${G.CONSUMABLES.map((c) => `<div class="shop-item">
        <div class="si-icon">${G.icon(c.icon)}</div>
        <div class="si-txt"><b>${c.name}</b><span>${c.desc}</span><small>En stock : ${s.items[c.id] || 0}</small></div>
        <button class="btn btn-buy" data-buy-item="${c.id}" ${s.coins < c.price ? 'disabled' : ''}>${G.icon('coin')}${G.fmt(c.price)}</button>
      </div>`).join('')}`;
  } else if (tab === 'tools') {
    body = G.TOOLS.map((t) => {
      const lvl = s.tools[t.id];
      const maxed = lvl >= t.max;
      const cost = maxed ? 0 : t.costs[lvl];
      return `<div class="shop-item">
        <div class="si-icon">${G.icon(t.icon)}</div>
        <div class="si-txt"><b>${t.name}</b><span>${t.desc(lvl)}</span><div class="pips">${Array.from({ length: t.max }, (_, i) => `<i class="${i < lvl ? 'on' : ''}"></i>`).join('')}</div>${maxed ? '' : `<small>Niveau suivant : ${t.desc(lvl + 1)}</small>`}</div>
        <button class="btn btn-buy" data-buy-tool="${t.id}" ${maxed || s.coins < cost ? 'disabled' : ''}>${maxed ? 'Max' : `${G.icon('coin')}${G.fmt(cost)}`}</button>
      </div>`;
    }).join('');
  } else if (tab === 'uniforms') {
    body = `<div class="uni-grid">${G.UNIFORMS.map((u) => {
      const owned = s.owned.includes(u.id) || (u.moons && G.nightmareMoons() >= u.moons);
      const eq = s.uniform === u.id;
      return `<div class="uni ${eq ? 'eq' : ''}"><div class="uni-portrait">${G.drawPerson(G.conductorLook(u.id), { photo: true, mood: eq ? 'happy' : 'neutral' })}</div><b>${u.name}</b>
        ${eq ? `<span class="uni-state">${G.icon('check')} Porté</span>` : !owned && u.cost > G.FREE_UNIFORM_MAX && !G.isFull() ? `<button class="cos-lock" data-full>${G.icon('star')} Jeu complet</button>` : u.moons && !owned ? `<span class="cos-lock moon">${G.icon('moon')} ${u.moons} lunes rouges</span>` : owned ? `<button class="btn btn-small" data-wear="${u.id}">Porter</button>` : `<button class="btn btn-small btn-buy" data-buy-uni="${u.id}" ${s.gold < u.cost ? 'disabled' : ''}>${G.icon('gold')}${u.cost}</button>`}</div>`;
    }).join('')}</div>`;
  } else {
    body = G.isFull()
      ? `<div class="full-owned">${G.icon('check')}<b>${G.save.full === 'ancien' ? 'Jeu complet offert' : 'Jeu complet'}</b><span>${G.save.full === 'ancien' ? "Merci d'avoir joué aux premières versions : toutes les villes et tous les modes restent à toi." : 'Toutes les villes, tous les modes et toutes les tenues sont à toi. Merci !'}</span></div>`
      : `<div class="full-card">
          <b>Jeu complet</b>
          <span>9 villes et leurs boss, Ligne infinie, défi de la semaine, événements mensuels, mode Cauchemar et toutes les tenues. Un seul achat, sans pub.</span>
          <button class="btn btn-primary" data-full>Voir l'offre · ${G.Store.priceLabel()}</button>
        </div>`;
    body += `<button class="link-btn shop-restore" data-restore>Restaurer un achat</button>
      <p class="shop-note">Pas de pub dans Ticket SVP ! : les tickets d'or se gagnent en jouant (missions, boss, coffre du jour, défis).</p>`;
  }
  root.innerHTML = `${topBar({ title: 'Boutique' })}
    <div class="page">
      <div class="tabs">${tabs.map(([id, label]) => `<button class="tab ${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`).join('')}</div>
      <div class="shop-body">${body}</div>
    </div>
    ${bottomNav('shop')}`;
  G.showScreen(root);
  bindNav(root);
  root.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-tab]');
    if (t) {
      G.Audio.sfx('tap');
      return UI.shop(t.dataset.tab);
    }
    const sc = ev.target.closest('[data-cat]');
    if (sc) {
      G.Audio.sfx('tap');
      return UI.shop('style', sc.dataset.cat);
    }
    const bi = ev.target.closest('[data-buy-item]');
    if (bi && !bi.disabled) {
      const c = G.CONSUMABLES.find((x) => x.id === bi.dataset.buyItem);
      if (s.coins < c.price) return;
      s.coins -= c.price;
      s.items[c.id] = (s.items[c.id] || 0) + 1;
      G.persist();
      G.Audio.sfx('buy');
      G.toast(`${G.icon('check')} ${c.name} : ${s.items[c.id]} en stock`, 'good');
      return UI.shop('boosts');
    }
    const bc = ev.target.closest('[data-buy-cos]');
    if (bc && !bc.disabled) {
      const [cat, id] = bc.dataset.buyCos.split(':');
      const it = G.cosItem(cat, id);
      const cur = it.price.gold ? 'gold' : 'coins';
      const cost = it.price.gold || it.price.coins;
      if (s[cur] < cost) return;
      s[cur] -= cost;
      s.cos.owned.push(G.cosKey(cat, id));
      s.cos[cat] = id;
      G.persist();
      G.Audio.sfx('buy');
      G.toast(`${G.icon('check')} ${it.name} : acheté et équipé !`, 'good');
      return UI.shop('style', cat);
    }
    const eqc = ev.target.closest('[data-equip-cos]');
    if (eqc) {
      const [cat, id] = eqc.dataset.equipCos.split(':');
      s.cos[cat] = id;
      G.persist();
      G.Audio.sfx('click');
      return UI.shop('style', cat);
    }
    const bt = ev.target.closest('[data-buy-tool]');
    if (bt && !bt.disabled) {
      const tool = G.TOOLS.find((x) => x.id === bt.dataset.buyTool);
      const cost = tool.costs[s.tools[tool.id]];
      if (s.coins < cost) return;
      s.coins -= cost;
      s.tools[tool.id]++;
      G.persist();
      G.Audio.sfx('buy');
      G.toast(`${G.icon('check')} ${tool.name} : niveau ${s.tools[tool.id]}`, 'good');
      return UI.shop('tools');
    }
    const bu = ev.target.closest('[data-buy-uni]');
    if (bu && !bu.disabled) {
      const u = G.UNIFORMS.find((x) => x.id === bu.dataset.buyUni);
      if (s.gold < u.cost) return;
      s.gold -= u.cost;
      s.owned.push(u.id);
      s.uniform = u.id;
      G.persist();
      G.Audio.sfx('buy');
      return UI.shop('uniforms');
    }
    const w = ev.target.closest('[data-wear]');
    if (w) {
      s.uniform = w.dataset.wear;
      G.persist();
      G.Audio.sfx('click');
      return UI.shop('uniforms');
    }
    if (ev.target.closest('[data-full]')) {
      G.Audio.sfx('click');
      return G.Store.offer();
    }
    if (ev.target.closest('[data-restore]')) return G.Store.restore();
  });
};

/* ---------- Réglages ---------- */
const TEXT_SIZES = { m: 'Normal', l: 'Grand', xl: 'Très grand' };

/* Où la partie est gardée : online | connecting | local | readonly | nostore */
function saveState() {
  const st = G.Cloud.status();
  if (st === 'online' || st === 'connecting') return st;
  return G.storageOK ? st : 'nostore';
}
/* Avertissement + bouton code, quand la partie ne survivra pas à la fermeture de la page */
function saveWarnHtml() {
  if (saveState() !== 'nostore') return '';
  return `<div class="save-warn">${G.icon('lock')}<span><b>Partie non enregistrée ici</b><small>Ce navigateur efface les données. Copie ton code de sauvegarde pour ne rien perdre.</small></span><button class="btn btn-small" data-savecode>Copier</button></div>`;
}
function showSaveCode() {
  const code = G.Cloud.exportCode();
  const m = G.modal(`<div class="report"><h2>Code de sauvegarde</h2><p>Copie ce code et colle-le dans « Charger un code de sauvegarde » (Réglages) la prochaine fois, ou sur ton autre appareil. Garde-le pour toi : il contient toute ta partie.</p><textarea class="code-box" readonly rows="5">${code}</textarea><button class="btn btn-primary" data-copy>${G.icon('share')} Copier le code</button><p class="share-preview" data-cprev hidden></p></div>`);
  G.$('.code-box', m.el).addEventListener('focus', (e) => e.target.select());
  G.$('[data-copy]', m.el).addEventListener('click', () => copyText(code, G.$('[data-cprev]', m.el)));
}
document.addEventListener('click', (ev) => {
  if (ev.target.closest('[data-savecode]')) {
    ev.stopPropagation();
    showSaveCode();
  }
}, true);
const SAVE_STATUS = {
  online: '<b>Sauvegarde en ligne active</b><small>Ta partie te suit sur tous tes appareils où tu es connecté à claude.ai.</small>',
  connecting: '<b>Connexion à la sauvegarde en ligne…</b><small>En attendant, ta partie est gardée sur cet appareil.</small>',
  readonly: '<b>Sauvegardée sur cet appareil</b><small>Ce lien ne permet pas la sauvegarde en ligne : utilise le code de sauvegarde pour changer d\'appareil.</small>',
  local: '<b>Sauvegardée sur cet appareil</b><small>Utilise le code de sauvegarde pour changer d\'appareil.</small>',
  nostore: '<b>Partie non enregistrée ici</b><small>Ce navigateur efface les données (navigation privée, navigateur intégré d\'une appli…). Ouvre le lien dans Safari ou Chrome, ou copie ton code de sauvegarde avant de quitter.</small>',
};

/* Politique de confidentialité, affichée dans le jeu : un lien vers privacy.html ne s'ouvre ni dans
   l'appli Android (pas de nouvel onglet dans la WebView) ni dans la version claude.ai (fichier absent).
   Même texte que www/privacy.html, la page publique demandée par Google Play. */
G.PRIVACY = [
  ['En bref', "Ticket SVP ! ne contient aucune publicité et ne collecte aucune donnée personnelle. Pas de compte, pas de nom, pas d'adresse e-mail : ta progression reste sur ton appareil."],
  ['Données enregistrées sur ton appareil', "Étoiles, pièces, réglages, album et statistiques de jeu sont stockés uniquement sur ton appareil. Personne d'autre n'y a accès. Désinstaller le jeu ou utiliser « Réinitialiser la progression » les efface."],
  ['Code de sauvegarde et rapport de test', "Le code de sauvegarde et le rapport de test ne sont créés que si tu les demandes, et ne partent que si tu choisis toi-même de les copier et de les envoyer."],
  ['Achat du jeu complet', "Le paiement est entièrement géré par Google Play. Le jeu reçoit seulement la confirmation que l'achat a eu lieu, jamais tes coordonnées ni tes informations de paiement."],
  ['Enfants', "Le jeu ne collecte aucune donnée, y compris sur les enfants."],
  ['Tes droits', "Comme aucune donnée ne quitte ton appareil, il n'y a rien à consulter ni à supprimer chez nous. Pour tout effacer, réinitialise ta progression ou désinstalle le jeu."],
];
UI.privacy = () => {
  if (G.$('.modal-privacy')) return;
  const m = G.modal(`<div class="privacy"><h2>Politique de confidentialité</h2>
    <p class="privacy-date">Ticket SVP ! · mise à jour le 1er novembre 2026</p>
    ${G.PRIVACY.map(([h, t]) => `<section class="wn-block"><h3>${h}</h3><p>${t}</p></section>`).join('')}
    <button class="btn btn-primary" data-ok>Fermer</button></div>`, { cls: 'modal-privacy' });
  G.$('[data-ok]', m.el).addEventListener('click', () => m.close());
};
// Un seul écouteur pour tous les boutons « Politique de confidentialité »
document.addEventListener('click', (ev) => {
  if (!ev.target.closest || !ev.target.closest('[data-privacy]')) return;
  ev.preventDefault();
  G.Audio.sfx('click');
  UI.privacy();
});


UI.settings = () => {
  const s = G.save;
  const root = G.el('div', 'screen settings-screen');
  const st = s.stats;
  root.innerHTML = `${topBar({ title: 'Réglages' })}
    <div class="page">
      <div class="set-group">
        <button class="set-row" data-tg="music">${G.icon('music')}<span>Musique 8 bits</span><i class="sw ${s.settings.music ? 'on' : ''}"></i></button>
        <button class="set-row" data-tg="sfx">${G.icon('sound')}<span>Effets sonores</span><i class="sw ${s.settings.sfx ? 'on' : ''}"></i></button>
        <button class="set-row" data-tg="vibe">${G.icon('vibe')}<span>Vibrations</span><i class="sw ${s.settings.vibe ? 'on' : ''}"></i></button>
        <button class="set-row" data-lang>${G.icon('talk')}<span>Langue</span><em class="set-val" data-notr>${G.LANGS[G.lang]}</em></button>
      </div>
      <h3 class="set-h">Accessibilité</h3>
      <div class="set-group">
        <button class="set-row" data-textsize>${G.icon('textsize')}<span>Taille du texte</span><em class="set-val">${TEXT_SIZES[s.settings.textSize] || TEXT_SIZES.m}</em></button>
        <button class="set-row" data-tg="cb">${G.icon('eye')}<span>Couleurs pour daltoniens<small>Bleu et orange au lieu de vert et rouge</small></span><i class="sw ${s.settings.cb ? 'on' : ''}"></i></button>
        <button class="set-row" data-tg="slow">${G.icon('clock')}<span>Chrono plus lent<small>+50 % de temps par passager</small></span><i class="sw ${s.settings.slow ? 'on' : ''}"></i></button>
        <button class="set-row" data-tg="calm">${G.icon('bolt')}<span>Réduire les animations</span><i class="sw ${s.settings.calm ? 'on' : ''}"></i></button>
      </div>
      <h3 class="set-h">Sauvegarde</h3>
      <div class="set-group">
        <div class="set-row set-info ${saveState() === 'nostore' ? 'danger' : ''}">${G.icon(saveState() === 'online' ? 'check' : 'lock')}<span>${SAVE_STATUS[saveState()] || SAVE_STATUS.local}</span></div>
        <button class="set-row" data-export>${G.icon('share')}<span>Copier mon code de sauvegarde<small>${window.cordova ? "Avant de désinstaller l'APK de test pour la version Play Store, ou pour changer de téléphone" : 'Pour reprendre ta partie sur un autre appareil'}</small></span>${G.icon('back', 'flip')}</button>
        <button class="set-row" data-import>${G.icon('chest')}<span>Charger un code de sauvegarde</span>${G.icon('back', 'flip')}</button>
      </div>
      <h3 class="set-h">Données</h3>
      <div class="set-group">
        <button class="set-row" data-report>${G.icon('share')}<span>Rapport de test<small>À copier et envoyer au développeur</small></span>${G.icon('back', 'flip')}</button>
        ${G.Install.canOffer() ? `<button class="set-row" data-install>${G.icon('chest')}<span>Installer l'appli<small>Icône sur l'écran d'accueil, jeu hors ligne</small></span>${G.icon('back', 'flip')}</button>` : ''}
        ${G.Tester.on() ? `<button class="set-row" data-tester-off>${G.icon('star')}<span>Quitter le mode testeur<small>Les services réussis restent acquis</small></span>${G.icon('back', 'flip')}</button>` : ''}
        <button class="set-row" data-privacy>${G.icon('lock')}<span>Politique de confidentialité</span>${G.icon('back', 'flip')}</button>
      </div>
      <h3 class="set-h">Statistiques</h3>
      <div class="stat-grid">
        <div><b>${G.fmt(st.checked)}</b><span>passagers contrôlés</span></div>
        <div><b>${G.fmt(st.caught)}</b><span>fraudeurs attrapés</span></div>
        <div><b>${G.fmt(st.shifts)}</b><span>services joués</span></div>
        <div><b>${G.fmt(st.specials)}</b><span>spéciaux rencontrés</span></div>
      </div>
      <div class="set-group">
        <button class="set-row" data-howto>${G.icon('hand')}<span>Comment jouer</span>${G.icon('back', 'flip')}</button>
        <button class="set-row danger" data-reset>${G.icon('cross')}<span>Réinitialiser la progression</span></button>
      </div>
      <p class="credits">Ticket SVP ! v${G.VERSION}<br>Personnages, décors et musique 8 bits générés par le code : 100 % originaux et libres de droits.<br>Polices Lilita One, Nunito et Press Start 2P sous licence SIL OFL.<br>Aucune publicité, aucune donnée collectée.${G.Store.native ? '' : " Dans cette version de test, l'achat du jeu complet est simulé."}</p>
    </div>
    ${bottomNav('settings')}`;
  G.showScreen(root);
  bindNav(root);
  root.addEventListener('click', (ev) => {
    const tg = ev.target.closest('[data-tg]');
    if (tg) {
      const k = tg.dataset.tg;
      s.settings[k] = !s.settings[k];
      G.persist();
      G.Audio.applySettings();
      G.Audio.sfx('click');
      G.$('.sw', tg).classList.toggle('on', s.settings[k]);
      if (k === 'vibe') G.vibrate(40);
      G.applyAccess();
      G.persist();
    }
    const ts = ev.target.closest('[data-textsize]');
    if (ts) {
      const order = Object.keys(TEXT_SIZES);
      s.settings.textSize = order[(order.indexOf(s.settings.textSize) + 1) % order.length];
      G.persist();
      G.applyAccess();
      G.Audio.sfx('click');
      G.$('.set-val', ts).textContent = TEXT_SIZES[s.settings.textSize];
    }
    if (ev.target.closest('[data-lang]')) {
      G.Audio.sfx('click');
      const m = G.modal(`<div class="lang-pick"><h2>${G.icon('talk')} Langue</h2><div class="lang-list" data-notr>${Object.entries(G.LANGS).map(([code, name]) => `<button class="btn ${code === G.lang ? 'btn-primary' : 'btn-ghost'}" data-setlang="${code}">${name}</button>`).join('')}</div></div>`, { cls: 'modal-lang' });
      G.$$('[data-setlang]', m.el).forEach((b) => b.addEventListener('click', () => {
        s.lang = b.dataset.setlang;
        G.persist();
        location.reload();
      }));
    }
    if (ev.target.closest('[data-install]')) G.Install.prompt();
    if (ev.target.closest('[data-tester-off]')) {
      s.tester = false;
      G.persist();
      G.toast('Mode testeur désactivé.');
      UI.settings();
    }
    if (ev.target.closest('[data-export]')) showSaveCode();
    if (ev.target.closest('[data-import]')) {
      const m = G.modal(`<div class="report"><h2>Charger une partie</h2><p>Colle ici ton code de sauvegarde. <b>La partie de cet appareil sera remplacée.</b></p><textarea class="code-box" rows="5" placeholder="TSVP1-…" autocomplete="off" spellcheck="false"></textarea><p class="form-err" data-err hidden></p><button class="btn btn-primary" data-load>Charger cette partie</button><button class="btn btn-ghost" data-no>Annuler</button></div>`);
      G.$('[data-no]', m.el).addEventListener('click', () => m.close());
      G.$('[data-load]', m.el).addEventListener('click', () => {
        if (G.Cloud.importCode(G.$('.code-box', m.el).value)) {
          m.close();
          G.Audio.sfx('buy');
          G.toast(`${G.icon('check')} Partie chargée !`, 'good');
          UI.settings();
        } else {
          const err = G.$('[data-err]', m.el);
          err.hidden = false;
          err.textContent = 'Ce code n\'est pas valide. Vérifie qu\'il est complet et commence par TSVP1-.';
        }
      });
    }
    if (ev.target.closest('[data-report]')) {
      const txt = G.Analytics.report();
      const m = G.modal(`<div class="report"><h2>Rapport de test</h2><p>Ces chiffres restent sur ton appareil. Copie-les et envoie-les au développeur pour l'aider à régler la difficulté.</p><pre class="report-txt">${txt.replace(/</g, '&lt;')}</pre><button class="btn btn-primary" data-copy>${G.icon('share')} Copier le rapport</button><p class="share-preview" data-rprev hidden></p><button class="btn btn-ghost" data-wipe>Effacer ces statistiques</button></div>`);
      G.$('[data-copy]', m.el).addEventListener('click', () => copyText(txt, G.$('[data-rprev]', m.el)));
      G.$('[data-wipe]', m.el).addEventListener('click', () => {
        G.Analytics.reset();
        m.close();
        G.toast('Statistiques effacées.');
      });
    }
    if (ev.target.closest('[data-howto]')) howTo();
    if (ev.target.closest('[data-reset]')) {
      const m = G.modal(`<div class="confirm"><h2>Tout effacer ?</h2><p>Étoiles, pièces, tickets d'or, album et uniformes seront perdus. Impossible d'annuler.</p><button class="btn btn-danger" data-yes>Oui, tout effacer</button><button class="btn btn-ghost" data-no>Annuler</button></div>`);
      G.$('[data-no]', m.el).addEventListener('click', () => m.close());
      G.$('[data-yes]', m.el).addEventListener('click', () => {
        G.resetSave();
        m.close();
        G.Audio.applySettings();
        G.toast('Progression réinitialisée.');
        UI.title();
      });
    }
  });
};

function howTo() {
  G.modal(`<div class="howto"><h2>Comment jouer</h2>
    <ol>
      <li>${G.icon('ticket')}<div><b>Inspecte</b><p>Chaque passager montre son ticket et sa carte d'identité. Touche un document pour l'agrandir.</p></div></li>
      <li>${G.icon('hand')}<div><b>Décide</b><p>Glisse à droite pour valider, à gauche pour verbaliser. Plus tu es rapide, plus tu marques.</p></div></li>
      <li>${G.icon('bolt')}<div><b>Enchaîne</b><p>Les bonnes décisions d'affilée font grimper le multiplicateur jusqu'à x3.</p></div></li>
      <li>${G.icon('shield')}<div><b>Garde ta réputation</b><p>Chaque erreur coûte un bouclier. À zéro, le service s'arrête.</p></div></li>
      <li>${G.icon('star')}<div><b>Collectionne</b><p>Les passagers spéciaux rejoignent ton album quand tu prends la bonne décision.</p></div></li>
    </ol></div>`, { cls: 'modal-howto' });
}

/* ---------- Résultats ---------- */
UI.results = (r) => {
  const { cfg } = r;
  const nextG = cfg.g + 1;
  const canNext = !cfg.daily && !cfg.event && !cfg.weekly && cfg.challengeScore == null && r.success && nextG < G.TOTAL_LEVELS && !G.needsFull(nextG) && (!cfg.nightmare || G.isLevelUnlocked(nextG));
  const title = cfg.nightmare ? (r.success ? (r.stars === 3 ? 'Cauchemar maîtrisé !' : 'Tu as survécu…') : 'Le cauchemar continue…') : cfg.daily ? (r.success ? 'Défi terminé !' : 'Défi raté') : r.success ? (r.stars === 3 ? 'Service parfait !' : 'Service terminé !') : 'Service raté';
  const m = G.modal(`
    <div class="results ${r.success ? 'win' : 'lose'}${cfg.nightmare ? ' nm' : ''}">
      <div class="res-ribbon">${cfg.label}</div>
      <h2>${title}</h2>
      <div class="res-stars">${[1, 2, 3].map((k) => `<i class="${r.stars >= k ? 'on' : ''}" style="--d:${k * 0.25}s">${G.icon(cfg.nightmare ? 'moon' : 'star')}</i>`).join('')}</div>
      <div class="res-score"><span>Score</span><b data-rscore>0</b>${cfg.nightmare ? (G.save.nightmare.best[cfg.g] === r.score && r.score > 0 ? '<em>Record !</em>' : '') : cfg.weekly ? (r.weekly && r.weekly.record && r.score > 0 ? '<em>Record de la semaine !</em>' : '') : !cfg.daily && G.save.best[cfg.g] === r.score && r.score > 0 ? '<em>Record !</em>' : ''}</div>
      <div class="res-grid">
        <div><b>${r.caught}</b><span>fraudeurs attrapés</span></div>
        <div><b>${r.acc} %</b><span>précision</span></div>
        <div><b>${r.bestCombo}</b><span>meilleur combo</span></div>
        <div><b>+${G.fmt(r.xp)}</b><span>XP</span></div>
      </div>
      ${r.objectives ? `<ul class="obj-list res-obj">${r.objectives.map((o) => `<li class="obj ${o.done ? 'done' : 'fail'}"><i>${G.icon(o.done ? 'check' : 'cross')}</i><span>${o.text}</span></li>`).join('')}</ul>` : ''}
      ${r.bestMoment ? `<div class="res-moment">${G.icon('star')}<span>${r.bestMoment}</span></div>` : ''}
      ${r.newAlbum.length ? `<div class="res-album"><b>Nouveau dans l'album</b><div>${r.newAlbum.map((id) => { const sp = G.SPECIALS.find((x) => x.id === id); return `<span class="ra-item"><span class="ra-face">${G.drawPerson(previewLook(sp), { photo: true })}</span>${sp.name}</span>`; }).join('')}</div></div>` : ''}
      ${r.rankUp ? `<div class="res-rank">${G.icon('trophy')} Promotion : <b>${G.rankOf(G.save.xp).name}</b></div>` : ''}
      ${achievementsBlock(r.unlocked)}
      ${saveWarnHtml()}
      ${r.firstClear && cfg.boss ? `<div class="res-rank">${G.icon('gold')} Boss vaincu : +5 tickets d'or</div>` : ''}
      ${r.rushInfo ? `<div class="res-rank">${G.icon('clock')} ${r.rushInfo.done}/${r.rushInfo.target} passagers bien contrôlés${r.rushInfo.done >= r.rushInfo.target ? '' : ' : objectif manqué'}</div>` : ''}
      ${r.mystery && r.mystery.solved !== null && r.mystery.solved !== undefined ? `<div class="res-rank">${G.icon('camera')} ${r.mystery.solved ? 'Coupable démasqué : +500 points' : 'Le coupable a filé…'}</div>` : ''}
      ${cfg.nightmare ? `<div class="res-ach nm-moons"><b>${G.icon('moon')} ${G.nightmareMoons()} lune${G.nightmareMoons() > 1 ? 's' : ''} rouge${G.nightmareMoons() > 1 ? 's' : ''} en tout</b><span>${nextMoonReward()}</span></div>` : ''}
      ${r.weekly ? `<div class="res-ach"><b>${G.icon('trophy')} Défi de la semaine</b><span>Ton meilleur score : ${G.fmt(r.weekly.best)} pts${r.weekly.reward ? ` · +${r.weekly.reward} tickets d'or` : ''}</span></div><button class="btn btn-ghost btn-challenge" data-wshare>${G.icon('share')} Défier mes amis cette semaine</button><p class="share-preview" data-wprev hidden></p>` : ''}
      ${r.eventReward ? `<div class="res-rank">${G.icon('gold')} Événement réussi : +${r.eventReward} tickets d'or</div>` : ''}
      ${r.challenge ? `<div class="res-ach"><b>${G.icon('trophy')} ${r.challenge.beat ? 'Défi réussi : tu bats ton ami !' : 'Défi raté'}</b><span>Score à battre : ${G.fmt(r.challenge.target)}</span></div>` : ''}
      ${r.story ? `<div class="letter"><div class="letter-head">${G.icon('talk')} Lettre du chef</div><p>${r.story}</p></div>` : ''}
      <div class="res-coins"><span class="money coins">${G.icon('coin')}<b data-rcoins>+${G.fmt(r.coins)}</b></span>
        ${r.coins > 0 ? `<button class="btn btn-gold btn-small" data-double ${G.save.gold < 1 ? 'disabled' : ''}>Doubler · 1 ${G.icon('gold')}</button>` : ''}</div>
      ${r.challengeCode && r.success ? `<button class="btn btn-ghost btn-challenge" data-challenge>${G.icon('share')} Défier un ami sur ce service</button><p class="share-preview" data-cprev hidden></p>` : ''}
      <div class="res-actions">
        ${!cfg.nightmare && !cfg.daily && r.success && nextG === G.FREE_LEVELS && G.needsFull(nextG) ? `<button class="btn btn-primary" data-full>${G.icon('star')} Continuer : jeu complet</button>` : ''}
        ${cfg.daily ? `<button class="btn btn-primary" data-daily>${G.icon('share')} Voir et partager</button>` : canNext ? `<button class="btn btn-primary" data-next>${G.icon('play')} Service suivant</button>` : ''}
        ${cfg.daily ? '' : `<button class="btn ${canNext ? 'btn-ghost' : 'btn-primary'}" data-retry>Rejouer</button>`}
        <button class="btn btn-ghost" data-map>${G.icon('map')} Carte</button>
      </div>
    </div>`, { cls: 'modal-results', dismissable: false });
  G.countTo(G.$('[data-rscore]', m.el), 0, r.score, 900, (n) => String(Math.round(n)));
  for (let k = 1; k <= r.stars; k++) setTimeout(() => G.Audio.sfx('star'), 300 + k * 250);
  if (r.stars === 3) confetti(m.el);
  const leave = (fn) => {
    m.close();
    fn();
  };
  const full = G.$('[data-full]', m.el);
  if (full) full.addEventListener('click', () => G.Store.offer());
  const dbl = G.$('[data-double]', m.el);
  if (dbl) dbl.addEventListener('click', async () => {
    if (G.save.gold < 1) return; // doubler coûte 1 ticket d'or (plus de pub)
    G.save.gold--;
    G.save.coins += r.coins;
    G.persist();
    G.$('[data-rcoins]', m.el).textContent = `+${G.fmt(r.coins * 2)}`;
    dbl.disabled = true;
    dbl.innerHTML = `${G.icon('check')} Doublé`;
    G.Audio.sfx('coin');
  });
  const nx = G.$('[data-next]', m.el);
  if (nx) nx.addEventListener('click', () => leave(() => G.Game.start(cfg.nightmare ? G.nightmareConfig(nextG) : G.levelConfig(nextG))));
  const rt = G.$('[data-retry]', m.el);
  const again = () => (cfg.nightmare ? G.nightmareConfig(cfg.g) : cfg.weekly ? Object.assign(G.weeklyConfig(), cfg.challengeScore != null ? { challengeScore: cfg.challengeScore } : {}) : cfg.event ? G.eventConfig(cfg.event) : cfg.challengeScore != null ? Object.assign(G.levelConfig(cfg.g), { seed: cfg.seed, challengeScore: cfg.challengeScore }) : G.levelConfig(cfg.g));
  if (rt) rt.addEventListener('click', () => leave(() => G.Game.start(again())));
  const ch = G.$('[data-challenge]', m.el);
  if (ch) ch.addEventListener('click', () => {
    const txt = `🎫 Ticket SVP ! Bats mon score de ${G.fmt(r.score)} points sur « ${cfg.label} ».\nCode défi : ${r.challengeCode}`;
    copyText(txt, G.$('[data-cprev]', m.el));
  });
  const ws = G.$('[data-wshare]', m.el);
  if (ws) ws.addEventListener('click', () => {
    const txt = `🎫 Ticket SVP ! Défi de la semaine : ${G.fmt(r.score)} points. Tu fais mieux ?\nCode : ${r.weekly.code} (à entrer dans « Défi d'un ami »)`;
    copyText(txt, G.$('[data-wprev]', m.el));
  });
  const dl = G.$('[data-daily]', m.el);
  if (dl) dl.addEventListener('click', () => {
    m.close();
    UI.daily();
  });
  G.$('[data-map]', m.el).addEventListener('click', () => leave(() => UI.map()));
};

/* ---------- Fin de la Ligne infinie ---------- */
UI.endlessResults = (r) => {
  const perkNames = r.perks.map((id) => G.PERKS.find((p) => p.id === id)).filter(Boolean);
  const m = G.modal(`
    <div class="results endless ${r.record ? 'win' : ''}">
      <div class="res-ribbon">Ligne infinie</div>
      <h2>${r.record ? 'Nouveau record !' : 'Terminus !'}</h2>
      <div class="end-station"><span>Stations franchies</span><b>${r.stations}</b></div>
      <div class="res-score"><span>Score</span><b data-rscore>0</b>${r.record ? '<em>Record !</em>' : ''}</div>
      <p class="end-best">Meilleur score : ${G.fmt(G.save.endless.best)} · station ${G.save.endless.bestStation}</p>
      <div class="res-grid">
        <div><b>${r.caught}</b><span>fraudeurs attrapés</span></div>
        <div><b>${r.acc} %</b><span>précision</span></div>
        <div><b>${r.bestCombo}</b><span>meilleur combo</span></div>
        <div><b>+${G.fmt(r.xp)}</b><span>XP</span></div>
      </div>
      ${achievementsBlock(r.unlocked)}
      ${saveWarnHtml()}
      ${perkNames.length ? `<div class="end-perks"><b>Bonus choisis</b><div>${perkNames.map((p) => `<span>${G.icon(p.icon)}${p.name}</span>`).join('')}</div></div>` : ''}
      ${r.rankUp ? `<div class="res-rank">${G.icon('trophy')} Promotion : <b>${G.rankOf(G.save.xp).name}</b></div>` : ''}
      <div class="res-coins"><span class="money coins">${G.icon('coin')}<b data-rcoins>+${G.fmt(r.coins)}</b></span>
        ${r.coins > 0 ? `<button class="btn btn-gold btn-small" data-double ${G.save.gold < 1 ? 'disabled' : ''}>Doubler · 1 ${G.icon('gold')}</button>` : ''}</div>
      <div class="res-actions">
        <button class="btn btn-primary" data-retry>${G.icon('play')} Rejouer</button>
        <button class="btn btn-ghost" data-map>${G.icon('map')} Carte</button>
      </div>
    </div>`, { cls: 'modal-results', dismissable: false });
  G.countTo(G.$('[data-rscore]', m.el), 0, r.score, 900, (n) => String(Math.round(n)));
  if (r.record) confetti(m.el);
  const leave = (fn) => {
    m.close();
    fn();
  };
  const dbl = G.$('[data-double]', m.el);
  if (dbl) dbl.addEventListener('click', async () => {
    if (G.save.gold < 1) return; // doubler coûte 1 ticket d'or (plus de pub)
    G.save.gold--;
    G.save.coins += r.coins;
    G.persist();
    G.$('[data-rcoins]', m.el).textContent = `+${G.fmt(r.coins * 2)}`;
    dbl.disabled = true;
    dbl.innerHTML = `${G.icon('check')} Doublé`;
    G.Audio.sfx('coin');
  });
  G.$('[data-retry]', m.el).addEventListener('click', () => leave(() => G.Game.start(G.endlessConfig(1))));
  G.$('[data-map]', m.el).addEventListener('click', () => leave(() => UI.map()));
};

function confetti(host) {
  const layer = G.el('div', 'confetti');
  const colors = ['#ffd23f', '#e94f4f', '#3a86ff', '#2ec4b6', '#ff6fb5', '#8338ec'];
  for (let i = 0; i < 40; i++) {
    const c = G.el('i');
    c.style.left = `${Math.random() * 100}%`;
    c.style.background = colors[i % colors.length];
    c.style.animationDelay = `${Math.random() * 0.6}s`;
    c.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(c);
  }
  host.appendChild(layer);
  setTimeout(() => layer.remove(), 3500);
}

/* ---------- Boutique : onglet Style (tampons, encres, compagnons, décors) ---------- */
function cosPreview(cat, id) {
  if (cat === 'stamp') return `<div class="vs-preview"><div class="verdict-stamp vs-${id} ink-${G.cosEquipped('ink')} fine">AMENDE</div></div>`;
  if (cat === 'ink') return `<div class="vs-preview ink-pair"><div class="verdict-stamp ink-${id} fine">AMENDE</div><div class="verdict-stamp ink-${id} ok">VALIDÉ</div></div>`;
  if (cat === 'pet') return `<div class="pet-preview">${id === 'none' ? G.icon('cross') : G.petSvg(id)}</div>`;
  return `<div class="deco-preview">${id === 'none' ? '' : G.wagonDeco(id).replace('xMidYMax slice', 'xMidYMid meet')}</div>`;
}

function styleShop(cat) {
  const s = G.save;
  const ev = G.currentEvent();
  const items = G.COSMETICS[cat].filter((it) => !it.event || (ev && ev.id === it.event) || G.cosOwned(cat, it.id));
  const sub = `<div class="cos-cats">${G.COS_CATS.map(([id, label, icon]) => `<button class="cos-cat ${cat === id ? 'on' : ''}" data-cat="${id}">${G.icon(icon)}<span>${label}</span></button>`).join('')}</div>`;
  const cards = items.map((it) => {
    const owned = G.cosOwned(cat, it.id);
    const eq = G.cosEquipped(cat) === it.id;
    let action;
    if (eq) action = `<span class="uni-state">${G.icon('check')} Équipé</span>`;
    else if (owned) action = `<button class="btn btn-small" data-equip-cos="${cat}:${it.id}">Équiper</button>`;
    else if (it.moons) action = `<span class="cos-lock moon">${G.icon('moon')} ${it.moons} lunes rouges (${G.nightmareMoons()})</span>`;
    else if (it.collection) {
      const col = G.COLLECTIONS.find((c) => c.id === it.collection);
      action = `<span class="cos-lock">${G.icon('album')} Collection « ${col.name} »</span>`;
    } else {
      const gold = !!it.price.gold;
      const cost = it.price.gold || it.price.coins;
      action = `<button class="btn btn-small btn-buy" data-buy-cos="${cat}:${it.id}" ${(gold ? s.gold : s.coins) < cost ? 'disabled' : ''}>${G.icon(gold ? 'gold' : 'coin')}${G.fmt(cost)}</button>`;
    }
    const badge = it.moons ? `<span class="cos-badge nmb">${G.icon('moon')} Cauchemar</span>` : it.event ? `<span class="cos-badge ev">${G.icon('star')} ${ev && ev.id === it.event ? `Événement · ${G.eventEndText(ev)}` : 'Édition limitée'}</span>` : it.collection ? `<span class="cos-badge col">Exclusif</span>` : '';
    return `<div class="cos ${eq ? 'eq' : ''}">${cosPreview(cat, it.id)}<b>${it.name}</b><small>${it.desc}</small>${badge}${action}</div>`;
  }).join('');
  return `${sub}<div class="cos-grid">${cards}</div><p class="shop-note">Les objets « Exclusif » se gagnent en complétant les collections de l'album. Les éditions limitées ne sont en vente que pendant leur événement.</p>`;
}

/* ---------- Album : collections à compléter ---------- */
function collectionsPage() {
  const s = G.save;
  const root = G.el('div', 'screen album-screen');
  root.innerHTML = `${topBar({ title: 'Collections' })}
    <div class="page">
      ${albumTabs('col')}
      <p class="shop-intro">Rencontre tous les passagers d'une page pour gagner un objet exclusif, introuvable en boutique.</p>
      <div class="col-list">${G.COLLECTIONS.map((c) => {
        const x = G.collectionState(c);
        const [cat, id] = c.reward;
        const it = G.cosItem(cat, id);
        const faces = c.specials.map((sid) => {
          const sp = G.SPECIALS.find((q) => q.id === sid);
          const have = s.album[sid];
          return `<span class="col-face ${have ? 'have' : ''}" title="${have ? sp.name : '???'}">${have ? G.drawPerson(previewLook(sp), { photo: true }) : '<b>?</b>'}</span>`;
        }).join('');
        return `<div class="col-card ${x.claimed ? 'claimed' : x.done ? 'ready' : ''}">
          <div class="col-head"><b>${c.name}</b><span>${x.got}/${x.total}</span></div>
          <div class="col-faces">${faces}</div>
          <div class="col-reward">${cosPreview(cat, id)}<span><small>Récompense</small><b>${it.name}</b></span>
          ${x.claimed ? `<em>${G.icon('check')} Obtenu</em>` : x.done ? `<button class="btn btn-small btn-primary" data-claimcol="${c.id}">Récupérer</button>` : `<em>${G.icon('lock')}</em>`}</div>
        </div>`;
      }).join('')}</div>
    </div>
    ${bottomNav('album')}`;
  G.showScreen(root);
  bindNav(root);
  root.addEventListener('click', (ev) => {
    const tb = ev.target.closest('[data-atab]');
    if (tb) {
      G.Audio.sfx('tap');
      return UI.album(tb.dataset.atab);
    }
    const cl = ev.target.closest('[data-claimcol]');
    if (cl && G.claimCollection(cl.dataset.claimcol)) {
      const c = G.COLLECTIONS.find((x) => x.id === cl.dataset.claimcol);
      G.Audio.sfx('open');
      G.toast(`${G.icon('star')} ${G.cosItem(c.reward[0], c.reward[1]).name} débloqué ! Équipe-le dans la boutique, onglet Style.`, 'gold');
      collectionsPage();
    }
  });
}

/* Prochain objet à débloquer avec les lunes rouges */
function nextMoonReward() {
  const moons = G.nightmareMoons();
  const all = [].concat(...Object.entries(G.COSMETICS).map(([, list]) => list.filter((x) => x.moons)), G.UNIFORMS.filter((u) => u.moons));
  const next = all.filter((x) => x.moons > moons).sort((a, b) => a.moons - b.moons)[0];
  return next ? `Prochain trésor : ${next.name} à ${next.moons} lunes` : 'Tous les trésors du cauchemar sont à toi !';
}
