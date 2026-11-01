/* Ticket SVP ! — boucle de jeu d'un service et HUD */
'use strict';

const Game = (G.Game = {});
let st = null; // état du service en cours

const MULTS = [
  [10, 3],
  [6, 2],
  [3, 1.5],
  [0, 1],
];
const multOf = (combo) => MULTS.find(([c]) => combo >= c)[1];

/* ---------- Démarrage ---------- */
Game.start = (cfg) => {
  Game.cleanup();
  const seed = cfg.seed != null ? cfg.seed : (Math.random() * 1e9) | 0;
  G.nightmareActive = !!cfg.nightmare;
  const { queue, ctx, extra } = G.buildQueue(cfg, seed);
  G.Analytics.levelStart(cfg);
  if (cfg.endless) queue.forEach((q) => Object.assign(q, { cfg, ctx }));
  const tools = G.save.tools;
  st = {
    cfg,
    queue,
    ctx,
    idx: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    rep: cfg.nightmare ? 2 : 3 + tools.badge,
    maxRep: cfg.nightmare ? 2 : 3 + tools.badge,
    // Cauchemar : ni montre, ni badge, ni sifflet (améliorations achetées en boutique)
    time: cfg.nightmare ? cfg.time : (cfg.time + tools.watch * 0.7) * G.timeScale(),
    timeLeft: 0,
    state: 'brief',
    paused: false,
    frozenUntil: 0,
    uvLeft: G.uvUses(tools.uv),
    whistleLeft: cfg.nightmare ? 0 : tools.whistle,
    hintsLeft: 2,
    appealUsed: false,
    caught: 0,
    coins: 0,
    results: [],
    mistakes: [], // erreurs du service, pour le récapitulatif de fin
    newAlbum: [],
    lastTick: 0,
    raf: 0,
    timers: [],
    bestMoment: null,
    asked: false,
    stats: { errors: 0, timeouts: 0, wrongFines: 0, caughtBy: {}, questionCatches: 0 },
    objectives: cfg.daily || cfg.endless ? [] : G.makeObjectives(cfg, queue),
    // Ligne infinie
    stationStartIdx: 0,
    stationsCleared: 0,
    perks: [],
    timeBonus: 0,
    freeHints: 0,
    comboFloor: 0,
    coinMult: 1,
    askFree: false,
    flair: false,
    // Nouveautés de gameplay
    seed,
    wanted: extra.wanted || null,
    twin: extra.twin || null,
    mystery: extra.mystery || null,
    mysterySolved: false,
    blacklist: extra.blacklist || null,
    memory: extra.memory || null,
    loupeLeft: 0,
    doubleCoins: false,
    boosts: [],
    globalTime: (cfg.timeAttack || 0) * G.timeScale(),
    feverUntil: 0,
    watch: null,
    miniEvent: null,
    pendingChase: false,
    pulled: false,
  };
  if (cfg.bossMech === 'uvfake') st.uvLeft = 99;
  if (st.mystery && st.objectives.length === 2) st.objectives[1] = { id: 'mystery', text: 'Démasquer le coupable', done: false };
  if (!cfg.daily && !cfg.boss && !cfg.event && !cfg.endless && cfg.g >= 6) planMiniEvent(cfg.count, 0);
  if (cfg.daily) {
    G.save.daily.last = G.dayKey();
    G.save.daily.result = null;
    G.persist();
  }
  renderScreen();
  briefing();
};

Game.debugState = () => st; // utilisé par les tests automatiques

Game.cleanup = () => {
  G.nightmareActive = false;
  if (!st) return;
  cancelAnimationFrame(st.raf);
  st.timers.forEach(clearTimeout);
  document.removeEventListener('keydown', onKey);
  st = null;
};

const later = (fn, ms) => {
  const s0 = st;
  const id = setTimeout(() => {
    if (st === s0) fn();
  }, ms);
  st.timers.push(id);
};

/* ---------- Écran et HUD ---------- */
function renderScreen() {
  const { cfg } = st;
  const root = G.el('div', `screen game-screen${cfg.dark ? ' dark' : ''}${cfg.sway ? ' sway' : ''}${st.blacklist ? ' blacklist' : ''}${cfg.o2 ? ' o2' : ''}${cfg.nightmare ? ' nightmare' : ''}`);
  root.style.setProperty('--line', cfg.city.lineColor);
  const dayRule = cfg.dayRule ? G.DAY_RULES.find((d) => d.id === cfg.dayRule) : null;
  root.innerHTML = `
    <header class="hud">
      <div class="hud-row">
        <button class="hud-btn" data-act="pause" aria-label="Pause">${G.icon('pause')}</button>
        <div class="hud-title">
          <div class="hud-level"><span class="line-pill">${cfg.endless ? '∞' : cfg.daily ? '★' : cfg.boss ? G.icon('skull') : cfg.i + 1}</span><span class="hud-level-txt" data-label>${cfg.label}</span></div>
          <div class="hud-dots">${Array.from({ length: cfg.endless ? G.STATION_SIZE : st.queue.length }, () => '<i></i>').join('')}</div>
        </div>
        <div class="hud-score">
          <div class="score-lbl">SCORE</div>
          <div class="score-val" data-score>0</div>
          <div class="combo-chip" data-combo>x1</div>
        </div>
      </div>
      <div class="hud-row hud-row2">
        <div class="rep" data-rep aria-label="Réputation"></div>
        <div class="hud-chips">
          <span class="chip chip-fines" data-fines-chip title="Amendes encaissées">${G.icon('coin')}<b data-fines>0</b></span>
          <span class="chip chip-date">${G.icon('calendar')}<b>${G.fmtDate(st.ctx.today)}</b></span>
          <span class="chip chip-zone" data-zonechip ${cfg.rules.includes('zone') ? '' : 'hidden'}>${G.icon('zone')}<b>1-${cfg.zoneReq}</b></span>
          <span class="chip chip-class ${cfg.firstClass ? '' : 'second'}" data-classchip ${cfg.rules.includes('class') ? '' : 'hidden'}>${G.icon('star')}<b>${cfg.firstClass ? '1re' : '2e'}</b></span>
        </div>
      </div>
    </header>
    <section class="scene" data-scene>
      ${G.drawScene(cfg.city)}
      ${G.wagonDeco(G.cosEquipped('deco'))}
      ${cfg.event ? G.eventDeco(cfg.event.deco) : ''}
      <div class="pet pet-${G.cosEquipped('pet')}" data-pet>${G.petSvg(G.cosEquipped('pet'))}<span class="pet-say" data-petsay hidden></span></div>
      <div class="queue-strip" data-queue></div>
      <div class="companions" data-comp></div>
      <div class="pax-wrap" data-pax></div>
      <button class="warn-btn" data-act="warn" hidden>${G.icon('megaphone')}<span>Avertir</span><small data-warntxt></small></button>
      <div class="bubble" data-bubble hidden></div>
      <div class="bubble me" data-me hidden></div>
      <div class="float-layer" data-float></div>
      <div class="timer" data-timer><div class="timer-bar"><i data-timebar></i></div><span data-timetxt>0,0 s</span></div>
      <div class="swipe-hint left">${G.icon('cross')}<span>Verbaliser</span></div>
      <div class="swipe-hint right">${G.icon('check')}<span>Valider</span></div>
    </section>
    <div class="rules-strip" data-rules>${rulesStrip(cfg)}</div>
    <section class="docs" data-docs></section>
    <div class="toolbar">
      <button class="tool" data-act="uv">${G.icon('uv')}<span>UV</span><em data-uv></em></button>
      <button class="tool" data-act="whistle">${G.icon('whistle')}<span>Sifflet</span><em data-whistle></em></button>
      <button class="tool tool-ask" data-act="ask">${G.icon('talk')}<span>Question</span><em data-ask></em></button>
      <button class="tool tool-ad" data-act="hint">${G.icon('camera')}<span>Caméra</span><em data-hint></em></button>
      <button class="tool tool-loupe" data-act="loupe" hidden>${G.icon('loupe')}<span>Loupe</span><em data-loupe></em></button>
    </div>
    <div class="actions">
      <button class="act act-fine" data-act="fine">${G.icon('cross')}<span>Verbaliser</span></button>
      <button class="act act-ok" data-act="ok">${G.icon('check')}<span>Valider</span></button>
    </div>
    <div class="zoom" data-zoom hidden></div>`;
  G.showScreen(root);
  st.root = root;
  st.el = {
    score: G.$('[data-score]', root),
    fines: G.$('[data-fines]', root),
    finesChip: G.$('[data-fines-chip]', root),
    combo: G.$('[data-combo]', root),
    rep: G.$('[data-rep]', root),
    dots: G.$$('.hud-dots i', root),
    pax: G.$('[data-pax]', root),
    bubble: G.$('[data-bubble]', root),
    me: G.$('[data-me]', root),
    label: G.$('[data-label]', root),
    zoneChip: G.$('[data-zonechip]', root),
    classChip: G.$('[data-classchip]', root),
    rules: G.$('[data-rules]', root),
    float: G.$('[data-float]', root),
    timer: G.$('[data-timer]', root),
    timebar: G.$('[data-timebar]', root),
    timetxt: G.$('[data-timetxt]', root),
    docs: G.$('[data-docs]', root),
    queue: G.$('[data-queue]', root),
    zoom: G.$('[data-zoom]', root),
    scene: G.$('[data-scene]', root),
    comp: G.$('[data-comp]', root),
    warn: G.$('[data-act="warn"]', root),
    warnTxt: G.$('[data-warntxt]', root),
    pet: G.$('[data-pet]', root),
    petSay: G.$('[data-petsay]', root),
    loupe: G.$('[data-act="loupe"]', root),
  };
  root.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  setupSwipe();
  updateHud();
  updateTools();
}

function rulesStrip(cfg) {
  const dayRule = cfg.dayRule ? G.DAY_RULES.find((d) => d.id === cfg.dayRule) : null;
  let h = '';
  if (st.blacklist) h += `<span class="rule-chip wanted blacklist-chip">${G.icon('skull')}<span>Volés : <b>${st.blacklist.join(' · ')}</b></span></span>`;
  if (st.objectives.length) h += `<button class="rule-chip obj" data-obj>${G.icon('star')}<span data-objtxt>Objectifs ${st.objectives.filter((o) => o.done).length}/${st.objectives.length}</span></button>`;
  if (cfg.endless) h += `<button class="rule-chip obj" data-obj>${G.icon('trophy')}<span>Record : ${G.fmt(G.save.endless.best)}</span></button>`;
  if (cfg.challengeScore != null) h += `<span class="rule-chip obj">${G.icon('trophy')}<span>À battre : ${G.fmt(cfg.challengeScore)}</span></span>`;
  if (cfg.inverted) h += `<span class="rule-chip day">${G.icon('megaphone')}<span>Tout est inversé !</span></span>`;
  if (st.wanted) h += `<button class="rule-chip wanted" data-wanted>${G.icon('skull')}<span>Avis de recherche</span></button>`;
  if (st.mystery) h += `<button class="rule-chip obj" data-mystery>${G.icon('camera')}<span data-mysterytxt>Indices ${st.mystery.revealed}/${st.mystery.clues.length}</span></button>`;
  if (cfg.bossMech === 'rush') h += `<span class="rule-chip day">${G.icon('clock')}<span data-rushtxt>0/${cfg.rushTarget} contrôlés</span></span>`;
  if (st.memory) h += `<button class="rule-chip wanted" data-memory>${G.icon('camera')}<span>Caméras (−150 pts)</span></button>`;
  if (cfg.o2) h += `<span class="rule-chip day">${G.icon('bolt')}<span>O₂ : +4 s si juste, −6 s si faux</span></span>`;
  if (dayRule) h += `<button class="rule-chip day" data-rule="day">${G.icon('megaphone')}<span>${dayRule.title}</span></button>`;
  h += cfg.rules.map((id) => { const ru = G.RULES.find((x) => x.id === id); return `<button class="rule-chip" data-rule="${id}">${G.icon(ru.icon)}<span>${ru.short}</span></button>`; }).join('');
  return h;
}

function updateHud() {
  const e = st.el;
  e.rep.innerHTML = Array.from({ length: st.maxRep }, (_, i) => `<span class="shield ${i < st.rep ? 'on' : 'off'}">${G.icon('shield')}</span>`).join('');
  const m = multOf(st.combo);
  e.combo.textContent = `x${String(m).replace('.', ',')}`;
  e.combo.className = `combo-chip m${String(m).replace('.', '')}`;
  const base = st.cfg.endless ? st.stationStartIdx : 0;
  e.dots.forEach((d, i) => {
    const r = st.results[base + i];
    d.className = r ? (r.correct ? 'ok' : 'ko') : base + i === st.idx ? 'cur' : '';
  });
  const end = st.cfg.endless ? st.stationStartIdx + G.STATION_SIZE : st.queue.length;
  const left = end - st.idx - 1;
  const lastTxt = st.cfg.endless ? 'Dernier avant la station' : 'Dernier passager';
  e.queue.innerHTML = left > 0 ? `${Array.from({ length: Math.min(left, 4) }, () => '<span class="q-head"></span>').join('')}${left > 4 ? `<span class="q-more">+${left - 4}</span>` : ''}<span class="q-label">en attente</span>` : `<span class="q-label">${lastTxt}</span>`;
}

function updateTools() {
  const r = st.root;
  const t = G.save.tools;
  const uv = G.$('[data-act="uv"]', r);
  const wh = G.$('[data-act="whistle"]', r);
  const hi = G.$('[data-act="hint"]', r);
  const uvLocked = t.uv === 0 && st.uvLeft <= 0;
  uv.classList.toggle('locked', uvLocked);
  G.$('[data-uv]', r).innerHTML = uvLocked ? G.icon('lock') : st.uvLeft >= 99 ? '∞' : st.uvLeft;
  uv.disabled = !uvLocked && st.uvLeft <= 0;
  const whLocked = t.whistle === 0 && st.whistleLeft <= 0;
  wh.classList.toggle('locked', whLocked || !!st.cfg.nightmare);
  G.$('[data-whistle]', r).innerHTML = st.cfg.nightmare ? G.icon('moon') : whLocked ? G.icon('lock') : st.whistleLeft;
  wh.disabled = !!st.cfg.nightmare || (!whLocked && st.whistleLeft <= 0);
  G.$('[data-hint]', r).innerHTML = st.freeHints + st.hintsLeft;
  hi.disabled = st.hintsLeft <= 0 && st.freeHints <= 0;
  const ask = G.$('[data-act="ask"]', r);
  const askOn = G.askAvailable(st.cfg);
  ask.classList.toggle('locked', !askOn);
  G.$('[data-ask]', r).innerHTML = !askOn ? G.icon('lock') : st.asked ? G.icon('check') : st.askFree ? '0 s' : '-1 s';
  ask.disabled = askOn && st.asked;
  const lp = G.$('[data-act="loupe"]', r);
  const loupeOn = st.boosts.includes('magnifier');
  lp.hidden = !loupeOn;
  r.classList.toggle('has-loupe', loupeOn);
  G.$('[data-loupe]', r).textContent = st.loupeLeft;
  lp.disabled = st.loupeLeft <= 0;
}

function setScore(v) {
  const from = st.score;
  st.score = Math.max(0, v);
  G.countTo(st.el.score, from, st.score, 400, (n) => String(Math.round(n)));
  st.el.score.classList.remove('bump');
  void st.el.score.offsetWidth;
  st.el.score.classList.add('bump');
}

/* ---------- Objectifs ---------- */
function statsSnapshot() {
  return Object.assign({ score: st.score, bestCombo: st.bestCombo }, st.stats);
}

function objItems(withFinish) {
  const s = statsSnapshot();
  let h = withFinish ? `<li class="obj"><i>${G.icon('star')}</i><span>Terminer le service</span></li>` : '';
  h += st.objectives.map((o) => `<li class="obj ${o.done ? 'done' : ''}"><i>${G.icon(o.done ? 'check' : 'star')}</i><span>${o.text}</span>${withFinish ? '' : `<em>${o.done ? 'réussi' : G.objectiveProgress(o, s)}</em>`}</li>`).join('');
  return h;
}

function checkObjectives() {
  if (!st.objectives.length) return;
  const s = statsSnapshot();
  let changed = false;
  st.objectives.forEach((o) => {
    if (!o.done && G.objectiveLive(o) && G.objectiveDone(o, s)) {
      o.done = true;
      changed = true;
      later(() => {
        G.toast(`${G.icon('star')} Objectif réussi : ${o.text}`, 'gold');
        G.Audio.sfx('star');
      }, 500);
    }
  });
  if (changed) {
    const t = G.$('[data-objtxt]', st.root);
    if (t) t.textContent = `Objectifs ${st.objectives.filter((o) => o.done).length}/${st.objectives.length}`;
  }
}

function showObjectives() {
  if (!st || st.cfg.endless) return;
  const wasPaused = st.paused;
  st.paused = true;
  const m = G.modal(`<div class="obj-modal"><h2>Objectifs</h2><ul class="obj-list">${objItems(false)}</ul><p class="obj-note">1re étoile : terminer le service. Chaque objectif réussi ajoute une étoile.</p><button class="btn btn-primary" data-ok>Reprendre</button></div>`);
  const close = () => {
    m.close();
    if (st) st.paused = wasPaused;
  };
  G.$('[data-ok]', m.el).addEventListener('click', close);
  m.onDismiss = close;
}

/* ---------- Briefing ---------- */
function briefing() {
  const { cfg } = st;
  const day = cfg.dayRule ? G.DAY_RULES.find((d) => d.id === cfg.dayRule) : null;
  let rulePart = '';
  if (cfg.newRule && cfg.newRule.id !== 'day') {
    rulePart = `<div class="brief-new"><div class="brief-badge">Nouvelle règle</div><h3>${G.icon(cfg.newRule.icon)} ${cfg.newRule.title}</h3><p>${cfg.newRule.desc}</p><div class="rule-card">${G.ruleCard(cfg.newRule.id, cfg)}</div><p class="brief-easy">${G.icon('clock')} Pour ce service : plus de temps et moins de fraudeurs, le temps de t'habituer.</p></div>`;
  }
  const mech = cfg.bossMech ? G.BOSS_MECH[cfg.city.id] : null;
  let poster = st.wanted ? `<div class="wanted-poster"><b>RECHERCHÉ</b>${G.drawPerson(st.wanted, { photo: true })}<span>Son jumeau lui ressemble, à un détail près.</span></div>` : '';
  if (st.blacklist) poster = `<div class="blacklist-poster"><b>LISTE NOIRE</b><ul>${st.blacklist.map((n) => `<li>N° ${n}</li>`).join('')}</ul><span>Attention : certains numéros ne diffèrent que d'un chiffre.</span></div>`;
  if (st.memory) poster = `<div class="memory-poster"><b>${G.icon('camera')} Caméra 3 · portillon nord</b><div class="memory-faces">${st.memory.map((l) => `<div>${G.drawPerson(l, { photo: true })}</div>`).join('')}</div><span>Mémorise bien ces trois visages !</span></div>`;
  const boss = cfg.boss ? `<div class="brief-boss"><div class="boss-tag">${G.icon('skull')} Boss de fin de ligne</div><h3>${cfg.city.boss.name}</h3><p>${cfg.city.boss.desc}</p>${mech ? `<div class="boss-mech"><b>${G.icon('bolt')} ${mech.title}</b><p>${mech.desc}</p></div>` : ''}${poster}</div>` : '';
  const letter = cfg.i === 0 && !cfg.daily && !cfg.endless && !cfg.event && cfg.challengeScore == null && G.STORY.intro[cfg.city.id] ? `<div class="letter"><div class="letter-head">${G.icon('talk')} Lettre du chef</div><p>${G.STORY.intro[cfg.city.id]}</p></div>` : '';
  const eventPart = cfg.event ? `<div class="brief-day"><div class="brief-badge alt">${G.icon('star')} Événement</div><h3>${cfg.event.name}</h3><p>${cfg.event.desc}</p></div>` : '';
  const challengePart = cfg.challengeScore != null ? `<div class="brief-day"><div class="brief-badge alt">${G.icon('trophy')} Défi d'un ami</div><h3>Score à battre : ${G.fmt(cfg.challengeScore)}</h3><p>Les mêmes passagers que ton ami, dans le même ordre.</p></div>` : '';
  const classPart = cfg.rules.includes('class') && !cfg.endless ? `<div class="brief-day"><div class="brief-badge alt">${G.icon('star')} Voiture du jour</div><h3>${cfg.firstClass ? 'Voiture de 1re classe' : 'Voiture de 2e classe'}</h3><p>${cfg.firstClass ? 'Seuls les billets de 1re classe sont acceptés.' : 'Tous les billets sont acceptés dans cette voiture.'}</p></div>` : '';
  const dayPart = day ? `<div class="brief-day"><div class="brief-badge alt">${G.icon('megaphone')} Consigne de la direction</div><h3>${day.title}</h3><p>${day.desc}</p></div>` : '';
  const ruleList = cfg.rules.map((id) => { const ru = G.RULES.find((x) => x.id === id); return `<li>${G.icon(ru.icon)}<span><b>${ru.title}</b> · ${ru.short}</span></li>`; }).join('');
  const objPart = st.objectives.length ? `<div class="brief-obj"><h4>${G.icon('star')} Objectifs</h4><ul class="obj-list">${objItems(true)}</ul></div>` : '';
  const askPart = cfg.g === G.ASK_FROM && !cfg.daily && !cfg.endless ? `<div class="brief-new"><div class="brief-badge">Nouvel outil</div><h3>${G.icon('talk')} L'interrogatoire</h3><p>Touche « Question » pour interroger le passager (coûte 1 seconde). Un fraudeur questionné sur ce qui cloche ment ou hésite : compare sa réponse avec ses papiers !</p></div>` : '';
  const endlessPart = cfg.endless ? `<div class="brief-new"><div class="brief-badge">Mode infini</div><h3>${G.icon('trophy')} Jusqu'où iras-tu ?</h3><ul class="endless-rules"><li>${G.STATION_SIZE} passagers par station, puis la rame repart.</li><li>Les règles s'ajoutent et le chrono raccourcit à chaque station.</li><li>Toutes les ${G.PERK_EVERY} stations, choisis un bonus parmi 3.</li><li>Record actuel : <b>${G.fmt(G.save.endless.best)} points</b>, station ${G.save.endless.bestStation}.</li></ul></div>` : '';
  const html = `
    <div class="brief">
      <div class="brief-head" style="--line:${cfg.city.lineColor}">
        <div class="brief-line"><span class="line-pill big">${cfg.endless ? '∞' : cfg.daily ? '★' : cfg.boss ? G.icon('skull') : cfg.i + 1}</span><div><div class="brief-city">${cfg.endless ? 'Ligne infinie' : cfg.daily ? cfg.label : cfg.city.name}</div><div class="brief-sub">${cfg.endless ? 'Départ : ' + cfg.city.name : cfg.city.line}</div></div></div>
        <div class="brief-stats"><span>${G.icon('ticket')} ${cfg.endless ? '∞' : cfg.count} passagers</span><span>${G.icon('clock')} ${st.time.toFixed(1).replace('.', ',')} s chacun</span><span>${G.icon('shield')} ${st.maxRep} erreurs max</span></div>
      </div>
      ${letter}${eventPart}${challengePart}${endlessPart}${boss}${rulePart}${askPart}${classPart}${dayPart}${objPart}
      <details class="brief-rules" ${cfg.newRule ? '' : 'open'}><summary>À vérifier (${cfg.rules.length})</summary><ul>${ruleList}</ul></details>
      ${cfg.daily ? '<p class="brief-note">Un seul essai par jour, les mêmes passagers pour tout le monde.</p>' : ''}
      ${boostPicker(cfg)}
      <div class="brief-actions">
        ${cfg.boss && !cfg.daily ? `<button class="btn btn-gold" data-renfort ${G.save.gold < 1 ? 'disabled' : ''}>Renfort : +1 réputation · 1 ${G.icon('gold')}</button>` : ''}
        <button class="btn btn-primary" data-go>${G.icon('play')} Commencer le service</button>
        ${cfg.daily ? '' : '<button class="btn btn-ghost" data-quit>Retour à la carte</button>'}
      </div>
    </div>`;
  const m = G.modal(html, { cls: 'modal-brief', dismissable: false });
  const ren = G.$('[data-renfort]', m.el);
  if (ren) {
    ren.addEventListener('click', async () => {
      G.Audio.sfx('click');
      // Plus de pub : le renfort coûte 1 ticket d'or, gagné en jouant
      if (G.save.gold < 1 || !st) return;
      G.save.gold--;
      G.persist();
      {
        st.rep++;
        st.maxRep++;
        updateHud();
        ren.disabled = true;
        ren.innerHTML = `${G.icon('check')} Renfort arrivé`;
      }
    });
  }
  G.$$('[data-boost]', m.el).forEach((b) => b.addEventListener('click', () => {
    G.Audio.sfx('click');
    b.classList.toggle('on');
  }));
  G.$('[data-go]', m.el).addEventListener('click', () => {
    G.Audio.sfx('click');
    applyBoosts(G.$$('[data-boost].on', m.el).map((b) => b.dataset.boost));
    m.close();
    countdown();
  });
  const q = G.$('[data-quit]', m.el);
  if (q) q.addEventListener('click', () => {
    G.Audio.sfx('click');
    m.close();
    Game.cleanup();
    G.UI.map();
  });
}

function countdown() {
  const c = G.el('div', 'countdown');
  st.root.appendChild(c);
  const seq = ['3', '2', '1', 'Contrôle !'];
  let i = 0;
  const step = () => {
    if (!st) return;
    if (i >= seq.length) {
      c.remove();
      G.Audio.play(st.cfg.boss ? 'boss' : st.cfg.city.music || 'game', serviceMusic());
      st.state = 'idle';
      loop();
      nextPassenger();
      return;
    }
    c.innerHTML = `<span>${seq[i]}</span>`;
    G.Audio.sfx(i < 3 ? 'tick' : 'door');
    i++;
    later(step, i === seq.length ? 650 : 520);
  };
  step();
}

/* ---------- Passagers ---------- */
function holdingOf(p) {
  if (!p.ticket || p.ticket.variant === 'invisible') return 'none';
  return p.ticket.kind === 'pass' ? 'pass' : 'ticket';
}

function curP() {
  return st.queue[st.idx];
}

function nextPassenger() {
  if (st.idx >= st.queue.length) return finish(true);
  G.Analytics.progress(st.idx);
  const p = curP();
  G.$$('.explain', st.root).forEach((x) => x.remove());
  if (st.flair && !p.specialFixed) p.nervous = p.fraud ? Math.random() < 0.9 : false;
  st.asked = false;
  st.el.me.hidden = true;
  st.timeLeft = st.time;
  st.hintShown = false;
  st.uvOn = false;
  const e = st.el;
  st.pulled = false;
  e.pax.innerHTML = `<div class="pax arrive${p.special ? ' special' : ''}">${G.drawPerson(p.look, { nervous: p.nervous, holding: holdingOf(p) })}</div>`;
  e.comp.innerHTML = (p.companions || []).map((l, i) => `<div class="comp c${i}">${G.drawPerson(l, {})}</div>`).join('');
  e.warn.hidden = !p.minor;
  if (p.minor) e.warnTxt.textContent = p.minor.text;
  e.docs.innerHTML = `<div class="doc-slot" data-zoomable="ticket">${G.renderTicket(p, st.cfg, st.ctx)}</div><div class="doc-slot" data-zoomable="id">${G.renderId(p, st.cfg, st.ctx)}</div>`;
  e.docs.classList.remove('uv-on', 'leave');
  e.docs.classList.add('enter');
  later(() => e.docs.classList.remove('enter'), 400);
  if (st.cfg.nightmare && !p.special && !p.specialFixed && Math.random() < 0.4) p.line = G.rng(st.idx * 31 + 7).pick(G.NIGHTMARE_LINES);
  showBubble(p.line, p.special ? 'special' : '');
  if (p.possess) later(() => possess(p), p.possess.at * 1000);
  if (p.special) G.toast(p.special === G.monthSpecial().id ? `${G.icon('star')} Le passager du mois ! Points doublés` : `${G.icon('star')} Passager spécial !`, 'gold');
  G.Audio.sfx('arrive');
  updateHud();
  updateTools();
  st.state = 'inspect';
  st.lastTick = 0;
  if (!G.save.tutorialDone && !st.cfg.daily && st.cfg.g === 0 && st.idx === 0) tutorial();
  // Service qui introduit une règle : on montre où regarder sur les premiers passagers
  const nr = st.cfg.newRule && NEW_RULE_FIELD[st.cfg.newRule.id];
  if (nr && st.idx - st.stationStartIdx < 2) {
    later(() => {
      const f = G.$(`[data-f="${nr}"]`, e.docs);
      if (f) f.classList.add('hinted');
      if (st.idx - st.stationStartIdx === 0) G.toast(`${G.icon(st.cfg.newRule.icon)} Nouvelle règle : regarde ici !`, 'gold');
    }, 450);
  }
  if (p.groupSize > 1) G.toast(`${G.icon('hand')} Un groupe de ${p.groupSize} !`, 'info');
}

const NEW_RULE_FIELD = { date: 'date', zone: 'zone', photo: 'photo', reduit: 'age', stamp: 'stamp', name: 'name', expiry: 'expiry', class: 'class', group: 'group' };

function showBubble(text, kind) {
  const b = st.el.bubble;
  b.hidden = false;
  b.className = `bubble ${kind || ''}`;
  b.textContent = text;
  b.classList.remove('pop');
  void b.offsetWidth;
  b.classList.add('pop');
  const pw = st.el.pax;
  pw.classList.remove('talking');
  void pw.offsetWidth;
  pw.classList.add('talking');
}

function floatText(text, cls) {
  const f = G.el('div', `float ${cls}`, text);
  st.el.float.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

/* ---------- Décision ---------- */
function decide(verdict, timeout, warn) {
  if (!st || st.state !== 'inspect' || st.paused) return;
  st.state = 'resolve';
  const p = curP();
  const fined = verdict === 'fine';
  const expectFine = st.cfg.inverted ? !p.fraud : p.fraud;
  const correct = !timeout && fined === expectFine;
  st.el.warn.hidden = true;
  const e = st.el;
  const paxEl = G.$('.pax', e.pax);
  const sp = p.special ? G.SPECIALS.find((s) => s.id === p.special) : null;

  // Tampon visuel sur les documents
  const stamp = G.el('div', `verdict-stamp ${G.verdictClass()} ${timeout ? 'late' : fined ? 'fine' : warn ? 'warn' : 'ok'}`, timeout ? 'TROP TARD' : fined ? 'AMENDE<small>50 €</small>' : warn ? 'AVERTI' : 'VALIDÉ');
  e.docs.appendChild(stamp);
  G.Audio.sfx(timeout ? 'alarm' : fined ? 'fine' : 'stamp');
  if (correct && !timeout) later(() => G.FX.sparks(stamp, fined ? '#ff8a8a' : '#8dffbf'), 140);
  G.vibrate(fined ? [30, 40, 30] : 25);

  st.results.push({ correct, fraud: p.fraud, special: !!p.special });
  petReact(correct ? 'happy' : 'sad', correct && fined);
  if (st.cfg.o2) {
    st.globalTime = Math.min(st.cfg.timeAttack * G.timeScale() * 1.3, st.globalTime + (correct ? 4 : -6));
    floatText(correct ? 'O₂ +4 s' : 'O₂ −6 s', correct ? 'good' : 'bad');
  }
  if (!correct) {
    G.Analytics.mistake(timeout ? 'temps écoulé' : fined ? 'innocent verbalisé' : 'fraude ratée (' + (p.hint || '?') + ')');
    st.stats.errors++;
    if (timeout) st.stats.timeouts++;
    else if (fined) st.stats.wrongFines++;
  } else if (fined) {
    if (p.hint && !p.specialFixed) st.stats.caughtBy[p.hint] = (st.stats.caughtBy[p.hint] || 0) + 1;
    if (st.asked) st.stats.questionCatches++;
  }
  st.el.me.hidden = true;
  if (correct) {
    st.combo++;
    st.bestCombo = Math.max(st.bestCombo, st.combo);
    const speed = Math.round(50 * (st.timeLeft / st.time));
    const fever = performance.now() < st.feverUntil;
    let gain = Math.round((100 + speed) * multOf(st.combo) * (fever ? 2 : 1));
    if (sp) gain += 150 + (sp.bonus && fined ? sp.bonus : 0);
    if (sp && sp === G.monthSpecial()) gain *= 2;
    if (warn) {
      gain += 80;
      G.missionEvent('warn');
    }
    if (st.combo > 0 && st.combo % 10 === 0) later(startFever, 300);
    if (fined) G.missionEvent('catch');
    if (sp) G.missionEvent('specials');
    if (fined && st.miniEvent && st.miniEvent.type === 'chase' && !st.miniEvent.done && st.idx >= st.miniEvent.at) st.pendingChase = true;
    revealClue();
    setScore(st.score + gain);
    floatText(`+${G.fmt(gain)}`, 'good');
    if (fined) {
      st.caught++;
      st.coins += G.ECO.fine * st.coinMult;
      G.FX.coins(e.pax, e.finesChip, 4); // les pièces volent du fraudeur vers la caisse
      later(() => {
        G.Audio.sfx('coin');
        e.fines.textContent = st.coins;
        e.finesChip.classList.remove('bump');
        void e.finesChip.offsetWidth;
        e.finesChip.classList.add('bump');
      }, 760);
    }
    if (st.combo >= 3 && [3, 6, 10].includes(st.combo)) {
      later(() => {
        floatText(`COMBO x${String(multOf(st.combo)).replace('.', ',')} !`, 'combo');
        G.Audio.sfx('combo', st.combo);
      }, 250);
    } else later(() => G.Audio.sfx('correct'), 200);
    if (paxEl) {
      paxEl.innerHTML = G.drawPerson(p.look, { mood: fined ? 'sad' : 'happy', holding: holdingOf(p) });
      paxEl.classList.remove('arrive');
      if (!fined) paxEl.classList.add('react-happy');
    }
    showBubble(sp ? (fined ? sp.caught : sp.escaped) : fined ? G.rng(st.idx + 7).pick(G.LINES.caught) : G.rng(st.idx + 3).pick(G.LINES.thanks), fined ? 'sad' : 'happy');
    if (sp && !st.newAlbum.includes(sp.id)) {
      if (!G.save.album[sp.id]) st.newAlbum.push(sp.id);
      G.save.album[sp.id] = (G.save.album[sp.id] || 0) + 1;
      G.save.stats.specials++;
      if (!st.bestMoment) st.bestMoment = fined ? `Tu as verbalisé ${sp.name.replace(/^(Le|La|L')\s?/, (m) => m.toLowerCase())}.` : `Tu as laissé passer ${sp.name.replace(/^(Le|La|L')\s?/, (m) => m.toLowerCase())}, à raison.`;
    }
  } else {
    st.combo = st.comboFloor;
    const cost = p.special === 'influencer' ? 2 : 1;
    G.FX.shieldBreak(e.rep.children[st.rep - 1]); // le bouclier perdu éclate
    G.FX.hurt();
    st.rep = Math.max(0, st.rep - cost);
    const penalty = timeout ? 60 : fined ? 150 : 60;
    setScore(st.score - penalty);
    floatText(`-${penalty}`, 'bad');
    st.root.classList.remove('shake');
    void st.root.offsetWidth;
    st.root.classList.add('shake');
    later(() => G.Audio.sfx('wrong'), 150);
    G.vibrate([60, 50, 120]);
    if (paxEl) {
      paxEl.innerHTML = G.drawPerson(p.look, { mood: fined ? 'angry' : 'happy', holding: holdingOf(p) });
      paxEl.classList.remove('arrive');
      paxEl.classList.add(fined ? 'react-angry' : 'react-happy');
    }
    let msg;
    if (timeout) msg = 'Trop lent ! Le passager est descendu.';
    else if (st.cfg.inverted) msg = `Poisson d'avril : il fallait faire l'inverse ! (${p.fraud ? 'fraudeur' : 'en règle'})`;
    else if (fined && p.minor) msg = `Une petite infraction (${p.minor.text.toLowerCase()}) ne vaut pas une amende : il fallait l'avertir.`;
    else if (fined) msg = `Plainte ! Ce passager était en règle.`;
    else msg = `Fraudeur ! ${p.reason}`;
    if (p.special === 'influencer') msg += ' La vidéo devient virale : -2 réputation.';
    // On garde le passager et ses papiers pour le récapitulatif de fin de service
    st.mistakes.push({
      look: p.look,
      kind: timeout ? 'late' : st.cfg.inverted ? 'inverted' : fined ? (p.minor ? 'minor' : 'wrongfine') : 'missed',
      msg,
      reason: p.reason || '',
      hint: !fined && !timeout ? p.hint : null,
      ticket: G.renderTicket(p, st.cfg, st.ctx),
      id: G.renderId(p, st.cfg, st.ctx),
      name: p.name || '',
    });
    showBubble(timeout ? 'Bon, j\'y vais !' : sp ? (fined ? sp.caught : sp.escaped) : fined ? G.rng(st.idx + 11).pick(G.LINES.wronged) : G.rng(st.idx + 5).pick(G.LINES.escaped), fined ? 'angry' : '');
    explain(msg, p, timeout ? 'late' : fined ? 'wrongfine' : 'missed');
  }
  G.save.stats.checked++;
  if (fined && p.fraud) G.save.stats.caught++;
  if (st.watch) {
    if (!correct) st.watch.ok = false;
    st.watch.left--;
    if (st.watch.left <= 0) endWatch();
  }
  if (st.cfg.bossMech === 'rush') {
    const t = G.$('[data-rushtxt]', st.root);
    if (t) t.textContent = `${st.results.filter((x) => x.correct).length}/${st.cfg.rushTarget} contrôlés`;
  }
  updateHud();
  checkObjectives();
  G.Audio.setTempo(1 + Math.min(st.combo, 10) * 0.012);

  const dir = fined ? 'left' : 'right';
  later(() => {
    if (paxEl) {
      paxEl.classList.remove('react-happy', 'react-angry');
      paxEl.classList.add(`leave-${dir}`);
    }
    e.docs.classList.add('leave');
  }, correct ? 650 : errPause(1500, 2500));
  later(() => {
    e.bubble.hidden = true;
    st.idx++;
    if (st.rep <= 0) gameOver();
    else if (st.pendingChase) {
      st.pendingChase = false;
      runChase(proceed);
    } else proceed();
  }, correct ? 1000 : errPause(1900, 2900));
}
// Après une erreur, on laisse le temps de lire (sauf si un chrono global tourne : ce serait une pénalité)
const errPause = (short, long) => (st && st.cfg.timeAttack ? short : long);

/* Passager suivant, ou fin de station en Ligne infinie */
function proceed() {
  if (!st || st.state === 'end') return;
  if (st.cfg.bossMech === 'rush' && st.idx >= st.queue.length) return finish(true);
  if (!st.cfg.endless) return maybeMiniEvent() || nextPassenger();
  ensureQueue();
  if (st.idx - st.stationStartIdx < G.STATION_SIZE) return maybeMiniEvent() || nextPassenger();
  st.stationsCleared = curP().cfg.station - 1;
  const bonus = G.ECO.station * st.stationsCleared;
  st.coins += bonus;
  st.el.fines.textContent = st.coins;
  G.Audio.sfx('door');
  floatText(`Station ${st.stationsCleared} franchie !`, 'combo');
  if (st.stationsCleared % G.PERK_EVERY === 0) later(perkChoice, 900);
  else later(beginStation, 900);
}

function ensureQueue() {
  while (st.queue.length - st.idx < G.STATION_SIZE + 1) {
    const n = st.queue[st.queue.length - 1].cfg.station + 1;
    const cfg = G.endlessConfig(n);
    const { queue, ctx } = G.buildQueue(cfg, (Math.random() * 1e9) | 0);
    queue.forEach((q) => Object.assign(q, { cfg, ctx }));
    st.queue.push(...queue);
  }
}

function beginStation() {
  if (!st) return;
  const p = curP();
  st.cfg = p.cfg;
  st.ctx = p.ctx;
  st.stationStartIdx = st.idx;
  st.time = (st.cfg.time + G.save.tools.watch * 0.7 + st.timeBonus) * G.timeScale();
  st.miniEvent = null;
  if (st.cfg.station >= 3 && Math.random() < 0.35) planMiniEvent(G.STATION_SIZE, st.idx);
  // Nouveau décor si la rame change de ville
  st.root.style.setProperty('--line', st.cfg.city.lineColor);
  const old = G.$('.scene-svg', st.el.scene);
  if (old) old.outerHTML = G.drawScene(st.cfg.city);
  st.el.label.textContent = st.cfg.label;
  st.el.rules.innerHTML = rulesStrip(st.cfg);
  st.el.zoneChip.hidden = !st.cfg.rules.includes('zone');
  G.$('b', st.el.zoneChip).textContent = `1-${st.cfg.zoneReq}`;
  st.el.classChip.hidden = !st.cfg.rules.includes('class');
  st.el.classChip.classList.toggle('second', !st.cfg.firstClass);
  G.$('b', st.el.classChip).textContent = st.cfg.firstClass ? '1re' : '2e';
  G.Audio.play(st.cfg.city.music || 'game');
  const banner = G.el('div', 'station-banner', `<span>Station ${st.cfg.station}</span><b>${st.cfg.city.name}</b>`);
  st.el.scene.appendChild(banner);
  setTimeout(() => banner.remove(), 1600);
  if (st.cfg.newRule) later(() => G.toast(`${G.icon(st.cfg.newRule.icon)} Nouvelle règle : ${st.cfg.newRule.title}`, 'gold'), 300);
  if (st.cfg.dayRule) later(() => G.toast(`${G.icon('megaphone')} ${G.DAY_RULES.find((d) => d.id === st.cfg.dayRule).title}`, 'info'), 900);
  updateHud();
  later(nextPassenger, 1000);
}

function perkChoice() {
  if (!st) return;
  st.paused = true;
  const options = G.pickPerks(st.perks, G.rng((Math.random() * 1e9) | 0));
  G.Audio.sfx('open');
  const m = G.modal(`<div class="perks"><div class="perk-kicker">Station ${st.stationsCleared} franchie</div><h2>Choisis un bonus</h2>
    <div class="perk-list">${options.map((o) => `<button class="perk" data-perk="${o.id}"><span class="perk-ic">${G.icon(o.icon)}</span><span class="perk-txt"><b>${o.name}</b><small>${o.desc}</small></span></button>`).join('')}</div></div>`, { cls: 'modal-perks', dismissable: false });
  G.$$('[data-perk]', m.el).forEach((b) => b.addEventListener('click', () => {
    applyPerk(b.dataset.perk);
    G.Audio.sfx('buy');
    m.close();
    st.paused = false;
    beginStation();
  }));
}

function applyPerk(id) {
  st.perks.push(id);
  switch (id) {
    case 'shield': st.maxRep++; st.rep++; break;
    case 'heal': st.rep = st.maxRep; break;
    case 'slow': st.timeBonus += 1.5; break;
    case 'flair': st.flair = true; break;
    case 'cam': st.freeHints += 2; break;
    case 'combo': st.comboFloor = 3; st.combo = Math.max(st.combo, 3); break;
    case 'uv': st.uvLeft = Math.min(99, st.uvLeft + 3); break;
    case 'whistle': st.whistleLeft += 2; break;
    case 'coins': st.coinMult = 2; break;
    case 'ask': st.askFree = true; break;
    default: break;
  }
  updateHud();
  updateTools();
}

/* Explication de l'erreur, pour apprendre en jouant */
function explain(msg, p, kind) {
  const title = { late: 'Trop lent !', wrongfine: 'Amende injuste', missed: 'Fraudeur laissé passer' }[kind] || 'Erreur';
  const long = !st.cfg.timeAttack;
  const box = G.el('div', `explain ex-${kind || 'err'}`, `<b>${G.icon('cross')} ${title}</b><span>${msg}</span>`);
  st.root.appendChild(box);
  if (p.hint) {
    const f = G.$(`[data-f="${p.hint}"]`, st.el.docs);
    if (f) {
      f.classList.add('flag');
      // repère bien visible sur le champ fautif
      const ring = G.el('i', 'flag-ring');
      f.appendChild(ring);
    }
  }
  setTimeout(() => box.classList.add('out'), long ? 2450 : 1550);
  setTimeout(() => box.remove(), long ? 2800 : 1900);
}

/* ---------- Chrono ---------- */
function loop() {
  const t0 = performance.now();
  let last = t0;
  const frame = (now) => {
    if (!st) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (st.cfg.timeAttack && (st.state === 'inspect' || st.state === 'resolve') && !st.paused) {
      if (now > st.frozenUntil) st.globalTime -= dt;
      const k = G.clamp(st.globalTime / (st.cfg.timeAttack * G.timeScale()), 0, 1);
      st.el.timebar.style.transform = `scaleX(${k})`;
      st.el.timer.classList.toggle('low', st.globalTime < 10);
      st.el.timetxt.textContent = `${st.cfg.o2 ? 'O₂ ' : ''}${Math.max(0, st.globalTime).toFixed(1).replace('.', ',')} s`;
      if (st.globalTime <= 0) {
        if (st.cfg.o2) G.toast(`${G.icon('bolt')} Plus d'oxygène ! Le dôme est évacué.`);
        finish(!st.cfg.o2);
        return;
      }
    } else if (st.state === 'inspect' && !st.paused) {
      if (now > st.frozenUntil) st.timeLeft -= dt;
      const k = G.clamp(st.timeLeft / st.time, 0, 1);
      st.el.timebar.style.transform = `scaleX(${k})`;
      st.el.timer.classList.toggle('low', st.timeLeft < 2.5);
      st.el.timer.classList.toggle('frozen', now < st.frozenUntil);
      st.el.timetxt.textContent = `${Math.max(0, st.timeLeft).toFixed(1).replace('.', ',')} s`;
      if (st.timeLeft < 2.5 && now - st.lastTick > 500) {
        st.lastTick = now;
        G.Audio.sfx('tick');
      }
      if (st.timeLeft <= 0) decide('ok', true);
    }
    st.raf = requestAnimationFrame(frame);
  };
  st.raf = requestAnimationFrame(frame);
}

/* ---------- Outils ---------- */
function useUv() {
  if (G.save.tools.uv === 0 && st.uvLeft <= 0) return G.toast(`${G.icon('lock')} Achète la lampe UV à la boutique.`);
  if (st.uvLeft <= 0 || st.state !== 'inspect') return;
  if (st.uvLeft < 99) st.uvLeft--;
  st.el.docs.classList.add('uv-on');
  G.Audio.sfx('uv');
  later(() => st.el.docs.classList.remove('uv-on'), 2600);
  updateTools();
}

function useWhistle() {
  if (G.save.tools.whistle === 0 && st.whistleLeft <= 0) return G.toast(`${G.icon('lock')} Achète le sifflet à la boutique.`);
  if (st.whistleLeft <= 0 || st.state !== 'inspect') return;
  st.whistleLeft--;
  st.frozenUntil = performance.now() + 5000;
  G.Audio.sfx('whistle');
  floatText('Chrono figé !', 'freeze');
  updateTools();
}

async function useHint() {
  if (st.state !== 'inspect') return;
  if (st.freeHints > 0) st.freeHints--;
  else {
    if (st.hintsLeft <= 0) return;
    st.hintsLeft--; // caméra : 2 regards par service, gratuits (plus de pub)
  }
  updateTools();
  const p = curP();
  G.Audio.sfx('hint');
  if (p.hint) {
    const f = G.$(`[data-f="${p.hint}"]`, st.el.docs);
    if (f) f.classList.add('hinted');
    G.toast(`${G.icon('camera')} La caméra a repéré quelque chose…`, 'info');
  } else if (p.fraud) {
    G.toast(`${G.icon('camera')} Comportement suspect…`, 'info');
  } else {
    G.toast(`${G.icon('camera')} Rien à signaler sur ce passager.`, 'info');
  }
}

/* Interrogatoire : une question par passager */
function useAsk() {
  if (!G.askAvailable(st.cfg)) return G.toast(`${G.icon('lock')} L'interrogatoire arrive au service ${G.ASK_FROM + 1}.`);
  if (st.state !== 'inspect' || st.asked || st.paused) return;
  st.asked = true;
  const p = curP();
  const res = G.interrogate(p, st.cfg, st.ctx, G.rng((Math.random() * 1e9) | 0));
  if (!st.askFree) st.timeLeft = Math.max(0.6, st.timeLeft - 1);
  G.missionEvent('ask');
  G.Audio.sfx('tap');
  const me = st.el.me;
  me.hidden = false;
  me.textContent = res.q;
  me.classList.remove('pop');
  void me.offsetWidth;
  me.classList.add('pop');
  updateTools();
  later(() => {
    if (!st || st.state !== 'inspect' || curP() !== p) return;
    if (res.tell) {
      const paxEl = G.$('.pax', st.el.pax);
      if (paxEl) paxEl.innerHTML = G.drawPerson(p.look, { nervous: true, mood: 'nervous', holding: holdingOf(p) });
    }
    showBubble(res.a, res.tell ? 'nervous' : '');
  }, 650);
}

/* ---------- Zoom sur un document ---------- */
function openZoom(which) {
  if (st.state !== 'inspect') return;
  if (st.cfg.dark) return G.toast(`${G.icon('uv')} Trop sombre pour zoomer : éclaire avec ton doigt !`);
  const p = curP();
  const z = st.el.zoom;
  const doc = which === 'ticket' ? G.renderTicket(p, st.cfg, st.ctx) : G.renderId(p, st.cfg, st.ctx);
  const compare = which === 'id' ? `<div class="zoom-compare"><div><div class="zc-face">${G.drawPerson(p.look, { photo: true })}</div><span>Passager</span></div><div><div class="zc-face">${p.photoVariant === 'crayon' ? G.renderId(p, st.cfg, st.ctx).match(/<svg viewBox="0 0 100 110"[\s\S]*?<\/svg>/)[0] : p.photoVariant === 'blank' ? '<div class="photo-blank">?</div>' : G.drawPerson(p.photoLook, { photo: true })}</div><span>Photo de la carte</span></div></div>` : '';
  z.innerHTML = `<div class="zoom-card ${st.el.docs.classList.contains('uv-on') ? 'uv-on' : ''}">${compare}<div class="zoom-doc">${doc}</div><p class="zoom-help">Touchez pour fermer · le chrono continue</p></div>`;
  z.hidden = false;
  G.Audio.sfx('tap');
}

/* ---------- Entrées ---------- */
function onClick(ev) {
  if (!st) return;
  const z = ev.target.closest('[data-zoom]');
  if (z) {
    z.hidden = true;
    return;
  }
  const a = ev.target.closest('[data-act]');
  if (a) {
    const act = a.dataset.act;
    if (act === 'pause') return pause();
    if (act === 'fine' || act === 'ok') return decide(act === 'fine' ? 'fine' : 'ok');
    if (act === 'uv') return useUv();
    if (act === 'whistle') return useWhistle();
    if (act === 'hint') return useHint();
    if (act === 'ask') return useAsk();
    if (act === 'warn') return warnPassenger();
    if (act === 'loupe') return useLoupe();
  }
  if (ev.target.closest('[data-obj]')) return showObjectives();
  if (ev.target.closest('[data-wanted]')) return showWanted();
  if (ev.target.closest('[data-mystery]')) return showClues();
  if (ev.target.closest('[data-memory]')) return showMemory();
  const rc = ev.target.closest('[data-rule]');
  if (rc) return showRules();
}

function onKey(ev) {
  if (!st || document.querySelector('.modal')) return;
  if (ev.key === 'ArrowLeft') decide('fine');
  else if (ev.key === 'ArrowRight') decide('ok');
  else if (ev.key === 'Escape' || ev.key === ' ') {
    ev.preventDefault();
    pause();
  } else if (ev.key === 'u') useUv();
  else if (ev.key === 'q') useAsk();
  else if (ev.key === 'w') warnPassenger();
}

function setupSwipe() {
  const area = st.root;
  let sx = 0;
  let sy = 0;
  let dx = 0;
  let active = false;
  let lamp = false; // wagon dans le noir : le doigt sur les documents déplace la lampe, il ne fait pas glisser
  let target = null;
  const zone = (t) => t.closest('[data-docs], [data-pax]');
  area.addEventListener('pointerdown', (ev) => {
    if (!st || st.state !== 'inspect' || st.paused) return;
    if (!zone(ev.target)) return;
    sx = ev.clientX;
    sy = ev.clientY;
    dx = 0;
    target = ev.target;
    if (st.cfg.dark && ev.target.closest('[data-docs]')) {
      lamp = true;
      moveLamp(ev);
      return;
    }
    active = true;
  });
  area.addEventListener('pointermove', (ev) => {
    if (!st) return;
    // À la souris, la lampe suit le pointeur ; au doigt, seulement pendant qu'il touche les documents
    if (st.cfg.dark && (lamp || ev.pointerType === 'mouse')) moveLamp(ev);
    if (lamp) {
      ev.preventDefault();
      return;
    }
    if (!active) return;
    dx = ev.clientX - sx;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(ev.clientY - sy)) {
      st.root.style.setProperty('--dx', `${dx}px`);
      st.root.style.setProperty('--rot', `${(dx / 25).toFixed(1)}deg`);
      st.root.classList.add('dragging');
      st.root.classList.toggle('drag-left', dx < -40);
      st.root.classList.toggle('drag-right', dx > 40);
    }
  });
  const end = () => {
    if (lamp) {
      lamp = false;
      return;
    }
    if (!active || !st) return;
    active = false;
    st.root.classList.remove('dragging', 'drag-left', 'drag-right');
    st.root.style.setProperty('--dx', '0px');
    st.root.style.setProperty('--rot', '0deg');
    if (Math.abs(dx) > 90) {
      G.Audio.sfx('swipe');
      decide(dx < 0 ? 'fine' : 'ok');
    } else if (Math.abs(dx) < 8 && target) {
      const slot = target.closest('[data-zoomable]');
      if (slot) openZoom(slot.dataset.zoomable);
      else if (target.closest('[data-pax]') && st.cfg.bossMech === 'mustache') pullMustache();
    }
  };
  area.addEventListener('pointerup', end);
  area.addEventListener('pointercancel', end);
}

/* ---------- Pause, règles, tutoriel ---------- */
function pause() {
  if (!st || st.paused || st.state === 'brief' || st.state === 'end') return;
  st.paused = true;
  G.Audio.duck(true);
  G.Audio.sfx('click');
  const s = G.save.settings;
  const m = G.modal(`
    <div class="pause">
      <h2>Pause</h2>
      <p class="pause-sub">${st.cfg.endless ? `${st.cfg.label} · ${G.fmt(st.score)} points` : `${st.cfg.label} · passager ${Math.min(st.idx + 1, st.queue.length)}/${st.queue.length}`}</p>
      ${st.objectives.length ? `<ul class="obj-list compact">${objItems(false)}</ul>` : ''}
      <div class="pause-toggles">
        <button class="toggle ${s.music ? 'on' : ''}" data-tg="music">${G.icon('music')}<span>Musique</span></button>
        <button class="toggle ${s.sfx ? 'on' : ''}" data-tg="sfx">${G.icon('sound')}<span>Effets</span></button>
        <button class="toggle ${s.vibe ? 'on' : ''}" data-tg="vibe">${G.icon('vibe')}<span>Vibrations</span></button>
      </div>
      <button class="btn btn-primary" data-resume>${G.icon('play')} Reprendre</button>
      <button class="btn btn-ghost" data-rules>Revoir les règles</button>
      ${st.cfg.daily ? '' : `<button class="btn btn-ghost" data-restart>${st.cfg.endless ? 'Recommencer la ligne' : 'Recommencer le service'}</button>`}
      <button class="btn btn-danger" data-quit>${st.cfg.daily ? 'Abandonner le défi' : st.cfg.endless ? 'Descendre de la rame' : 'Quitter vers la carte'}</button>
    </div>`, { cls: 'modal-pause', dismissable: false });
  G.$$('[data-tg]', m.el).forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.tg;
    G.save.settings[k] = !G.save.settings[k];
    b.classList.toggle('on', G.save.settings[k]);
    G.persist();
    G.Audio.applySettings();
    G.Audio.duck(true);
    G.Audio.sfx('click');
  }));
  const resume = () => {
    m.close();
    if (!st) return;
    st.paused = false;
    G.Audio.duck(false);
  };
  G.$('[data-resume]', m.el).addEventListener('click', resume);
  G.$('[data-rules]', m.el).addEventListener('click', () => {
    m.close();
    showRules(true);
  });
  const rs = G.$('[data-restart]', m.el);
  if (rs) rs.addEventListener('click', () => {
    m.close();
    const cfg = st.cfg.endless ? G.endlessConfig(1) : st.cfg;
    G.Audio.duck(false);
    Game.start(cfg);
  });
  G.$('[data-quit]', m.el).addEventListener('click', () => {
    m.close();
    G.Audio.duck(false);
    if (st.cfg.daily || st.cfg.endless) {
      st.rep = 0;
      finish(false);
    } else {
      G.Analytics.levelQuit(st.cfg, st.idx);
      Game.cleanup();
      G.UI.map();
    }
  });
}

function showRules(fromPause) {
  if (!st) return;
  const wasPaused = st.paused;
  st.paused = true;
  const day = st.cfg.dayRule ? G.DAY_RULES.find((d) => d.id === st.cfg.dayRule) : null;
  const items = st.cfg.rules.map((id) => { const ru = G.RULES.find((x) => x.id === id); return `<li>${G.icon(ru.icon)}<div><b>${ru.title}</b><p>${ru.desc}</p></div></li>`; }).join('');
  const m = G.modal(`<div class="rules-modal"><h2>Le carnet du contrôleur</h2><ul>${items}${day ? `<li class="day">${G.icon('megaphone')}<div><b>${day.title}</b><p>${day.desc}</p></div></li>` : ''}</ul><p class="rules-tip">${G.icon('hand')} Glisse à droite pour valider, à gauche pour verbaliser. Touche un document pour l'agrandir.</p><button class="btn btn-primary" data-ok>J'ai compris</button></div>`, { cls: 'modal-rules' });
  const close = () => {
    m.close();
    if (!st) return;
    if (fromPause) {
      st.paused = false;
      G.Audio.duck(false);
    } else st.paused = wasPaused;
  };
  G.$('[data-ok]', m.el).addEventListener('click', close);
  m.onDismiss = close;
}

function tutorial() {
  st.paused = true;
  const steps = [
    { sel: '.chip-date', text: "Voici la date d'aujourd'hui." },
    { sel: '[data-f="date"]', text: 'Compare-la avec la date du ticket. Si elle diffère, c\'est une fraude.' },
    { sel: '.actions', text: 'Glisse les documents à gauche pour verbaliser, à droite pour valider. Ou utilise ces boutons.' },
    { sel: '[data-timer]', text: 'Attention au chrono ! Tu as 3 erreurs avant la fin du service.' },
  ];
  let i = 0;
  const ov = G.el('div', 'coach');
  st.root.appendChild(ov);
  const show = () => {
    if (!st) return;
    if (i >= steps.length) {
      ov.remove();
      G.save.tutorialDone = true;
      G.persist();
      st.paused = false;
      return;
    }
    const s = steps[i];
    const target = G.$(s.sel, st.root);
    const rr = st.root.getBoundingClientRect();
    const tr = target ? target.getBoundingClientRect() : { left: rr.left + 40, top: rr.top + 200, width: 200, height: 40 };
    const x = tr.left - rr.left - 6;
    const y = tr.top - rr.top - 6;
    const below = y < rr.height / 2;
    ov.innerHTML = `<div class="coach-hole" style="left:${x}px;top:${y}px;width:${tr.width + 12}px;height:${tr.height + 12}px"></div>
      <div class="coach-tip ${below ? 'below' : 'above'}" style="${below ? `top:${y + tr.height + 24}px` : `bottom:${rr.height - y + 12}px`}">
        <div class="coach-chef">${G.drawPerson(G.conductorLook('retro'), { photo: true, mood: 'happy' })}</div>
        <div><b>Le chef</b><p>${s.text}</p><span class="coach-next">${i + 1}/${steps.length} · Touchez pour continuer</span></div>
      </div>`;
    G.Audio.sfx('tap');
  };
  ov.addEventListener('click', () => {
    i++;
    show();
  });
  show();
}

/* ---------- Fin du service ---------- */
function gameOver() {
  st.state = 'end';
  st.paused = true;
  G.Audio.stop();
  G.Audio.sfx('wrong');
  if (st.appealUsed || st.cfg.daily) return finish(false);
  const m = G.modal(`
    <div class="gameover">
      <div class="go-icon">${G.icon('shield')}</div>
      <h2>Réputation à zéro !</h2>
      <p>Trop de plaintes et de fraudeurs oubliés. La direction veut te voir.</p>
      <button class="btn btn-primary" data-appeal>${G.icon('shield')} Faire appel et continuer</button>
      <p class="go-note">L'appel te rend 1 bouclier, une seule fois par ${st.cfg.endless ? 'partie' : 'service'}.</p>
      <button class="btn btn-ghost" data-end>${st.cfg.endless ? 'Terminer la partie' : 'Terminer le service'}</button>
    </div>`, { cls: 'modal-go', dismissable: false });
  G.$('[data-appeal]', m.el).addEventListener('click', async () => {
    const ok = true; // appel gratuit, une fois par service
    m.close();
    if (!st) return;
    if (ok) {
      st.appealUsed = true;
      st.rep = 1;
      st.paused = false;
      st.state = 'idle';
      updateHud();
      G.Audio.play(st.cfg.boss ? 'boss' : st.cfg.city.music || 'game', serviceMusic());
      proceed();
    } else finish(false);
  });
  G.$('[data-end]', m.el).addEventListener('click', () => {
    m.close();
    finish(false);
  });
}

function finish(completed) {
  if (!st || st.finishing) return;
  st.state = 'end';
  cancelAnimationFrame(st.raf);
  const { cfg } = st;
  if (cfg.endless) return finishEndless();
  // L'enquête du Grand Express se conclut avant les résultats
  if (st.mystery && st.mystery.solved === null && completed && st.rep > 0) return accuse(() => finish(completed));
  st.finishing = true;
  const lost = st.maxRep - st.rep;
  const correctCount = st.results.filter((r) => r.correct).length;
  const success = completed && st.rep > 0 && (cfg.bossMech !== 'rush' || correctCount >= cfg.rushTarget);
  const snap = statsSnapshot();
  st.objectives.forEach((o) => { o.done = G.objectiveDone(o, snap); });
  const objDone = st.objectives.filter((o) => o.done).length;
  const stars = !success ? 0 : cfg.daily ? (lost === 0 ? 3 : lost === 1 ? 2 : 1) : 1 + objDone;
  const correct = st.results.filter((r) => r.correct).length;
  const acc = st.results.length ? Math.round((correct / st.results.length) * 100) : 0;
  let coins = st.coins + stars * G.ECO.star + (cfg.boss && success ? G.ECO.boss : 0);
  if (cfg.daily && success) coins += G.ECO.daily;
  if (st.doubleCoins) coins *= 2;
  if (cfg.nightmare) coins *= 2;
  const xp = Math.round(st.score / 10);
  const s = G.save;
  const prevRank = G.rankOf(s.xp).index;
  s.xp += xp;
  s.coins += coins;
  s.stats.shifts++;
  let firstClear = false;
  let eventReward = 0;
  if (cfg.event && success) {
    s.eventDone = s.eventDone || {};
    const k = cfg.event.id + G.dayKey();
    if (!s.eventDone[k]) {
      s.eventDone[k] = true;
      s.gold += 5;
      eventReward = 5;
    }
  }
  if (success) G.missionEvent('services');
  G.missionEvent('combo', st.bestCombo, 'max');
  if (cfg.daily) G.missionEvent('daily');
  if (stars === 3 && !cfg.daily) G.missionEvent('stars3');
  let weekly = null;
  if (cfg.nightmare) {
    const n = s.nightmare;
    if (stars > (n.levels[cfg.g] || 0)) n.levels[cfg.g] = stars;
    n.best[cfg.g] = Math.max(n.best[cfg.g] || 0, st.score);
  } else if (cfg.weekly) {
    const w = s.weekly.week === cfg.week ? s.weekly : { week: cfg.week, best: 0, plays: 0, rewarded: false };
    w.plays++;
    const record = st.score > w.best;
    w.best = Math.max(w.best, st.score);
    let reward = 0;
    if (success && !w.rewarded) {
      w.rewarded = true;
      s.gold += 3;
      reward = 3;
    }
    s.weekly = w;
    weekly = { record, best: w.best, reward, code: G.makeWeeklyCode(cfg.week, st.score) };
  } else if (!cfg.daily && !cfg.event) {
    if (stars > (s.levels[cfg.g] || 0)) {
      if (!s.levels[cfg.g]) firstClear = stars > 0;
      s.levels[cfg.g] = stars;
    }
    s.best[cfg.g] = Math.max(s.best[cfg.g] || 0, st.score);
    if (firstClear && cfg.boss) s.gold += 5;
  } else if (cfg.daily) {
    const yesterday = G.dayKey(G.addDays(G.today(), -1));
    s.daily.streak = s.daily.prevKey === yesterday ? s.daily.streak + 1 : 1;
    s.daily.prevKey = G.dayKey();
    s.daily.result = { score: st.score, correct, total: st.queue.length, grid: st.results.map((r) => (r.correct ? (r.special ? 'S' : 'O') : 'X')).join(''), done: true, slow: G.timeScale() > 1 };
    if (s.daily.streak % 7 === 0) s.gold += 3;
  }
  G.persist();
  const rankUp = G.rankOf(s.xp).index > prevRank;
  G.Audio.play(success ? 'win' : 'lose', { onEnd: () => G.Audio.play('map') });
  const objectives = st.objectives.length ? [{ text: 'Terminer le service', done: success }].concat(st.objectives.map((o) => ({ text: o.text, done: o.done && success }))) : null;
  s.stats.bestCombo = Math.max(s.stats.bestCombo || 0, st.bestCombo);
  s.stats.questionCatches = (s.stats.questionCatches || 0) + st.stats.questionCatches;
  s.stats.coinsEarned = (s.stats.coinsEarned || 0) + coins;
  G.persist();
  G.Analytics.levelEnd(cfg, { success, stars, errors: st.stats.errors, score: st.score, acc });
  G.Cloud.flush();
  const unlocked = G.checkAchievements();
  const story = firstClear && cfg.boss && !cfg.nightmare ? G.STORY.outro[cfg.city.id] : null;
  const challengeCode = !cfg.daily && !cfg.event && !cfg.weekly && !cfg.nightmare ? G.makeChallengeCode(cfg.g, st.seed, st.score) : null;
  const rushInfo = cfg.bossMech === 'rush' ? { done: correctCount, target: cfg.rushTarget } : null;
  const mystery = st.mystery ? { solved: st.mystery.solved } : null;
  G.UI.results({ cfg, mistakes: st.mistakes.slice(), success, stars, score: st.score, correct, total: st.results.length, acc, caught: st.caught, bestCombo: st.bestCombo, coins, xp, newAlbum: st.newAlbum.slice(), bestMoment: st.bestMoment, rankUp, firstClear, objectives, unlocked, story, challengeCode, challenge: cfg.challengeScore != null ? { target: cfg.challengeScore, beat: st.score > cfg.challengeScore } : null, eventReward, rushInfo, mystery, weekly });
  Game.cleanup();
}

function finishEndless() {
  cancelAnimationFrame(st.raf);
  const s = G.save;
  const stations = st.stationsCleared;
  const correct = st.results.filter((r) => r.correct).length;
  const acc = st.results.length ? Math.round((correct / st.results.length) * 100) : 0;
  const coins = st.coins + stations * G.ECO.endlessStation;
  const xp = Math.round(st.score / 10);
  const prevRank = G.rankOf(s.xp).index;
  const record = st.score > s.endless.best;
  s.endless.best = Math.max(s.endless.best, st.score);
  s.endless.bestStation = Math.max(s.endless.bestStation, stations);
  s.endless.runs++;
  if (stations) G.missionEvent('stations', stations);
  G.missionEvent('combo', st.bestCombo, 'max');
  s.xp += xp;
  s.coins += coins;
  s.stats.shifts++;
  s.stats.bestCombo = Math.max(s.stats.bestCombo || 0, st.bestCombo);
  s.stats.questionCatches = (s.stats.questionCatches || 0) + st.stats.questionCatches;
  s.stats.coinsEarned = (s.stats.coinsEarned || 0) + coins;
  G.persist();
  G.Analytics.levelEnd(st.cfg, { success: true, stars: 0, errors: st.stats.errors, score: st.score, acc });
  G.Cloud.flush();
  const unlocked = G.checkAchievements();
  G.Audio.play(record ? 'win' : 'lose', { onEnd: () => G.Audio.play('map') });
  G.UI.endlessResults({ cfg: st.cfg, score: st.score, stations, record, caught: st.caught, acc, bestCombo: st.bestCombo, coins, xp, perks: st.perks.slice(), newAlbum: st.newAlbum.slice(), rankUp: G.rankOf(s.xp).index > prevRank, unlocked });
  Game.cleanup();
}

/* ---------- Mini-événements ---------- */
function planMiniEvent(count, base) {
  if (count < 5) return;
  const r = G.rng((Math.random() * 1e9) | 0);
  st.miniEvent = { type: r.pick(['chase', 'inspector', 'pickpocket']), at: base + r.int(1, count - 3), done: false };
}

/* Déclenche l'inspecteur ou le pickpocket avant le passager prévu. Renvoie true s'il prend la main. */
function maybeMiniEvent() {
  const ev = st.miniEvent;
  if (!ev || ev.done || st.idx < ev.at || st.idx >= st.queue.length) return false;
  if (ev.type === 'inspector') {
    ev.done = true;
    st.watch = { left: 3, ok: true };
    const b = G.el('div', 'station-banner inspector', `<span>Mini-événement</span><b>L'inspecteur t'observe</b><small>3 passagers sans erreur = prime !</small>`);
    st.el.scene.appendChild(b);
    setTimeout(() => b.remove(), 1700);
    G.Audio.sfx('alarm');
    later(nextPassenger, 1500);
    return true;
  }
  if (ev.type === 'pickpocket') {
    ev.done = true;
    runPickpocket(nextPassenger);
    return true;
  }
  return false;
}

function rewardEvent(score, coins, text) {
  setScore(st.score + score);
  st.coins += coins;
  st.el.fines.textContent = st.coins;
  floatText(text, 'combo');
  G.Audio.sfx('open');
  G.missionEvent('events');
}

function endWatch() {
  const ok = st.watch.ok;
  st.watch = null;
  if (ok) later(() => rewardEvent(300, 12, "Bravo ! L'inspecteur te félicite : +300"), 400);
  else later(() => G.toast(`${G.icon('cross')} L'inspecteur a noté une erreur. Pas de prime cette fois.`), 400);
}

/* Course-poursuite : taper vite pour rattraper le fraudeur qui s'enfuit.
   Vue à la première personne : le fuyard, de dos, court vers le bout du wagon ; les mains à plat
   du contrôleur pompent comme celles d'un sprinteur et le rattrapent à chaque appui.
   Rattrapé : une claque sur l'arrière de la tête, « PAF ! ». */
function runChase(done) {
  st.miniEvent.done = true;
  st.state = 'event';
  const need = 8;
  let taps = 0;
  let over = false;
  const runner = st.queue[st.idx - 1];
  const u = G.UNIFORMS.find((x) => x.id === G.save.uniform) || G.UNIFORMS[0];
  const ov = G.el('div', 'mini-ev chase');
  ov.innerHTML = `<div class="mini-card"><div class="mini-kicker">Mini-événement</div><h3>Il s'enfuit !</h3>
    <div class="chase-stage" data-cstage style="--reach:0;--far:1">
      <div class="cs-corridor"></div>
      <div class="cs-runner" data-crunner>${G.drawBack(runner ? runner.look : {})}<i class="cs-dust"></i><i class="cs-dust d2"></i><b class="cs-paf">PAF !</b><i class="cs-stars"></i></div>
      ${G.drawSprintHand('left', u.coat, u.trim)}${G.drawSprintHand('right', u.coat, u.trim)}
      <div class="cs-slap">${G.drawSprintHand('right', u.coat, u.trim)}</div>
    </div>
    <p>Tape vite sur le bouton pour le rattraper.</p>
    <div class="chase-bar"><i data-cbar></i></div><button class="btn btn-primary chase-btn" data-ctap>${G.icon('hand')} Attrape-le !</button><div class="chase-time"><i data-ctime></i></div></div>`;
  st.root.appendChild(ov);
  const bar = G.$('[data-cbar]', ov);
  const tbar = G.$('[data-ctime]', ov);
  const stage = G.$('[data-cstage]', ov);
  const t0 = performance.now();
  const total = 3200;
  // Le fuyard s'éloigne avec le temps ; chaque appui rapproche les mains et regagne du terrain
  const place = (tf) => {
    const prog = taps / need;
    stage.style.setProperty('--reach', prog.toFixed(3));
    stage.style.setProperty('--far', Math.max(0.45, Math.min(1, 0.92 - tf * 0.42 + prog * 0.38)).toFixed(3));
  };
  const finishChase = (won) => {
    if (over) return;
    over = true;
    stage.classList.add(won ? 'caught' : 'escaped');
    if (won) {
      // la main droite part en arc et claque l'arrière de la tête
      later(() => {
        stage.classList.add('slapped');
        G.Audio.sfx('slap');
        G.vibrate([35, 25, 70]);
      }, 210);
    }
    later(() => {
      ov.remove();
      if (!st) return; // le joueur a quitté le service pendant la claque
      if (won) rewardEvent(200, 8, 'Rattrapé ! +200');
      else G.toast(`${G.icon('cross')} Il a filé… Pas grave, l'amende est encaissée.`);
      st.state = 'resolve';
      later(done, 500);
    }, won ? 1050 : 650);
  };
  const tick = () => {
    if (over || !st) return;
    const tf = (performance.now() - t0) / total;
    tbar.style.transform = `scaleX(${Math.max(0, 1 - tf)})`;
    place(Math.min(1, tf));
    if (tf >= 1) return finishChase(false);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  G.$('[data-ctap]', ov).addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (over) return;
    taps++;
    G.Audio.sfx('tap');
    G.vibrate(10);
    bar.style.transform = `scaleX(${Math.min(1, taps / need)})`;
    // petit élan des mains vers l'avant à chaque appui
    stage.classList.remove('lunge');
    void stage.offsetWidth;
    stage.classList.add('lunge');
    place(Math.min(1, (performance.now() - t0) / total));
    if (taps >= need) finishChase(true);
  });
  G.Audio.sfx('whistle');
}

/* Pickpocket : un indice, trois suspects, 6 secondes */
function runPickpocket(done) {
  const pk = G.buildPickpocket(G.rng((Math.random() * 1e9) | 0));
  if (!pk) return done();
  st.state = 'event';
  let over = false;
  const ov = G.el('div', 'mini-ev');
  ov.innerHTML = `<div class="mini-card"><div class="mini-kicker">Mini-événement</div><h3>Au voleur !</h3><p class="pk-clue">${G.icon('camera')} ${pk.clue}</p>
    <div class="pk-list">${pk.looks.map((l, i) => `<button class="pk" data-pk="${i}">${G.drawPerson(l, { photo: true })}</button>`).join('')}</div><div class="chase-time"><i data-ptime></i></div></div>`;
  st.root.appendChild(ov);
  G.Audio.sfx('alarm');
  const t0 = performance.now();
  const total = 6000;
  const end = (won) => {
    if (over) return;
    over = true;
    ov.remove();
    if (won) rewardEvent(150, 6, 'Voleur attrapé ! +150');
    else G.toast(`${G.icon('cross')} Raté, le voleur s'est échappé.`);
    st.state = 'idle';
    later(done, 500);
  };
  const tick = () => {
    if (over || !st) return;
    const k = 1 - (performance.now() - t0) / total;
    G.$('[data-ptime]', ov).style.transform = `scaleX(${Math.max(0, k)})`;
    if (k <= 0) return end(false);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  G.$$('[data-pk]', ov).forEach((b) => b.addEventListener('click', () => end(Number(b.dataset.pk) === pk.thief)));
}

/* ---------- Mode fièvre ---------- */
function startFever() {
  if (!st || st.state === 'end') return;
  st.feverUntil = performance.now() + 10000;
  st.root.classList.add('fever');
  floatText('FIÈVRE ! Gains x2', 'combo');
  G.Audio.sfx('combo', 10);
  G.Audio.setTempo(1.18);
  later(() => {
    st.root.classList.remove('fever');
    G.Audio.setTempo(1 + Math.min(st.combo, 10) * 0.012);
  }, 10000);
}

/* ---------- Avertissement : pour une petite infraction, sans amende ---------- */
function warnPassenger() {
  if (!st || st.state !== 'inspect' || st.paused) return;
  const p = curP();
  if (!p.minor) return;
  showBubble("Oups, pardon ! J'arrête tout de suite.", 'happy');
  decide('ok', false, true);
}

/* ---------- Boss de Paris : tirer sur la moustache ---------- */
function pullMustache() {
  if (st.state !== 'inspect' || st.pulled) return;
  const p = curP();
  if (!G.hasMustache(p.look)) return;
  st.pulled = true;
  const paxEl = G.$('.pax', st.el.pax);
  if (p.fakeMustache) {
    st.timeLeft = Math.max(0.6, st.timeLeft - 0.5);
    if (paxEl) paxEl.innerHTML = G.drawPerson(Object.assign({}, p.look, { facial: 'none' }), { mood: 'shock', holding: holdingOf(p) });
    showBubble('Ma… ma moustache !', 'nervous');
    floatText('Fausse moustache !', 'combo');
    G.Audio.sfx('hint');
  } else {
    st.timeLeft = Math.max(0.6, st.timeLeft - 1);
    if (paxEl) paxEl.innerHTML = G.drawPerson(p.look, { mood: 'angry', holding: holdingOf(p) });
    showBubble('Aïe ! Elle est vraie !', 'angry');
    G.Audio.sfx('error');
  }
}

/* ---------- Boss du train de nuit : lampe torche ---------- */
function moveLamp(ev) {
  const r = st.el.docs.getBoundingClientRect();
  const x = ev.clientX - r.left;
  const y = ev.clientY - r.top - (ev.pointerType === 'touch' ? 46 : 0);
  st.el.docs.style.setProperty('--lx', `${x}px`);
  st.el.docs.style.setProperty('--ly', `${y}px`);
}

/* ---------- Boss des jumeaux : avis de recherche ---------- */
function showWanted() {
  if (!st.wanted) return;
  const was = st.paused;
  st.paused = true;
  const m = G.modal(`<div class="wanted-modal"><div class="wanted-poster big"><b>RECHERCHÉ</b>${G.drawPerson(st.wanted, { photo: true })}<span>Verbalise-le, même avec des papiers en règle.</span></div><button class="btn btn-primary" data-ok>Reprendre</button></div>`);
  const close = () => {
    m.close();
    if (st) st.paused = was;
  };
  G.$('[data-ok]', m.el).addEventListener('click', close);
  m.onDismiss = close;
}

/* ---------- Boss du Grand Express : enquête ---------- */
function revealClue() {
  const my = st.mystery;
  if (!my || my.revealed >= my.clues.length) return;
  const correct = st.results.filter((r) => r.correct).length;
  const step = Math.max(1, Math.floor((st.queue.length - 2) / (my.clues.length + 1)));
  if (correct >= step * (my.revealed + 1)) {
    const clue = my.clues[my.revealed];
    my.revealed++;
    later(() => G.toast(`${G.icon('camera')} Indice : ${clue}`, 'info'), 700);
    const t = G.$('[data-mysterytxt]', st.root);
    if (t) t.textContent = `Indices ${my.revealed}/${my.clues.length}`;
  }
}

function cluesHtml() {
  const my = st.mystery;
  return `<ul class="clue-list">${my.clues.map((c, i) => `<li class="${i < my.revealed ? '' : 'locked'}">${G.icon(i < my.revealed ? 'camera' : 'lock')}<span>${i < my.revealed ? c : 'Indice à découvrir'}</span></li>`).join('')}</ul>`;
}

function showClues() {
  if (!st.mystery) return;
  const was = st.paused;
  st.paused = true;
  const m = G.modal(`<div class="obj-modal"><h2>L'enquête</h2><p>Les bonnes décisions révèlent des indices sur le coupable.</p>${cluesHtml()}<button class="btn btn-primary" data-ok>Reprendre</button></div>`);
  const close = () => {
    m.close();
    if (st) st.paused = was;
  };
  G.$('[data-ok]', m.el).addEventListener('click', close);
  m.onDismiss = close;
}

function accuse(done) {
  const my = st.mystery;
  my.revealed = my.clues.length; // tous les indices sont dévoilés pour l'accusation
  const m = G.modal(`<div class="accuse"><div class="mini-kicker">Fin du service</div><h2>Qui est le coupable ?</h2>${cluesHtml()}
    <div class="pk-list four">${my.suspects.map((q, i) => `<button class="pk" data-sus="${i}">${G.drawPerson(q.look, { photo: true })}<span>${q.idName.split(' ')[0]}</span></button>`).join('')}</div></div>`, { cls: 'modal-accuse', dismissable: false });
  G.$$('[data-sus]', m.el).forEach((b) => b.addEventListener('click', () => {
    const chosen = my.suspects[Number(b.dataset.sus)];
    my.solved = chosen === my.culprit;
    st.mysterySolved = my.solved;
    m.close();
    if (my.solved) {
      setScore(st.score + 500);
      st.coins += G.ECO.mystery;
      G.Audio.sfx('open');
      G.toast(`${G.icon('trophy')} Coupable démasqué ! +500 points`, 'gold');
    } else {
      G.Audio.sfx('wrong');
      G.toast(`${G.icon('cross')} Raté : c'était ${my.culprit.idName}.`);
    }
    setTimeout(done, 900);
  }));
}

/* ---------- Bonus à usage unique (choisis au briefing) ---------- */
function boostPicker(cfg) {
  if (!G.boostsAllowed(cfg)) return '';
  const owned = G.CONSUMABLES.filter((c) => (G.save.items[c.id] || 0) > 0 && G.boostAllowed(cfg, c.id));
  if (!owned.length) return '';
  return `<div class="boost-pick"><h4>${G.icon('bolt')} Bonus pour ce service</h4><div class="boost-row">${owned.map((c) => `<button class="boost-btn" data-boost="${c.id}">${G.icon(c.icon)}<span>${c.name}</span><em>×${G.save.items[c.id]}</em></button>`).join('')}</div></div>`;
}

function applyBoosts(ids) {
  if (!st || !ids.length) return;
  ids.forEach((id) => {
    if (!(G.save.items[id] > 0) || !G.boostAllowed(st.cfg, id)) return;
    G.save.items[id]--;
    st.boosts.push(id);
    if (id === 'coffee') {
      st.timeBonus += 2;
      st.time += 2 * G.timeScale();
    }
    if (id === 'magnifier') st.loupeLeft += 3;
    if (id === 'double') st.doubleCoins = true;
  });
  G.persist();
  updateTools();
  G.toast(`${G.icon('bolt')} Bonus actif : ${st.boosts.map((id) => G.CONSUMABLES.find((c) => c.id === id).name).join(', ')}`, 'gold');
}

/* Loupe : désigne le détail suspect du passager, ou confirme que tout va bien */
function useLoupe() {
  if (!st || st.state !== 'inspect' || st.paused || st.loupeLeft <= 0) return;
  const p = curP();
  st.loupeLeft--;
  updateTools();
  G.Audio.sfx('uv');
  const fraud = st.cfg.inverted ? !p.fraud : p.fraud;
  if (!fraud) return G.toast(`${G.icon('loupe')} La loupe ne trouve rien de suspect.`, 'good');
  const el = p.hint && G.$(`[data-f="${p.hint}"]`, st.el.docs);
  if (el) {
    el.classList.remove('loupe-hit');
    void el.offsetWidth;
    el.classList.add('loupe-hit');
  }
  G.toast(`${G.icon('loupe')} ${el ? 'Regarde bien ce détail…' : 'Ce passager cache quelque chose…'}`, 'gold');
}

/* Compagnon : petite réaction à chaque décision */
function petReact(mood, catchIt) {
  const pet = G.cosEquipped('pet');
  if (!st.el.pet || pet === 'none') return;
  const el = st.el.pet;
  el.classList.remove('pet-happy', 'pet-sad');
  void el.offsetWidth;
  el.classList.add(mood === 'happy' ? 'pet-happy' : 'pet-sad');
  if (catchIt || mood !== 'happy' || Math.random() < 0.35) {
    st.el.petSay.textContent = G.petSay(pet, mood);
    st.el.petSay.hidden = false;
    later(() => { if (st && st.el.petSay) st.el.petSay.hidden = true; }, 1100);
  }
}

/* ---------- Boss de Berlin : revoir les images des caméras ---------- */
function showMemory() {
  if (!st || !st.memory) return;
  const was = st.paused;
  st.paused = true;
  if (st.state === 'inspect') {
    setScore(Math.max(0, st.score - 150));
    floatText('-150', 'bad');
  }
  const m = G.modal(`<div class="wanted-modal"><div class="memory-poster"><b>${G.icon('camera')} Caméra 3 · portillon nord</b><div class="memory-faces">${st.memory.map((l) => `<div>${G.drawPerson(l, { photo: true })}</div>`).join('')}</div><span>Verbalise-les, même avec un ticket valable.</span></div><button class="btn btn-primary" data-ok>Reprendre</button></div>`);
  const close = () => {
    m.close();
    if (st) st.paused = was;
  };
  G.$('[data-ok]', m.el).addEventListener('click', close);
  m.onDismiss = close;
}

/* Musique du service : en Cauchemar, plus lente et plus grave */
function serviceMusic() {
  return st.cfg.nightmare ? { restart: true, tempo: 0.82, pitch: 0.89 } : { restart: true };
}

/* ---------- Mode Cauchemar : papiers possédés ---------- */
function possess(p) {
  if (!st || curP() !== p || st.state !== 'inspect') return;
  const docs = st.el.docs;
  if (!p.possess.fake) {
    p.ticket.dayOffset = p.possess.dayOffset;
    const slot = G.$('[data-zoomable="ticket"]', docs);
    if (slot) slot.innerHTML = G.renderTicket(p, st.cfg, st.ctx);
    const f = G.$('[data-f="date"]', docs);
    if (f) f.classList.add('possessed-field');
  }
  docs.classList.remove('possessed');
  void docs.offsetWidth;
  docs.classList.add('possessed');
  G.Audio.sfx('tick');
  G.vibrate(30);
}
