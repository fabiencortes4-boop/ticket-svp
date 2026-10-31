const { chromium } = require('playwright');
// Faux window.claude : db en mémoire partagée entre deux "appareils" (contextes)
const store = {};
function mock(canWrite) {
  return `(() => {
    const docs = {};
    const db = { doc: (path) => ({ path,
      get: async () => { const v = await window.__dbget(path); return { exists: !!v, data: () => v && JSON.parse(v) }; },
      set: async (d) => { if (!${canWrite}) throw { code: 'invalid_argument', message: 'no' }; await window.__dbset(path, JSON.stringify(d)); } }) };
    const user = { id: async () => 'u123' };
    window.claude = { use: async (n) => (n === 'db' ? db : n === 'user' ? user : null) };
  })();`;
}
async function device(b, canWrite, save) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.exposeFunction('__dbget', (p) => store[p] || null);
  await ctx.exposeFunction('__dbset', (p, v) => { store[p] = v; });
  await ctx.addInitScript(mock(canWrite));
  if (save) await ctx.addInitScript((s) => { if (!localStorage.getItem('ticketsvp.save.v1')) localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(save));
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push(e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(1500);
  return p;
}
(async () => {
  const b = await chromium.launch();
  // Appareil A : partie avancée
  const A = await device(b, true, { v: 1, lang: 'fr', seenVersion: '99.0.0', xp: 3000, coins: 777, levels: { 0: 3, 1: 2, 2: 1 }, tutorialDone: true, settings: { music: true, sfx: true, vibe: true, consentAsked: true } });
  console.log('A status', await A.evaluate(() => G.Cloud.status()));
  await A.waitForTimeout(3000);
  console.log('stored after A', !!store['data/users/u123/save'], store['data/users/u123/save'] && JSON.parse(store['data/users/u123/save']).save.coins);
  // A gagne des pièces
  await A.evaluate(() => { G.save.coins = 900; G.persist(); });
  await A.waitForTimeout(3200);
  console.log('stored coins after A change', JSON.parse(store['data/users/u123/save']).save.coins);
  // Appareil B : neuf
  const B = await device(b, true, null);
  await B.waitForTimeout(500);
  console.log('B consent modal (fresh device) visible:', !!(await B.$('.modal-consent')));
  console.log('B adopted', await B.evaluate(() => [G.save.coins, G.save.xp, G.save.levels[0], G.Cloud.status()]));
  await B.screenshot({ path: 'shots/90-B.png' });
  // B en lecture seule (visiteur extérieur) : reste local
  const C = await device(b, false, { v: 1, lang: 'fr', seenVersion: '99.0.0', xp: 5000, coins: 5, levels: { 0: 1 }, tutorialDone: true, settings: { consentAsked: true } });
  await C.waitForTimeout(3500);
  console.log('C status', await C.evaluate(() => G.Cloud.status()), 'cloud coins still', JSON.parse(store['data/users/u123/save']).save.coins);
  // Code de sauvegarde : A -> D (sans claude)
  const code = await A.evaluate(() => G.Cloud.exportCode());
  console.log('code length', code.length, code.slice(0, 12));
  const ctxD = await b.newContext({ viewport: { width: 390, height: 800 } });
  const D = await ctxD.newPage();
  D.errs = []; D.on('pageerror', (e) => D.errs.push(e.message));
  await D.goto('http://localhost:8765/index.html'); await D.waitForTimeout(1200);
  if (await D.$('.modal-consent [data-no]')) await D.click('.modal-consent [data-no]');
  await D.click('[data-play]'); await D.waitForTimeout(400);
  await D.click('[data-nav="settings"]'); await D.waitForTimeout(400);
  console.log('D status', await D.evaluate(() => G.Cloud.status()));
  await D.click('[data-import]'); await D.waitForTimeout(300);
  await D.fill('.code-box', 'nimporte quoi'); await D.click('[data-load]'); await D.waitForTimeout(200);
  console.log('bad code error shown', await D.evaluate(() => !G.$('[data-err]').hidden));
  await D.fill('.code-box', code); await D.click('[data-load]'); await D.waitForTimeout(600);
  console.log('D after import', await D.evaluate(() => [G.save.coins, G.save.xp, G.save.levels[1]]));
  await D.reload(); await D.waitForTimeout(1000);
  console.log('D after reload', await D.evaluate(() => [G.save.coins, G.save.xp]));
  await D.evaluate(() => G.UI.settings()); await D.waitForTimeout(400);
  await D.screenshot({ path: 'shots/91-settings-save.png' });
  await D.click('[data-export]'); await D.waitForTimeout(300);
  await D.screenshot({ path: 'shots/92-export.png' });
  const errs = [...A.errs, ...B.errs, ...C.errs, ...D.errs];
  console.log(errs.length ? errs : 'NO ERRORS');
  await b.close();
})();
