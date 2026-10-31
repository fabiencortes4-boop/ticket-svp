const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['Pixel 7'] });
  const p = await ctx.newPage(); await require("./noconsent.js")(p);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1000);
  // boss du train de nuit
  const g = await p.evaluate(() => { for (let i = 0; i < G.TOTAL_LEVELS; i++) { const c = G.levelConfig(i); if (c.dark) return i; } return -1; });
  console.log('dark level', g);
  await p.evaluate((g) => G.Game.start(G.levelConfig(g)), g);
  await p.waitForTimeout(600); await p.click('[data-go]'); await p.waitForTimeout(3000);
  for (let k = 0; k < 5 && (await p.evaluate(() => G.Game.debugState().state)) !== 'inspect'; k++) await p.waitForTimeout(800);
  const idx0 = await p.evaluate(() => G.Game.debugState().idx);
  const box = await p.$eval('.docs', (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  // glisse le doigt de gauche à droite sur les documents (geste de lampe)
  const cdp = await ctx.newCDPSession(p);
  const pts = (x, y) => [{ x, y }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(box.x + 30, box.y + box.h / 2) });
  let maxDx = 0;
  for (let i = 1; i <= 15; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(box.x + 30 + i * 20, box.y + box.h / 2) });
    const dx = await p.evaluate(() => getComputedStyle(document.querySelector('.docs')).transform);
    if (dx !== 'none') maxDx = dx;
    await p.waitForTimeout(30);
  }
  const lx = await p.evaluate(() => document.querySelector('.docs').style.getPropertyValue('--lx'));
  await p.screenshot({ path: 'shots/98-dark-lamp.png' });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(500);
  const st = await p.evaluate(() => [G.Game.debugState().idx, G.Game.debugState().state, document.querySelector('.game-screen').classList.contains('dragging')]);
  console.log('docs transform during lamp:', maxDx || 'none', 'lamp x:', lx, 'idx before/after:', idx0, st[0], 'state', st[1], 'dragging', st[2]);
  // le glissé sur le passager décide toujours
  const pb = await p.$eval('[data-pax]', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(pb.x, pb.y) });
  for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(pb.x + i * 15, pb.y) }); await p.waitForTimeout(20); }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(400);
  console.log('swipe on passenger decides:', (await p.evaluate(() => G.Game.debugState().results.length)) === 1);
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
