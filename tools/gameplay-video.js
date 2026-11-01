// Tournage d'une vidéo de gameplay de 30 s : vraie partie pilotée à la souris, capture image par image (CDP screencast)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const LANG = process.argv[2] || 'fr';
const OUT = path.join(__dirname, '..', 'dist', 'video', 'frames-' + LANG); // images + list.txt pour ffmpeg (voir store/PUBLIER.md)
const CAP = {
  fr: { c1: 'Tu es contrôleur de métro', c2: 'Vérifie les tickets…', c3: '…et démasque les fraudeurs !', c4: 'Arrache les fausses moustaches', c5: 'Traque les faux tampons sous UV', c6: 'Contrôle dans le noir', c7: '11 villes · 11 boss', end1: 'Essai gratuit', end2: 'Jeu complet : 2,99 €', end3: 'Sans pub · Sans collecte de données', end4: 'Bientôt sur Google Play' },
  en: { c1: "You're a metro ticket inspector", c2: 'Check the tickets…', c3: '…and catch the fare dodgers!', c4: 'Rip off the fake moustaches', c5: 'Hunt fake stamps under UV', c6: 'Inspect in the dark', c7: '11 cities · 11 bosses', end1: 'Free to try', end2: 'Full game: €2.99', end3: 'No ads · No data collected', end4: 'Coming soon to Google Play' },
}[LANG];

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  const levels = {};
  for (let i = 0; i < 110; i++) levels[i] = 3;
  await p.addInitScript(([s]) => localStorage.setItem('ticketsvp.save.v1', s), [JSON.stringify({ v: 1, lang: LANG, seenVersion: '99.0.0', fullChecked: true, full: true, tutorialDone: true, coins: 1240, gold: 18, xp: 5200, levels, chest: { last: '99999999' }, daily: { last: '99999999', streak: 6 }, settings: { music: false, sfx: false, consentAsked: true } })]);
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(1200);
  // Légendes et carte de fin, hors du jeu (data-notr : pas retraduites)
  await p.addStyleTag({ content: `
    #vcap { position: fixed; left: 0; right: 0; top: 0; z-index: 9999; padding: 26px 18px 34px; text-align: center; pointer-events: none;
      background: linear-gradient(rgba(16,22,44,.92), rgba(16,22,44,.75) 70%, rgba(16,22,44,0)); color: #fff;
      font: 400 34px/1.1 'Lilita One', sans-serif; letter-spacing: .5px; text-shadow: 0 3px 0 #000; opacity: 0; transform: translateY(-14px); transition: opacity .25s, transform .25s; }
    #vcap.on { opacity: 1; transform: none; }
    #vend { position: fixed; inset: 0; z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
      background: radial-gradient(circle at 50% 35%, #2b3a78, #121a36 70%); color: #fff; text-align: center; opacity: 0; transition: opacity .35s; font-family: 'Nunito', sans-serif; }
    #vend.on { opacity: 1; }
    #vend .logo-svg { width: 360px; height: auto; animation: popIn .5s cubic-bezier(.2,1.4,.4,1) both; }
    #vend b { font: 400 40px/1.1 'Lilita One', sans-serif; color: #ffd23f; text-shadow: 0 3px 0 #000; }
    #vend span { font-size: 26px; font-weight: 900; }
    #vend em { font-style: normal; font-size: 20px; font-weight: 800; opacity: .85; margin-top: 18px; padding: 8px 18px; border: 2px solid rgba(255,255,255,.5); border-radius: 99px; }
  ` });
  await p.evaluate(() => { const c = document.createElement('div'); c.id = 'vcap'; c.dataset.notr = '1'; document.body.appendChild(c); });
  const cap = async (txt) => {
    await p.evaluate((t) => { const c = document.getElementById('vcap'); if (!t) return c.classList.remove('on'); c.textContent = t; c.classList.add('on'); }, txt);
  };

  // Capture
  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  let rec = false;
  const marks = {};
  cdp.on('Page.screencastFrame', async (f) => {
    if (rec) frames.push({ t: f.metadata.timestamp, data: f.data });
    await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  // Petit mouvement permanent : l'écran change toujours, donc des images arrivent en continu
  await p.evaluate(() => { const d = document.createElement('i'); d.style.cssText = 'position:fixed;left:0;bottom:0;width:1px;height:1px;z-index:99999;pointer-events:none'; document.body.appendChild(d); let k = 0; (function tick() { d.style.opacity = (k++ % 2) ? '0.011' : '0.012'; requestAnimationFrame(tick); })(); });
  const W = (ms) => p.waitForTimeout(ms);
  const order = [];
  const scene = (name) => { order.push([name, frames.length]); rec = true; };
  const cut = () => { rec = false; };
  const state = () => p.evaluate(() => { const s = G.Game.debugState(); return s ? { st: s.state, idx: s.idx, fraud: s.queue[s.idx] && s.queue[s.idx].fraud, paused: s.paused } : null; });
  const waitInspect = async () => { for (let k = 0; k < 40; k++) { const s = await state(); if (s && s.st === 'inspect' && !s.paused) return s; await W(150); } return state(); };
  const pax = () => p.$eval('[data-pax]', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.45 }; });
  const swipe = async (dir) => {
    const c = await pax();
    await p.mouse.move(c.x, c.y);
    await p.mouse.down();
    for (let i = 1; i <= 14; i++) { await p.mouse.move(c.x + dir * i * 13, c.y + i * 0.6); await W(22); }
    await p.mouse.up();
  };
  const decideRight = async () => { const s = await waitInspect(); await W(650); await swipe(s.fraud ? -1 : 1); await W(700); };
  const startLevel = async (g, extra = {}) => {
    await p.evaluate(([g, extra]) => {
      G.$$('.modal').forEach((m) => m.remove());
      G.Game.start(Object.assign(G.levelConfig(g), { specialRate: 0 }, extra));
      const s = G.Game.debugState();
      s.miniEvent = null; // pas de mini-événement qui cache l'écran
      // boss de Paris : le premier passager porte une fausse moustache
      const i = s.queue.findIndex((q) => q.fakeMustache);
      if (i > 0) [s.queue[0], s.queue[i]] = [s.queue[i], s.queue[0]];
    }, [g, extra]);
    await W(500);
    await p.click('[data-go]');
  };

  // 1. Écran titre
  scene('title');
  await cap(CAP.c1);
  await W(3000);
  // 2. Paris : trois décisions
  cut();
  await cap('');
  await startLevel(16);
  await waitInspect();
  scene('paris');
  await cap(CAP.c2);
  await W(500);
  // premier passager en règle, deuxième fraudeur : on force pour montrer les deux gestes
  await p.evaluate(() => { const s = G.Game.debugState(); });
  await decideRight();
  await cap(CAP.c3);
  await decideRight();
  await decideRight();
  // 3. Boss de Paris : fausse moustache
  cut();
  await cap('');
  await startLevel(19);
  await waitInspect();
  console.log('moustache', await p.evaluate(() => { const s = G.Game.debugState(); return !!s.queue[s.idx].fakeMustache; }));
  scene('mustache');
  await cap(CAP.c4);
  await W(700);
  const m = await pax();
  await p.mouse.move(m.x, m.y + 10); await p.mouse.down(); await W(60); await p.mouse.up();
  await W(1300);
  await swipe(-1);
  await W(800);
  // 4. Boss de Londres : faux tampons sous UV
  cut();
  await cap('');
  await startLevel(29);
  await waitInspect();
  scene('uv');
  await cap(CAP.c5);
  await W(500);
  await p.click('[data-act="uv"]');
  await W(900);
  await p.click('[data-zoomable="ticket"]');
  await W(1900);
  await p.mouse.click(12, 940);
  await W(400);
  // 5. Train de nuit : contrôle à la lampe
  cut();
  await cap('');
  await startLevel(59);
  await waitInspect();
  scene('dark');
  await cap(CAP.c6);
  const box = await p.$eval('.docs', (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  for (let i = 0; i <= 46; i++) { await p.mouse.move(box.x + 20 + (box.w - 40) * (0.5 - 0.5 * Math.cos(i / 46 * Math.PI * 2)), box.y + box.h * (0.35 + 0.3 * Math.sin(i / 46 * Math.PI))); await W(55); }
  // 6. Venise et Mars : 11 villes, 11 boss
  cut();
  await cap('');
  await startLevel(99);
  await waitInspect();
  scene('venise');
  await cap(CAP.c7);
  await W(1500);
  cut();
  await startLevel(109);
  await waitInspect();
  scene('mars');
  await W(1500);
  // 7. Carte de fin
  await cap('');
  await p.evaluate((C) => {
    const e = document.createElement('div'); e.id = 'vend'; e.dataset.notr = '1';
    e.innerHTML = `${G.drawLogo()}<b>${C.end1}</b><span>${C.end2}</span><span>${C.end3}</span><em>${C.end4}</em>`;
    document.body.appendChild(e); requestAnimationFrame(() => e.classList.add('on'));
  }, CAP);
  scene('end');
  await W(4600);
  cut();
  await cdp.send('Page.stopScreencast');

  // Écriture des images et de leurs durées (fichier concat pour ffmpeg), sans les passages coupés
  let list = '';
  let total = 0;
  const T0 = frames[0].t;
  for (let i = 0; i < frames.length; i++) {
    const name = `f${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, name), Buffer.from(frames[i].data, 'base64'));
    let d = i + 1 < frames.length ? frames[i + 1].t - frames[i].t : 1 / 30;
    if (d > 0.25) d = 1 / 30; // saut = coupe entre deux scènes
    total += d;
    list += `file '${name}'\nduration ${d.toFixed(4)}\n`;
  }
  list += `file 'f${String(frames.length - 1).padStart(5, '0')}.jpg'\n`;
  fs.writeFileSync(path.join(OUT, 'list.txt'), list);
  order.forEach(([n, i], k) => { const j = k + 1 < order.length ? order[k + 1][1] : frames.length; let d = 0; for (let q = i; q < j - 1; q++) { const g = frames[q + 1].t - frames[q].t; d += g > 0.25 ? 1 / 30 : g; } console.log(n, d.toFixed(1) + ' s'); });
  console.log('images', frames.length, 'durée', total.toFixed(1), 's', errs.length ? 'ERREURS ' + errs.join(' | ') : 'NO ERRORS');
  await b.close();
})();
