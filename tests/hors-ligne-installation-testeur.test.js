const { chromium, devices } = require('playwright');
const URL = 'http://localhost:8765/index.html';
(async () => {
  const b = await chromium.launch();
  const errs = [];
  // 1. Hors ligne
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage(); await require("./noconsent.js")(p);
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(2500);
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r && (r.active ? 'active' : 'pending'); });
  console.log('service worker:', sw);
  await p.reload(); await p.waitForTimeout(1200);
  console.log('cached files:', await p.evaluate(async () => (await (await caches.open('ticketsvp-v1')).keys()).length));
  await ctx.setOffline(true);
  await p.reload(); await p.waitForTimeout(1500);
  console.log('offline title shown:', !!(await p.$('[data-play]')), 'fonts:', await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "Lilita One"'); }));
  await p.click('[data-play]'); await p.waitForTimeout(400);
  await p.click('[data-level="0"]'); await p.waitForTimeout(400);
  console.log('offline level brief:', !!(await p.$('[data-go]')));
  await ctx.setOffline(false);
  // missions conservées
  await p.evaluate(() => { G.todayMissions(); G.save.missions.list[0].done = 1; G.save.missions.list[0].claimed = true; G.save.eventDone.test = true; G.persist(); });
  await p.reload(); await p.waitForTimeout(1000);
  console.log('missions kept:', await p.evaluate(() => [!!G.save.missions && G.save.missions.list[0].claimed, G.save.eventDone.test]));
  // 2. Mode testeur
  await p.goto(URL + '?testeur'); await p.waitForTimeout(1500);
  console.log('tester:', await p.evaluate(() => [G.save.tester, G.save.coins, G.save.gold, location.search]));
  await p.screenshot({ path: 'shots/93-tester-title.png' });
  await p.click('[data-play]'); await p.waitForTimeout(600);
  console.log('locked cities:', await p.$$eval('.city-locked', (x) => x.length), 'endless open:', await p.evaluate(() => G.isEndlessUnlocked()));
  await p.evaluate(() => document.querySelector('.map-scroll, .page') && (document.querySelector('.map-scroll, .page').scrollTop = 99999)); await p.waitForTimeout(300);
  await p.screenshot({ path: 'shots/94-tester-map.png' });
  await p.goto(URL + '?testeur'); await p.waitForTimeout(800);
  console.log('gift only once:', await p.evaluate(() => G.save.coins));
  await p.goto(URL + '?testeur=off'); await p.waitForTimeout(800);
  console.log('tester off:', await p.evaluate(() => [G.save.tester, G.isLevelUnlocked(40)]));
  // 3. iPhone (agent iOS simulé)
  const ictx = await b.newContext({ ...devices['iPhone 13'] });
  const ip = await ictx.newPage(); await require("./noconsent.js")(ip);
  ip.on('pageerror', (e) => errs.push('ios ' + e.message));
  await ip.goto(URL); await ip.waitForTimeout(1500);
  const btn = await ip.$('[data-install]:not([hidden])');
  console.log('iOS install button:', !!btn);
  await ip.screenshot({ path: 'shots/95-ios-title.png' });
  await btn.click(); await ip.waitForTimeout(500);
  await ip.screenshot({ path: 'shots/96-ios-help.png' });
  // 4. Ordinateur de bureau Chrome sans invite : pas de bouton
  const dctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const dp = await dctx.newPage(); await require("./noconsent.js")(dp);
  await dp.goto(URL); await dp.waitForTimeout(1200);
  console.log('desktop button hidden:', !(await dp.$('[data-install]:not([hidden])')));
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
