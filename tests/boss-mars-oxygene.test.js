const { chromium } = require('playwright');
const save = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 100, gold: 0, xp: 9000, levels: {}, tutorialDone: true, settings: { music: false, sfx: false, consentAsked: true } };
for (let i = 0; i < 109; i++) save.levels[i] = 2;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  for (const mode of ['good', 'bad']) {
    await p.evaluate(() => G.Game.start(G.levelConfig(109)));
    await p.waitForTimeout(400); await p.click('[data-go]'); await p.waitForTimeout(3200);
    let guard = 0, minO2 = 99;
    while (guard++ < 250) {
      const s = await p.evaluate(() => { const s = G.Game.debugState(); return s ? [s.state, s.globalTime, s.idx] : null; });
      if (!s || (await p.$('.modal-results'))) break;
      minO2 = Math.min(minO2, s[1]);
      if (s[0] === 'inspect') {
        const fraud = await p.evaluate(() => { const s = G.Game.debugState(); return s.queue[s.idx].fraud; });
        const right = mode === 'good' || Math.random() < 0.5;
        await p.keyboard.press((fraud === right) ? 'ArrowLeft' : 'ArrowRight');
      }
      await p.waitForTimeout(250);
    }
    await p.waitForTimeout(1500);
    if (await p.$('[data-end]')) { await p.click('[data-end]'); await p.waitForTimeout(1500); }
    console.log(mode, 'result:', await p.evaluate(() => { const t = document.querySelector('.modal-results h2'); return t ? t.textContent : 'none'; }), 'min O2', minO2.toFixed(1));
    await p.screenshot({ path: `shots/b-mars-${mode}.png` });
    await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); });
  }
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
