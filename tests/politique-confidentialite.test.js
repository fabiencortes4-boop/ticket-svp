// La politique de confidentialité s'ouvre dans le jeu (réglages et fenêtre de consentement), traduite, et se referme
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const problems = [];
  for (const [lang, title] of [['fr', 'Politique de confidentialité'], ['en', 'Privacy policy'], ['es', 'Política de privacidad'], ['de', 'Datenschutzerklärung']]) {
    const p = await b.newPage({ viewport: { width: 390, height: 760 } });
    p.on('pageerror', (e) => problems.push(lang + ' PAGEERROR ' + e.message));
    await p.addInitScript((l) => localStorage.setItem('ticketsvp.save.v1', JSON.stringify({ v: 1, lang: l, seenVersion: '99.0.0', coins: 300, xp: 900, levels: { 0: 3 }, tutorialDone: true, settings: { consentAsked: true, music: false, sfx: false } })), lang);
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
    await p.click('[data-play]'); await p.waitForTimeout(500);
    await p.click('[data-nav="settings"]'); await p.waitForTimeout(400);
    await p.click('[data-privacy]'); await p.waitForTimeout(500);
    const h = await p.$eval('.modal-privacy h2', (e) => e.textContent.trim()).catch(() => null);
    const n = await p.$$eval('.modal-privacy section', (s) => s.length).catch(() => 0);
    console.log(lang, h, n, 'sections');
    if (h !== title) problems.push(`${lang} : titre « ${h} »`);
    if (n < 6) problems.push(`${lang} : ${n} sections`);
    await p.click('.modal-privacy [data-ok]'); await p.waitForTimeout(400);
    if (await p.$('.modal-privacy')) problems.push(lang + ' : fenêtre pas refermée');
    await p.close();
  }
  // Depuis la fenêtre de consentement du premier lancement : elle reste ouverte derrière
  const p = await b.newPage({ viewport: { width: 390, height: 760 } });
  await p.addInitScript(() => localStorage.setItem('ticketsvp.save.v1', JSON.stringify({ v: 1, lang: 'fr' })));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  await p.click('.modal-consent [data-privacy]'); await p.waitForTimeout(500);
  if (!(await p.$('.modal-privacy'))) problems.push('consentement : politique non ouverte');
  await p.click('.modal-privacy [data-ok]'); await p.waitForTimeout(400);
  if (!(await p.$('.modal-consent'))) problems.push('consentement : fenêtre de consentement perdue');
  console.log(problems.length ? 'PROBLEMS ' + problems.join(' ; ') : 'problèmes 0');
  await b.close();
})();
