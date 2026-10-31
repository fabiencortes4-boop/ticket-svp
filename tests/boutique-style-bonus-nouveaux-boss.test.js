const { chromium } = require('playwright');
const save = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 9000, gold: 300, xp: 9000, levels: {}, best: {}, tools: { watch: 2, uv: 3, whistle: 1, badge: 1 }, owned: ['classic'], uniform: 'classic', album: {}, tutorialDone: true, settings: { music: false, sfx: false, vibe: false, consentAsked: true } };
for (let i = 0; i < 109; i++) save.levels[i] = 2;
['ghost', 'vampire', 'zombie', 'mummy', 'dogs', 'bee'].forEach((k) => (save.album[k] = 1));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript((s) => { if (!localStorage.getItem('ticketsvp.save.v1')) localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  await p.click('[data-play]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.map-scroll').scrollTop = 0);
  await p.screenshot({ path: 'shots/a1-map-top.png' });
  await p.evaluate(() => { const c = [...document.querySelectorAll('.city')]; c[c.length - 1].scrollIntoView(); });
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/a2-map-mars.png' });
  // boutique Style
  await p.click('[data-nav="shop"]'); await p.waitForTimeout(300);
  await p.click('[data-tab="style"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/a3-style-stamps.png' });
  await p.click('[data-buy-cos="stamp:gold"]'); await p.waitForTimeout(200);
  await p.click('[data-cat="pet"]'); await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/a4-style-pets.png' });
  await p.click('[data-buy-cos="pet:dog"]'); await p.waitForTimeout(200);
  await p.click('[data-cat="deco"]'); await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/a5-style-deco.png' });
  await p.click('[data-buy-cos="deco:lights"]'); await p.waitForTimeout(200);
  await p.click('[data-cat="ink"]'); await p.waitForTimeout(200);
  await p.click('[data-buy-cos="ink:violet"]'); await p.waitForTimeout(200);
  await p.click('[data-tab="boosts"]'); await p.waitForTimeout(200);
  for (const id of ['coffee', 'magnifier', 'double']) { await p.click(`[data-buy-item="${id}"]`); await p.waitForTimeout(150); }
  await p.screenshot({ path: 'shots/a6-boosts.png' });
  console.log('cos', await p.evaluate(() => JSON.stringify(G.save.cos)), 'items', await p.evaluate(() => JSON.stringify(G.save.items)));
  // collections
  await p.click('[data-nav="album"]'); await p.waitForTimeout(300);
  await p.click('[data-atab="col"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/a7-collections.png' });
  const claim = await p.$('[data-claimcol="night"]');
  console.log('night claimable', !!claim);
  if (claim) { await claim.click(); await p.waitForTimeout(300); }
  console.log('skull owned', await p.evaluate(() => G.cosOwned('stamp', 'skull')));
  // jouer un service avec bonus
  await p.evaluate(() => G.Game.start(G.levelConfig(15)));
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/a8-brief-boosts.png' });
  for (const id of ['coffee', 'magnifier', 'double']) await p.click(`[data-boost="${id}"]`);
  await p.click('[data-go]'); await p.waitForTimeout(3000);
  for (let k = 0; k < 5 && (await p.evaluate(() => G.Game.debugState().state)) !== 'inspect'; k++) await p.waitForTimeout(500);
  const st = await p.evaluate(() => { const s = G.Game.debugState(); return { boosts: s.boosts, loupe: s.loupeLeft, dbl: s.doubleCoins, time: s.time }; });
  console.log('boost state', JSON.stringify(st));
  await p.click('[data-act="loupe"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/a9-game-loupe.png' });
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(250);
  await p.screenshot({ path: 'shots/b0-stamp.png' });
  await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); });
  // les 4 nouveaux boss
  for (const g of [79, 89, 99, 109]) {
    await p.evaluate((g) => G.Game.start(G.levelConfig(g)), g);
    await p.waitForTimeout(500);
    await p.screenshot({ path: `shots/b-brief-${g}.png` });
    await p.click('[data-go]'); await p.waitForTimeout(3200);
    await p.screenshot({ path: `shots/b-game-${g}.png` });
    // joue juste : utilise la vérité du jeu
    let guard = 0;
    while (guard++ < 60) {
      const s = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return 'none'; return s.state; });
      if (s === 'none' || (await p.$('.modal-results'))) break;
      if (await p.$('.modal [data-accuse], .accuse')) break;
      if (s === 'inspect') {
        const fraud = await p.evaluate(() => { const s = G.Game.debugState(); return s.queue[s.idx].fraud; });
        await p.keyboard.press(fraud ? 'ArrowLeft' : 'ArrowRight');
      }
      await p.waitForTimeout(450);
    }
    await p.waitForTimeout(1200);
    const res = await p.evaluate(() => { const t = document.querySelector('.modal-results h2'); return t ? t.textContent : 'no results'; });
    console.log('boss', g, res);
    await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); });
  }
  // défi de la semaine
  await p.evaluate(() => G.UI.map()); await p.waitForTimeout(400);
  await p.click('[data-weekly]'); await p.waitForTimeout(500);
  console.log('weekly label', await p.evaluate(() => G.Game.debugState().cfg.label), 'boost picker hidden', !(await p.$('.boost-pick')));
  await p.evaluate(() => { G.Game.cleanup(); G.$$('.modal').forEach((m) => m.remove()); });
  console.log('coins after', await p.evaluate(() => G.save.coins));
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
