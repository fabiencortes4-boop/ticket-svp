const { chromium } = require('playwright');
const mk = (n) => { const s = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 20, xp: 9000, levels: {}, tutorialDone: true, settings: { music: false, sfx: false, consentAsked: true } }; for (let i = 0; i < n; i++) s.levels[i] = 2; return s; };
(async () => {
  const b = await chromium.launch();
  const errs = [];
  // verrouillé avant le service 61
  let p = await b.newPage({ viewport: { width: 390, height: 844 } });
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(mk(40)));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(700);
  await p.click('[data-play]'); await p.waitForTimeout(400);
  await p.click('[data-nightmare]'); await p.waitForTimeout(300);
  console.log('locked: on =', await p.evaluate(() => G.save.nightmare.on));
  await p.screenshot({ path: 'shots/n0-locked.png' });
  await p.close();
  // débloqué
  p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript((s) => { if (!localStorage.getItem('ticketsvp.save.v1')) localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(mk(70)));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(700);
  await p.click('[data-play]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/n1-map-off.png' });
  await p.click('[data-nightmare]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/n2-intro.png' });
  await p.click('.modal-nm [data-ok]'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/n3-map-on.png' });
  // un service en cauchemar
  const cfg = await p.evaluate(() => { const c = G.nightmareConfig(5); return { t: c.time.toFixed(2), rules: c.rules.length, nm: c.nightmare, normal: G.levelConfig(5).time.toFixed(2) }; });
  console.log('cfg', JSON.stringify(cfg));
  await p.click('[data-level="5"]'); await p.waitForTimeout(500);
  await p.click('[data-go]'); await p.waitForTimeout(3200);
  console.log('rep', await p.evaluate(() => G.Game.debugState().maxRep), 'possessed in queue', await p.evaluate(() => G.Game.debugState().queue.filter((q) => q.possess).length));
  await p.screenshot({ path: 'shots/n4-game.png' });
  // attendre un passager possédé
  let seen = false;
  for (let k = 0; k < 40; k++) {
    const s = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return null; const q = s.queue[s.idx]; return { state: s.state, possess: q && q.possess && !q.possess.fake, fraud: q && q.fraud, at: q && q.possess && q.possess.at }; });
    if (!s || await p.$('.modal-results')) break;
    if (s.state === 'inspect') {
      if (s.possess && !seen) {
        const before = await p.evaluate(() => G.$('[data-f="date"]', G.Game.debugState().el.docs).textContent);
        await p.waitForTimeout(s.at * 1000 + 300);
        const after = await p.evaluate(() => G.$('[data-f="date"]', G.Game.debugState().el.docs).textContent);
        console.log('possessed date', before.trim(), '->', after.trim());
        await p.screenshot({ path: 'shots/n5-possessed.png' });
        seen = true;
      }
      await p.keyboard.press(s.fraud ? 'ArrowLeft' : 'ArrowRight');
    }
    await p.waitForTimeout(450);
  }
  await p.waitForTimeout(1200);
  await p.screenshot({ path: 'shots/n6-results.png' });
  console.log('moons', await p.evaluate(() => [G.save.nightmare.levels[5], G.nightmareMoons(), G.save.levels[5]]));
  await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); G.UI.shop('style', 'pet'); });
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.page').scrollTop = 9999);
  await p.screenshot({ path: 'shots/n7-shop.png' });
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
