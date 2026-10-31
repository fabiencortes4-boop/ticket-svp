const { chromium } = require('playwright');
const save = {v:1, coins: 500, gold: 10, xp: 900, levels: {}, tools:{watch:0, uv:1, whistle:1, badge:0}, tutorialDone:true, album:{}};
for (let i=0;i<12;i++) save.levels[i]=2;
async function autoplay(p, n, wrongAt = -1, shotPrefix = null) {
  let k = 0;
  for (let guard = 0; guard < 400 && k < n; guard++) {
    const info = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return { done: true }; const q = s.queue[s.idx]; return { state: s.state, paused: s.paused, fraud: q && q.fraud, modal: !!document.querySelector('.modal') }; });
    if (info.done) return 'done';
    if (info.modal) return 'modal';
    if (info.state === 'inspect' && !info.paused) {
      if (k === 1) { await p.click('[data-act="ask"]'); await p.waitForTimeout(800); if (shotPrefix) await p.screenshot({ path: shotPrefix + '-ask.png' }); }
      const wrong = k >= wrongAt && wrongAt >= 0;
      await p.click((info.fraud !== wrong) ? '[data-act="fine"]' : '[data-act="ok"]');
      k++;
    }
    await p.waitForTimeout(150);
  }
  return 'count';
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + e.stack));
  await p.addInitScript(s => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(700);
  await p.click('[data-play]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
  await p.screenshot({ path: 'shots/90-map.png' });
  // Campaign level index 3 (ask intro)
  await p.evaluate(() => G.Game.start(G.levelConfig(3)));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/91-brief.png' });
  await p.click('[data-go]'); await p.waitForTimeout(2800);
  console.log('campaign:', await autoplay(p, 99, -1, 'shots/92'));
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shots/93-results.png' });
  // Endless
  await p.evaluate(() => G.Game.start(G.endlessConfig(1)));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/94-endless-brief.png' });
  await p.click('[data-go]'); await p.waitForTimeout(2800);
  let r = await autoplay(p, 10);
  console.log('endless 2 stations:', r);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shots/95-perks.png' });
  if (await p.$('[data-perk]')) await p.click('[data-perk]');
  await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/96-station.png' });
  await p.waitForTimeout(800);
  const st = await p.evaluate(() => { const s = G.Game.debugState(); return { station: s.cfg.station, city: s.cfg.city.id, rules: s.cfg.rules, perks: s.perks, qlen: s.queue.length, idx: s.idx }; });
  console.log(JSON.stringify(st));
  r = await autoplay(p, 30, 0);
  console.log('endless losing:', r);
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/97-go.png' });
  if (await p.$('[data-end]')) { await p.click('[data-end]'); await p.waitForTimeout(1500); }
  await p.screenshot({ path: 'shots/98-endless-results.png' });
  console.log('save endless', JSON.stringify(await p.evaluate(() => G.save.endless)));
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
