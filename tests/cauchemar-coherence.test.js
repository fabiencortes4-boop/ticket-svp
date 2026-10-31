const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage(); await require("./noconsent.js")(p);
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const out = { problems: [], fraud: 0, total: 0, possessed: 0, possessedOk: 0 };
    for (let g = 0; g < G.TOTAL_LEVELS; g++) {
      for (let seed = 1; seed <= 6; seed++) {
        const cfg = G.nightmareConfig(g);
        const { queue, ctx } = G.buildQueue(cfg, seed * 1009 + g);
        for (const q of queue) {
          out.total++;
          if (q.fraud) out.fraud++;
          if (q.possess && !q.possess.fake) {
            out.possessed++;
            const t = JSON.parse(JSON.stringify(q.ticket));
            const before = G.evaluate(Object.assign({}, q, { specialFixed: false }), cfg, ctx).fraud;
            q.ticket.dayOffset = q.possess.dayOffset;
            const after = G.evaluate(Object.assign({}, q, { specialFixed: false }), cfg, ctx).fraud;
            q.ticket = t;
            if (!before && after) out.possessedOk++;
            else out.problems.push(`g${g} possédé avant=${before} après=${after}`);
            continue;
          }
          if (q.specialFixed) continue;
          const ev = G.evaluate(q, cfg, ctx);
          if (ev.fraud !== q.fraud) out.problems.push(`g${g} ${q.hint}`);
        }
      }
    }
    return out;
  });
  console.log('passagers', r.total, 'fraudeurs', Math.round((r.fraud / r.total) * 100) + '%', 'possédés', r.possessed, 'cohérents', r.possessedOk, 'problèmes', r.problems.length, r.problems.slice(0, 8));
  await b.close();
})();
