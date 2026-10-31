const { chromium } = require('playwright');
const save = {v:1, coins: 2500, gold: 40, xp: 5200, levels: {}, best: {}, tools:{watch:2, uv:2, whistle:1, badge:1}, owned:['classic','pirate'], uniform:'pirate', album:{}, tutorialDone:true};
for (let i=0;i<39;i++) save.levels[i]= (i%3)+1;
['mime','dogs','ghost','tourist','timetraveler','grandma','pirate','baby','influencer','vampire','robot','king','alien','inspector','astronaut','magician','diva','twin'].forEach(k=>save.album[k]=2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); await require("./noconsent.js")(p);
  const errs = [];
  p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + e.stack));
  await p.addInitScript(s => { localStorage.setItem('ticketsvp.save.v1', s); }, JSON.stringify(save));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(600);
  await p.click('[data-play]'); await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/20-map.png' });
  await p.click('[data-nav="album"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/21-album.png', fullPage: false });
  await p.evaluate(() => document.querySelector('.page').scrollTop = 900);
  await p.waitForTimeout(200);
  await p.screenshot({ path: 'shots/21b-album.png' });
  await p.click('[data-sp="dogs"]'); await p.waitForTimeout(500);
  await p.screenshot({ path: 'shots/22-sp.png' });
  await p.mouse.click(10, 10); await p.waitForTimeout(300);
  await p.click('[data-nav="shop"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/23-shop.png' });
  await p.click('[data-tab="uniforms"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/24-uni.png' });
  await p.click('[data-tab="gold"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/25-gold.png' });
  await p.click('[data-nav="settings"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/26-settings.png' });
  await p.click('[data-nav="daily"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/27-daily.png' });
  // Level 13 (stamp rule)
  await p.evaluate(() => G.Game.start(G.levelConfig(13)));
  await p.waitForTimeout(600);
  await p.screenshot({ path: 'shots/30-brief13.png' });
  await p.click('[data-go]'); await p.waitForTimeout(2700);
  await p.screenshot({ path: 'shots/31-game13.png' });
  await p.click('[data-act="uv"]'); await p.waitForTimeout(400);
  await p.screenshot({ path: 'shots/32-uv.png' });
  await p.waitForTimeout(2500);
  // autoplay correctly
  let n = 0;
  while (n < 40) {
    const info = await p.evaluate(() => { const s = G.Game.debugState(); if (!s) return {done:true}; return {state: s.state, paused: s.paused, fraud: s.queue[s.idx] && s.queue[s.idx].fraud, idx: s.idx}; });
    if (info.done) break;
    if (info.state === 'inspect' && !info.paused) {
      if (n === 2) { await p.click('[data-zoomable="id"]'); await p.waitForTimeout(300); await p.screenshot({ path: 'shots/33-zoom.png' }); await p.mouse.click(195, 300); }
      await p.click(info.fraud ? '[data-act="fine"]' : '[data-act="ok"]');
      n++;
      if (n === 3) { await p.waitForTimeout(250); await p.screenshot({ path: 'shots/34-verdict.png' }); }
    }
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'shots/35-results.png' });
  console.log(errs.join('\n') || 'NO ERRORS');
  await b.close();
})();
