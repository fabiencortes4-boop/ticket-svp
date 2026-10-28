/* Ticket SVP ! — graphismes supplémentaires : chapeaux, tenues, accessoires, coiffures,
   éléments de costume et paysages des nouvelles villes. Branché sur art.js via G.EXTRA. */
'use strict';

(function () {
  const K = '#1e2a4a';
  let n = 0;
  const cid = () => 'xc' + n++;
  const st = (fill, w = 4) => `fill="${fill}" stroke="${K}" stroke-width="${w}" stroke-linejoin="round"`;
  const hand = (look, x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${look.skin}" stroke="${K}" stroke-width="3.5"/>`;
  const torsoPath = (look) => {
    const w = look.build === 'round' ? 70 : look.build === 'slim' ? 48 : 58;
    const L = 100 - w;
    const R = 100 + w;
    return { L, R, d: `M${L} 242 C${L} 190 ${L + 18} 160 100 160 C${R - 18} 160 ${R} 190 ${R} 242 Z` };
  };
  const clipped = (look, base, pattern) => {
    const { d } = torsoPath(look);
    const id = cid();
    return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${base}"/><g clip-path="url(#${id})">${pattern}</g><path d="${d}" fill="none" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`;
  };

  const hats = {
    santa: () => `<path d="M52 72 C56 30 96 16 132 28 C152 36 162 58 170 78 L152 72 C142 52 122 46 100 46 C78 46 60 56 52 72Z" ${st('#d62828')}/><rect x="46" y="60" width="108" height="17" rx="8.5" ${st('#fff')}/><circle cx="170" cy="80" r="10" ${st('#fff', 3.5)}/>`,
    toque: () => `<path d="M64 68 L64 42 C48 38 50 12 72 16 C76 -2 102 -4 106 12 C118 0 142 6 136 26 C152 26 152 46 136 44 L136 68Z" ${st('#ffffff')}/><rect x="62" y="54" width="76" height="16" rx="3" ${st('#f1f1f1', 3.5)}/><path d="M84 26 L86 50 M100 22 L100 50 M116 26 L114 50" stroke="#d9d9d9" stroke-width="3" stroke-linecap="round"/>`,
    unicorn: (l) => `<path d="M42 112 C34 36 166 36 158 112 C152 68 48 68 42 112Z" ${st(l.outfitColor || '#ffb3d9')}/><path d="M60 46 L66 22 L80 40Z M140 46 L134 22 L120 40Z" ${st(l.outfitColor || '#ffb3d9', 3.5)}/><path d="M90 42 L100 0 L110 42Z" ${st('#ffd23f', 3.5)}/><path d="M93 30 L107 26 M95 18 L105 15" stroke="${K}" stroke-width="2.5"/><path d="M108 46 C130 40 150 56 152 76" fill="none" stroke="#b388ff" stroke-width="7" stroke-linecap="round"/>`,
    cowboy: (l) => `<ellipse cx="100" cy="64" rx="74" ry="13" ${st(G.shade(l.hatColor || '#9c5a2c', -0.06))}/><path d="M66 62 C62 28 82 22 100 32 C118 22 138 28 134 62Z" ${st(l.hatColor || '#9c5a2c')}/><path d="M66 54 L134 54" stroke="${K}" stroke-width="7"/><path d="M66 54 L134 54" stroke="#e8c25a" stroke-width="3.5"/>`,
    elf: (l) => `<path d="M56 70 L126 4 L144 70Z" ${st(l.hatColor || '#2e8b57')}/><circle cx="126" cy="6" r="8" ${st('#ffd23f', 3)}/><rect x="50" y="60" width="100" height="14" rx="7" ${st('#d62828')}/>`,
    tiara: () => `<path d="M66 54 L72 34 L86 46 L100 24 L114 46 L128 34 L134 54Z" ${st('#ffd23f', 3.5)}/><circle cx="100" cy="40" r="5" ${st('#e94f4f', 2)}/><circle cx="80" cy="48" r="3.5" ${st('#3a86ff', 1.5)}/><circle cx="120" cy="48" r="3.5" ${st('#3a86ff', 1.5)}/>`,
    knight: () => `<path d="M100 42 C96 8 132 0 144 18 C128 16 114 26 110 44Z" ${st('#d62828', 3.5)}/><path d="M46 116 C38 34 162 34 154 116 L138 116 C142 70 58 70 62 116Z" ${st('#b8c2cc')}/><path d="M100 40 L100 66" stroke="${K}" stroke-width="3"/><circle cx="62" cy="104" r="3" fill="${K}"/><circle cx="138" cy="104" r="3" fill="${K}"/><path d="M60 52 Q80 42 96 44" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`,
    straw: () => `<ellipse cx="100" cy="64" rx="76" ry="14" ${st('#e8c25a')}/><path d="M64 62 C64 30 136 30 136 62Z" ${st('#f2d27a')}/><path d="M64 54 L136 54" stroke="#d62828" stroke-width="7"/><path d="M40 64 L60 60 M150 60 L160 64 M84 40 L80 52 M110 36 L112 50" stroke="#b8902e" stroke-width="2.5" stroke-linecap="round"/>`,
  };

  const outfitFill = {
    bee: (l) => clipped(l, '#ffd23f', [176, 204, 232].map((y) => `<rect x="20" y="${y}" width="160" height="13" fill="#1b1b25"/>`).join('')),
    scales: (l) => clipped(l, l.outfitColor || '#2ec4b6', Array.from({ length: 30 }, (_, i) => { const x = 30 + (i % 6) * 26 + (Math.floor(i / 6) % 2) * 13; const y = 168 + Math.floor(i / 6) * 16; return `<path d="M${x - 12} ${y} Q${x} ${y + 14} ${x + 12} ${y}" fill="none" stroke="${G.shade(l.outfitColor || '#2ec4b6', -0.2)}" stroke-width="2.5"/>`; }).join('')),
    armor: (l) => clipped(l, '#b8c2cc', `<path d="M20 196 L180 196 M20 222 L180 222 M100 160 L100 242" stroke="#7f8c99" stroke-width="3"/>${[60, 80, 120, 140].map((x) => `<circle cx="${x}" cy="196" r="2.5" fill="${K}"/>`).join('')}<path d="M60 176 Q80 168 96 172" stroke="#fff" stroke-width="4" opacity=".55" fill="none"/>`),
    mummy: (l) => clipped(l, '#e9dfc4', Array.from({ length: 7 }, (_, i) => `<path d="M20 ${170 + i * 11} L180 ${176 + i * 11}" stroke="#cbbf9e" stroke-width="3"/>`).join('')),
    torn: (l) => clipped(l, l.outfitColor || '#6b7a5a', `<path d="M60 200 l8 8 l-6 6 l10 6 M130 186 l-6 10 l8 4 l-4 10 M90 226 l6 -6 l6 8 l6 -6" stroke="${K}" stroke-width="2.5" fill="none" stroke-linejoin="round"/><circle cx="74" cy="236" r="6" fill="${G.shade(l.outfitColor || '#6b7a5a', -0.25)}"/>`),
    wetsuit: (l) => clipped(l, '#1b1b25', `<path d="M20 200 L180 190" stroke="#3a86ff" stroke-width="8"/><path d="M100 162 L100 242" stroke="#555" stroke-width="2.5"/>`),
    wedding: (l) => clipped(l, '#ffffff', Array.from({ length: 18 }, (_, i) => `<circle cx="${40 + (i % 6) * 24}" cy="${184 + Math.floor(i / 6) * 20}" r="3" fill="#e6e9f2"/>`).join('')),
    fur: (l) => clipped(l, '#8a5a32', `<path d="M58 172 Q70 160 80 172 Q90 160 100 172 Q110 160 120 172 Q130 160 142 172 L150 186 Q100 200 50 186Z" fill="#d9c3a0" stroke="${K}" stroke-width="2.5"/><path d="M70 214 L76 222 M120 210 L126 218 M96 232 L102 238" stroke="#5e3a1e" stroke-width="3" stroke-linecap="round"/>`),
    santa: (l) => clipped(l, '#d62828', `<rect x="20" y="210" width="160" height="12" fill="#1b1b25"/><rect x="90" y="208" width="20" height="16" rx="2" fill="#ffd23f" stroke="${K}" stroke-width="2"/><path d="M100 160 L100 242" stroke="#fff" stroke-width="12"/>`),
    overalls: (l) => clipped(l, '#f4f1ea', `<path d="M64 190 L136 190 L140 250 L60 250Z" fill="${l.outfitColor || '#3a86ff'}" stroke="${K}" stroke-width="3"/><path d="M70 190 L62 162 M130 190 L138 162" stroke="${l.outfitColor || '#3a86ff'}" stroke-width="10"/><circle cx="72" cy="194" r="4" fill="#ffd23f" stroke="${K}" stroke-width="2"/><circle cx="128" cy="194" r="4" fill="#ffd23f" stroke="${K}" stroke-width="2"/><rect x="88" y="204" width="24" height="16" rx="3" fill="none" stroke="${K}" stroke-width="2.5"/>`),
  };

  const outfitDetail = {
    chef: () => `${[188, 206, 224].map((y) => `<circle cx="88" cy="${y}" r="3.5" fill="#d9d9d9" stroke="${K}" stroke-width="2"/><circle cx="112" cy="${y}" r="3.5" fill="#d9d9d9" stroke="${K}" stroke-width="2"/>`).join('')}<path d="M82 162 L100 180 L118 162" fill="none" stroke="${K}" stroke-width="3"/>`,
    leather: () => `<path d="M100 164 L100 242" stroke="#c9d3dd" stroke-width="3"/><path d="M84 162 L74 196 L90 192 M116 162 L126 196 L110 192" fill="none" stroke="#555" stroke-width="3"/><circle cx="70" cy="214" r="3" fill="#c9d3dd"/><circle cx="130" cy="214" r="3" fill="#c9d3dd"/>`,
    onesie: (l) => `<ellipse cx="100" cy="214" rx="26" ry="24" fill="${G.shade(l.outfitColor || '#ffb3d9', 0.12)}"/><path d="M84 164 Q100 176 116 164" fill="none" stroke="${K}" stroke-width="3"/>`,
    hero: () => `<path d="M100 178 L106 192 L121 192 L109 201 L113 216 L100 207 L87 216 L91 201 L79 192 L94 192Z" fill="#ffd23f" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><rect x="60" y="226" width="80" height="10" fill="#d62828"/>`,
    vest: (l) => `<path d="M84 162 L100 200 L116 162" fill="#f4f1ea" stroke="${K}" stroke-width="3"/><path d="M84 162 L78 242 M116 162 L122 242" stroke="${G.shade(l.outfitColor || '#7a5230', -0.2)}" stroke-width="4"/><path d="M98 206 L102 206 M98 222 L102 222" stroke="${K}" stroke-width="5" stroke-linecap="round"/><path d="M128 190 l6 -4 l2 7Z" fill="#ffd23f" stroke="${K}" stroke-width="2"/>`,
    sweater: (l) => `<path d="M100 214 C88 202 82 194 90 188 C96 184 100 190 100 192 C100 190 104 184 110 188 C118 194 112 202 100 214Z" fill="#fff" stroke="${K}" stroke-width="2.5"/><path d="M60 236 L140 236" stroke="${G.shade(l.outfitColor, -0.2)}" stroke-width="6"/><path d="M84 162 Q100 176 116 162" fill="none" stroke="${K}" stroke-width="3"/>`,
  };

  const sleeve = { bee: '#1b1b25', armor: '#b8c2cc', mummy: '#e9dfc4', wetsuit: '#1b1b25', wedding: '#ffffff', fur: '#8a5a32', santa: '#d62828', chef: '#ffffff', leather: '#1b1b25', overalls: '#f4f1ea', scales: null, onesie: null, torn: null };

  const hairBack = {
    ponytail: (l) => `<path d="M138 58 C178 66 182 134 160 156 C166 124 160 98 128 80Z" ${st(l.hairColor)}/>`,
    pigtails: (l) => `<path d="M52 82 C22 78 16 124 32 136 C38 114 46 102 58 98Z M148 82 C178 78 184 124 168 136 C162 114 154 102 142 98Z" ${st(l.hairColor)}/><circle cx="54" cy="86" r="5" ${st('#ff6fb5', 2.5)}/><circle cx="146" cy="86" r="5" ${st('#ff6fb5', 2.5)}/>`,
  };
  const hairFront = {
    ponytail: (l) => `<path d="M54 90 C50 52 74 38 100 38 C126 38 150 52 146 90 C136 66 118 58 98 60 C80 62 64 72 54 90Z" ${st(l.hairColor)}/>`,
    pigtails: (l) => `<path d="M54 86 C54 50 78 40 100 40 C122 40 146 50 146 86 C130 66 120 72 100 62 C80 72 70 66 54 86Z" ${st(l.hairColor)}/>`,
    buzz: (l) => `<path d="M54 84 C52 50 76 40 100 40 C124 40 148 50 146 84 C134 64 66 64 54 84Z" fill="${l.hairColor}" opacity=".85" stroke="${K}" stroke-width="3.5"/>${[[74, 54], [90, 48], [108, 48], [124, 54], [82, 62], [116, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${G.shade(l.hairColor, -0.2)}"/>`).join('')}`,
  };

  const extras = {
    mask: () => `<path d="M60 86 C70 74 92 78 100 88 C108 78 130 74 140 86 C142 100 128 106 118 102 C110 100 104 97 100 97 C96 97 90 100 82 102 C72 106 58 100 60 86Z" fill="#1b1b25" stroke="${K}" stroke-width="2"/><ellipse cx="82" cy="92" rx="8" ry="6" fill="#fff"/><ellipse cx="118" cy="92" rx="8" ry="6" fill="#fff"/><circle cx="83" cy="92" r="3.5" fill="${K}"/><circle cx="119" cy="92" r="3.5" fill="${K}"/>`,
    bandages: () => `<path d="M54 66 Q100 54 146 68 M52 80 Q100 72 148 82 M54 116 Q100 108 146 118 M62 130 Q100 126 138 132" stroke="#cbbf9e" stroke-width="5" fill="none" opacity=".95"/><path d="M130 66 l10 -12 l4 14" fill="#e9dfc4" stroke="${K}" stroke-width="2"/>`,
    clownnose: () => `<circle cx="100" cy="108" r="11" fill="#e01e37" stroke="${K}" stroke-width="3"/><circle cx="96" cy="104" r="3" fill="#fff" opacity=".8"/>`,
    elfears: (l) => `<path d="M58 92 L28 74 L50 112Z M142 92 L172 74 L150 112Z" fill="${l.skin}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`,
    headphones: () => `<path d="M50 98 C44 26 156 26 150 98" fill="none" stroke="${K}" stroke-width="11"/><path d="M50 98 C44 26 156 26 150 98" fill="none" stroke="#ff4d6d" stroke-width="6"/><rect x="38" y="84" width="20" height="32" rx="8" ${st('#2b2b38', 3.5)}/><rect x="142" y="84" width="20" height="32" rx="8" ${st('#2b2b38', 3.5)}/>`,
    snorkel: () => `<rect x="60" y="78" width="80" height="32" rx="15" fill="#bfe9ff" fill-opacity=".55" stroke="#ffbe0b" stroke-width="5"/><path d="M60 92 L50 90 M140 92 L150 90" stroke="#ffbe0b" stroke-width="5"/><path d="M150 96 L158 40" stroke="${K}" stroke-width="9" stroke-linecap="round"/><path d="M150 96 L158 40" stroke="#ff8a3d" stroke-width="5" stroke-linecap="round"/>`,
    flowercrown: () => [66, 84, 100, 116, 134].map((x, i) => `<g transform="translate(${x} ${i % 2 ? 44 : 48})"><circle r="6" fill="${['#ff6fb5', '#fff', '#ffd23f', '#fff', '#ff6fb5'][i]}" stroke="${K}" stroke-width="2"/><circle r="2.2" fill="#ffbe0b"/></g>`).join(''),
  };

  const back = {
    wings: () => `<path d="M74 176 C24 120 6 206 58 214 C28 236 62 252 86 214Z" fill="#e0f7ff" fill-opacity=".9" stroke="${K}" stroke-width="3"/><path d="M126 176 C176 120 194 206 142 214 C172 236 138 252 114 214Z" fill="#e0f7ff" fill-opacity=".9" stroke="${K}" stroke-width="3"/>`,
    cape: () => `<path d="M28 246 L56 166 L100 156 L144 166 L172 246Z" ${st('#d62828')}/>`,
    veil: () => `<path d="M62 60 C34 120 24 200 30 246 L170 246 C176 200 166 120 138 60Z" fill="#ffffff" fill-opacity=".72" stroke="${K}" stroke-width="2.5"/>`,
  };

  const acc = {
    pan: (l) => `<path d="M150 214 L166 196" stroke="${K}" stroke-width="7" stroke-linecap="round"/><ellipse cx="176" cy="184" rx="22" ry="13" ${st('#3a3a46', 3.5)}/><ellipse cx="176" cy="182" rx="14" ry="7" fill="#ffd23f"/><circle cx="176" cy="182" r="4" fill="#fff6c9"/>${hand(l, 150, 214)}`,
    accordion: (l) => `<rect x="66" y="190" width="18" height="44" rx="3" ${st('#d62828', 3)}/><rect x="116" y="190" width="18" height="44" rx="3" ${st('#d62828', 3)}/><path d="M84 192 L90 232 L96 192 L102 232 L108 192 L116 232" fill="#f4f1ea" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M84 192 L116 192 M84 232 L116 232" stroke="${K}" stroke-width="2.5"/>${[198, 208, 218].map((y) => `<circle cx="75" cy="${y}" r="2.5" fill="#fff"/>`).join('')}${hand(l, 136, 214)}`,
    pizza: (l) => `<rect x="124" y="190" width="58" height="16" rx="3" ${st('#e8c08a', 3)}/><text x="153" y="202" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#d62828">PIZZA</text>${hand(l, 150, 214)}`,
    guitar: (l) => `<path d="M150 214 L178 120" stroke="#5e3a1e" stroke-width="8" stroke-linecap="round"/><rect x="172" y="104" width="14" height="22" rx="3" fill="#3a2a1e" transform="rotate(16 179 115)"/><ellipse cx="160" cy="222" rx="20" ry="17" ${st('#d9531e', 3.5)}/><circle cx="160" cy="220" r="5" fill="${K}"/>${hand(l, 156, 196)}`,
    coffee: (l) => `<path d="M140 186 L162 186 L158 214 L144 214Z" ${st('#fff', 3)}/><rect x="140" y="194" width="22" height="8" fill="#c08a5a"/><path d="M146 180 Q142 172 148 166 M156 180 Q152 172 158 166" stroke="#9aa5c4" stroke-width="2.5" fill="none" stroke-linecap="round"/>${hand(l, 150, 214)}`,
    duck: (l) => `<ellipse cx="158" cy="200" rx="16" ry="12" ${st('#ffd23f', 3)}/><circle cx="168" cy="186" r="9" ${st('#ffd23f', 3)}/><path d="M176 186 L186 189 L176 192Z" fill="#ff8a3d" stroke="${K}" stroke-width="2"/><circle cx="170" cy="184" r="2" fill="${K}"/>${hand(l, 150, 214)}`,
    catbag: (l) => `<path d="M138 196 L186 196 L182 236 L142 236Z" ${st('#8338ec', 3.5)}/><circle cx="162" cy="190" r="13" ${st('#f2a93b', 3)}/><path d="M151 182 L152 170 L160 178 M173 182 L172 170 L164 178" fill="#f2a93b" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="157" cy="190" r="2" fill="${K}"/><circle cx="167" cy="190" r="2" fill="${K}"/><path d="M160 195 L164 195" stroke="${K}" stroke-width="2"/>${hand(l, 158, 196)}`,
    bouquet: (l) => `<path d="M148 214 L140 190 M148 214 L150 186 M148 214 L160 190" stroke="#2e8b57" stroke-width="3"/>${[[138, 184, '#ff6fb5'], [152, 178, '#fff'], [164, 186, '#ffd23f'], [146, 192, '#e94f4f']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="${K}" stroke-width="2"/>`).join('')}${hand(l, 148, 214)}`,
    trident: (l) => `<path d="M150 244 L168 120" stroke="#e0b35a" stroke-width="6" stroke-linecap="round"/><path d="M156 124 L170 96 L182 128 M168 118 L170 94" fill="none" stroke="#e0b35a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${hand(l, 152, 206)}`,
  };
  const accHand = { pan: [150, 214], accordion: [136, 214], pizza: [150, 214], guitar: [156, 196], coffee: [150, 214], duck: [150, 214], catbag: [158, 196], bouquet: [148, 214], trident: [152, 206] };

  /* Paysages des nouvelles villes, vus par la fenêtre */
  const windows = {
    night: (k, t) => `<rect x="0" y="40" width="400" height="96" fill="url(#${k}-tunnel)"/><g class="scroll-cloud">${Array.from({ length: 28 }, (_, i) => `<circle cx="${(i * 53) % 800}" cy="${48 + ((i * 37) % 50)}" r="${i % 3 ? 1.2 : 2}" fill="#fff6c9" opacity="${i % 2 ? 0.9 : 0.5}"/>`).join('')}<circle cx="300" cy="62" r="13" fill="#fff6c9"/><circle cx="306" cy="58" r="11" fill="${t.window}"/><circle cx="700" cy="62" r="13" fill="#fff6c9"/><circle cx="706" cy="58" r="11" fill="${t.window}"/></g><g class="scroll-far"><path d="M0 120 Q60 96 120 114 T240 108 T360 116 T480 108 T600 116 T720 108 T840 116 L840 136 L0 136Z" fill="#141a33"/></g><g class="scroll-near"><path d="M0 128 L800 128 L800 136 L0 136Z" fill="#0b0f22"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 100 + 30}" y="104" width="4" height="26" fill="#0b0f22"/><circle cx="${i * 100 + 32}" cy="104" r="4" fill="#ffd66b" opacity=".85"/>`).join('')}</g>`,
    dusk: (k, t) => `<defs><linearGradient id="${k}-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b3a8f"/><stop offset=".55" stop-color="#f08a5d"/><stop offset="1" stop-color="#ffd27a"/></linearGradient></defs><rect x="0" y="40" width="400" height="96" fill="url(#${k}-dusk)"/><circle cx="250" cy="112" r="20" fill="#fff1b8" opacity=".9"/><g class="scroll-far"><path d="M0 118 L60 96 L110 116 L170 90 L230 118 L300 98 L360 118 L420 96 L470 116 L530 90 L590 118 L660 98 L720 118 L780 96 L800 106 L800 136 L0 136Z" fill="#6b3a5a" opacity=".85"/></g><g class="scroll-near"><path d="M0 126 Q50 118 100 126 T200 126 T300 126 T400 126 T500 126 T600 126 T700 126 T800 126 L800 136 L0 136Z" fill="#3b2240"/>${[40, 190, 330, 440, 590, 730].map((x) => `<path d="M${x} 128 L${x + 6} 100 L${x + 12} 128Z" fill="#2a1830"/>`).join('')}</g>`,
  };

  G.EXTRA = { hats, outfitFill, outfitDetail, sleeve, hairBack, hairFront, extras, back, acc, accHand, windows };

  // Plus de variété chez les passagers ordinaires
  G.HAIRS.push('ponytail', 'pigtails', 'buzz');
  G.HATS.push('cowboy', 'straw');
  G.OUTFITS.push('overalls', 'sweater', 'chef', 'leather');
  G.ACCS.push('coffee', 'duck', 'guitar', 'catbag', 'bouquet');
})();
