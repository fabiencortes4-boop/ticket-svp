const { chromium } = require('playwright');
const save = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 5, xp: 1200, levels: {}, best: {}, tools: { watch: 0, uv: 1, whistle: 0, badge: 0 }, owned: ['classic'], uniform: 'classic', album: {}, tutorialDone: true };
for (let i = 0; i < 14; i++) save.levels[i] = 2;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  const errs = [], remote = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  p.on('request', (r) => { if (!r.url().startsWith('http://localhost')) remote.push(r.url()); });
  await p.addInitScript((s) => { if (!localStorage.getItem('ticketsvp.save.v1')) localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(1200);
  const consent = await p.$('.modal-consent');
  console.log('consent modal shown:', !!consent);
  await p.screenshot({ path: 'shots/80-consent.png' });
  await p.click('.modal-consent [data-yes]'); await p.waitForTimeout(400);
  console.log('analytics setting:', await p.evaluate(() => G.save.settings.analytics));
  console.log('fonts:', await p.evaluate(async () => { await document.fonts.ready; return ['Lilita One', 'Nunito', 'Press Start 2P'].map((f) => document.fonts.check(`16px "${f}"`)); }));
  await p.click('[data-play]'); await p.waitForTimeout(500);
  await p.click('[data-nav="settings"]'); await p.waitForTimeout(400);
  await p.click('[data-textsize]'); await p.click('[data-textsize]'); // xl
  await p.click('[data-tg="cb"]'); await p.click('[data-tg="slow"]');
  await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/81-settings.png' });
  await p.evaluate(() => document.querySelector('.page').scrollTop = 400); await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/81b-settings.png' });
  console.log('html attrs:', await p.evaluate(() => [document.documentElement.dataset.text, document.documentElement.className]));
  // Joue un service
  await p.evaluate(() => G.Game.start(G.levelConfig(14)));
  await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/82-brief-xl.png' });
  await p.click('[data-go]'); await p.waitForTimeout(2600);
  const t = await p.evaluate(() => [G.Game.debugState().time, G.levelConfig(14).time]);
  console.log('time scaled:', t, (t[0] / t[1]).toFixed(2));
  await p.screenshot({ path: 'shots/83-game-xl-cb.png' });
  // Termine en verbalisant tout le monde
  for (let i = 0; i < 40; i++) {
    const s = await p.evaluate(() => { const st = G.Game.debugState(); return st ? st.state : 'none'; });
    if (s === 'inspect') await p.keyboard.press('ArrowLeft');
    if (await p.$('[data-end]')) await p.click('[data-end]');
    if (await p.$('.modal-results')) break;
    await p.waitForTimeout(700);
  }
  await p.waitForTimeout(800);
  await p.evaluate(() => G.$$('.modal').forEach((m) => m.remove()));
  await p.evaluate(() => G.UI.settings()); await p.waitForTimeout(400);
  await p.click('[data-report]'); await p.waitForTimeout(400);
  console.log(await p.evaluate(() => G.Analytics.report()));
  await p.screenshot({ path: 'shots/84-report.png' });
  await p.evaluate(() => G.$$('.modal').forEach((m) => m.remove()));
  await p.evaluate(() => G.UI.album()); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/85-album.png' });
  console.log('month special:', await p.evaluate(() => G.monthSpecial().name));
  // reload : pas de 2e demande de consentement
  await p.reload(); await p.waitForTimeout(1200);
  console.log('consent again:', !!(await p.$('.modal-consent')));
  console.log('remote requests:', remote);
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
