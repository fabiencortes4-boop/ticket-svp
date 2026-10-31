const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const errs = [];
  // Navigateur qui refuse le stockage (comme certains navigateurs intégrés)
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });
  });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  if (await p.$('.modal-consent [data-no]')) await p.click('.modal-consent [data-no]');
  await p.waitForTimeout(300);
  console.log('storageOK', await p.evaluate(() => G.storageOK), 'warn on title', !!(await p.$('.title-save .save-warn')));
  await p.screenshot({ path: 'shots/97-nostore-title.png' });
  await p.click('.title-save [data-savecode]'); await p.waitForTimeout(400);
  console.log('code modal', !!(await p.$('.code-box')));
  await p.evaluate(() => G.$$('.modal').forEach((m) => m.remove()));
  await p.evaluate(() => G.UI.settings()); await p.waitForTimeout(300);
  console.log('settings status', await p.$eval('.set-info', (x) => x.textContent.slice(0, 40)));
  // navigateur normal : pas d'avertissement
  const p2 = await (await b.newContext()).newPage();
  await require("./noconsent.js")(p2);
  p2.on('pageerror', (e) => errs.push(e.message));
  await p2.goto('http://localhost:8765/index.html'); await p2.waitForTimeout(1200);
  console.log('normal: warn', !!(await p2.$('.save-warn')), 'status', await p2.evaluate(() => G.Cloud.status()));
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
