const { chromium } = require('playwright');
const save = {v:1, coins: 500, gold: 10, xp: 900, levels: {}, tools:{watch:0, uv:1, whistle:1, badge:0}, tutorialDone:true};
for (let i=0;i<39;i++) save.levels[i]=2;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2 }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + e.stack));
  await p.addInitScript(s => { localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(500);
  await p.click('[data-play]'); await p.waitForTimeout(400);
  // Boss Paris briefing
  await p.evaluate(() => G.Game.start(G.levelConfig(19)));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/40-boss-brief.png' });
  // Day rule level with specials forced
  await p.evaluate(() => G.Game.start(Object.assign(G.levelConfig(25), { specialRate: 0.9, count: 12 })));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/41-day-brief.png' });
  await p.click('[data-go]'); await p.waitForTimeout(2600);
  for (let k = 0; k < 6; k++) {
    await p.screenshot({ path: `shots/42-sp${k}.png` });
    // wrong decision on purpose to see game over flow
    const f = await p.evaluate(() => G.Game.debugState().queue[G.Game.debugState().idx].fraud);
    await p.click(k < 3 ? (f ? '[data-act="ok"]' : '[data-act="fine"]') : (f ? '[data-act="fine"]' : '[data-act="ok"]'));
    await p.waitForTimeout(k < 3 ? 600 : 300);
    if (k === 0) await p.screenshot({ path: 'shots/43-wrong.png' });
    await p.waitForTimeout(2500); // après une erreur, le jeu laisse ~2,9 s pour lire l'explication
    if (await p.$('.modal-go')) { await p.screenshot({ path: 'shots/44-gameover.png' }); break; }
  }
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
