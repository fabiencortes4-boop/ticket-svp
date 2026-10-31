const { chromium } = require('playwright');
// Joueur équipé au maximum : montre 5, badge 2, sifflet 3, chrono lent, café et loupe en stock
const save = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 20, xp: 9000, levels: {}, tutorialDone: true, tools: { watch: 5, uv: 3, whistle: 3, badge: 2 }, items: { coffee: 3, magnifier: 3, double: 3 }, settings: { music: false, sfx: false, consentAsked: true, slow: true } };
for (let i = 0; i < 110; i++) save.levels[i] = 2;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  const times = await p.evaluate(() => [0, 9, 30, 59, 79, 89, 99, 109].map((g) => `${g}:${G.nightmareConfig(g).time.toFixed(1)}`).join(' '));
  console.log('temps de config', times);
  for (const g of [0, 59]) {
    await p.evaluate((g) => G.Game.start(G.nightmareConfig(g)), g);
    await p.waitForTimeout(400);
    const picker = await p.$$eval('[data-boost]', (x) => x.map((e) => e.dataset.boost));
    for (const id of picker) await p.click(`[data-boost="${id}"]`);
    await p.click('[data-go]'); await p.waitForTimeout(3000);
    const s = await p.evaluate(() => { const s = G.Game.debugState(); return { time: s.time, rep: s.maxRep, whistle: s.whistleLeft, loupe: s.loupeLeft, boosts: s.boosts }; });
    console.log('cauchemar', g, 'bonus proposés', picker, JSON.stringify(s));
    await p.screenshot({ path: `shots/n8-game-${g}.png` });
    await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); });
  }
  await p.evaluate(() => G.Game.start(G.levelConfig(0))); await p.waitForTimeout(300);
  console.log('mode normal, même joueur', await p.evaluate(() => { const s = G.Game.debugState(); return JSON.stringify({ time: s.time, rep: s.maxRep, whistle: s.whistleLeft }); }));
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
