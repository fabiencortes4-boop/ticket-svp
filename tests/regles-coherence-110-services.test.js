const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 } }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(500);
  const res = await p.evaluate(() => {
    const out = { levels: [], problems: [] };
    for (let g = 0; g < G.TOTAL_LEVELS; g++) {
      const cfg = G.levelConfig(g);
      let fr = 0, tot = 0, sp = 0; const reasons = {};
      for (let k = 0; k < 120; k++) {
        const { queue, ctx } = G.buildQueue(cfg, g * 1000 + k);
        for (const q of queue) {
          tot++; if (q.fraud) fr++; if (q.special) sp++;
          reasons[q.hint || (q.fraud ? 'special' : 'ok')] = (reasons[q.hint || (q.fraud ? 'special' : 'ok')] || 0) + 1;
          // re-evaluation must agree
          const ev = G.evaluate(q, cfg, ctx);
          if (ev.fraud !== q.fraud) out.problems.push(`g${g} mismatch ${q.special} ${q.reason} vs ${ev.reason}`);
          // render must not throw
          try { G.renderTicket(q, cfg, ctx); G.renderId(q, cfg, ctx); G.drawPerson(q.look, {}); } catch (e) { out.problems.push('render ' + e.message); }
          if (q.fraud && !q.special && q.hint === null) out.problems.push(`g${g} fraud without hint ${q.reason}`);
        }
      }
      out.levels.push(`g${g} ${cfg.label} rules=${cfg.rules.join(',')} day=${cfg.dayRule} fraud=${(fr/tot*100).toFixed(0)}% sp=${(sp/tot*100).toFixed(0)}% ${JSON.stringify(reasons)}`);
    }
    // daily
    const d = G.dailyConfig(); const a = G.buildQueue(d, d.seed).queue.map(q=>q.fraud).join(); const b2 = G.buildQueue(d, d.seed).queue.map(q=>q.fraud).join();
    out.daily = a === b2 ? 'daily deterministic' : 'DAILY NOT DETERMINISTIC';
    return out;
  });
  console.log(res.levels.filter((_, i) => i % 3 === 0 || i>=24).join('\n'));
  console.log(res.daily);
  console.log('problems', res.problems.length, res.problems.slice(0, 10));
  console.log(errs.join('\n'));
  await b.close();
})();
