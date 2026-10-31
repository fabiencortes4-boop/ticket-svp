const { chromium } = require('playwright');
const save = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 100, xp: 3000, levels: {}, tutorialDone: true, settings: { music: false, sfx: false, consentAsked: true } };
for (let i = 0; i < 30; i++) save.levels[i] = 2;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  const months = [[0, 28], [1, 10], [2, 5], [3, 1], [3, 10], [4, 5], [5, 20], [6, 14], [8, 3], [9, 28], [10, 20], [11, 12]];
  for (const [m, d] of months) {
    const r = await p.evaluate(([m, d]) => { const e = G.currentEvent(new Date(2027, m, d)); return e ? e.id : '-'; }, [m, d]);
    process.stdout.write(`${d}/${m + 1}:${r}  `);
  }
  console.log();
  await p.evaluate(() => { const real = G.today; G.today = () => new Date(2027, 1, 10); });
  await p.evaluate(() => G.UI.map()); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/c1-map-valentin.png' });
  await p.click('[data-event]'); await p.waitForTimeout(500);
  await p.click('[data-go]'); await p.waitForTimeout(3200);
  await p.screenshot({ path: 'shots/c2-game-valentin.png' });
  await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); G.UI.shop('style', 'stamp'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.page').scrollTop = 9999);
  await p.screenshot({ path: 'shots/c3-shop-event.png' });
  console.log('love stamp listed', !!(await p.$('[data-buy-cos="stamp:love"]')), 'pumpkin hidden', !(await p.$('[data-buy-cos="stamp:pumpkin"]')));
  await p.evaluate(() => { G.today = () => new Date(2027, 6, 14); G.Game.start(G.eventConfig(G.currentEvent())); });
  await p.waitForTimeout(400); await p.click('[data-go]'); await p.waitForTimeout(3200);
  await p.screenshot({ path: 'shots/c4-game-ete.png' });
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
