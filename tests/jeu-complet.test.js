// Jeu complet : bus + Paris gratuits, le reste derrière un achat unique ; anciens joueurs servis ; aucune pub
const { chromium } = require('playwright');
const levels = {}; for (let i = 0; i < 20; i++) levels[i] = 2;
const fresh = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 5, xp: 3000, levels, tutorialDone: true, fullChecked: true, full: false, settings: { music: false, sfx: false } };
(async () => {
  const b = await chromium.launch();
  const problems = [];
  const page = async (save) => {
    const p = await b.newPage({ viewport: { width: 390, height: 800 } });
    p.on('pageerror', (e) => problems.push('PAGEERROR ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') problems.push('console ' + m.text()); });
    await p.addInitScript((s) => { if (!sessionStorage.getItem('init')) { localStorage.setItem('ticketsvp.save.v1', s); sessionStorage.setItem('init', 1); } }, JSON.stringify(save));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(800);
    await p.click('[data-play]'); await p.waitForTimeout(600);
    return p;
  };
  // 1. Joueur gratuit qui a fini Paris
  let p = await page(fresh);
  const st = await p.evaluate(() => ({
    full: G.isFull(), london: G.isLevelUnlocked(20), paris: G.isLevelUnlocked(19),
    lockBtns: document.querySelectorAll('.city-full[data-full]').length,
    weeklyTxt: document.querySelector('.weekly-card') && document.querySelector('.weekly-card').textContent,
    ads: !!window.G.Ads, consent: !!document.querySelector('.modal-consent'),
  }));
  console.log('gratuit', JSON.stringify(st));
  if (st.full || st.london || !st.paris) problems.push('verrou des villes incorrect');
  if (st.lockBtns !== 9) problems.push(st.lockBtns + ' villes avec offre (9 attendues)');
  if (st.ads || st.consent) problems.push('pub ou consentement encore présents');
  await p.click('.city-full[data-full]'); await p.waitForTimeout(400);
  if (!(await p.$('.modal-full'))) problems.push('offre non affichée');
  await p.screenshot({ path: 'shots/jeu-complet-offre.png' });
  // les modes payants ouvrent l'offre
  await p.click('.modal-full [data-later]'); await p.waitForTimeout(300);
  await p.click('[data-endless]'); await p.waitForTimeout(400);
  if (!(await p.$('.modal-full'))) problems.push('Ligne infinie sans offre');
  // achat simulé
  await p.click('.modal-full [data-buy-full]'); await p.waitForTimeout(400);
  await p.click('.modal-sim [data-yes]'); await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ full: G.isFull(), london: G.isLevelUnlocked(20), lock: document.querySelectorAll('#screens .city-full').length, saved: JSON.parse(localStorage.getItem('ticketsvp.save.v1')).full }));
  console.log('après achat', JSON.stringify(after));
  if (!after.full || !after.london || after.lock || after.saved !== true) problems.push('achat simulé sans effet');
  await p.reload(); await p.waitForTimeout(800);
  if (!(await p.evaluate(() => G.isFull()))) problems.push('achat perdu après rechargement');
  await p.close();
  // 2. Fin du boss de Paris : bouton « Continuer : jeu complet »
  p = await page(fresh);
  await p.evaluate(() => G.UI.results({ cfg: G.levelConfig(19), success: true, stars: 2, score: 1200, coins: 30, xp: 50, caught: 3, acc: 90, bestCombo: 4, unlocked: [], newAlbum: [], objectives: [], rankUp: false, firstClear: true, challengeCode: 'X' }));
  await p.waitForTimeout(500);
  const r = await p.evaluate(() => ({ full: !!document.querySelector('.modal-results [data-full]'), next: !!document.querySelector('.modal-results [data-next]') }));
  console.log('fin de Paris', JSON.stringify(r));
  if (!r.full || r.next) problems.push('fin de Paris : pas d\'offre ou service suivant ouvert');
  await p.close();
  // 3. Ancien joueur (sauvegarde d'avant la 1.5) : jeu complet offert
  const old = { v: 1, lang: 'fr', seenVersion: '99.0.0', coins: 500, gold: 5, xp: 3000, levels: { 0: 3, 1: 2, 2: 1 }, tutorialDone: true, settings: { consentAsked: true, music: false, sfx: false } };
  p = await page(old);
  const o = await p.evaluate(() => ({ full: G.save.full, london: G.isLevelUnlocked(20) }));
  console.log('ancien joueur', JSON.stringify(o));
  if (o.full !== 'ancien') problems.push('ancien joueur non servi');
  await p.close();
  // 4. Nouveau joueur sans aucune partie : pas de cadeau
  p = await page({ v: 1, lang: 'fr', seenVersion: '99.0.0', settings: { music: false, sfx: false } });
  const n = await p.evaluate(() => ({ full: G.save.full, checked: G.save.fullChecked }));
  console.log('nouveau joueur', JSON.stringify(n));
  if (n.full || !n.checked) problems.push('nouveau joueur : jeu complet offert à tort');
  await p.close();
  console.log(problems.length ? 'PROBLEMS ' + problems.join(' ; ') : 'problèmes 0');
  await b.close();
})();
