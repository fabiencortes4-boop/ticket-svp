const { chromium } = require('playwright');
const save = {v:1, coins: 3000, gold: 80, xp: 9000, levels: {}, tools:{watch:1, uv:2, whistle:1, badge:0}, tutorialDone:true, album:{}, owned:['classic']};
for (let i=0;i<69;i++) save.levels[i]=2;
const W = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + e.stack));
  await p.addInitScript(s => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await W(700);
  await p.click('[data-play]'); await W(400);
  await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
  await p.screenshot({ path: 'shots/b0-map.png' });
  // rule cards
  for (const g of [0, 2, 5, 10, 13, 20, 40, 45, 60]) {
    await p.evaluate((g) => G.Game.start(G.levelConfig(g)), g); await W(350);
    const el = await p.$('.rule-card');
    if (el) await el.screenshot({ path: `shots/b1-rule-${g}.png` });
  }
  // bosses: briefing screenshot + start
  for (const g of [9, 19, 29, 39, 49, 59, 69]) {
    await p.evaluate((g) => G.Game.start(G.levelConfig(g)), g); await W(350);
    await p.screenshot({ path: `shots/b2-boss-${g}.png` });
    await p.click('[data-go]'); await W(2800);
    if (g === 19) { // mustache pull on a fake mustache passenger
      await p.evaluate(() => { const s = G.Game.debugState(); const i = s.queue.findIndex((q, k) => k > s.idx && q.fakeMustache); return i; });
    }
    if (g === 59) await p.mouse.move(120, 640);
    await p.screenshot({ path: `shots/b3-boss-${g}.png` });
  }
  // mystery accusation: play express boss to the end quickly
  await p.evaluate(() => G.Game.start(G.levelConfig(69))); await W(350);
  await p.click('[data-go]'); await W(2800);
  for (let i = 0; i < 400; i++) {
    const s = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return { done: true }; const q = s.queue[s.idx]; return { st: s.state, pa: s.paused, f: q && q.fraud, modal: !!document.querySelector('.modal-accuse') }; });
    if (s.done || s.modal) break;
    if (s.st === 'inspect' && !s.pa) await p.click(s.f ? '[data-act="fine"]' : '[data-act="ok"]');
    await W(120);
  }
  await W(500);
  await p.screenshot({ path: 'shots/b4-accuse.png' });
  if (await p.$('[data-sus]')) { await p.click('[data-sus]'); await W(2500); }
  await p.screenshot({ path: 'shots/b5-results.png' });
  // mini events + warn on a normal level
  await p.evaluate(() => G.Game.start(G.levelConfig(25))); await W(350);
  await p.click('[data-go]'); await W(2800);
  await p.evaluate(() => { const s = G.Game.debugState(); s.queue[s.idx + 1].minor = G.MINOR[0]; s.queue[s.idx+1].fraud = false; s.miniEvent = { type: 'pickpocket', at: s.idx + 2, done: false }; });
  let f = await p.evaluate(() => G.Game.debugState().queue[G.Game.debugState().idx].fraud);
  await p.click(f ? '[data-act="fine"]' : '[data-act="ok"]'); await W(1300);
  await p.screenshot({ path: 'shots/b6-warn.png' });
  if (await p.isVisible('[data-act="warn"]')) await p.click('[data-act="warn"]');
  await W(1500);
  await p.screenshot({ path: 'shots/b7-pickpocket.png' });
  if (await p.$('[data-pk]')) await p.click('[data-pk]');
  await W(1500);
  await p.evaluate(() => { const s = G.Game.debugState(); s.miniEvent = { type: 'chase', at: 0, done: false }; s.queue[s.idx].fraud = true; });
  await p.click('[data-act="fine"]'); await W(1400);
  await p.screenshot({ path: 'shots/b8-chase.png' });
  for (let k = 0; k < 9; k++) { if (await p.$('[data-ctap]')) await p.click('[data-ctap]'); await W(60); }
  await W(800);
  console.log('state after chase', await p.evaluate(() => G.Game.debugState() && G.Game.debugState().state));
  // event + missions + code modal
  await p.evaluate(() => { G.Game.cleanup(); G.UI.map(); }); await W(400);
  await p.click('[data-missions]'); await W(400);
  await p.screenshot({ path: 'shots/b9-missions.png' });
  await p.mouse.click(10, 10); await W(300);
  await p.evaluate(() => G.UI.map()); await W(300);
  await p.click('[data-code]'); await W(300);
  await p.fill('#challenge-code', '5-1A2B3C-3E8'); await p.click('form [type="submit"]'); await W(500);
  await p.screenshot({ path: 'shots/b10-challenge.png' });
  await p.evaluate(() => G.Game.start(G.eventConfig(G.currentEvent()))); await W(400);
  await p.click('[data-go]'); await W(2800);
  await p.screenshot({ path: 'shots/b11-event.png' });
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
