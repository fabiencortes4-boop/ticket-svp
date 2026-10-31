/* Génère l'icône et les visuels Play Store à partir des graphismes du jeu.
   Usage : servir www/ sur http://localhost:8765 puis `node tools/store-assets.js` (Playwright requis).
   STORE_LANG=en|es|de génère les visuels d'une autre langue dans store/<langue>/. */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const LANG = process.env.STORE_LANG || 'fr';
const TAGS = { fr: 'Démasque les fraudeurs<br>du métro !', en: 'Catch the metro<br>fare dodgers!', es: '¡Desenmascara a los<br>colados del metro!', de: 'Entlarve die<br>Schwarzfahrer!' };
const OUT = LANG === 'fr' ? path.join(__dirname, '..', 'store') : path.join(__dirname, '..', 'store', LANG);
fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.GAME_URL || 'http://localhost:8765/index.html';

async function render(page, w, h, html, file) {
  await page.setViewportSize({ width: w, height: h });
  await page.evaluate(([w2, h2, inner]) => {
    document.body.innerHTML = `<div id="cap" style="position:fixed;inset:0;width:${w2}px;height:${h2}px;overflow:hidden">${inner}</div>`;
  }, [w, h, html]);
  await page.waitForTimeout(400);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: w, height: h } });
}

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ deviceScaleFactor: 1 });
  await page.addInitScript((l) => localStorage.setItem('ticketsvp.save.v1', JSON.stringify({ lang: l, settings: { consentAsked: true } })), LANG);
  await page.goto(URL);
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: '#cap .pax-body{animation:none!important} #cap *{animation:none!important}' });

  const icon = await page.evaluate(() => `
    <div style="width:512px;height:512px;background:radial-gradient(circle at 30% 25%,#ffe680,#ffd23f 55%,#f5b700);position:relative">
      <div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:#1e2a4a"></div>
      <div style="position:absolute;left:0;right:0;bottom:112px;height:16px;background:repeating-linear-gradient(90deg,#1e2a4a 0 26px,transparent 26px 44px)"></div>
      <div style="position:absolute;left:56px;top:40px;width:400px;height:440px">${G.drawPerson(G.conductorLook('classic'), { photo: true, mood: 'happy' })}</div>
    </div>`);
  await render(page, 512, 512, icon, path.join(OUT, 'icon-512.png'));
  await render(page, 512, 512, icon, path.join(__dirname, '..', 'www', 'icon-512.png'));

  const feature = await page.evaluate((TAG) => {
    const face = (look, x, size, rot) => `<div style="position:absolute;left:${x}px;bottom:-10px;width:${size}px;height:${size * 1.23}px;transform:rotate(${rot}deg)">${G.drawPerson(look, {})}</div>`;
    const sp = (id) => { const s = G.SPECIALS.find((x) => x.id === id); return G.makeSpecial(s, G.levelConfig(35), G.rng(7), { today: G.today(), zoneReq: 3 }).look; };
    return `<div style="width:1024px;height:500px;position:relative;overflow:hidden;background:repeating-linear-gradient(45deg,#182447 0 22px,#1d2c57 22px 44px)">
      <div style="position:absolute;left:40px;top:70px;width:470px">${G.drawLogo()}</div>
      <div style="position:absolute;left:60px;top:318px;width:440px;font:400 30px/1.15 'Lilita One',sans-serif;color:#fff">${TAG}</div>
      ${face(sp('dogs'), 520, 230, -6)}${face(G.conductorLook('classic'), 650, 300, 0)}${face(sp('mime'), 830, 220, 6)}
    </div>`;
  }, TAGS[LANG]);
  await render(page, 1024, 500, feature, path.join(OUT, 'feature-graphic-1024x500.png'));

  // Captures d'écran 1080×1920 (9:16) pour la fiche Play Store
  const shots = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const save = { lang: LANG, settings: { music: true, sfx: true, vibe: true, consentAsked: true }, v: 1, coins: 860, gold: 24, xp: 2300, levels: {}, tools: { watch: 1, uv: 2, whistle: 1, badge: 0 }, owned: ['classic'], uniform: 'classic', album: {}, tutorialDone: true };
  for (let i = 0; i < 16; i++) save.levels[i] = 3 - (i % 2);
  ['mime', 'dogs', 'ghost', 'tourist', 'timetraveler', 'grandma', 'pirate', 'baby', 'vampire', 'robot', 'alien'].forEach((k) => { save.album[k] = 1; });
  await shots.addInitScript((s) => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
  await shots.goto(URL);
  await shots.waitForTimeout(900);
  const snap = (n) => shots.screenshot({ path: path.join(OUT, `screenshot-${n}.png`) });
  await snap(1);
  await shots.click('[data-play]');
  await shots.waitForTimeout(700);
  await shots.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove()));
  await snap(2);
  await shots.evaluate(() => G.Game.start(Object.assign(G.levelConfig(16), { specialRate: 0 })));
  await shots.waitForTimeout(500);
  await shots.click('[data-go]');
  await shots.waitForTimeout(2800);
  await snap(3);
  await shots.evaluate(() => { const s = G.Game.debugState(); s.paused = true; });
  await shots.click('[data-zoomable="id"]');
  await shots.waitForTimeout(400);
  await snap(4);
  await shots.evaluate(() => G.UI.album());
  await shots.waitForTimeout(600);
  await snap(5);
  await b.close();
  console.log('Visuels générés dans', OUT);
})();
