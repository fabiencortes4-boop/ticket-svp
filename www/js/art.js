/* Ticket SVP ! — graphismes 2D originaux, dessinés en SVG par le code.
   Style cartoon : contours épais, couleurs vives, grosses têtes. */
'use strict';

const INK = '#1e2a4a';
const SW = 4;
let uid = 0;

G.SKINS = ['#ffdcb5', '#f5c79a', '#e0a878', '#c58652', '#99623a', '#6e4428'];
G.HAIR_COLORS = ['#2b1b12', '#5a3a1e', '#9c5a2c', '#e8c25a', '#d9531e', '#b9b9b9', '#f2f2f2', '#7b4bcf', '#2fb5a8', '#ff6fb5'];
G.OUTFIT_COLORS = ['#e94f4f', '#3a86ff', '#ffbe0b', '#8338ec', '#2ec4b6', '#ff8fab', '#6a994e', '#f77f00', '#5c677d', '#118ab2'];
G.HAIRS = ['none', 'short', 'spiky', 'afro', 'bob', 'bun', 'mohawk', 'long', 'curly', 'side'];
G.HATS = ['none', 'none', 'none', 'beret', 'cap', 'beanie', 'bowler', 'flower', 'top'];
G.GLASSES = ['none', 'none', 'none', 'round', 'square', 'sun'];
G.FACIALS = ['none', 'none', 'none', 'mustache', 'beard', 'curly', 'goatee'];
G.OUTFITS = ['tee', 'suit', 'hoodie', 'stripes', 'dress', 'tee'];
G.ACCS = ['none', 'baguette', 'suitcase', 'balloon', 'phone', 'plant', 'fish', 'umbrella', 'newspaper', 'none'];

G.shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => G.clamp(Math.round(c + amt * 255), 0, 255);
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};

/* ---------- Pièces du personnage ---------- */

function torso(look) {
  const c = look.outfitColor;
  const w = look.build === 'round' ? 70 : look.build === 'slim' ? 48 : 58;
  const L = 100 - w;
  const R = 100 + w;
  const base = `M${L} 242 C${L} 190 ${L + 18} 160 100 160 C${R - 18} 160 ${R} 190 ${R} 242 Z`;
  let s = '';
  const o = look.outfit;
  if (o === 'hoodie') s += `<path d="M66 172 C70 150 130 150 134 172 C120 166 80 166 66 172Z" fill="${G.shade(c, -0.12)}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  if (o === 'cape' || o === 'vampire' || o === 'royalcape') {
    const cc = o === 'royalcape' ? '#c0262d' : '#1b1b25';
    s += `<path d="M${L - 14} 242 L${L + 6} 168 L100 156 L${R - 6} 168 L${R + 14} 242Z" fill="${cc}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  if (o === 'stripes') {
    const id = 'clip' + uid++;
    s += `<defs><clipPath id="${id}"><path d="${base}"/></clipPath></defs><path d="${base}" fill="#fdfdfd"/>`;
    s += `<g clip-path="url(#${id})">`;
    for (let y = 172; y < 242; y += 16) s += `<rect x="20" y="${y}" width="160" height="7" fill="${c}"/>`;
    s += `</g><path d="${base}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  } else if (o === 'hawaii') {
    const id = 'clip' + uid++;
    s += `<defs><clipPath id="${id}"><path d="${base}"/></clipPath></defs><path d="${base}" fill="#2ec4b6"/>`;
    s += `<g clip-path="url(#${id})">`;
    const spots = [[62, 190], [90, 214], [128, 186], [140, 226], [72, 232], [112, 236], [104, 180]];
    for (const [x, y] of spots) s += `<g transform="translate(${x} ${y})"><circle r="7" fill="#ff6fb5"/><circle r="3" fill="#ffe14d"/></g>`;
    s += `</g><path d="${base}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  } else if (G.EXTRA.outfitFill[o]) {
    s += G.EXTRA.outfitFill[o](look);
  } else {
    let fill = c;
    if (o === 'chef') fill = '#ffffff';
    if (o === 'leather') fill = '#1b1b25';
    if (o === 'foil') fill = '#c9d3dd';
    if (o === 'ninja') fill = '#2a2a33';
    if (o === 'trench') fill = '#c9a46a';
    if (o === 'robot') fill = '#9aa7b4';
    if (o === 'space') fill = '#f4f6f8';
    s += `<path d="${base}" fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  // volume : ombre propre côté droit, reflet sur l'épaule, plis des bras
  const sid = 'clip' + uid++;
  s += `<defs><clipPath id="${sid}"><path d="${base}"/></clipPath></defs><g clip-path="url(#${sid})" class="shading">
    <ellipse cx="${R + 4}" cy="238" rx="${w * 0.66}" ry="100" fill="${INK}" opacity=".17"/>
    <ellipse cx="${L + 26}" cy="182" rx="20" ry="11" fill="#fff" opacity=".25" transform="rotate(-24 ${L + 26} 182)"/>
    <path d="M${L + 17} 192 Q${L + 23} 218 ${L + 21} 248 M${R - 17} 192 Q${R - 23} 218 ${R - 21} 248" stroke="${INK}" stroke-width="3" opacity=".32" fill="none" stroke-linecap="round"/>
    <path d="M70 168 Q100 180 130 168" stroke="${INK}" stroke-width="10" opacity=".1" fill="none"/></g>
    <path d="${base}" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  // détails
  if (o === 'tee' || o === 'hoodie' || o === 'hawaii') s += `<path d="M84 162 Q100 176 116 162" fill="none" stroke="${INK}" stroke-width="3"/>`;
  if (o === 'hoodie') s += `<path d="M92 170 L90 196 M108 170 L110 196" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  if (o === 'suit' || o === 'trench') {
    s += `<path d="M86 160 L100 200 L114 160Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    if (o === 'suit') s += `<path d="M100 170 L95 180 L100 206 L105 180Z" fill="#d62828" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    s += `<path d="M86 160 L80 186 L94 184 M114 160 L120 186 L106 184" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  if (o === 'dress') s += `<path d="M78 164 Q100 184 122 164" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="182" r="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`;
  if (o === 'uniform') {
    const trim = look.trim || '#f2c14e';
    s += `<path d="M86 160 L100 196 L114 160" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<path d="M100 172 L96 180 L100 198 L104 180Z" fill="${trim}" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="M86 160 L78 190 L96 188 M114 160 L122 190 L104 188" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    for (const y of [208, 226]) s += `<circle cx="100" cy="${y}" r="4" fill="${trim}" stroke="${INK}" stroke-width="2"/>`;
    s += `<path d="M${L + 8} 196 L${L + 26} 196" stroke="${trim}" stroke-width="5" stroke-linecap="round"/><path d="M${R - 26} 196 L${R - 8} 196" stroke="${trim}" stroke-width="5" stroke-linecap="round"/>`;
  }
  if (o === 'ninja') s += `<path d="M70 200 L130 200" stroke="#d62828" stroke-width="7"/>`;
  if (G.EXTRA.outfitDetail[o]) s += G.EXTRA.outfitDetail[o](look);
  if (o === 'foil') s += `<path d="M70 190 L90 200 L80 216 L104 222 M120 186 L132 206 L114 214" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
  if (o === 'space') s += `<rect x="84" y="186" width="32" height="22" rx="4" fill="#3a86ff" stroke="${INK}" stroke-width="3"/><circle cx="92" cy="197" r="3" fill="#ff4d4d"/><circle cx="104" cy="197" r="3" fill="#ffe14d"/>`;
  if (o === 'royalcape') s += `<path d="M66 168 Q100 186 134 168 L134 180 Q100 198 66 180Z" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="84" cy="178" r="2.5" fill="${INK}"/><circle cx="100" cy="184" r="2.5" fill="${INK}"/><circle cx="116" cy="178" r="2.5" fill="${INK}"/>`;
  if (o === 'vampire') s += `<path d="M64 150 L76 176 L100 160 L124 176 L136 150" fill="#b0182a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  return s;
}

/* Bras : le gauche tend le ticket (ou montre une main vide), le droit tient l'accessoire */
const ACC_HAND = { baguette: [150, 214], suitcase: [158, 192], balloon: [150, 210], phone: [148, 214], plant: [138, 214], fish: [160, 214], umbrella: [150, 206], newspaper: [130, 214], selfie: [150, 212], wand: [146, 214], magnifier: [150, 214] };
function sleeveColor(look) {
  const o = look.outfit;
  if (G.EXTRA.sleeve[o]) return G.EXTRA.sleeve[o];
  if (o === 'stripes') return '#fdfdfd';
  if (o === 'hawaii') return '#2ec4b6';
  if (o === 'foil') return '#c9d3dd';
  if (o === 'ninja') return '#2a2a33';
  if (o === 'trench') return '#c9a46a';
  if (o === 'space') return '#f4f6f8';
  if (o === 'royalcape') return '#c0262d';
  if (o === 'cape' || o === 'vampire') return '#1b1b25';
  return look.outfitColor;
}
function limb(d, color) {
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="27" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="19" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity=".12" transform="translate(4 2)"/>`;
}
function arms(look, holding) {
  const w = look.build === 'round' ? 70 : look.build === 'slim' ? 48 : 58;
  const L = 100 - w;
  const R = 100 + w;
  const c = sleeveColor(look);
  const skin = look.skin;
  let s = '';
  // bras droit
  const hand = ACC_HAND[look.acc] || G.EXTRA.accHand[look.acc];
  if (hand) s += limb(`M${R - 16} 184 Q${R + 6} 232 ${hand[0]} ${hand[1]}`, c);
  else s += limb(`M${R - 15} 186 Q${R - 6} 212 ${R - 12} 230`, c);
  // bras gauche
  if (holding === 'ticket' || holding === 'pass') {
    s += limb(`M${L + 16} 184 Q${L - 6} 238 72 216`, c);
    const card = holding === 'pass'
      ? `<rect x="56" y="186" width="36" height="24" rx="4" fill="#cfe3ff" stroke="${INK}" stroke-width="2.5"/><rect x="56" y="186" width="36" height="7" rx="3" fill="#2b4c9b"/><circle cx="66" cy="202" r="4" fill="#ffd23f" stroke="${INK}" stroke-width="1.5"/>`
      : `<rect x="56" y="186" width="36" height="22" rx="3" fill="#fff3c4" stroke="${INK}" stroke-width="2.5"/><rect x="56" y="186" width="36" height="6" rx="2" fill="#b0428f"/><path d="M61 198 L80 198 M61 203 L74 203" stroke="${INK}" stroke-width="1.6" opacity=".5"/><rect x="56" y="204" width="36" height="4" fill="#4a3426"/>`;
    s += `<g class="held" transform="rotate(-12 74 198)">${card}</g>`;
    s += `<ellipse cx="72" cy="214" rx="11" ry="10" fill="${skin}" stroke="${INK}" stroke-width="3.5"/><path d="M64 208 Q68 202 74 204" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  } else if (holding === 'none') {
    // main vide tendue, paume vers le haut : « j'ai rien, chef »
    s += limb(`M${L + 16} 184 Q${L - 8} 232 66 212`, c);
    s += `<path d="M50 207 C49 200 54 199 56 203 C56 196 62 195 63 201 C63 194 70 194 70 201 C71 195 77 196 77 203 L80 204 C86 200 90 204 86 209 C82 218 72 221 62 219 C54 218 50 213 50 207Z" fill="${skin}" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/><path d="M58 212 Q67 215 76 211" stroke="${G.shade(skin, -0.2)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  } else {
    s += limb(`M${L + 15} 186 Q${L + 6} 212 ${L + 12} 230`, c);
  }
  return s;
}

function hairBack(look) {
  const c = look.hairColor;
  const st = `fill="${c}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"`;
  switch (look.hair) {
    case 'afro':
      return `<circle cx="100" cy="80" r="64" ${st}/>`;
    case 'bob':
      return `<path d="M48 96 C44 46 72 32 100 32 C128 32 156 46 152 96 L154 134 C140 140 128 136 124 128 L76 128 C72 136 60 140 46 134Z" ${st}/>`;
    case 'long':
      return `<path d="M50 90 C46 44 74 32 100 32 C126 32 154 44 150 90 L158 178 C140 188 124 176 122 160 L78 160 C76 176 60 188 42 178Z" ${st}/>`;
    case 'curly':
      return `<g ${st}><circle cx="56" cy="86" r="18"/><circle cx="144" cy="86" r="18"/><circle cx="58" cy="116" r="14"/><circle cx="142" cy="116" r="14"/></g>`;
    case 'bun':
      return `<circle cx="100" cy="34" r="18" ${st}/>`;
    case 'diva':
      return `<path d="M36 100 C26 40 66 18 100 22 C134 18 174 40 164 100 C172 130 160 156 140 150 L60 150 C40 156 28 130 36 100Z" ${st}/>`;
    case 'wild':
      return `<path d="M40 100 L28 70 L50 74 L40 44 L66 56 L70 26 L90 46 L100 18 L112 46 L132 26 L134 56 L160 44 L150 74 L172 70 L160 100Z" ${st}/>`;
    default:
      return G.EXTRA.hairBack[look.hair] ? G.EXTRA.hairBack[look.hair](look) : '';
  }
}

const HAIR_STRANDS = {"short": "M70 64 Q80 53 92 51 M110 51 Q122 55 132 66", "long": "M68 74 Q90 58 122 58 M84 50 Q104 46 128 54", "bob": "M78 47 Q74 64 76 82 M100 45 L100 82 M122 47 Q126 64 124 82", "slick": "M74 56 Q100 44 126 56 M80 64 Q100 54 120 64", "spiky": "M76 62 L80 44 M100 58 L100 36 M122 60 L122 42"};
function hairFront(look) {
  const out = hairFrontShape(look);
  const st = HAIR_STRANDS[look.hair === 'bun' ? 'short' : look.hair];
  if (!st) return out;
  return out + `<path d="${st}" fill="none" stroke="${G.shade(look.hairColor, -0.16)}" stroke-width="2.8" stroke-linecap="round" opacity=".9"/>`;
}
function hairFrontShape(look) {
  const c = look.hairColor;
  const st = `fill="${c}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"`;
  switch (look.hair) {
    case 'short':
    case 'bun':
      return `<path d="M54 90 C50 52 74 38 100 38 C126 38 150 52 146 90 C138 70 120 62 100 62 C80 62 62 70 54 90Z" ${st}/>`;
    case 'spiky':
      return `<path d="M52 88 L56 50 L70 62 L76 34 L92 54 L100 26 L110 52 L124 32 L130 60 L144 48 L148 88 C136 66 64 66 52 88Z" ${st}/>`;
    case 'afro':
      return `<path d="M56 76 C60 56 76 50 86 56 C92 46 110 46 116 56 C126 50 142 56 144 76 C130 66 70 66 56 76Z" ${st}/>`;
    case 'bob':
      return `<path d="M54 84 C54 52 76 42 100 42 C124 42 146 52 146 84 L54 84Z" ${st}/>`;
    case 'mohawk':
      return `<path d="M90 64 L86 22 L100 12 L114 22 L110 64Z" ${st}/>`;
    case 'long':
      return `<path d="M54 92 C52 50 78 40 104 42 C130 44 150 58 146 92 C130 70 96 60 70 74 C64 80 58 86 54 92Z" ${st}/>`;
    case 'curly':
      return `<g ${st}><circle cx="66" cy="62" r="16"/><circle cx="86" cy="50" r="16"/><circle cx="108" cy="48" r="16"/><circle cx="130" cy="58" r="16"/></g>`;
    case 'side':
      return `<path d="M54 86 C52 50 80 36 108 40 C134 44 150 62 146 86 C130 62 92 56 54 86Z" ${st}/><path d="M80 52 Q110 48 140 70" fill="none" stroke="${G.shade(c, 0.18)}" stroke-width="3"/>`;
    case 'slick':
      return `<path d="M54 88 C50 46 80 36 100 38 C120 36 150 46 146 88 C134 64 116 58 100 74 C84 58 66 64 54 88Z" ${st}/>`;
    case 'diva':
      return `<path d="M54 86 C60 40 140 40 146 86 C130 60 116 70 100 56 C84 70 70 60 54 86Z" ${st}/>`;
    case 'wild':
      return `<path d="M56 80 C60 56 80 48 100 50 C120 48 140 56 144 80 C126 66 74 66 56 80Z" ${st}/>`;
    case 'none':
      return `<path d="M76 56 Q90 48 104 50" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
    default:
      return G.EXTRA.hairFront[look.hair] ? G.EXTRA.hairFront[look.hair](look) : '';
  }
}

function headShape(look) {
  const st = `fill="${look.skin}" stroke="${INK}" stroke-width="${SW}"`;
  const inner = G.shade(look.skin, -0.14);
  let s = `<circle cx="54" cy="100" r="11" ${st}/><circle cx="146" cy="100" r="11" ${st}/>`;
  s += `<path d="M52 95 Q58 100 53 106 M148 95 Q142 100 147 106" stroke="${inner}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  let shape;
  if (look.head === 'oval') shape = `<ellipse cx="100" cy="94" rx="44" ry="52"/>`;
  else if (look.head === 'square') shape = `<rect x="54" y="44" width="92" height="98" rx="32"/>`;
  else shape = `<circle cx="100" cy="94" r="48"/>`;
  s += shape.replace('/>', ` ${st}/>`);
  // volume du visage : ombre douce à droite, reflet sur le front
  const hid = 'clip' + uid++;
  s += `<defs><clipPath id="${hid}">${shape}</clipPath></defs><g clip-path="url(#${hid})" class="shading">
    <path d="M116 42 C140 62 146 110 122 150 L176 150 L176 36Z" fill="${INK}" opacity=".15"/>
    <ellipse cx="100" cy="150" rx="46" ry="14" fill="${INK}" opacity=".08"/>
    <ellipse cx="78" cy="64" rx="13" ry="7" fill="#fff" opacity=".42" transform="rotate(-20 78 64)"/></g>`;
  return s;
}

function face(look, mood) {
  let s = '';
  const eyeY = 94;
  const lx = 82;
  const rx = 118;
  // sourcils
  const bc = look.hair === 'none' || look.hairColor === '#f2f2f2' ? '#6b5a4a' : look.hairColor;
  let bl = `M${lx - 9} 78 L${lx + 8} 78`;
  let br = `M${rx - 8} 78 L${rx + 9} 78`;
  if (mood === 'angry') {
    bl = `M${lx - 9} 74 L${lx + 9} 81`;
    br = `M${rx - 9} 81 L${rx + 9} 74`;
  } else if (mood === 'sad' || mood === 'nervous') {
    bl = `M${lx - 9} 81 L${lx + 8} 75`;
    br = `M${rx - 8} 75 L${rx + 9} 81`;
  } else if (mood === 'happy' || mood === 'shock') {
    bl = `M${lx - 9} 74 Q${lx} 68 ${lx + 9} 74`;
    br = `M${rx - 9} 74 Q${rx} 68 ${rx + 9} 74`;
  }
  s += `<path d="${bl} ${br}" stroke="${G.shade(bc, -0.1)}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
  // yeux
  const eyes = mood === 'happy' ? 'happy' : look.eyes;
  s += `<g class="eyes" style="animation-delay:-${(uid++ % 9) * 0.47}s">`;
  if (eyes === 'happy') {
    s += `<path d="M${lx - 7} ${eyeY + 2} Q${lx} ${eyeY - 7} ${lx + 7} ${eyeY + 2} M${rx - 7} ${eyeY + 2} Q${rx} ${eyeY - 7} ${rx + 7} ${eyeY + 2}" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (eyes === 'iris' && mood !== 'shock') {
    const ic = look.eyeColor || '#5a3a1e';
    for (const x of [lx, rx]) s += `<ellipse cx="${x}" cy="${eyeY}" rx="8.5" ry="9.5" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    s += `<g class="pupils">${[lx, rx].map((x) => `<circle cx="${x + 1}" cy="${eyeY + 1}" r="5.6" fill="${ic}"/><circle cx="${x + 1}" cy="${eyeY + 1}" r="2.6" fill="${INK}"/><circle cx="${x + 3}" cy="${eyeY - 2}" r="1.8" fill="#fff"/>`).join('')}</g>`;
    if (look.lashes) s += `<path d="M${lx - 9} ${eyeY - 5} l-5 -3 M${lx - 6} ${eyeY - 8} l-3 -4 M${rx + 9} ${eyeY - 5} l5 -3 M${rx + 6} ${eyeY - 8} l3 -4" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  } else if (eyes === 'big' || eyes === 'wide' || mood === 'shock') {
    const r = eyes === 'big' ? 10 : 8;
    s += `<ellipse cx="${lx}" cy="${eyeY}" rx="${r}" ry="${r + 1}" fill="#fff" stroke="${INK}" stroke-width="3"/><ellipse cx="${rx}" cy="${eyeY}" rx="${r}" ry="${r + 1}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
    s += `<g class="pupils"><circle cx="${lx + 1}" cy="${eyeY + 1}" r="${eyes === 'big' ? 5 : 3.5}" fill="${INK}"/><circle cx="${rx + 1}" cy="${eyeY + 1}" r="${eyes === 'big' ? 5 : 3.5}" fill="${INK}"/></g>`;
  } else if (eyes === 'sleepy') {
    s += `<g class="pupils"><circle cx="${lx}" cy="${eyeY + 1}" r="5" fill="${INK}"/><circle cx="${rx}" cy="${eyeY + 1}" r="5" fill="${INK}"/></g>`;
    s += `<path d="M${lx - 8} ${eyeY - 1} L${lx + 8} ${eyeY - 1} M${rx - 8} ${eyeY - 1} L${rx + 8} ${eyeY - 1}" stroke="${look.skin}" stroke-width="6"/><path d="M${lx - 8} ${eyeY + 1} L${lx + 8} ${eyeY + 1} M${rx - 8} ${eyeY + 1} L${rx + 8} ${eyeY + 1}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    s += `<g class="pupils"><circle cx="${lx}" cy="${eyeY}" r="5.5" fill="${INK}"/><circle cx="${rx}" cy="${eyeY}" r="5.5" fill="${INK}"/><circle cx="${lx + 2}" cy="${eyeY - 2}" r="1.6" fill="#fff"/><circle cx="${rx + 2}" cy="${eyeY - 2}" r="1.6" fill="#fff"/></g>`;
  }
  s += '</g>';
  // joues
  if (look.cheeks || mood === 'happy') s += `<circle cx="72" cy="114" r="7" fill="#ff7a8a" opacity=".45"/><circle cx="128" cy="114" r="7" fill="#ff7a8a" opacity=".45"/>`;
  // nez
  const ns = G.shade(look.skin, -0.12);
  if (look.nose === 'long') s += `<path d="M100 98 L94 118 L104 118" fill="${ns}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  else if (look.nose === 'small') s += `<path d="M96 110 Q100 114 104 110" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else s += `<ellipse cx="100" cy="109" rx="7" ry="6" fill="${ns}" stroke="${INK}" stroke-width="3"/>`;
  // bouche
  const m = mood === 'happy' ? 'grin' : mood === 'angry' ? 'flat' : mood === 'sad' ? 'frown' : mood === 'nervous' ? 'wavy' : mood === 'shock' ? 'o' : look.mouth;
  s += '<g class="mouth">';
  switch (m) {
    case 'grin':
      s += `<path d="M84 122 Q100 142 116 122Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M90 130 Q100 136 110 130" fill="none" stroke="#e85d75" stroke-width="3"/>`;
      break;
    case 'flat':
      s += `<path d="M88 128 L112 128" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case 'frown':
      s += `<path d="M86 132 Q100 120 114 132" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      break;
    case 'wavy':
      s += `<path d="M86 128 Q91 123 96 128 T106 128 T116 128" stroke="${INK}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      break;
    case 'o':
      s += `<ellipse cx="100" cy="128" rx="7" ry="9" fill="#5a1f2b" stroke="${INK}" stroke-width="3"/>`;
      break;
    case 'sing':
      s += `<ellipse cx="100" cy="128" rx="11" ry="12" fill="#5a1f2b" stroke="${INK}" stroke-width="3"/>`;
      break;
    default:
      s += `<path d="M86 124 Q100 136 114 124" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  s += '</g>';
  return s;
}

function facial(look) {
  const c = look.hair === 'none' ? '#5a3a1e' : look.hairColor;
  const st = `fill="${c}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  switch (look.facial) {
    case 'mustache':
      return `<path d="M78 120 C84 110 96 112 100 117 C104 112 116 110 122 120 C114 124 106 122 100 120 C94 122 86 124 78 120Z" ${st}/>`;
    case 'curly':
      return `<path d="M100 117 C92 110 80 112 76 120 C72 126 64 122 66 116 C62 126 76 132 84 124 C90 120 96 120 100 120 C104 120 110 120 116 124 C124 132 138 126 134 116 C136 122 128 126 124 120 C120 112 108 110 100 117Z" ${st}/>`;
    case 'beard':
      return `<path d="M54 100 C56 150 80 160 100 160 C120 160 144 150 146 100 C140 120 130 130 118 128 C112 120 88 120 82 128 C70 130 60 120 54 100Z" ${st}/><path d="M86 120 C92 114 108 114 114 120" ${st}/>`;
    case 'goatee':
      return `<path d="M90 136 Q100 160 110 136Z" ${st}/><path d="M84 120 C90 114 110 114 116 120" fill="none" stroke="${INK}" stroke-width="3"/>`;
    default:
      return '';
  }
}

function glasses(look) {
  const st = `stroke="${INK}" stroke-width="3.5"`;
  switch (look.glasses) {
    case 'round':
      return `<circle cx="82" cy="94" r="14" fill="#e8f6ff" fill-opacity=".35" ${st}/><circle cx="118" cy="94" r="14" fill="#e8f6ff" fill-opacity=".35" ${st}/><path d="M96 92 Q100 88 104 92 M68 92 L56 88 M132 92 L144 88" fill="none" ${st}/><path d="M74 88 L80 82 M110 88 L116 82" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>`;
    case 'square':
      return `<rect x="66" y="82" width="32" height="24" rx="5" fill="#e8f6ff" fill-opacity=".35" ${st}/><rect x="102" y="82" width="32" height="24" rx="5" fill="#e8f6ff" fill-opacity=".35" ${st}/><path d="M98 92 L102 92 M66 90 L56 88 M134 90 L144 88" fill="none" ${st}/><path d="M72 90 L78 85 M108 90 L114 85" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".85"/>`;
    case 'sun':
      return `<path d="M64 84 L98 84 L96 100 Q82 110 68 100Z M102 84 L136 84 L132 100 Q118 110 104 100Z" fill="#1b1b25" ${st} stroke-linejoin="round"/><path d="M98 88 L102 88" ${st}/><path d="M72 88 L80 88" stroke="#fff" stroke-width="2.5" opacity=".6"/>`;
    case 'goggles':
      return `<path d="M56 88 L144 88" stroke="#5a3a1e" stroke-width="8"/><circle cx="82" cy="90" r="15" fill="#7fd1ff" ${st}/><circle cx="118" cy="90" r="15" fill="#7fd1ff" ${st}/><circle cx="78" cy="86" r="4" fill="#fff" opacity=".8"/><circle cx="114" cy="86" r="4" fill="#fff" opacity=".8"/>`;
    case 'patch':
      return `<path d="M56 74 L146 104" stroke="${INK}" stroke-width="3"/><ellipse cx="118" cy="94" rx="14" ry="12" fill="${INK}"/>`;
    case 'ninja':
      return `<path d="M50 80 L150 80 L150 92 L50 92Z" fill="#1b1b25"/><path d="M150 84 L170 76 L166 90Z M150 88 L172 94 L162 100Z" fill="#1b1b25"/>`;
    default:
      return '';
  }
}

function hat(look) {
  const c = look.hatColor || '#d62828';
  const st = `fill="${c}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"`;
  switch (look.hat) {
    case 'beret':
      return `<path d="M52 66 C50 40 90 26 128 34 C156 40 158 58 146 66 C120 58 80 58 52 66Z" ${st}/><path d="M104 30 L108 20" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    case 'cap':
      return `<path d="M54 70 C52 38 76 28 100 28 C124 28 148 38 146 70Z" ${st}/><path d="M100 64 L168 66 C170 74 150 78 100 74Z" fill="${G.shade(c, -0.15)}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><circle cx="100" cy="30" r="5" fill="${G.shade(c, -0.15)}" stroke="${INK}" stroke-width="3"/>`;
    case 'top':
      return `<rect x="66" y="0" width="68" height="58" rx="6" ${st}/><rect x="66" y="40" width="68" height="10" fill="#e94f4f" stroke="${INK}" stroke-width="3"/><path d="M44 60 L156 60" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M44 60 L156 60" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
    case 'beanie':
      return `<path d="M54 72 C50 30 150 30 146 72Z" ${st}/><rect x="50" y="62" width="100" height="16" rx="7" fill="${G.shade(c, -0.15)}" stroke="${INK}" stroke-width="${SW}"/><circle cx="100" cy="26" r="11" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>`;
    case 'bowler':
      return `<path d="M62 62 C60 26 140 26 138 62Z" ${st}/><path d="M42 64 Q100 50 158 64" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M42 64 Q100 50 158 64" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
    case 'flower':
      return `<g transform="translate(138 58)"><circle cx="0" cy="-10" r="8" fill="#ff6fb5" stroke="${INK}" stroke-width="3"/><circle cx="10" cy="0" r="8" fill="#ff6fb5" stroke="${INK}" stroke-width="3"/><circle cx="0" cy="10" r="8" fill="#ff6fb5" stroke="${INK}" stroke-width="3"/><circle cx="-10" cy="0" r="8" fill="#ff6fb5" stroke="${INK}" stroke-width="3"/><circle r="6" fill="#ffe14d" stroke="${INK}" stroke-width="3"/></g>`;
    case 'kepi':
      return `<path d="M58 72 L62 34 C80 26 120 26 138 34 L142 72Z" ${st}/><rect x="58" y="58" width="84" height="12" fill="${look.trim || '#f2c14e'}" stroke="${INK}" stroke-width="3"/><path d="M58 72 Q100 64 142 72 L150 82 Q100 72 50 82Z" fill="${INK}"/><circle cx="100" cy="46" r="7" fill="${look.trim || '#f2c14e'}" stroke="${INK}" stroke-width="3"/>`;
    case 'tricorn':
      return `<path d="M30 70 Q60 20 100 30 Q140 20 170 70 Q100 50 30 70Z" ${st}/><path d="M80 40 L88 50 L96 40 L100 52 L104 40 L112 50 L120 40" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    case 'tophat':
      return `<rect x="68" y="2" width="64" height="58" rx="6" ${st}/><rect x="68" y="40" width="64" height="9" fill="${look.trim || '#e0b35a'}" stroke="${INK}" stroke-width="3"/><path d="M46 62 L154 62" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M46 62 L154 62" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="24" r="9" fill="#7fd1ff" stroke="${INK}" stroke-width="3"/><circle cx="110" cy="24" r="9" fill="#7fd1ff" stroke="${INK}" stroke-width="3"/>`;
    case 'crown':
      return `<path d="M60 64 L56 22 L78 42 L100 14 L122 42 L144 22 L140 64Z" fill="#ffd23f" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><circle cx="100" cy="48" r="6" fill="#e94f4f" stroke="${INK}" stroke-width="2.5"/><circle cx="76" cy="54" r="4" fill="#3a86ff" stroke="${INK}" stroke-width="2"/><circle cx="124" cy="54" r="4" fill="#3a86ff" stroke="${INK}" stroke-width="2"/>`;
    case 'bucket':
      return `<path d="M64 62 L70 30 C90 22 110 22 130 30 L136 62Z" ${st}/><path d="M40 70 Q100 50 160 70 L152 78 Q100 62 48 78Z" fill="${G.shade(c, -0.1)}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    case 'viking':
      return `<path d="M54 70 C50 30 150 30 146 70Z" fill="#c9d3dd" stroke="${INK}" stroke-width="${SW}"/><path d="M56 56 C36 50 30 30 38 14 C42 34 52 40 62 44Z M144 56 C164 50 170 30 162 14 C158 34 148 40 138 44Z" fill="#fff6dc" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M52 66 L148 66" stroke="#ffd23f" stroke-width="7"/>`;
    case 'fedora':
      return `<path d="M62 62 L68 30 Q100 18 132 30 L138 62Z" ${st}/><path d="M100 26 L100 40" stroke="${INK}" stroke-width="3"/><rect x="64" y="50" width="72" height="9" fill="${INK}"/><path d="M36 66 Q100 52 164 66" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M36 66 Q100 52 164 66" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
    case 'bonnet':
      return `<path d="M48 104 C40 40 160 40 152 104 C146 70 54 70 48 104Z" fill="#a8dcff" stroke="${INK}" stroke-width="${SW}"/><path d="M54 104 L60 140 M146 104 L140 140" stroke="#a8dcff" stroke-width="5"/>`;
    default:
      return G.EXTRA.hats[look.hat] ? G.EXTRA.hats[look.hat](look) : '';
  }
}

function accessory(look) {
  const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${look.skin}" stroke="${INK}" stroke-width="3.5"/>`;
  switch (look.acc) {
    case 'baguette':
      return `<g><rect x="128" y="150" width="20" height="96" rx="10" transform="rotate(24 138 198)" fill="#e2a74a" stroke="${INK}" stroke-width="3.5"/><path d="M140 168 l8 -4 M136 184 l8 -4 M132 200 l8 -4" stroke="#b77a26" stroke-width="3" stroke-linecap="round" transform="rotate(24 138 198)"/>${hand(150, 214)}</g>`;
    case 'suitcase':
      return `<g><rect x="138" y="196" width="50" height="40" rx="6" fill="#c0392b" stroke="${INK}" stroke-width="3.5"/><path d="M154 196 L154 188 L172 188 L172 196" fill="none" stroke="${INK}" stroke-width="3.5"/><rect x="138" y="210" width="50" height="6" fill="#f2c14e"/>${hand(158, 192)}</g>`;
    case 'balloon':
      return `<g class="balloon"><path d="M168 96 Q160 150 150 206" fill="none" stroke="${INK}" stroke-width="2"/><ellipse cx="170" cy="70" rx="22" ry="27" fill="#ff4d6d" stroke="${INK}" stroke-width="3.5"/><path d="M162 58 Q166 52 172 52" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/></g>${hand(150, 210)}`;
    case 'phone':
      return `<g><rect x="136" y="176" width="24" height="40" rx="5" fill="#222" stroke="${INK}" stroke-width="3"/><rect x="140" y="181" width="16" height="28" rx="2" fill="#7fd1ff"/>${hand(148, 214)}</g>`;
    case 'plant':
      return `<g><path d="M146 196 C130 170 140 150 152 176 C150 150 172 150 160 180 C176 166 182 180 162 196Z" fill="#4caf50" stroke="${INK}" stroke-width="3"/><path d="M140 196 L172 196 L166 230 L146 230Z" fill="#d97b46" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>${hand(138, 214)}</g>`;
    case 'fish':
      return `<g><path d="M128 200 C140 184 170 184 180 200 C170 216 140 216 128 200Z M180 200 L196 188 L196 212Z" fill="#7fb7ff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="140" cy="198" r="3" fill="${INK}"/>${hand(160, 214)}</g>`;
    case 'umbrella':
      return `<g><path d="M150 150 L150 236 Q150 244 142 244" fill="none" stroke="${INK}" stroke-width="4"/><path d="M118 160 Q150 120 182 160 Q174 154 166 160 Q158 152 150 160 Q142 152 134 160 Q126 154 118 160Z" fill="#8338ec" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>${hand(150, 206)}</g>`;
    case 'newspaper':
      return `<g><rect x="126" y="176" width="44" height="52" rx="3" fill="#f4f1ea" stroke="${INK}" stroke-width="3" transform="rotate(-8 148 202)"/><path d="M134 188 L162 184 M134 196 L162 192 M134 204 L156 201" stroke="#8a8a8a" stroke-width="3" transform="rotate(-8 148 202)"/>${hand(130, 214)}</g>`;
    case 'selfie':
      return `<g><path d="M150 210 L176 120" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><rect x="166" y="96" width="22" height="34" rx="4" fill="#222" stroke="${INK}" stroke-width="3" transform="rotate(16 177 113)"/><circle cx="177" cy="108" r="3" fill="#ff4d6d"/>${hand(150, 212)}</g>`;
    case 'wand':
      return `<g><path d="M146 214 L182 170" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M174 180 L182 170" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M186 156 l3 8 8 1 -6 5 2 8 -7 -4 -7 4 2 -8 -6 -5 8 -1z" fill="#ffe14d" stroke="${INK}" stroke-width="2"/>${hand(146, 214)}</g>`;
    case 'camera':
      return `<g><path d="M80 160 L96 196 M120 160 L104 196" stroke="${INK}" stroke-width="3"/><rect x="82" y="190" width="36" height="26" rx="5" fill="#333" stroke="${INK}" stroke-width="3"/><circle cx="100" cy="203" r="8" fill="#7fd1ff" stroke="${INK}" stroke-width="3"/></g>`;
    case 'magnifier':
      return `<g><path d="M150 214 L168 186" stroke="#7a5230" stroke-width="7" stroke-linecap="round"/><circle cx="176" cy="172" r="16" fill="#e8f6ff" fill-opacity=".6" stroke="${INK}" stroke-width="4"/>${hand(150, 214)}</g>`;
    case 'parrot':
      return `<g transform="translate(140 132)"><path d="M0 30 C-4 10 6 -6 18 -4 C30 -2 30 16 22 30Z" fill="#2ec4b6" stroke="${INK}" stroke-width="3"/><circle cx="14" cy="2" r="9" fill="#e94f4f" stroke="${INK}" stroke-width="3"/><path d="M22 0 L32 4 L22 9Z" fill="#ffbe0b" stroke="${INK}" stroke-width="2.5"/><circle cx="15" cy="0" r="2" fill="${INK}"/></g>`;
    case 'pacifier':
      return `<g><circle cx="100" cy="128" r="10" fill="#ff8fab" stroke="${INK}" stroke-width="3"/><circle cx="100" cy="128" r="4" fill="#fff"/></g>`;
    case 'pearls':
      return `<g fill="#fff" stroke="${INK}" stroke-width="2">${[76, 84, 92, 100, 108, 116, 124].map((x, i) => `<circle cx="${x}" cy="${168 + Math.abs(i - 3) * -2 + 6}" r="4.5"/>`).join('')}</g>`;
    default:
      return G.EXTRA.acc[look.acc] ? G.EXTRA.acc[look.acc](look) : '';
  }
}

function extras(look) {
  let s = '';
  const ex = look.extras || [];
  if (ex.includes('mimepaint')) s += `<path d="M118 100 L114 112 L122 112Z" fill="${INK}"/><path d="M90 126 Q100 132 110 126" stroke="#e01e37" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (ex.includes('fangs')) s += `<path d="M92 126 L95 134 L98 126 M102 126 L105 134 L108 126" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
  if (ex.includes('antennae')) s += `<path d="M80 50 L66 16 M120 50 L134 16" stroke="${INK}" stroke-width="4"/><circle cx="66" cy="14" r="7" fill="#ffe14d" stroke="${INK}" stroke-width="3"/><circle cx="134" cy="14" r="7" fill="#ffe14d" stroke="${INK}" stroke-width="3"/>`;
  if (ex.includes('alieneyes')) s += `<ellipse cx="80" cy="94" rx="13" ry="17" fill="${INK}" transform="rotate(-18 80 94)"/><ellipse cx="120" cy="94" rx="13" ry="17" fill="${INK}" transform="rotate(18 120 94)"/><circle cx="76" cy="88" r="4" fill="#fff"/><circle cx="116" cy="88" r="4" fill="#fff"/>`;
  if (ex.includes('muscles')) s += `<path d="M44 206 C30 190 40 168 58 176 C64 168 78 172 74 186" fill="${look.skin}" stroke="${INK}" stroke-width="3.5"/><path d="M156 206 C170 190 160 168 142 176 C136 168 122 172 126 186" fill="${look.skin}" stroke="${INK}" stroke-width="3.5"/>`;
  if (ex.includes('notes')) s += `<g class="notes" fill="${INK}"><path d="M160 60 L160 40 L172 36 L172 56" stroke="${INK}" stroke-width="3" fill="none"/><circle cx="157" cy="61" r="5"/><circle cx="169" cy="57" r="5"/></g>`;
  if (ex.includes('helmet')) s += `<circle cx="100" cy="94" r="64" fill="#bfe9ff" fill-opacity=".25" stroke="${INK}" stroke-width="5"/><path d="M60 70 Q70 46 96 40" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>`;
  if (ex.includes('ringlight')) s += `<circle cx="170" cy="64" r="20" fill="none" stroke="#fff6a8" stroke-width="7"/><circle cx="170" cy="64" r="20" fill="none" stroke="${INK}" stroke-width="2"/>`;
  if (ex.includes('badge')) s += `<path d="M64 196 l8 -6 8 6 -3 10 -10 0z" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>`;
  s += ex.map((e) => (G.EXTRA.extras[e] ? G.EXTRA.extras[e](look) : '')).join('');
  return s;
}

/* Personnages entièrement spéciaux */
function ghostSvg(mood) {
  const eyes = mood === 'angry' ? `<path d="M72 84 L90 92 M128 84 L110 92" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` : '';
  return `<g opacity=".88"><path d="M40 236 L40 110 C40 50 70 30 100 30 C130 30 160 50 160 110 L160 236 L146 222 L132 236 L118 222 L100 236 L82 222 L68 236 L54 222Z" fill="#f4f8ff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <ellipse cx="80" cy="100" rx="10" ry="14" fill="${INK}"/><ellipse cx="120" cy="100" rx="10" ry="14" fill="${INK}"/>${eyes}
  <ellipse cx="100" cy="138" rx="${mood === 'happy' ? 14 : 9}" ry="${mood === 'shock' || mood === 'angry' ? 14 : 10}" fill="${INK}"/>
  <rect x="112" y="170" width="38" height="22" rx="3" fill="#fff3c4" stroke="${INK}" stroke-width="3" transform="rotate(-10 131 181)"/></g>`;
}

function robotSvg(mood) {
  const led = mood === 'angry' ? '#ff4d4d' : mood === 'happy' ? '#7dff9a' : '#7fd1ff';
  return `<g><rect x="50" y="160" width="100" height="84" rx="10" fill="#9aa7b4" stroke="${INK}" stroke-width="${SW}"/>
  <rect x="70" y="176" width="60" height="34" rx="4" fill="#34495e" stroke="${INK}" stroke-width="3"/><circle cx="84" cy="193" r="5" fill="#ffe14d"/><circle cx="100" cy="193" r="5" fill="#ff4d4d"/><circle cx="116" cy="193" r="5" fill="#7dff9a"/>
  <rect x="88" y="140" width="24" height="24" fill="#7f8c99" stroke="${INK}" stroke-width="3"/>
  <path d="M100 46 L100 22" stroke="${INK}" stroke-width="4"/><circle cx="100" cy="18" r="8" fill="#ff4d4d" stroke="${INK}" stroke-width="3" class="blink"/>
  <rect x="50" y="44" width="100" height="100" rx="16" fill="#c3ccd6" stroke="${INK}" stroke-width="${SW}"/>
  <rect x="62" y="70" width="76" height="34" rx="8" fill="#22303f" stroke="${INK}" stroke-width="3"/>
  <circle cx="82" cy="87" r="8" fill="${led}"/><circle cx="118" cy="87" r="8" fill="${led}"/>
  <rect x="74" y="114" width="52" height="16" rx="3" fill="#7f8c99" stroke="${INK}" stroke-width="3"/><path d="M84 114 L84 130 M94 114 L94 130 M104 114 L104 130 M114 114 L114 130" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="44" cy="94" r="9" fill="#7f8c99" stroke="${INK}" stroke-width="3"/><circle cx="156" cy="94" r="9" fill="#7f8c99" stroke="${INK}" stroke-width="3"/></g>`;
}

function dogsSvg(mood) {
  const brown = '#a0673c';
  const tongue = mood === 'happy' || mood === 'escaped' ? `<path d="M100 138 Q100 156 108 152 Q112 146 108 136Z" fill="#ff7a8a" stroke="${INK}" stroke-width="2.5"/>` : '';
  return `<g><path d="M38 244 C38 186 58 158 100 158 C142 158 162 186 162 244Z" fill="#c9a46a" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <path d="M100 160 L100 244" stroke="${INK}" stroke-width="3"/><circle cx="90" cy="196" r="4" fill="${INK}"/><circle cx="90" cy="220" r="4" fill="${INK}"/>
  <g transform="translate(110 186)"><ellipse cx="0" cy="8" rx="16" ry="14" fill="#d9a066" stroke="${INK}" stroke-width="3"/><circle cx="-5" cy="4" r="3" fill="${INK}"/><circle cx="6" cy="4" r="3" fill="${INK}"/><ellipse cx="0" cy="13" rx="5" ry="3.5" fill="${INK}"/><path d="M-14 -2 C-22 6 -20 16 -14 18 M14 -2 C22 6 20 16 14 18" fill="#8a5432" stroke="${INK}" stroke-width="3"/></g>
  <path d="M60 236 C46 228 44 210 52 204" fill="none" stroke="${brown}" stroke-width="8" stroke-linecap="round" class="tail"/>
  <path d="M50 70 C36 80 34 118 46 128 C54 118 58 96 62 84Z M150 70 C164 80 166 118 154 128 C146 118 142 96 138 84Z" fill="#7a4a26" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
  <ellipse cx="100" cy="96" rx="46" ry="48" fill="${brown}" stroke="${INK}" stroke-width="${SW}"/>
  <ellipse cx="100" cy="122" rx="24" ry="18" fill="#e2b48a" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="100" cy="112" rx="9" ry="7" fill="${INK}"/><path d="M100 119 L100 128 M92 130 Q100 136 108 130" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>${tongue}
  <circle cx="82" cy="90" r="6" fill="${INK}"/><circle cx="118" cy="90" r="6" fill="${INK}"/><circle cx="84" cy="88" r="2" fill="#fff"/><circle cx="120" cy="88" r="2" fill="#fff"/>
  ${hat({ hat: 'fedora', hatColor: '#6b5a4a' })}</g>`;
}

/* Rend un passager complet (ou une photo d'identité si opts.photo). */
const HAIR_SHINE = ['ponytail', 'pigtails', 'short', 'bun', 'spiky', 'bob', 'long', 'side', 'slick', 'diva', 'wild', 'curly'];

G.drawPerson = (look, opts = {}) => {
  const mood = opts.mood || 'neutral';
  const photo = !!opts.photo;
  let inner = '';
  if (look.kind === 'ghost') inner = ghostSvg(mood);
  else if (look.kind === 'robot') inner = robotSvg(mood);
  else if (look.kind === 'dogs') inner = dogsSvg(mood);
  else {
    const l = photo ? Object.assign({}, look, { acc: look.acc === 'parrot' || look.acc === 'pacifier' || look.acc === 'pearls' || look.acc === 'camera' ? look.acc : 'none' }) : look;
    if (!photo) inner += `<ellipse cx="100" cy="246" rx="76" ry="11" fill="#000" opacity=".2"/>`;
    inner += (l.back || []).map((b) => (G.EXTRA.back[b] ? G.EXTRA.back[b](l) : '')).join('');
    inner += hairBack(l);
    inner += torso(l);
    if (!photo) inner += arms(l, opts.holding);
    inner += `<rect x="86" y="128" width="28" height="38" fill="${l.skin}" stroke="${INK}" stroke-width="${SW}"/><ellipse cx="100" cy="146" rx="15" ry="7" fill="${INK}" opacity=".2"/>`;
    if (l.outfit === 'uniform' || l.outfit === 'suit') inner += `<path d="M86 160 L100 170 L114 160" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    inner += headShape(l);
    inner += face(l, mood);
    inner += facial(l);
    inner += hairFront(l);
    if (HAIR_SHINE.includes(l.hair) && l.hat !== 'top' && l.hat !== 'beanie' && l.hat !== 'bonnet') inner += `<path d="M70 60 Q84 48 102 47" stroke="${G.shade(l.hairColor, 0.28)}" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".75"/>`;
    inner += glasses(l);
    inner += hat(l);
    inner += extras(l);
    inner += accessory(l);
  }
  let fx = '';
  if (opts.nervous && !photo) fx = `<g class="sweat"><path d="M150 64 C146 72 146 78 150 80 C154 78 154 72 150 64Z" fill="#7fd1ff" stroke="${INK}" stroke-width="2"/><path d="M48 76 C45 82 45 86 48 88 C51 86 51 82 48 76Z" fill="#7fd1ff" stroke="${INK}" stroke-width="2"/></g>`;
  const vb = photo ? '22 4 156 172' : '0 0 200 246';
  const cls = ['pax-svg', photo ? 'photo' : '', opts.nervous ? 'is-nervous' : '', opts.cls || ''].join(' ');
  return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="pax-body">${inner}${fx}</g></svg>`;
};

/* Le contrôleur (avatar du joueur) avec son uniforme équipé */
G.conductorLook = (uniformId) => {
  const u = G.UNIFORMS.find((x) => x.id === uniformId) || G.UNIFORMS[0];
  return {
    kind: 'person', skin: '#f5c79a', head: 'round', hair: 'short', hairColor: '#5a3a1e', eyes: 'dot', nose: 'round', mouth: 'smile',
    glasses: 'none', facial: 'mustache', hat: u.hat, hatColor: u.hatColor, outfit: 'uniform', outfitColor: u.coat, trim: u.trim, build: 'normal', acc: 'none', cheeks: true,
  };
};

/* ---------- Décor : intérieur de rame ---------- */
function seated(x, flip, kind, tint) {
  // Voyageur assis en arrière-plan, en silhouette colorée pour donner de la profondeur
  const f = flip ? -1 : 1;
  const tr = `translate(${x} 0) scale(${f} 1)`;
  let extra = '';
  if (kind === 'paper') extra = `<rect x="-6" y="166" width="34" height="42" rx="3" fill="#f4f1ea" stroke="${INK}" stroke-width="2.5" transform="rotate(-6 11 187)"/><path d="M0 178 L22 175 M0 186 L22 183 M0 194 L16 192" stroke="#9aa0b3" stroke-width="2.5" transform="rotate(-6 11 187)"/>`;
  if (kind === 'phone') extra = `<rect x="6" y="176" width="12" height="20" rx="3" fill="#2b2b38" stroke="${INK}" stroke-width="2"/><rect x="8" y="178" width="8" height="14" fill="#7fd1ff"/>`;
  if (kind === 'sleep') extra = `<text x="16" y="138" font-family="Lilita One, sans-serif" font-size="16" fill="${INK}" opacity=".55" class="zzz">z</text>`;
  return `<g transform="${tr}" opacity=".9">
    <path d="M-26 236 C-26 192 -14 176 0 176 C14 176 26 192 26 236Z" fill="${tint}" stroke="${INK}" stroke-width="3"/>
    <g class="${kind === 'sleep' ? 'seat-nod' : 'seat-look'}">
    <circle cx="0" cy="156" r="17" fill="${G.shade(tint, 0.25)}" stroke="${INK}" stroke-width="3"/>
    <path d="M-17 152 C-16 134 16 134 17 152 C8 144 -8 144 -17 152Z" fill="${G.shade(tint, -0.25)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${kind === 'sleep' ? `<path d="M-8 158 Q-4 161 0 158 M4 158 Q8 161 12 158" stroke="${INK}" stroke-width="2.5" fill="none"/>` : `<circle cx="-5" cy="157" r="2.5" fill="${INK}"/><circle cx="7" cy="157" r="2.5" fill="${INK}"/>`}
    </g>
    ${extra}</g>`;
}

G.drawScene = (city) => {
  const t = city.theme;
  const bus = city.id === 'bus';
  const k = 'sc' + uid++;
  const windowContent = city.window && G.EXTRA.windows[city.window]
    ? G.EXTRA.windows[city.window](k, t)
    : bus
    ? `<rect x="0" y="40" width="400" height="96" fill="url(#${k}-sky)"/><g class="scroll-cloud" fill="#fff" opacity=".9"><ellipse cx="60" cy="62" rx="22" ry="9"/><ellipse cx="74" cy="56" rx="14" ry="9"/><ellipse cx="260" cy="58" rx="28" ry="10"/><ellipse cx="280" cy="52" rx="16" ry="9"/><ellipse cx="460" cy="62" rx="22" ry="9"/><ellipse cx="474" cy="56" rx="14" ry="9"/><ellipse cx="660" cy="58" rx="28" ry="10"/><ellipse cx="680" cy="52" rx="16" ry="9"/></g><g class="scroll-far"><path d="M0 116 Q50 88 100 110 T200 106 T300 110 T400 106 T500 110 T600 106 T700 110 T800 106 L800 136 L0 136Z" fill="#8fd17f"/><g fill="#f4f1ea" stroke="${INK}" stroke-width="1.5">${[70, 330, 470, 730].map((x) => `<rect x="${x}" y="98" width="16" height="12"/><path d="M${x - 2} 98 L${x + 8} 90 L${x + 18} 98Z" fill="#d9534f"/>`).join('')}</g></g><g class="scroll-near"><path d="M0 126 Q40 112 80 124 T160 122 T240 124 T320 122 T400 124 T480 122 T560 124 T640 122 T720 124 T800 122 L800 136 L0 136Z" fill="#4f9e4a"/><g fill="#2f6b2c" stroke="${INK}" stroke-width="1.5">${[30, 140, 260, 370, 430, 540, 660, 770].map((x) => `<rect x="${x - 2}" y="112" width="4" height="16" fill="#6b4f3a"/><circle cx="${x}" cy="108" r="12"/><circle cx="${x - 4}" cy="104" r="4" fill="#4f9e4a" stroke="none"/>`).join('')}</g><g stroke="#8a7a5a" stroke-width="2">${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 40} 128 L${i * 40} 136"/>`).join('')}</g></g>`
    : `<rect x="0" y="40" width="400" height="96" fill="url(#${k}-tunnel)"/><g class="scroll-far">${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 80} 120 l40 -6 l40 6" stroke="#ffffff" stroke-opacity=".12" stroke-width="3" fill="none"/><rect x="${i * 80 + 52}" y="66" width="14" height="22" rx="2" fill="#000" opacity=".25"/>`).join('')}</g><g class="scroll-near">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 80 + 6}" y="80" width="48" height="10" rx="5" fill="#ffd66b" opacity=".18"/><rect x="${i * 80 + 10}" y="83" width="40" height="4" rx="2" fill="#fff3c4" opacity=".95"/><rect x="${i * 80 + 30}" y="50" width="3" height="80" fill="#000" opacity=".35"/>`).join('')}</g>`;
  const stations = [36, 96, 156, 216, 276, 336];
  return `<svg class="scene-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="${k}-wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shade(t.wall, 0.03)}"/><stop offset="1" stop-color="${t.wall2}"/></linearGradient>
    <linearGradient id="${k}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shade(t.floor, -0.12)}"/><stop offset="1" stop-color="${t.floor}"/></linearGradient>
    <linearGradient id="${k}-glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe6" stop-opacity=".55"/><stop offset="1" stop-color="#fffbe6" stop-opacity="0"/></linearGradient>
    <linearGradient id="${k}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shade(t.sky, -0.08)}"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient>
    <linearGradient id="${k}-tunnel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shade(t.window, -0.05)}"/><stop offset=".5" stop-color="${G.shade(t.window, 0.06)}"/><stop offset="1" stop-color="${G.shade(t.window, -0.08)}"/></linearGradient>
    <linearGradient id="${k}-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shade(t.seat, 0.08)}"/><stop offset="1" stop-color="${G.shade(t.seat, -0.08)}"/></linearGradient>
    <radialGradient id="${k}-vig" cx=".5" cy=".42" r=".75"><stop offset=".55" stop-color="#0b1020" stop-opacity="0"/><stop offset="1" stop-color="#0b1020" stop-opacity=".42"/></radialGradient>
    <clipPath id="${k}-win"><rect x="20" y="40" width="360" height="96" rx="18"/></clipPath>
    <pattern id="${k}-moq" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M6 1.5 L10.5 6 L6 10.5 L1.5 6Z" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1.1"/><circle cx="6" cy="6" r="1.3" fill="#000" fill-opacity=".2"/><circle cx="0" cy="0" r="1.1" fill="#fff" fill-opacity=".22"/><circle cx="12" cy="0" r="1.1" fill="#fff" fill-opacity=".22"/><circle cx="0" cy="12" r="1.1" fill="#fff" fill-opacity=".22"/><circle cx="12" cy="12" r="1.1" fill="#fff" fill-opacity=".22"/></pattern>
    <pattern id="${k}-stud" width="14" height="9" patternUnits="userSpaceOnUse"><circle cx="4" cy="3" r="2.3" fill="#000" fill-opacity=".16"/><circle cx="3.5" cy="2.4" r="1" fill="#fff" fill-opacity=".2"/><circle cx="11" cy="7.5" r="2.3" fill="#000" fill-opacity=".16"/><circle cx="10.5" cy="6.9" r="1" fill="#fff" fill-opacity=".2"/></pattern>
    ${G.TEX && G.TEX.grain ? `<pattern id="${k}-grain" width="64" height="64" patternUnits="userSpaceOnUse"><image href="${G.TEX.grain}" width="64" height="64"/></pattern>` : ''}
  </defs>
  <rect width="400" height="300" fill="url(#${k}-wall)"/>
  ${G.TEX && G.TEX.grain ? `<rect width="400" height="300" fill="url(#${k}-grain)"/>` : ''}
  ${[34, 142, 262].map((y) => `<path d="M0 ${y + 4} L400 ${y + 4}" stroke="#fff" stroke-width="1.2" opacity=".18"/>`).join('')}
  ${[24, 104, 176, 224, 296, 376].map((x) => `<circle cx="${x}" cy="146" r="1.6" fill="${INK}" opacity=".18"/><circle cx="${x}" cy="256" r="1.6" fill="${INK}" opacity=".18"/>`).join('')}
  ${[60, 140, 260, 340].map((x) => `<path d="M${x} 136 L${x} 262" stroke="${INK}" stroke-width="1.5" opacity=".08"/>`).join('')}
  <rect y="0" width="400" height="34" fill="${t.wall2}"/><path d="M0 34 L400 34" stroke="${INK}" stroke-width="2" opacity=".2"/>
  <g class="ceil-lights">${[70, 200, 330].map((x) => `<rect x="${x - 40}" y="28" width="80" height="6" rx="3" fill="#fffef2" stroke="${INK}" stroke-width="1.5"/>`).join('')}</g>
  <rect x="0" y="34" width="400" height="60" fill="url(#${k}-glow)"/>
  <g><rect x="30" y="6" width="340" height="18" rx="9" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M${stations[0]} 15 L${stations[5]} 15" stroke="${city.lineColor}" stroke-width="5" stroke-linecap="round"/>${stations.map((x, i) => `<circle cx="${x}" cy="15" r="${i === 2 ? 5.5 : 4}" fill="${i === 2 ? '#fff' : city.lineColor}" stroke="${INK}" stroke-width="2"/>`).join('')}<circle cx="${stations[2]}" cy="15" r="2.2" fill="#e94f4f" class="blink"/></g>
  <rect x="14" y="34" width="372" height="108" rx="22" fill="${G.shade(t.wall2, -0.08)}" stroke="${INK}" stroke-width="3"/>
  <g clip-path="url(#${k}-win)">${windowContent}
    <path d="M40 40 L90 40 L40 136 L-10 136Z M110 40 L130 40 L82 136 L62 136Z M240 40 L290 40 L240 136 L190 136Z M310 40 L330 40 L282 136 L262 136Z" fill="#fff" opacity=".1"/>
    <rect x="20" y="40" width="360" height="10" fill="#000" opacity=".18"/></g>
  <rect x="20" y="40" width="360" height="96" rx="18" fill="none" stroke="${INK}" stroke-width="5"/>
  <path d="M200 40 L200 136" stroke="${INK}" stroke-width="5"/>
  ${seated(46, false, 'paper', '#7d8fb8')}${seated(356, true, 'sleep', '#c08a6a')}
  <path d="M0 150 L400 150" stroke="${t.pole}" stroke-width="7"/><path d="M0 148.5 L400 148.5" stroke="#fff" stroke-width="1.5" opacity=".6"/><path d="M0 150 L400 150" stroke="${INK}" stroke-width="2" opacity=".35"/>
  ${[60, 130, 270, 340].map((x) => `<g class="handle" style="transform-origin:${x}px 150px"><path d="M${x} 150 L${x} 168" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="176" r="9" fill="none" stroke="${t.pole}" stroke-width="5"/><circle cx="${x}" cy="176" r="9" fill="none" stroke="${INK}" stroke-width="1.5"/></g>`).join('')}
  <rect x="-10" y="198" width="120" height="60" rx="14" fill="url(#${k}-seat)" stroke="${INK}" stroke-width="4"/><rect x="-8" y="200" width="116" height="56" rx="12" fill="url(#${k}-moq)"/><path d="M4 210 L96 210" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/><rect x="-10" y="236" width="128" height="30" rx="10" fill="${t.seat2}" stroke="${INK}" stroke-width="4"/>
  <rect x="290" y="198" width="120" height="60" rx="14" fill="url(#${k}-seat)" stroke="${INK}" stroke-width="4"/><rect x="292" y="200" width="116" height="56" rx="12" fill="url(#${k}-moq)"/><path d="M304 210 L396 210" stroke="#fff" stroke-width="3" opacity=".25" stroke-linecap="round"/><rect x="282" y="236" width="128" height="30" rx="10" fill="${t.seat2}" stroke="${INK}" stroke-width="4"/>
  <rect x="0" y="262" width="400" height="38" fill="url(#${k}-floor)"/><rect x="0" y="264" width="400" height="36" fill="url(#${k}-stud)"/><path d="M0 262 L400 262" stroke="${INK}" stroke-width="4"/>
  <ellipse cx="60" cy="270" rx="70" ry="5" fill="#000" opacity=".18"/><ellipse cx="340" cy="270" rx="70" ry="5" fill="#000" opacity=".18"/>
  ${[-60, -10, 40, 90, 140, 190, 240, 290, 340, 390].map((x) => `<path d="M${200 + (x - 200) * 0.7} 264 L${200 + (x - 200) * 1.25} 300" stroke="${INK}" stroke-width="1.5" opacity=".15"/>`).join('')}
  <path d="M0 280 L400 280" stroke="${INK}" stroke-width="1.2" opacity=".12"/>
  <rect x="122" y="30" width="7" height="232" fill="${t.pole}" stroke="${INK}" stroke-width="2.5"/><path d="M124 34 L124 258" stroke="#fff" stroke-width="1.5" opacity=".7"/>
  <rect x="271" y="30" width="7" height="232" fill="${t.pole}" stroke="${INK}" stroke-width="2.5"/><path d="M273 34 L273 258" stroke="#fff" stroke-width="1.5" opacity=".7"/>
  <rect width="400" height="300" fill="url(#${k}-vig)" pointer-events="none"/>
  </svg>`;
};

/* ---------- Icônes d'interface (24×24) ---------- */
const IC = {
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.6" fill="currentColor"/>',
  zone: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  photo: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="12" cy="10.5" r="3"/><path d="M6.5 18c1.2-2.6 3.2-3.8 5.5-3.8s4.3 1.2 5.5 3.8"/>',
  percent: '<path d="M18.5 5.5l-13 13"/><circle cx="7" cy="7" r="2.6"/><circle cx="17" cy="17" r="2.6"/>',
  stamp: '<path d="M9 3.5h6v5.5l2.5 3H6.5L9 9z"/><rect x="4" y="12" width="16" height="4" rx="1.5"/><path d="M5 20.5h14"/>',
  card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/><circle cx="8" cy="11" r="2.2"/><path d="M5 16c.6-1.5 1.6-2.2 3-2.2s2.4.7 3 2.2M13.5 10h5M13.5 13.5h4"/>',
  megaphone: '<path d="M4 10v4l3 .5L17 19V5L7 9.5z"/><path d="M7 14.5l1.5 5h2.5l-1-4.5M20 9.5v5"/>',
  pause: '<rect x="6.5" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/><rect x="13.9" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  clock: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4.5l3 1.8M10 3h4"/>',
  uv: '<path d="M9 3h6l-1 6h-4z"/><rect x="9.5" y="9" width="5" height="11" rx="1.5"/><path d="M4 7l2 1M20 7l-2 1M3.5 12H6M20.5 12H18"/>',
  whistle: '<circle cx="9" cy="14" r="5.5"/><path d="M12.5 9.8L20.5 7v5l-6.4 1.2M4 6l2 2M8 3.5v2.5"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  textsize: '<path d="M3 19l5-13 5 13M4.8 14.5h6.4M14 19l3.5-9 3.5 9M15.2 16h4.6"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
  coffeecup: '<path d="M5 9h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M11.5 3.5c-.8 1 .8 2 0 3"/>',
  loupe: '<circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/><path d="M7.5 8.5a3 3 0 0 1 3-2"/>',
  paw: '<ellipse cx="12" cy="16" rx="4.5" ry="3.8"/><circle cx="6.5" cy="10.5" r="2"/><circle cx="10" cy="6.5" r="2"/><circle cx="14" cy="6.5" r="2"/><circle cx="17.5" cy="10.5" r="2"/>',
  brush: '<path d="M14 4l6 6-8 8-6-6z"/><path d="M6 12c-2 0-3 2-3 4 0 1.5-1 2.5-1 2.5s4 1 6-1c1.2-1.2 1-3 1-3"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/>',
  camera: '<path d="M4 8h3.5L9 5.5h6L16.5 8H20v11H4z"/><circle cx="12" cy="13.2" r="3.4"/>',
  coin: '<circle cx="12" cy="12" r="8.5"/><path d="M14.8 8.8a3.8 3.8 0 1 0 0 6.4M7.5 11h5.5M7.5 13.4h5"/>',
  gold: '<path d="M3 5h18v4a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6z"/><path d="M12 8.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="currentColor"/>',
  star: '<path d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6-4.4-4.2 6-.9z"/>',
  map: '<path d="M3.5 6l5.5-2 6 2 5.5-2v14l-5.5 2-6-2-5.5 2z"/><path d="M9 4v14M15 6v14"/>',
  album: '<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 3.5v17"/><circle cx="14" cy="10" r="2.5"/><path d="M11 16c.6-1.6 1.6-2.4 3-2.4s2.4.8 3 2.4"/>',
  shop: '<path d="M4 9.5l1.5-5h13l1.5 5"/><path d="M4 9.5c0 1.6 1.3 2.5 2.7 2.5s2.6-.9 2.6-2.5c0 1.6 1.3 2.5 2.7 2.5s2.7-.9 2.7-2.5c0 1.6 1.2 2.5 2.6 2.5S20 11.1 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-5h4v5"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15.5" r="1.4" fill="currentColor"/>',
  check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18"/>',
  share: '<circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="6" r="2.6"/><circle cx="18" cy="18" r="2.6"/><path d="M8.3 10.8l7.4-3.6M8.3 13.2l7.4 3.6"/>',
  chest: '<path d="M3.5 10.5h17v9h-17z"/><path d="M3.5 10.5V8a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4v2.5"/><rect x="10" y="9" width="4" height="5" rx="1" fill="currentColor"/>',
  fire: '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.5 3-5.5 3.5-9 2 1.2 3 3 3 4.6 1-.8 1.6-2 1.6-3.4 2.8 2 4.9 4.8 4.9 7.8 0 3.4-2.5 6-6.5 6z"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  vibe: '<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M4.5 8v8M19.5 8v8M2 10v4M22 10v4"/>',
  trophy: '<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z"/>',
  back: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
  ad: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 15l2.2-6h.6L12 15M7.7 13.2h3.6M14.5 9v6h1.5a3 3 0 0 0 0-6z"/>',
  bolt: '<path d="M13 3L5 13.5h6L10 21l8.5-11h-6z"/>',
  skull: '<path d="M12 3.5c-4.4 0-7.5 3-7.5 7 0 2.4 1.1 4 2.5 5v3h10v-3c1.4-1 2.5-2.6 2.5-5 0-4-3.1-7-7.5-7z"/><circle cx="9" cy="11" r="1.8" fill="currentColor"/><circle cx="15" cy="11" r="1.8" fill="currentColor"/><path d="M10 18.5v2M14 18.5v2"/>',
  ticket: '<path d="M3 5h18v4a3 3 0 0 0 0 6v4H3v-4a3 3 0 0 0 0-6z"/><path d="M15 4.5v15" stroke-dasharray="2 2"/>',
  talk: '<path d="M4 5h16v11H10l-5 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  hand: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v6M16 9.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6.5 7S7 18.5 5.5 16L4 13.5a1.5 1.5 0 0 1 2.5-1.6L7 13"/>',
};
G.icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[name] || ''}</svg>`;

/* Coffre au trésor du jour */
G.drawChest = (open) => `<svg viewBox="0 0 120 100" class="chest-svg" aria-hidden="true">
  ${open ? `<g class="chest-glow"><circle cx="60" cy="46" r="40" fill="#ffe14d" opacity=".35"/></g>` : ''}
  <rect x="14" y="44" width="92" height="48" rx="8" fill="#b5651d" stroke="${INK}" stroke-width="4"/>
  <rect x="14" y="60" width="92" height="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>
  ${open ? `<path d="M14 44 L22 14 L98 14 L106 44Z" fill="#8a4a14" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><circle cx="44" cy="40" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><circle cx="62" cy="36" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><circle cx="78" cy="42" r="8" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>` : `<path d="M14 44 C14 22 30 16 60 16 C90 16 106 22 106 44Z" fill="#c97a2a" stroke="${INK}" stroke-width="4"/><path d="M14 36 L106 36" stroke="#ffd23f" stroke-width="6"/>`}
  <rect x="52" y="54" width="16" height="20" rx="3" fill="#ffd23f" stroke="${INK}" stroke-width="3"/><circle cx="60" cy="63" r="3" fill="${INK}"/>
</svg>`;

/* Logo du titre */
G.drawLogo = () => `<svg viewBox="0 0 360 170" class="logo-svg" aria-label="Ticket SVP !" role="img">
  <defs><mask id="perfo"><rect width="360" height="170" fill="#fff"/><circle cx="0" cy="85" r="18" fill="#000"/><circle cx="360" cy="85" r="18" fill="#000"/></mask></defs>
  <g transform="rotate(-4 180 85)">
    <rect x="14" y="18" width="332" height="134" rx="14" fill="#1e2a4a" mask="url(#perfo)" transform="translate(6 8)"/>
    <rect x="14" y="18" width="332" height="134" rx="14" fill="#ffd23f" stroke="${INK}" stroke-width="6" mask="url(#perfo)"/>
    <path d="M270 26 L270 144" stroke="${INK}" stroke-width="4" stroke-dasharray="8 8"/>
    <text x="142" y="84" text-anchor="middle" class="logo-t1">TICKET</text>
    <text x="142" y="132" text-anchor="middle" class="logo-t2">SVP !</text>
    <rect x="284" y="44" width="48" height="82" rx="6" fill="#fff" stroke="${INK}" stroke-width="4"/>
    <circle cx="308" cy="85" r="18" fill="none" stroke="#e94f4f" stroke-width="5"/><path d="M298 85 L305 92 L318 78" fill="none" stroke="#e94f4f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="24" y="138" width="240" height="7" rx="3" fill="#1e2a4a" opacity=".85"/>
  </g>
</svg>`;
