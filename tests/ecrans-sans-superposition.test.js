// Un seul écran à la fois : appuis rapides, onglets et réglages ne doivent jamais laisser de menus empilés
const { chromium } = require('playwright');
const save = { v: 1, coins: 3000, gold: 40, xp: 9000, levels: {}, best: {}, tools: { watch: 1, uv: 1, whistle: 0, badge: 0 }, owned: ['classic'], uniform: 'classic', album: {}, tutorialDone: true };
for (let i = 0; i < 40; i++) save.levels[i] = 3;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 560 } }); await require('./noconsent.js')(p);
  const errs = [], problems = [];
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
  await p.click('[data-play]'); await p.waitForTimeout(600);
  const screens = () => p.evaluate(() => [...document.querySelectorAll('#screens > *')].map((e) => e.className));
  const tap = (sel) => p.evaluate((sel) => { const e = document.querySelector('#screens > .screen:not(.screen-out) ' + sel); if (e) e.click(); return !!e; }, sel);
  const check = async (what) => { await p.waitForTimeout(400); const s = await screens(); console.log(what, s.length, s.join(' | ')); if (s.length !== 1) problems.push(what + ' : ' + s.length + ' écrans'); };
  // 1. Navigation très rapide entre les menus (double appui, impatience)
  for (const n of ['shop', 'album', 'settings', 'map', 'shop', 'daily', 'map']) { await tap(`[data-nav="${n}"]`); await p.waitForTimeout(40); }
  await check('navigation rapide');
  // 2. Onglets de la boutique enchaînés
  await tap('[data-nav="shop"]'); await p.waitForTimeout(300);
  for (let k = 0; k < 3; k++) for (const t of await p.evaluate(() => [...document.querySelectorAll('#screens > .screen:not(.screen-out) [data-tab]')].map((e) => e.dataset.tab))) { await tap(`[data-tab="${t}"]`); await p.waitForTimeout(30); }
  await check('onglets boutique');
  // 3. Le défilement est gardé quand la boutique se redessine
  const tabs = await p.evaluate(() => [...document.querySelectorAll('#screens > .screen:not(.screen-out) [data-tab]')].map((e) => e.dataset.tab));
  await tap(`[data-tab="${tabs[0]}"]`); await p.waitForTimeout(300);
  const before = await p.evaluate(() => { const pg = document.querySelector('#screens > .screen .page'); if (!pg) return -1; pg.scrollTop = 300; return pg.scrollTop; });
  await tap(`[data-tab="${tabs[0]}"]`); await p.waitForTimeout(300);
  const after = await p.evaluate(() => { const pg = document.querySelector('#screens > .screen .page'); return pg ? pg.scrollTop : -1; });
  console.log('défilement boutique', before, '→', after);
  if (before > 0 && after !== before) problems.push(`défilement perdu (${before} → ${after})`);
  // 4. Réglages basculés à la suite
  await tap('[data-nav="settings"]'); await p.waitForTimeout(300);
  for (let k = 0; k < 6; k++) { await tap('.switch, [data-set], [data-toggle]'); await p.waitForTimeout(30); }
  await check('réglages');
  // 5. Retour carte : rien de l'écran précédent ne reste par-dessus
  await tap('[data-nav="map"]'); await p.waitForTimeout(500);
  const stray = await p.evaluate(() => [...document.querySelectorAll('#screens > *')].filter((e) => !e.classList.contains('map-screen')).length);
  if (stray) problems.push(stray + ' élément(s) restés par-dessus la carte');
  await check('retour carte');
  await p.screenshot({ path: 'shots/ecrans-carte.png' });
  errs.forEach((e) => problems.push(e));
  console.log(problems.length ? 'PROBLEMS ' + problems.join(' ; ') : 'problèmes 0');
  await b.close();
})();
