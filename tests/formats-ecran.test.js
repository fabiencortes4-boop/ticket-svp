const { chromium } = require('playwright');
const save = {v:1, coins: 900, gold: 20, xp: 2000, levels: {}, tools:{watch:1, uv:2, whistle:1, badge:0}, tutorialDone:true, album:{}, owned:['classic']};
for (let i=0;i<24;i++) save.levels[i]=2;
const W = (ms) => new Promise(r => setTimeout(r, ms));
const sizes = [
  ['phone-land', 844, 390], ['tablet-port', 820, 1180], ['tablet-land', 1180, 820], ['fold-open', 884, 1104], ['passport', 760, 680], ['passport-cover', 412, 760], ['desktop', 1440, 900],
];
(async () => {
  const b = await chromium.launch();
  const errs = [];
  for (const [name, w, h] of sizes) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 }); await require("./noconsent.js")(p);
    p.on('pageerror', e => errs.push(name + ': ' + e.message));
    await p.addInitScript(s => localStorage.setItem('ticketsvp.save.v1', s), JSON.stringify(save));
    await p.goto('http://localhost:8765/index.html'); await W(700);
    await p.screenshot({ path: `shots/c-${name}-title.png` });
    await p.click('[data-play]'); await W(500);
    await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
    await p.screenshot({ path: `shots/c-${name}-map.png` });
    await p.evaluate(() => G.Game.start(G.levelConfig(20))); await W(400);
    await p.screenshot({ path: `shots/c-${name}-brief.png` });
    await p.click('[data-go]'); await W(2800);
    await p.evaluate(() => document.querySelectorAll('.toast').forEach(t => t.remove()));
    await p.screenshot({ path: `shots/c-${name}-game.png` });
    // overflow check
    const ov = await p.evaluate(() => { const r = document.getElementById('game-root').getBoundingClientRect(); const bad = []; document.querySelectorAll('.game-screen *').forEach(el => { const b = el.getBoundingClientRect(); if (b.width && (b.right > r.right + 1 || b.bottom > r.bottom + 1) && getComputedStyle(el).position !== 'absolute' && !el.closest('.scene')) bad.push(el.className.baseVal !== undefined ? el.tagName : el.className); }); return bad.slice(0, 5); });
    console.log(name, 'overflow:', JSON.stringify(ov));
    await p.close();
  }
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
