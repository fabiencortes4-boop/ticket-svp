// Après une manche ratée : récapitulatif des erreurs, détail avec la faute entourée ; erreur lisible sur le coup
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const problems = [];
  p.on('pageerror', (e) => problems.push('PAGEERROR ' + e.message));
  const levels = {}; for (let i = 0; i < 20; i++) levels[i] = 3;
  await p.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify({ v: 1, lang: 'fr', seenVersion: '99.0.0', fullChecked: true, full: true, tutorialDone: true, levels, settings: { music: false, sfx: false } }));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => { G.Game.start(Object.assign(G.levelConfig(16), { specialRate: 0 })); const s = G.Game.debugState(); s.miniEvent = null; s.queue[0].fraud = true; s.queue[0].hint = s.queue[0].hint || 'date'; });
  await p.waitForTimeout(400); await p.click('[data-go]');
  let sawExplain = false, sawRing = false;
  for (let k = 0; k < 14; k++) {
    for (let w = 0; w < 40; w++) { const s = await p.evaluate(() => { const s = G.Game.debugState(); return s ? s.state : 'none'; }); if (s === 'inspect' || s === 'none' || s === 'end') break; await p.waitForTimeout(120); }
    if (await p.$('.modal-go, .modal-results')) break;
    const st = await p.evaluate(() => { const s = G.Game.debugState(); if (!s || s.state !== 'inspect') return null; return { fraud: s.queue[s.idx].fraud }; });
    if (!st) break;
    await p.keyboard.press(st.fraud ? 'ArrowRight' : 'ArrowLeft'); // erreur volontaire
    await p.waitForTimeout(400);
    if (await p.$('.explain')) sawExplain = true;
    if (st.fraud && (await p.$('.docs .flag-ring'))) sawRing = true;
    await p.waitForTimeout(2700);
  }
  if (!sawExplain) problems.push("pas d'encadré d'erreur");
  if (!sawRing) problems.push('faute non entourée sur les papiers');
  const go = await p.$('.modal-go [data-end]'); if (go) { await go.click(); await p.waitForTimeout(900); }
  await p.waitForSelector('.modal-results', { timeout: 8000 }).catch(() => problems.push('pas de résultats'));
  await p.waitForTimeout(800);
  const rec = await p.evaluate(() => { const d = document.querySelector('.mistakes'); return d ? { open: d.open, rows: d.querySelectorAll('.mk-row').length, title: d.querySelector('summary').textContent.trim() } : null; });
  console.log('récapitulatif', JSON.stringify(rec));
  if (!rec || !rec.rows) problems.push('récapitulatif absent');
  else if (!rec.open) problems.push('récapitulatif fermé après un échec');
  const mm = await p.$('.mk-row.mk-missed'); if (mm) { await mm.click(); await p.waitForTimeout(500);
    const det = await p.evaluate(() => { const m = document.querySelector('.modal-mistake'); return m ? { docs: m.querySelectorAll('.mk-docs > .doc-slot').length, ring: !!m.querySelector('.flag-ring'), btnInGrid: !!m.querySelector('.mk-docs .btn') } : null; });
    console.log('détail', JSON.stringify(det));
    if (!det || det.docs !== 2) problems.push('détail : papiers manquants');
    else if (det.btnInGrid) problems.push('détail : bouton pris dans les papiers');
    await p.click('.modal-mistake [data-ok]'); await p.waitForTimeout(300);
  }
  console.log(problems.length ? 'PROBLEMS ' + problems.join(' ; ') : 'problèmes 0');
  await b.close();
})();
