/* Ticket SVP ! — rendu des documents : ticket, abonnement, carte d'identité */
'use strict';

function stampSvg(kind, city, time, dateTxt) {
  const ink = city.ticket.ink;
  if (kind === 'fake') {
    // Imitation au stylo bille : contour tremblant, texte maladroit
    return `<svg viewBox="0 0 120 64" class="stamp stamp-fake" aria-hidden="true">
      <path d="M8 12 Q30 6 60 10 T112 12 Q116 30 110 52 Q70 58 40 54 T10 50 Q4 30 8 12Z" fill="none" stroke="#3557c9" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M18 24 q6 -6 10 0 t10 0 t10 0 M60 22 l8 0 M74 20 q4 6 8 0 q4 -6 8 2" fill="none" stroke="#3557c9" stroke-width="2.4" stroke-linecap="round"/>
      <text x="58" y="45" text-anchor="middle" class="stamp-txt-fake" fill="#3557c9">${time}</text></svg>`;
  }
  return `<svg viewBox="0 0 120 64" class="stamp stamp-real" aria-hidden="true">
    <rect x="5" y="6" width="110" height="52" rx="8" fill="none" stroke="${ink}" stroke-width="3"/>
    <rect x="10" y="11" width="100" height="42" rx="5" fill="none" stroke="${ink}" stroke-width="1.2" stroke-dasharray="3 2"/>
    <text x="60" y="27" text-anchor="middle" class="stamp-txt" fill="${ink}">${city.company}</text>
    <text x="60" y="45" text-anchor="middle" class="stamp-txt2" fill="${ink}">${dateTxt} · ${time}</text>
    <g class="uv-mark"><circle cx="102" cy="16" r="7" fill="none" stroke="#5ff7ff" stroke-width="2"/><path d="M98 16 l3 3 5 -6" stroke="#5ff7ff" stroke-width="2" fill="none"/></g></svg>`;
}

G.stampSvg = stampSvg;

G.renderTicket = (p, cfg, ctx) => {
  const city = cfg.city;
  const t = p.ticket;
  const style = `--tk-bg:${city.ticket.bg};--tk-ink:${city.ticket.ink};--tk-band:${city.ticket.band}`;
  if (!t) {
    return `<div class="doc ticket ticket-none" data-doc="ticket" data-f="ticket">${G.icon('hand', 'big')}<b>Aucun ticket</b><span>Le passager n'a rien à montrer.</span></div>`;
  }
  if (t.variant === 'invisible') {
    return `<div class="doc ticket ticket-invisible" data-doc="ticket" data-f="ticket"><span class="inv-dots">· · ·</span><span>(ticket invisible)</span></div>`;
  }
  if (t.variant === 'map') {
    return `<div class="doc ticket ticket-map" data-doc="ticket" data-f="ticket"><svg viewBox="0 0 160 100" aria-hidden="true"><path d="M6 10 Q40 2 80 8 T154 10 L150 92 Q110 98 80 92 T8 94Z" fill="#e9cf98" stroke="#7a5230" stroke-width="3"/><path d="M20 70 Q40 40 70 56 T120 34" fill="none" stroke="#7a5230" stroke-width="2.5" stroke-dasharray="5 4"/><path d="M114 26 l12 12 M126 26 l-12 12" stroke="#d62828" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="30" r="9" fill="none" stroke="#7a5230" stroke-width="2"/><path d="M34 21 L34 39 M25 30 L43 30" stroke="#7a5230" stroke-width="1.5"/></svg><span class="map-cap">Carte au trésor</span></div>`;
  }
  if (t.variant === 'balloon') {
    return `<div class="doc ticket ticket-map" data-doc="ticket" data-f="ticket"><svg viewBox="0 0 160 100" aria-hidden="true"><g fill="#ff6fb5" stroke="#1e2a4a" stroke-width="3"><ellipse cx="58" cy="52" rx="26" ry="11"/><ellipse cx="96" cy="42" rx="12" ry="16"/><ellipse cx="106" cy="22" rx="9" ry="13"/><ellipse cx="40" cy="76" rx="7" ry="14"/><ellipse cx="76" cy="76" rx="7" ry="14"/><ellipse cx="26" cy="44" rx="10" ry="6"/></g><circle cx="110" cy="20" r="2.5" fill="#1e2a4a"/></svg><span class="map-cap">Chien en ballon</span></div>`;
  }
  if (t.variant === 'leaf') {
    return `<div class="doc ticket ticket-map" data-doc="ticket" data-f="ticket" style="background:#e7f5dc"><svg viewBox="0 0 160 100" aria-hidden="true"><path d="M30 80 C20 50 50 40 50 22 C66 34 76 18 92 26 C100 14 120 20 120 36 C136 36 140 56 128 64 C138 76 120 90 104 82 C96 94 70 90 66 80 C54 92 34 92 30 80Z" fill="#6aa84f" stroke="#1e2a4a" stroke-width="3"/><path d="M40 82 L118 34" stroke="#3d7a2c" stroke-width="3"/><text x="78" y="64" text-anchor="middle" font-family="cursive" font-size="13" fill="#fff6c9">ticket</text></svg><span class="map-cap" style="color:#3d7a2c">Feuille de chêne</span></div>`;
  }
  if (t.variant === 'card') {
    return `<div class="doc ticket ticket-card" data-doc="ticket" data-f="ticket"><div class="playing"><span class="pc-corner">A<br>♠</span><span class="pc-mid">♠</span><span class="pc-corner pc-rot">A<br>♠</span></div></div>`;
  }
  let kindLabel = 'TICKET À L\'UNITÉ';
  if (t.kind === 'reduced') kindLabel = 'TARIF RÉDUIT';
  if (t.kind === 'pass') kindLabel = 'ABONNEMENT MENSUEL';
  if (t.variant === 'barcode') kindLabel = 'TICKET ÉLECTRONIQUE';
  if (t.variant === 'alien') kindLabel = 'PASS INTERGALACTIQUE';

  const rows = [];
  if (t.kind === 'pass') {
    rows.push(`<div class="tk-row" data-f="date"><span class="lbl">Mois</span><b>${G.fmtMonth(G.addMonths(ctx.today, t.monthOffset))}</b></div>`);
    rows.push(`<div class="tk-row" data-f="name"><span class="lbl">Titulaire</span><b class="nm">${t.passName}</b></div>`);
  } else {
    const d = t.dateText || G.fmtDate(G.addDays(ctx.today, t.dayOffset));
    rows.push(`<div class="tk-row" data-f="date"><span class="lbl">Valable le</span><b>${d}</b></div>`);
  }
  if (cfg.rules.includes('zone') || t.variant === 'alien') rows.push(`<div class="tk-row" data-f="zone"><span class="lbl">Zones</span><b>1-${t.zoneMax >= 99 ? '∞' : t.zoneMax}</b></div>`);
  if (cfg.rules.includes('group') && t.kind !== 'pass') rows.push(`<div class="tk-row" data-f="group"><span class="lbl">Voyageurs</span><b>${t.travelers || 1}</b></div>`);
  if (cfg.rules.includes('class')) rows.push(`<div class="tk-row" data-f="class"><span class="lbl">Classe</span><b class="cls cls-${t.cls}">${t.cls === 1 ? '1re classe' : '2e classe'}</b></div>`);
  if (t.kind === 'reduced') {
    const txt = t.reducedType === 'etudiant' ? 'ÉTUDIANT · moins de 26 ans' : 'SENIOR · 65 ans et plus';
    rows.push(`<div class="tk-row" data-f="age"><span class="lbl">Réduction</span><b class="red">${txt}</b></div>`);
  }
  let stamp = '';
  if (t.kind !== 'pass') {
    const dTxt = (t.dateText || G.fmtDate(G.addDays(ctx.today, t.dayOffset))).slice(0, 5);
    if (t.variant === 'barcode') stamp = `<div class="tk-stamp" data-f="stamp"><svg viewBox="0 0 120 40" class="barcode" aria-hidden="true">${Array.from({ length: 34 }, (_, i) => `<rect x="${4 + i * 3.4}" y="4" width="${(i * 7) % 3 === 0 ? 2.4 : 1.2}" height="32" fill="#1e2a4a"/>`).join('')}</svg></div>`;
    else if (t.stamp === 'none') stamp = `<div class="tk-stamp tk-stamp-empty" data-f="stamp"><span>À COMPOSTER</span></div>`;
    else if (t.stamp === 'fake' && cfg.perfectFakes) stamp = `<div class="tk-stamp" data-f="stamp">${stampSvg('ok', city, t.stampTime, dTxt).replace('stamp-real', 'stamp-perfect')}</div>`;
    else stamp = `<div class="tk-stamp" data-f="stamp">${stampSvg(t.stamp, city, t.stampTime, dTxt)}</div>`;
  } else {
    stamp = `<div class="tk-stamp tk-holo" data-f="stamp"><span>${G.icon('ticket')} PASS</span></div>`;
  }
  const wet = t.variant === 'wet' ? '<div class="wet-drops" aria-hidden="true"></div>' : '';
  return `<div class="doc ticket kind-${t.kind}${t.variant ? ' v-' + t.variant : ''}" data-doc="ticket" style="${style}"${t.variant === 'wet' ? ' data-f="ticket"' : ''}>${wet}
    <div class="tk-head" data-f="day"><span class="tk-co">${t.variant === 'alien' ? 'GALAXY TRANSIT' : city.company}</span><span class="tk-kind">${kindLabel}</span></div>
    <div class="tk-body">${rows.join('')}</div>
    ${stamp}
    <div class="tk-foot"><span class="tk-serial">N° ${t.serial}</span></div>
    <div class="tk-stripe"></div>
  </div>`;
};

G.renderId = (p, cfg, ctx) => {
  let photo;
  if (p.photoVariant === 'crayon') {
    photo = `<svg viewBox="0 0 100 110" aria-hidden="true"><rect width="100" height="110" fill="#fff"/><circle cx="50" cy="40" r="22" fill="none" stroke="#e94f4f" stroke-width="3"/><circle cx="42" cy="36" r="3" fill="#3557c9"/><circle cx="58" cy="36" r="3" fill="#3557c9"/><path d="M40 50 Q50 58 60 50" fill="none" stroke="#3557c9" stroke-width="3"/><path d="M50 62 L50 92 M50 72 L32 66 M50 72 L68 66 M50 92 L38 106 M50 92 L62 106" stroke="#2ec4b6" stroke-width="3" stroke-linecap="round"/><text x="70" y="22" font-size="12" fill="#ff8fab" font-family="cursive">humain</text></svg>`;
  } else if (p.photoVariant === 'blank') {
    photo = `<div class="photo-blank">?</div>`;
  } else {
    photo = G.drawPerson(p.photoLook, { photo: true });
  }
  const year = p.birthYear < 0 ? `${-p.birthYear} av. J.-C.` : p.birthYear;
  const expiry = cfg.rules.includes('expiry') ? `<div class="id-row" data-f="expiry"><span class="lbl">Valable jusqu'au</span><b>${G.fmtDate(G.addDays(ctx.today, p.expiryOffset == null ? 999 : p.expiryOffset))}</b></div>` : '';
  const mrzName = p.idName.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z]+/g, '<');
  return `<div class="doc idcard" data-doc="id">
    <div class="id-head"><span>RÉPUBLIQUE DU RAIL</span><span class="id-sub">CARTE D'IDENTITÉ</span></div>
    <div class="id-body">
      <div class="id-photo" data-f="photo">${photo}</div>
      <div class="id-fields">
        <div class="id-row" data-f="name"><span class="lbl">Nom</span><b class="nm">${p.idName}</b></div>
        <div class="id-row" data-f="age"><span class="lbl">Né(e) en</span><b>${year}</b></div>
        ${expiry}
        <div class="id-row id-sign"${expiry ? ' hidden' : ''}><span class="lbl">Signature</span><svg viewBox="0 0 80 20" aria-hidden="true"><path d="M2 14 C10 2 14 18 22 8 S34 4 38 12 S52 16 58 6 S72 10 78 8" fill="none" stroke="#1e2a4a" stroke-width="1.8" stroke-linecap="round"/></svg></div>
      </div>
    </div>
    <div class="id-mrz">IDRAIL&lt;&lt;${mrzName.slice(0, 22)}${'&lt;'.repeat(4)}</div>
  </div>`;
};
