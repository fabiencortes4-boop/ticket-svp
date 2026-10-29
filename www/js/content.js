/* Ticket SVP ! — contenu supplémentaire : boutique « Style » (tampons, encres, compagnons, décors de wagon),
   bonus à usage unique, collections d'album, personnages récurrents, défi de la semaine, événements mensuels
   et décors des villes de New York, Berlin, Venise et Mars. */
'use strict';

const K = '#1e2a4a';

/* ---------- Cosmétiques visibles en jeu ---------- */
// price : { coins } ou { gold } · collection : récompense d'une collection d'album · event : seulement pendant l'événement
G.COSMETICS = {
  stamp: [
    { id: 'classic', name: 'Tampon officiel', desc: 'Le tampon de la brigade.', price: null },
    { id: 'neon', name: 'Néon', desc: 'Il brille comme une enseigne de Broadway.', price: { coins: 450 } },
    { id: 'pixel', name: 'Pixel', desc: 'Tout droit sorti d\'une borne d\'arcade.', price: { coins: 650 } },
    { id: 'comic', name: 'Bande dessinée', desc: 'BAM ! Chaque décision fait du bruit.', price: { coins: 900 } },
    { id: 'heart', name: 'Cœur tendre', desc: 'Verbaliser avec amour.', price: { gold: 15 } },
    { id: 'gold', name: 'Or massif', desc: 'Un tampon en or qui scintille.', price: { gold: 35 } },
    { id: 'skull', name: 'Tête de mort', desc: 'Pour les contrôleurs sans pitié.', collection: 'night' },
    { id: 'royal', name: 'Sceau royal', desc: 'Par ordre de Sa Majesté.', collection: 'crowns' },
    { id: 'pumpkin', name: 'Citrouille', desc: 'Édition Ligne hantée.', price: { gold: 12 }, event: 'halloween' },
    { id: 'love', name: 'Saint-Valentin', desc: 'Des cœurs partout.', price: { gold: 12 }, event: 'valentin' },
    { id: 'lantern', name: 'Lanterne rouge', desc: 'Édition Nouvel an lunaire.', price: { gold: 12 }, event: 'cny' },
  ],
  ink: [
    { id: 'classic', name: 'Rouge et vert', desc: "L'encre réglementaire.", price: null },
    { id: 'violet', name: 'Violet et bleu', desc: 'Une touche de mystère.', price: { coins: 300 } },
    { id: 'mint', name: 'Menthe et corail', desc: 'Fraîcheur garantie.', price: { coins: 300 } },
    { id: 'gold', name: 'Encre dorée', desc: 'Chaque tampon vaut de l\'or.', price: { gold: 20 } },
    { id: 'rainbow', name: 'Arc-en-ciel', desc: 'Toutes les couleurs à la fois.', collection: 'artists' },
    { id: 'school', name: 'Encre de cartable', desc: 'Édition Rentrée.', price: { gold: 10 }, event: 'rentree' },
  ],
  pet: [
    { id: 'none', name: 'Aucun', desc: 'Tu contrôles en solo.', price: null },
    { id: 'dog', name: 'Rex, chien renifleur', desc: 'Il remue la queue à chaque bonne décision.', price: { coins: 1200 } },
    { id: 'cat', name: 'Minette', desc: 'Elle juge tes erreurs en silence.', price: { coins: 1500 } },
    { id: 'hamster', name: 'Noisette', desc: 'Petit, rond, très motivé.', price: { gold: 12 } },
    { id: 'dragon', name: 'Braise, petit dragon', desc: 'Crache une étincelle quand tu attrapes un fraudeur.', price: { gold: 40 } },
    { id: 'pigeon', name: 'Roucoule', desc: 'Le pigeon officiel de la brigade.', collection: 'animals' },
    { id: 'robot', name: 'Bip-Bip', desc: 'Assistant robotique de contrôle.', collection: 'space' },
    { id: 'bat', name: 'Chauve-souris', desc: 'Édition Ligne hantée.', price: { gold: 15 }, event: 'halloween' },
    { id: 'bunny', name: 'Lapin de Pâques', desc: 'Édition Pâques.', price: { gold: 15 }, event: 'paques' },
  ],
  deco: [
    { id: 'none', name: 'Wagon standard', desc: 'Propre et réglementaire.', price: null },
    { id: 'plants', name: 'Wagon jardin', desc: 'Des plantes vertes partout.', price: { coins: 800 } },
    { id: 'lights', name: 'Guirlande lumineuse', desc: 'Une ambiance de fête toute l\'année.', price: { gold: 15 } },
    { id: 'disco', name: 'Wagon disco', desc: 'Une boule à facettes au plafond.', price: { gold: 25 } },
    { id: 'goldtrim', name: 'Wagon doré', desc: 'Dorures et velours, comme au Grand Express.', price: { gold: 45 } },
    { id: 'posters', name: 'Affiches de voyage', desc: 'Souvenirs du tour du monde.', collection: 'world' },
    { id: 'garland', name: 'Fanions de fête', desc: 'Pour les grandes occasions.', collection: 'party' },
    { id: 'cobwebs', name: 'Toiles d\'araignée', desc: 'Édition Ligne hantée.', price: { gold: 10 }, event: 'halloween' },
    { id: 'hearts', name: 'Pluie de cœurs', desc: 'Édition Saint-Valentin.', price: { gold: 10 }, event: 'valentin' },
    { id: 'lanterns', name: 'Lanternes', desc: 'Édition Nouvel an lunaire.', price: { gold: 10 }, event: 'cny' },
    { id: 'confetti', name: 'Confettis', desc: 'Édition Carnaval.', price: { gold: 10 }, event: 'carnaval' },
    { id: 'flowers', name: 'Wagon fleuri', desc: 'Édition Fête des fleurs.', price: { gold: 10 }, event: 'fleurs' },
    { id: 'notes', name: 'Notes de musique', desc: 'Édition Fête de la musique.', price: { gold: 10 }, event: 'musique' },
    { id: 'beach', name: 'Wagon plage', desc: 'Édition Été.', price: { gold: 10 }, event: 'ete' },
    { id: 'xmas', name: 'Sapin et boules', desc: 'Édition Noël.', price: { gold: 10 }, event: 'noel' },
  ],
};
G.COS_CATS = [
  ['stamp', 'Tampons', 'stamp'],
  ['ink', 'Encres', 'brush'],
  ['pet', 'Compagnons', 'paw'],
  ['deco', 'Décors de wagon', 'ticket'],
];
G.cosItem = (cat, id) => G.COSMETICS[cat].find((x) => x.id === id) || G.COSMETICS[cat][0];
G.cosKey = (cat, id) => `${cat}:${id}`;
G.cosOwned = (cat, id) => !G.cosItem(cat, id).price && !G.cosItem(cat, id).collection && !G.cosItem(cat, id).event ? true : G.save.cos.owned.includes(G.cosKey(cat, id));
G.cosEquipped = (cat) => G.save.cos[cat] || G.COSMETICS[cat][0].id;

/* ---------- Tampon de décision : classes du style et de l'encre ---------- */
G.verdictClass = () => `vs-${G.cosEquipped('stamp')} ink-${G.cosEquipped('ink')}`;

/* ---------- Compagnons ---------- */
const PETS = {
  dog: `<path d="M24 78 C22 58 34 48 50 48 C66 48 78 58 76 78Z" fill="#c98b4e" stroke="${K}" stroke-width="3"/><path d="M76 66 C88 60 92 50 88 44" stroke="${K}" stroke-width="3" fill="none" stroke-linecap="round" class="pet-tail"/><circle cx="50" cy="38" r="18" fill="#d9a066" stroke="${K}" stroke-width="3"/><path d="M33 30 C24 32 22 48 30 50 C34 44 36 38 36 32Z M67 30 C76 32 78 48 70 50 C66 44 64 38 64 32Z" fill="#8a5a32" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><circle cx="43" cy="36" r="3" fill="${K}"/><circle cx="57" cy="36" r="3" fill="${K}"/><ellipse cx="50" cy="45" rx="5" ry="4" fill="${K}"/><path d="M46 51 Q50 58 54 51" fill="#ff8fab" stroke="${K}" stroke-width="2"/>`,
  cat: `<path d="M26 80 C24 60 36 50 50 50 C64 50 76 60 74 80Z" fill="#f2a93b" stroke="${K}" stroke-width="3"/><path d="M74 74 C92 74 92 52 82 48" stroke="#f2a93b" stroke-width="7" fill="none" stroke-linecap="round" class="pet-tail"/><path d="M74 74 C92 74 92 52 82 48" stroke="${K}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".4"/><circle cx="50" cy="38" r="17" fill="#f7b955" stroke="${K}" stroke-width="3"/><path d="M36 30 L36 14 L48 24Z M64 30 L64 14 L52 24Z" fill="#f7b955" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M42 36 L46 36 M54 36 L58 36" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M47 43 L50 46 L53 43" fill="none" stroke="${K}" stroke-width="2"/><path d="M30 42 L40 43 M30 47 L40 46 M70 42 L60 43 M70 47 L60 46" stroke="${K}" stroke-width="1.5"/>`,
  hamster: `<ellipse cx="50" cy="62" rx="28" ry="24" fill="#e9c08d" stroke="${K}" stroke-width="3"/><ellipse cx="50" cy="68" rx="16" ry="13" fill="#fff3dc"/><circle cx="32" cy="40" r="7" fill="#e9c08d" stroke="${K}" stroke-width="3"/><circle cx="68" cy="40" r="7" fill="#e9c08d" stroke="${K}" stroke-width="3"/><circle cx="42" cy="54" r="3" fill="${K}"/><circle cx="58" cy="54" r="3" fill="${K}"/><ellipse cx="50" cy="60" rx="3" ry="2" fill="#ff8fab"/><circle cx="36" cy="62" r="5" fill="#ffb3c1" opacity=".7"/><circle cx="64" cy="62" r="5" fill="#ffb3c1" opacity=".7"/>`,
  dragon: `<path d="M30 52 L10 34 L22 58Z M70 52 L90 34 L78 58Z" fill="#9b5de5" stroke="${K}" stroke-width="3" stroke-linejoin="round" class="pet-wing"/><path d="M28 82 C26 60 38 50 50 50 C62 50 74 60 72 82Z" fill="#4caf50" stroke="${K}" stroke-width="3"/><path d="M40 62 L60 62 M42 70 L58 70" stroke="#a5d6a7" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="36" r="17" fill="#66bb6a" stroke="${K}" stroke-width="3"/><path d="M38 24 L34 12 L44 20Z M62 24 L66 12 L56 20Z" fill="#ffd23f" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><circle cx="44" cy="34" r="3" fill="${K}"/><circle cx="56" cy="34" r="3" fill="${K}"/><path d="M44 43 Q50 47 56 43" fill="none" stroke="${K}" stroke-width="2.5"/><circle cx="46" cy="41" r="1.2" fill="${K}"/><circle cx="54" cy="41" r="1.2" fill="${K}"/>`,
  pigeon: `<ellipse cx="52" cy="62" rx="26" ry="20" fill="#9aa5b1" stroke="${K}" stroke-width="3"/><path d="M60 56 C76 52 86 62 84 70 C74 68 66 66 60 64Z" fill="#7d8a99" stroke="${K}" stroke-width="3" class="pet-wing"/><circle cx="36" cy="40" r="13" fill="#9aa5b1" stroke="${K}" stroke-width="3"/><path d="M36 50 C44 52 50 52 54 48 C52 56 42 58 36 54Z" fill="#6bb39a" opacity=".8"/><circle cx="33" cy="38" r="3" fill="#ff7a1a" stroke="${K}" stroke-width="1.5"/><circle cx="33" cy="38" r="1.2" fill="${K}"/><path d="M23 42 L16 45 L23 47Z" fill="#ffd23f" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M44 82 L42 90 M58 82 L60 90" stroke="#ff7a1a" stroke-width="3" stroke-linecap="round"/>`,
  robot: `<rect x="28" y="48" width="44" height="34" rx="8" fill="#c9d3dd" stroke="${K}" stroke-width="3"/><rect x="38" y="58" width="24" height="12" rx="3" fill="#7fd1ff" stroke="${K}" stroke-width="2"/><rect x="32" y="20" width="36" height="26" rx="7" fill="#dfe6ee" stroke="${K}" stroke-width="3"/><circle cx="43" cy="33" r="4" fill="#2ec4b6" stroke="${K}" stroke-width="2"/><circle cx="57" cy="33" r="4" fill="#2ec4b6" stroke="${K}" stroke-width="2"/><path d="M50 20 L50 10" stroke="${K}" stroke-width="3"/><circle cx="50" cy="8" r="4" fill="#e94f4f" stroke="${K}" stroke-width="2" class="pet-blink"/><circle cx="36" cy="86" r="5" fill="${K}"/><circle cx="64" cy="86" r="5" fill="${K}"/>`,
  bat: `<path d="M50 48 C38 30 18 30 6 44 C18 42 24 50 26 58 C34 52 42 54 50 62 C58 54 66 52 74 58 C76 50 82 42 94 44 C82 30 62 30 50 48Z" fill="#3b2a50" stroke="${K}" stroke-width="3" stroke-linejoin="round" class="pet-wing"/><circle cx="50" cy="52" r="12" fill="#4a3666" stroke="${K}" stroke-width="3"/><path d="M42 42 L40 34 L46 40Z M58 42 L60 34 L54 40Z" fill="#4a3666" stroke="${K}" stroke-width="2"/><circle cx="46" cy="50" r="2.5" fill="#ffd23f"/><circle cx="54" cy="50" r="2.5" fill="#ffd23f"/><path d="M47 57 L48 60 L49 57 M51 57 L52 60 L53 57" fill="#fff" stroke="#fff" stroke-width="1"/>`,
  bunny: `<path d="M38 34 C30 8 40 2 44 30Z M62 34 C70 8 60 2 56 30Z" fill="#fff" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M39 28 C36 14 40 10 42 26Z M61 28 C64 14 60 10 58 26Z" fill="#ffb3c1"/><ellipse cx="50" cy="66" rx="24" ry="20" fill="#fff" stroke="${K}" stroke-width="3"/><circle cx="50" cy="42" r="15" fill="#fff" stroke="${K}" stroke-width="3"/><circle cx="44" cy="40" r="2.6" fill="${K}"/><circle cx="56" cy="40" r="2.6" fill="${K}"/><ellipse cx="50" cy="47" rx="3" ry="2" fill="#ff8fab"/><circle cx="74" cy="72" r="6" fill="#fff" stroke="${K}" stroke-width="2.5"/>`,
};
const PET_SAY = {
  dog: ['Ouaf !', 'Wouf wouf !', 'Grrr…'],
  cat: ['Miaou.', 'Mrrr…', 'Pfff.'],
  hamster: ['Couic !', 'Couic couic !', '…'],
  dragon: ['Rrroar !', 'Fshhh !', 'Pff…'],
  pigeon: ['Rrrou !', 'Rrrou rrrou !', 'Rou ?'],
  robot: ['BIP !', 'BIP BIP !', 'ERREUR.'],
  bat: ['Iiik !', 'Iiik iiik !', '…'],
  bunny: ['Snif snif !', 'Hop !', '…'],
};
G.petSvg = (id) => (PETS[id] ? `<svg viewBox="0 0 100 100" class="pet-svg" aria-hidden="true">${PETS[id]}</svg>` : '');
G.petSay = (id, mood) => (PET_SAY[id] ? PET_SAY[id][mood === 'happy' ? (Math.random() < 0.5 ? 0 : 1) : 2] : '');

/* ---------- Décors de wagon (calque posé sur la scène) ---------- */
const DECOS = {
  plants: () => {
    const pot = (x, s) => `<g transform="translate(${x} 262) scale(${s})"><path d="M-14 0 L14 0 L10 24 L-10 24Z" fill="#c4633a" stroke="${K}" stroke-width="2.5"/><path d="M0 0 C-4 -24 -22 -30 -26 -18 C-16 -18 -8 -12 0 0 C4 -28 20 -36 26 -24 C16 -22 8 -14 0 0 C0 -20 -6 -40 2 -46 C8 -38 4 -20 0 0Z" fill="#4caf50" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/></g>`;
    return `${pot(26, 1)}${pot(374, 1.1)}<g fill="#4caf50" stroke="${K}" stroke-width="2">${[60, 120, 280, 340].map((x) => `<path d="M${x} 34 q4 10 0 20 q-4 10 0 20" fill="none" stroke="#3f8a45" stroke-width="3"/><ellipse cx="${x - 5}" cy="48" rx="6" ry="3.5"/><ellipse cx="${x + 5}" cy="62" rx="6" ry="3.5"/>`).join('')}</g>`;
  },
  lights: () => `<path d="M0 30 Q50 50 100 30 T200 30 T300 30 T400 30" stroke="${K}" stroke-width="2" fill="none"/>${Array.from({ length: 16 }, (_, i) => { const x = 12 + i * 25; const y = 30 + 10 * Math.sin((i * Math.PI) / 2 + 0.6) + 6; return `<ellipse class="deco-blink" style="animation-delay:${(i % 4) * 0.3}s" cx="${x}" cy="${y}" rx="4.5" ry="6" fill="${['#ffd23f', '#e94f4f', '#3a86ff', '#2ec4b6'][i % 4]}" stroke="${K}" stroke-width="1.5"/>`; }).join('')}`,
  disco: () => `<path d="M200 0 L200 20" stroke="${K}" stroke-width="2.5"/><circle cx="200" cy="36" r="17" fill="#d7dde6" stroke="${K}" stroke-width="2.5"/><g stroke="#8a96a8" stroke-width="1.2">${[-10, 0, 10].map((d) => `<path d="M${183} ${36 + d} L${217} ${36 + d}"/>`).join('')}${[-10, 0, 10].map((d) => `<path d="M${200 + d} 20 L${200 + d} 52"/>`).join('')}</g><g class="deco-spin" opacity=".35">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M200 36 L${200 + 260 * Math.cos((a * Math.PI) / 180)} ${36 + 260 * Math.sin((a * Math.PI) / 180)}" stroke="${['#ff6fb5', '#ffd23f', '#3a86ff', '#2ec4b6'][a / 45 % 4]}" stroke-width="10"/>`).join('')}</g>`,
  goldtrim: () => `<rect x="0" y="30" width="400" height="6" fill="#e0b35a" stroke="${K}" stroke-width="1.5"/><rect x="0" y="136" width="400" height="5" fill="#e0b35a"/>${[20, 380].map((x) => `<rect x="${x - 4}" y="36" width="8" height="230" fill="#e0b35a" stroke="${K}" stroke-width="1.5"/>`).join('')}<g fill="#ffd23f" stroke="${K}" stroke-width="1.2">${[60, 140, 260, 340].map((x) => `<path d="M${x} 33 l3 -6 3 6 -3 6z"/>`).join('')}</g>`,
  posters: () => {
    const poster = (x, c, txt, icon) => `<g transform="translate(${x} 146) rotate(${x < 200 ? -3 : 3})"><rect x="0" y="0" width="54" height="70" rx="3" fill="${c}" stroke="${K}" stroke-width="2.5"/>${icon}<text x="27" y="62" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="10" fill="#fff">${txt}</text></g>`;
    return `${poster(28, '#3a86ff', 'PARIS', `<path d="M27 8 L32 30 L38 46 L16 46 L22 30Z" fill="#ffd23f" stroke="${K}" stroke-width="2"/>`)}${poster(318, '#e94f4f', 'TOKYO', `<circle cx="27" cy="24" r="12" fill="#fff" stroke="${K}" stroke-width="2"/><path d="M10 48 L27 14 L44 48Z" fill="#e6eef8" stroke="${K}" stroke-width="2"/>`)}`;
  },
  garland: () => `<path d="M0 30 Q100 56 200 30 T400 30" stroke="${K}" stroke-width="2" fill="none"/>${Array.from({ length: 14 }, (_, i) => { const x = 14 + i * 28; const y = 30 + 13 * Math.sin((x / 400) * Math.PI * 2 + Math.PI / 2) * -1 + 13; return `<path d="M${x - 8} ${y} L${x + 8} ${y} L${x} ${y + 16}Z" fill="${['#ffd23f', '#e94f4f', '#3a86ff', '#2ec4b6', '#ff6fb5'][i % 5]}" stroke="${K}" stroke-width="1.5"/>`; }).join('')}`,
  cobwebs: () => {
    const web = (x, flip) => `<g transform="translate(${x} 0) scale(${flip ? -1 : 1} 1)" stroke="#eef0f3" stroke-width="1.6" fill="none" opacity=".85"><path d="M0 0 L70 70 M0 0 L30 80 M0 0 L80 30"/><path d="M14 14 Q22 6 16 3 M28 28 Q44 12 32 6 M44 44 Q66 18 50 10 M14 14 Q6 22 3 16 M28 28 Q12 44 6 32 M44 44 Q18 66 10 50"/></g><g transform="translate(${flip ? x - 50 : x + 50} 56)"><path d="M0 -56 L0 0" stroke="#eef0f3" stroke-width="1"/><circle r="6" fill="#1b1b25"/><path d="M-6 -2 L-12 -6 M-6 2 L-12 4 M6 -2 L12 -6 M6 2 L12 4" stroke="#1b1b25" stroke-width="2"/></g>`;
    return `${web(0, false)}${web(400, true)}`;
  },
  hearts: () => Array.from({ length: 12 }, (_, i) => { const x = 20 + ((i * 97) % 360); const y = 20 + ((i * 53) % 110); const s = 0.6 + (i % 3) * 0.25; return `<path class="deco-float" style="animation-delay:${(i % 5) * 0.4}s" transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-10 -6 -22 4 -12 14 L0 26 L12 14 C22 4 10 -6 0 6Z" fill="${i % 2 ? '#ff6fb5' : '#e94f4f'}" stroke="${K}" stroke-width="2"/>`; }).join(''),
  lanterns: () => [40, 120, 280, 360].map((x, i) => `<g transform="translate(${x} 0)"><path d="M0 0 L0 22" stroke="${K}" stroke-width="2"/><ellipse class="deco-swing" style="animation-delay:${i * 0.3}s" cx="0" cy="40" rx="16" ry="20" fill="#e53935" stroke="${K}" stroke-width="2.5"/><rect x="-8" y="18" width="16" height="5" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/><rect x="-8" y="58" width="16" height="5" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/><path d="M-4 64 L-4 76 M0 64 L0 78 M4 64 L4 76" stroke="#ffd23f" stroke-width="2"/></g>`).join(''),
  confetti: () => Array.from({ length: 40 }, (_, i) => `<rect class="deco-fall" style="animation-delay:${(i % 8) * 0.5}s" x="${(i * 41) % 400}" y="${(i * 29) % 140}" width="6" height="10" rx="1" fill="${['#ffd23f', '#e94f4f', '#3a86ff', '#2ec4b6', '#ff6fb5', '#9b5de5'][i % 6]}" transform="rotate(${(i * 37) % 90} ${(i * 41) % 400} ${(i * 29) % 140})"/>`).join(''),
  flowers: () => {
    const fl = (x, y, c) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${7 * Math.cos((a * Math.PI) / 180)}" cy="${7 * Math.sin((a * Math.PI) / 180)}" r="6" fill="${c}" stroke="${K}" stroke-width="1.5"/>`).join('')}<circle r="4.5" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/></g>`;
    return `<path d="M0 32 Q100 50 200 32 T400 32" stroke="#3f8a45" stroke-width="4" fill="none"/>${[30, 90, 150, 210, 270, 330, 385].map((x, i) => fl(x, 38 + (i % 2) * 6, ['#ff6fb5', '#ffffff', '#ff8a1d', '#b388ff'][i % 4])).join('')}${fl(20, 270, '#ff6fb5')}${fl(42, 282, '#fff')}${fl(370, 274, '#b388ff')}`;
  },
  notes: () => Array.from({ length: 10 }, (_, i) => { const x = 30 + ((i * 89) % 340); const y = 30 + ((i * 47) % 100); return `<g class="deco-float" style="animation-delay:${(i % 4) * 0.5}s" transform="translate(${x} ${y})"><ellipse cx="0" cy="14" rx="7" ry="5" fill="${['#3a86ff', '#ff6fb5', '#ffd23f'][i % 3]}" stroke="${K}" stroke-width="2"/><path d="M6 14 L6 -10 L18 -6" stroke="${K}" stroke-width="2.5" fill="none"/></g>`; }).join(''),
  beach: () => `<g transform="translate(40 200)"><path d="M0 70 L4 0" stroke="${K}" stroke-width="3"/><path d="M-36 6 Q4 -30 44 6Z" fill="#ff6b35" stroke="${K}" stroke-width="2.5"/><path d="M-16 6 Q4 -26 4 -10 M24 6 Q4 -26 4 -10" stroke="#fff" stroke-width="5" fill="none"/></g><g transform="translate(362 260)"><circle r="16" fill="#fff" stroke="${K}" stroke-width="2.5"/><path d="M-16 0 Q0 -8 16 0 M0 -16 Q8 0 0 16" stroke="#e94f4f" stroke-width="4" fill="none"/></g><circle cx="360" cy="20" r="0" fill="none"/>`,
  xmas: () => G.eventDeco('noel').replace(/^<svg[^>]*>|<\/svg>$/g, ''),
};
G.wagonDeco = (id) => (DECOS[id] ? `<svg class="wagon-deco deco-${id}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${DECOS[id]()}</svg>` : '');

/* ---------- Bonus à usage unique ---------- */
G.CONSUMABLES = [
  { id: 'coffee', name: 'Café serré', icon: 'coffeecup', price: 40, desc: '+2 s par passager pendant tout un service.' },
  { id: 'magnifier', name: 'Loupe de détective', icon: 'loupe', price: 90, desc: '3 coups de loupe pendant un service : elle montre le détail suspect d\'un passager.' },
  { id: 'double', name: 'Ticket double gain', icon: 'coin', price: 70, desc: 'Toutes les pièces du service sont doublées.' },
];
// Interdits là où le score se compare entre joueurs
G.boostsAllowed = (cfg) => !cfg.daily && !cfg.weekly && cfg.challengeScore == null;

/* ---------- Personnages récurrents : ils reviennent de ville en ville ---------- */
G.RECURRING = {
  grandma: { london: 'Bonjour, mon petit… hiii-ya !', tokyo: 'Konnichiwa… je suis une petite vieille.', moscou: 'Il fait froid pour mes vieux os… hiii-ya !', ny: 'New York ne me fait pas peur, jeune homme.', berlin: 'Guten Tag, mon petit… ninja ? Quel ninja ?', venise: 'Une petite promenade en bateau, hiii-ya !', mars: 'Même sur Mars, je suis une petite vieille !' },
  mime: { paris: '(mime une baguette sous le bras)', london: '(mime une tasse de thé)', tokyo: '(mime une révérence)', ny: '(mime un taxi jaune)', berlin: '(mime un mur… puis le traverse)', venise: '(mime une gondole)', mars: '(mime l\'apesanteur)' },
  gaston: { berlin: 'Guten Tag… simple touriste…', venise: 'Buongiorno… je suis gondolier…', mars: 'Bip… je suis un Martien…' },
  inspector: { ny: 'Je vérifie que vous vérifiez. Même ici.', mars: 'Inspection interplanétaire, collègue.' },
};

/* ---------- Collections d'album : complète une page, gagne un objet exclusif ---------- */
G.COLLECTIONS = [
  { id: 'night', name: 'Créatures de la nuit', specials: ['ghost', 'vampire', 'zombie', 'mummy'], reward: ['stamp', 'skull'] },
  { id: 'crowns', name: 'Têtes couronnées', specials: ['king', 'queen', 'emperor', 'casanova'], reward: ['stamp', 'royal'] },
  { id: 'animals', name: 'Animaux déguisés', specials: ['dogs', 'bee', 'pigeon', 'astrocat'], reward: ['pet', 'pigeon'] },
  { id: 'artists', name: 'Les artistes', specials: ['accordion', 'diva', 'dj', 'painter', 'gondolier'], reward: ['ink', 'rainbow'] },
  { id: 'world', name: 'Tour du monde', specials: ['tourist', 'liberty', 'techno', 'cowboy', 'currywurst'], reward: ['deco', 'posters'] },
  { id: 'space', name: "Venus d'ailleurs", specials: ['alien', 'martian', 'astronaut', 'robot', 'rover'], reward: ['pet', 'robot'] },
  { id: 'party', name: 'Jours de fête', specials: ['santa', 'elf', 'bride', 'clown', 'carnival'], reward: ['deco', 'garland'] },
];
G.collectionState = (c) => {
  const got = c.specials.filter((id) => G.save.album[id]).length;
  return { got, total: c.specials.length, done: got >= c.specials.length, claimed: !!G.save.collections[c.id] };
};
G.claimCollection = (id) => {
  const c = G.COLLECTIONS.find((x) => x.id === id);
  if (!c || !G.collectionState(c).done || G.save.collections[id]) return false;
  G.save.collections[id] = true;
  const key = G.cosKey(c.reward[0], c.reward[1]);
  if (!G.save.cos.owned.includes(key)) G.save.cos.owned.push(key);
  G.persist();
  return true;
};

/* ---------- Défi de la semaine ---------- */
G.weekKey = (d = G.today()) => {
  // Semaine ISO : le lundi ouvre une nouvelle semaine pour tout le monde
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return t.getUTCFullYear() * 100 + Math.ceil(((t - y0) / 86400000 + 1) / 7);
};
G.WEEKLY_THEMES = [
  { name: 'Semaine des sosies', desc: 'Les photos sont piégées : regarde chaque visage de près.', mod: { bias: { photo: 4 } } },
  { name: 'Semaine des faussaires', desc: 'Les faux tampons pullulent. La lampe UV est ta meilleure amie.', mod: { bias: { stamp: 4 } } },
  { name: 'Semaine éclair', desc: 'Moins de temps par passager, mais une file plus courte.', mod: { timeAdd: -1.5, count: 12 } },
  { name: 'Semaine des stars', desc: 'Les passagers spéciaux sont partout.', mod: { specialRate: 0.3 } },
  { name: 'Semaine des abonnés', desc: 'Les abonnements nominatifs sont à surveiller.', mod: { bias: { name: 4, date: 1 } } },
  { name: 'Semaine des voyageurs pressés', desc: 'Une longue file et des dates à vérifier.', mod: { count: 20, bias: { date: 3 } } },
];
G.WEEKLY_UNLOCK = 12; // ouvert après le service 12 (Paris)
G.weeklyTheme = (wk = G.weekKey()) => G.WEEKLY_THEMES[wk % G.WEEKLY_THEMES.length];
G.weeklyConfig = (wk = G.weekKey()) => {
  const th = G.weeklyTheme(wk);
  // Même difficulté pour tout le monde : les règles d'un service de Tokyo
  const base = G.levelConfig(27);
  return Object.assign(base, {
    g: 27,
    weekly: true,
    week: wk,
    boss: false,
    bossMech: null,
    newRule: null,
    dayRule: null,
    city: G.CITIES[wk % G.CITIES.length],
    cityIndex: wk % G.CITIES.length,
    count: th.mod.count || 15,
    time: Math.max(5.5, base.time + (th.mod.timeAdd || 0)),
    bias: th.mod.bias || {},
    specialRate: th.mod.specialRate || 0.1,
    seed: wk * 7919,
    label: 'Défi de la semaine',
  });
};
G.makeWeeklyCode = (wk, score) => `S-${wk.toString(36)}-${Math.max(0, Math.round(score)).toString(36)}`.toUpperCase();

/* ---------- Événements mensuels ---------- */
G.EVENTS.push(
  { id: 'cny', name: 'Le Nouvel an lunaire', desc: 'Dragons, lanternes et pétards : la rame fait la fête. Les fraudeurs aussi.', from: [0, 25], to: [1, 6], specials: ['magician', 'diva', 'king', 'queen', 'accordion'], deco: 'cny', city: 3 },
  { id: 'valentin', name: 'Le Train des amoureux', desc: 'Roses, mots doux et abonnements empruntés à sa moitié…', from: [1, 7], to: [1, 14], specials: ['bride', 'casanova', 'gondolier', 'unicorn', 'diva'], deco: 'valentin', city: 9 },
  { id: 'carnaval', name: 'Le Carnaval de Venise', desc: 'Masques, capes et confettis : qui se cache derrière ?', from: [2, 1], to: [2, 12], specials: ['carnival', 'gondolier', 'painter', 'casanova', 'clown', 'pigeon'], deco: 'carnaval', city: 9 },
  { id: 'paques', name: 'La Chasse aux œufs', desc: 'Des œufs cachés partout dans la rame… et des fraudeurs aussi.', from: [3, 5], to: [3, 20], specials: ['bee', 'gardener', 'baby', 'fairy', 'unicorn'], deco: 'paques', city: 0 },
  { id: 'fleurs', name: 'La Fête des fleurs', desc: 'Le wagon déborde de bouquets. Attention aux tickets fanés !', from: [4, 1], to: [4, 15], specials: ['gardener', 'bee', 'fairy', 'bride', 'painter'], deco: 'fleurs', city: 1 },
  { id: 'musique', name: 'La Fête de la musique', desc: 'Accordéon, techno et opéra : tout le monde joue dans la rame.', from: [5, 15], to: [5, 25], specials: ['accordion', 'diva', 'dj', 'rocker', 'techno', 'breakdancer'], deco: 'musique', city: 8 },
  { id: 'ete', name: 'La Ligne de la plage', desc: 'Maillots, bouées et coups de soleil. Les tickets ont pris l\'eau.', from: [6, 1], to: [7, 31], specials: ['tourist', 'diver', 'mermaid', 'hotdog', 'liberty'], deco: 'ete', city: 0 },
  { id: 'rentree', name: 'La Rentrée', desc: 'Cartables, profs et étudiants : vérifie bien les tarifs réduits.', from: [8, 1], to: [8, 15], specials: ['philosopher', 'detective', 'inspector', 'broker', 'spy'], deco: 'rentree', city: 7 },
);
// Décor de scène de chaque événement : on réutilise les décors de wagon
const EVENT_DECO = { cny: 'lanterns', valentin: 'hearts', carnaval: 'confetti', paques: 'flowers', fleurs: 'flowers', musique: 'notes', ete: 'beach', rentree: 'garland' };
const baseEventDeco = G.eventDeco;
G.eventDeco = (deco) => (EVENT_DECO[deco] ? G.wagonDeco(EVENT_DECO[deco]).replace('wagon-deco', 'event-deco') : baseEventDeco(deco));
G.eventEndText = (ev) => `jusqu'au ${ev.to[1]} ${G.MONTHS[ev.to[0]].toLowerCase()}`;

/* ---------- Paysages des nouvelles villes ---------- */
Object.assign(G.EXTRA.windows, {
  nyc: (k) => `<defs><linearGradient id="${k}-nyc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a5a"/><stop offset=".6" stop-color="#ffcf8a"/><stop offset="1" stop-color="#ffe8c2"/></linearGradient></defs><rect x="0" y="40" width="400" height="96" fill="url(#${k}-nyc)"/><g class="scroll-far" fill="#6b5a7a">${Array.from({ length: 16 }, (_, i) => { const x = i * 52; const h = 30 + ((i * 37) % 45); return `<rect x="${x}" y="${136 - h}" width="40" height="${h}"/>${i % 4 === 1 ? `<path d="M${x + 14} ${136 - h} L${x + 20} ${120 - h} L${x + 26} ${136 - h}Z"/><path d="M${x + 20} ${120 - h} L${x + 20} ${108 - h}" stroke="#6b5a7a" stroke-width="2"/>` : ''}`; }).join('')}</g><g class="scroll-near">${Array.from({ length: 10 }, (_, i) => { const x = i * 84; const h = 22 + ((i * 29) % 30); return `<rect x="${x}" y="${136 - h}" width="56" height="${h}" fill="#3e3450"/>${Array.from({ length: 6 }, (_, j) => `<rect x="${x + 6 + (j % 3) * 16}" y="${140 - h + Math.floor(j / 3) * 10}" width="8" height="5" fill="#ffd66b" opacity="${(i + j) % 3 ? 0.9 : 0.3}"/>`).join('')}`; }).join('')}<path d="M0 132 L800 132" stroke="#2a2438" stroke-width="5"/></g>`,
  berlin: (k) => `<defs><linearGradient id="${k}-ber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb6d9"/><stop offset="1" stop-color="#dbe8f2"/></linearGradient></defs><rect x="0" y="40" width="400" height="96" fill="url(#${k}-ber)"/><g class="scroll-far" fill="#8a94a6">${[0, 400].map((o) => `<rect x="${o + 120}" y="64" width="5" height="72"/><circle cx="${o + 122.5}" cy="78" r="9"/><path d="M${o + 122.5} 50 L${o + 122.5} 70" stroke="#8a94a6" stroke-width="2"/><rect x="${o + 260}" y="104" width="70" height="32"/><path d="M${o + 256} 104 L${o + 334} 104 L${o + 330} 98 L${o + 260} 98Z"/>${[0, 1, 2, 3, 4].map((j) => `<rect x="${o + 264 + j * 13}" y="108" width="6" height="28" fill="#6d778a"/>`).join('')}`).join('')}</g><g class="scroll-near">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 80}" y="${108 - (i % 3) * 6}" width="60" height="${28 + (i % 3) * 6}" fill="${['#c96b4f', '#e0b35a', '#7a9b6e'][i % 3]}" stroke="#3a3f4a" stroke-width="1.5"/>${[0, 1, 2].map((j) => `<rect x="${i * 80 + 8 + j * 18}" y="${114 - (i % 3) * 6}" width="8" height="8" fill="#f2efe2"/>`).join('')}`).join('')}<path d="M0 132 L800 132" stroke="#3a3f4a" stroke-width="4"/></g>`,
  venise: (k) => `<defs><linearGradient id="${k}-ven" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ff"/><stop offset="1" stop-color="#e6f7ff"/></linearGradient></defs><rect x="0" y="40" width="400" height="96" fill="url(#${k}-ven)"/><g class="scroll-far">${Array.from({ length: 14 }, (_, i) => { const x = i * 58; const h = 28 + ((i * 23) % 22); return `<rect x="${x}" y="${116 - h}" width="50" height="${h}" fill="${['#e9a46a', '#f2d3a0', '#d77a5a', '#f6e1c3'][i % 4]}" stroke="#8b6b4a" stroke-width="1.2"/>${[0, 1, 2].map((j) => `<path d="M${x + 7 + j * 15} ${122 - h + 14} l0 -6 a3 3 0 0 1 6 0 l0 6z" fill="#5a4a3a"/>`).join('')}${i % 5 === 2 ? `<path d="M${x + 25} ${116 - h} L${x + 25} ${100 - h}" stroke="#8b6b4a" stroke-width="5"/><path d="M${x + 19} ${100 - h} L${x + 25} ${90 - h} L${x + 31} ${100 - h}Z" fill="#2e8b57"/>` : ''}`; }).join('')}</g><rect x="0" y="114" width="400" height="22" fill="#2a9fb8"/><g class="scroll-near"><path d="M0 120 Q20 116 40 120 T80 120 T120 120 T160 120 T200 120 T240 120 T280 120 T320 120 T360 120 T400 120 T440 120 T480 120 T520 120 T560 120 T600 120 T640 120 T680 120 T720 120 T760 120 T800 120" stroke="#bfefff" stroke-width="2" fill="none"/>${[90, 520].map((x) => `<path d="M${x} 124 Q${x + 30} 132 ${x + 70} 124 L${x + 76} 118 L${x + 72} 124" fill="#1b1b25" stroke="#1b1b25" stroke-width="2"/><path d="M${x + 40} 124 L${x + 46} 100" stroke="#1b1b25" stroke-width="2"/><circle cx="${x + 34}" cy="114" r="4" fill="#1b1b25"/><path d="M${x + 30} 118 L${x + 38} 118 L${x + 36} 124 L${x + 32} 124Z" fill="#d62828"/>`).join('')}</g>`,
  mars: (k) => `<defs><linearGradient id="${k}-mars" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1430"/><stop offset=".55" stop-color="#7a2e35"/><stop offset="1" stop-color="#d9673e"/></linearGradient></defs><rect x="0" y="40" width="400" height="96" fill="url(#${k}-mars)"/><g class="scroll-cloud">${Array.from({ length: 22 }, (_, i) => `<circle cx="${(i * 61) % 800}" cy="${46 + ((i * 29) % 30)}" r="${i % 3 ? 1 : 1.8}" fill="#fff" opacity=".8"/>`).join('')}<circle cx="320" cy="58" r="7" fill="#c9b8a6"/><circle cx="720" cy="58" r="7" fill="#c9b8a6"/></g><g class="scroll-far"><path d="M0 120 L50 98 L90 112 L150 86 L210 116 L270 100 L330 118 L400 96 L450 98 L490 112 L550 86 L610 116 L670 100 L730 118 L800 96 L800 136 L0 136Z" fill="#a8432f"/></g><g class="scroll-near"><path d="M0 128 Q100 120 200 128 T400 128 T600 128 T800 128 L800 136 L0 136Z" fill="#7f3122"/>${[60, 460].map((x) => `<path d="M${x} 128 A34 34 0 0 1 ${x + 68} 128Z" fill="#cfe9ff" fill-opacity=".55" stroke="#eaf6ff" stroke-width="2"/><rect x="${x + 26}" y="112" width="16" height="16" fill="#eceaf2"/>`).join('')}${[250, 650].map((x) => `<rect x="${x}" y="116" width="26" height="10" rx="2" fill="#eceaf2" stroke="#3a2a4a" stroke-width="1.5"/><circle cx="${x + 5}" cy="128" r="4" fill="#3a2a4a"/><circle cx="${x + 21}" cy="128" r="4" fill="#3a2a4a"/><path d="M${x + 20} 116 L${x + 26} 106" stroke="#3a2a4a" stroke-width="2"/>`).join('')}</g>`,
});

/* ---------- Monuments des nouvelles villes (carte) ---------- */
G.EXTRA_LANDMARKS = {
  ny: `<path d="M56 74 L56 46 L48 46 L52 30 L58 30 L58 22 L62 22 L62 30 L68 30 L72 46 L64 46 L64 74Z" fill="#7fc8a9" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M52 22 L56 12 L60 18 L64 8 L66 18 L72 12 L70 24Z" fill="#7fc8a9" stroke="${K}" stroke-width="2.5" stroke-linejoin="round"/><path d="M68 30 L76 6" stroke="${K}" stroke-width="3"/><path d="M73 4 Q76 -6 80 4 Q77 8 73 4Z" fill="#ffd23f" stroke="${K}" stroke-width="2"/><rect x="88" y="34" width="20" height="40" fill="#c9d3dd" stroke="${K}" stroke-width="3"/><rect x="10" y="44" width="24" height="30" fill="#c9d3dd" stroke="${K}" stroke-width="3"/>`,
  berlin: `<rect x="14" y="40" width="72" height="34" fill="#e0c9a0" stroke="${K}" stroke-width="3"/><rect x="10" y="32" width="80" height="10" fill="#e0c9a0" stroke="${K}" stroke-width="3"/>${[0, 1, 2, 3, 4].map((j) => `<rect x="${20 + j * 13}" y="44" width="7" height="30" fill="#c9a46a" stroke="${K}" stroke-width="1.5"/>`).join('')}<path d="M44 32 L50 20 L56 32 M50 20 L50 14" stroke="${K}" stroke-width="3" fill="none"/><rect x="100" y="6" width="5" height="68" fill="#c9d3dd" stroke="${K}" stroke-width="2"/><circle cx="102.5" cy="22" r="9" fill="#c9d3dd" stroke="${K}" stroke-width="3"/>`,
  venise: `<path d="M8 74 Q60 52 112 74" fill="none" stroke="${K}" stroke-width="3"/><path d="M14 68 Q60 44 106 68 L106 74 L14 74Z" fill="#f2d3a0" stroke="${K}" stroke-width="3"/>${[0, 1, 2, 3].map((j) => `<path d="M${30 + j * 18} 68 l0 -8 a4 4 0 0 1 8 0 l0 8z" fill="#8b6b4a"/>`).join('')}<path d="M20 30 Q50 44 96 30 L102 22 L98 30" fill="#1b1b25" stroke="${K}" stroke-width="3" stroke-linejoin="round"/><path d="M64 34 L72 4" stroke="${K}" stroke-width="3"/><circle cx="56" cy="26" r="5" fill="#1b1b25"/><path d="M50 22 L62 22 L60 16 L52 16Z" fill="#ffd23f" stroke="${K}" stroke-width="1.5"/>`,
  mars: `<circle cx="46" cy="38" r="30" fill="#d9673e" stroke="${K}" stroke-width="3"/><circle cx="36" cy="28" r="6" fill="#b8502f"/><circle cx="58" cy="46" r="8" fill="#b8502f"/><circle cx="40" cy="52" r="4" fill="#b8502f"/><rect x="82" y="54" width="30" height="12" rx="3" fill="#eceaf2" stroke="${K}" stroke-width="2.5"/><circle cx="88" cy="70" r="5" fill="${K}"/><circle cx="106" cy="70" r="5" fill="${K}"/><path d="M104 54 L110 42 M110 42 L116 44" stroke="${K}" stroke-width="2.5"/>`,
};
