const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(600);
  // logic: interrogation over many passengers
  const res = await p.evaluate(() => {
    const out = { fraudTell: 0, fraud: 0, okTell: 0, ok: 0, lieContradict: 0, problems: [] };
    for (let g = 0; g < 40; g++) {
      const cfg = G.levelConfig(g);
      for (let k = 0; k < 40; k++) {
        const { queue, ctx } = G.buildQueue(cfg, g * 100 + k);
        for (const q of queue) {
          try {
            const a = G.interrogate(q, cfg, ctx, G.rng(k * 7 + g));
            if (!a.q || !a.a) out.problems.push('empty ' + q.hint);
            if (q.fraud) { out.fraud++; if (a.tell) out.fraudTell++; } else { out.ok++; if (a.tell) out.okTell++; }
          } catch (e) { out.problems.push(e.message); }
        }
        const obj = G.makeObjectives(cfg, queue);
        if (obj.length !== 2 || obj.some(o => !o.text)) out.problems.push('obj');
      }
    }
    for (let n = 1; n < 30; n++) { const c = G.endlessConfig(n); const { queue } = G.buildQueue(c, n); if (queue.length !== G.STATION_SIZE) out.problems.push('station size'); }
    return out;
  });
  console.log(`fraudeurs qui se trahissent: ${(res.fraudTell / res.fraud * 100).toFixed(0)}%  innocents qui hésitent: ${(res.okTell / res.ok * 100).toFixed(0)}%  problèmes: ${res.problems.length} ${res.problems.slice(0,5)}`);
  // perk modal screenshot
  await p.click('[data-play]'); await p.waitForTimeout(300);
  await p.evaluate(() => { G.save.tutorialDone = true; G.Game.start(G.endlessConfig(1)); });
  await p.waitForTimeout(400); await p.click('[data-go]'); await p.waitForTimeout(2700);
  let k = 0;
  for (let i = 0; i < 300 && k < 10; i++) {
    const s = await p.evaluate(() => { const s = G.Game.debugState(); return { st: s.state, pa: s.paused, f: s.queue[s.idx].fraud }; });
    if (s.st === 'inspect' && !s.pa) { await p.click(s.f ? '[data-act="fine"]' : '[data-act="ok"]'); k++; }
    await p.waitForTimeout(120);
  }
  await p.waitForSelector('[data-perk]', { timeout: 8000 });
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/99-perks.png' });
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
