// Trois mini-jeux (portillon, portes, faux malaise) : réussite et échec, sans erreur
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const levels = {}; for (let i = 0; i < 20; i++) levels[i] = 3;
await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify({ v:1, lang:'fr', seenVersion:'99.0.0', fullChecked:true, full:true, tutorialDone:true, levels, settings:{music:false,sfx:false} }));
await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(700);
const CLIP = { x: 15, y: 200, width: 360, height: 360 };
const start = async (type) => {
  await p.evaluate((type) => { G.$$('.modal, .mini-ev').forEach(m => m.remove()); G.Game.start(Object.assign(G.levelConfig(16), { specialRate: 0 })); const s = G.Game.debugState(); s.miniEvent = { type, at: 1, done: false }; }, type);
  await p.waitForTimeout(400); await p.click('[data-go]');
  for (let k = 0; k < 30; k++) { const s = await p.evaluate(() => G.Game.debugState().state); if (s === 'inspect') break; await p.waitForTimeout(150); }
  const f = await p.evaluate(() => G.Game.debugState().queue[0].fraud);
  await p.keyboard.press(f ? 'ArrowLeft' : 'ArrowRight');
  await p.waitForSelector('.mini-ev.ms-' + type, { timeout: 6000 });
  return p.$eval('[data-mstage]', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
};
const after = async () => { await p.waitForTimeout(2200); return p.evaluate(() => ({ overlay: !!document.querySelector('.mini-ev'), state: G.Game.debugState() && G.Game.debugState().state, score: G.Game.debugState() && G.Game.debugState().score })); };
const out = {};
// Tourniquet : réussi
let c = await start('turnstile');
await p.waitForTimeout(700); 
await p.waitForSelector('.ms-stage.in-zone', { timeout: 4000 }); await p.mouse.click(c.x, c.y); await p.waitForTimeout(250); 
out.turnstileWin = await p.evaluate(() => !!document.querySelector('.ms-stage.won'));
out.ts = await after();
// Tourniquet : trop tôt
c = await start('turnstile'); await p.waitForTimeout(450); await p.mouse.click(c.x, c.y); await p.waitForTimeout(200);
out.turnstileEarly = await p.evaluate(() => !!document.querySelector('.ms-stage.missed')); // touché trop tôt : il finit son saut puis nargue
  await p.waitForTimeout(1800);
  out.turnstileTaunt = await p.evaluate(() => !!document.querySelector('.ms-stage.lost') || !document.querySelector('.mini-ev'));
await after();
// Portes : réussi (glisser vers le haut)
c = await start('doors'); await p.waitForTimeout(600); 
await p.mouse.move(c.x, c.y + 60); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(c.x, c.y + 60 - i * 16); await p.waitForTimeout(16); } await p.mouse.up();
await p.waitForTimeout(250); 
out.doorsWin = await p.evaluate(() => !!document.querySelector('.ms-stage.won'));
await after();
// Portes : trop tard
c = await start('doors'); await p.waitForTimeout(2500); 
out.doorsLate = await p.evaluate(() => !!document.querySelector('.ms-stage.lost'));
await after();
// Malaise : maintenir 2,1 s
c = await start('faint'); await p.waitForTimeout(500); 
await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.waitForTimeout(1100); 
await p.waitForTimeout(1000); await p.mouse.up(); await p.waitForTimeout(300); 
out.faintWin = await p.evaluate(() => !!document.querySelector('.ms-stage.won'));
await after();
// Malaise : on lâche trop tôt et on n'y revient pas
c = await start('faint'); await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.waitForTimeout(800); await p.mouse.up(); await p.waitForTimeout(5000);
out.faintLost = await p.evaluate(() => !!document.querySelector('.ms-stage.lost') || !document.querySelector('.mini-ev'));
const fin = await after();
const bad = Object.entries(out).filter(([k, v]) => v !== true && typeof v === 'boolean').map(([k]) => k);
  console.log(JSON.stringify(out));
  errs.forEach((e) => bad.push('PAGEERROR ' + e));
  console.log(bad.length ? 'PROBLEMS ' + bad.join(' ; ') : 'problèmes 0');
await b.close(); })();
