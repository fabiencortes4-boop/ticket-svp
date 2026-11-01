const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
  const p = await ctx.newPage(); await require("./noconsent.js")(p);
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + e.stack));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(500);
  await p.click('[data-play]'); await p.waitForTimeout(400);
  await p.click('[data-chest]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/50-chest.png' });
  await p.click('[data-ok]'); await p.waitForTimeout(400);
  await p.click('[data-nav="daily"]'); await p.waitForTimeout(400);
  await p.click('[data-play]'); await p.waitForTimeout(500);
  await p.click('[data-go]'); await p.waitForTimeout(2600);
  let n=0;
  while (n < 30) {
    const info = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return {done:true}; return {state: s.state, paused: s.paused, fraud: s.queue[s.idx] && s.queue[s.idx].fraud}; });
    if (info.done) break;
    if (info.state === 'inspect' && !info.paused) { await p.click((info.fraud ^ (n===4)) ? '[data-act="fine"]' : '[data-act="ok"]'); n++; }
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shots/51-daily-results.png' });
  await p.click('[data-daily]'); await p.waitForTimeout(500);
  await p.click('[data-share]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/52-daily.png' });
  const clip = await p.evaluate(() => navigator.clipboard.readText().catch(e => 'ERR ' + e));
  console.log('CLIPBOARD:\n' + clip);
  // onglet Jeu complet de la boutique (plus de pub)
  await p.click('[data-nav="shop"]'); await p.waitForTimeout(300);
  await p.click('[data-tab="full"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/53-jeu-complet.png' });
  if (await p.$('[data-gold-ad], .ad-close')) errs.push('pub encore présente dans la boutique');
  await p.click('[data-nav="map"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/54-map.png' });
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
