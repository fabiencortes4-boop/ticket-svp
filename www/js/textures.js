/* Ticket SVP ! — textures générées par le code au démarrage (aucun fichier image).
   Petites tuiles dessinées une fois dans un canvas, puis posées en fond répété via des variables CSS :
   --tex-grain   grain fin (surfaces peintes, boutons, barres)
   --tex-paper   papier fibreux (tickets, cartes, fenêtres)
   --tex-tiles   carrelage biseauté du métro (fonds des menus)
   --tex-wood    bois du plateau où le contrôleur pose les papiers
   --tex-metal   métal brossé (barre du haut, cadres)
   Le hasard est déterministe : les mêmes textures à chaque lancement. */
'use strict';

G.TEX = (() => {
  const out = {};
  let seed = 20261101;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const make = (w, h, draw) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    if (!x) return '';
    draw(x, w, h);
    try {
      return c.toDataURL('image/png');
    } catch (e) {
      return '';
    }
  };
  // Bruit en niveaux de gris, transparent : il assombrit ou éclaircit à peine la couleur dessous
  const noise = (x, w, h, alpha, lightShare = 0.5) => {
    const img = x.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const light = rnd() < lightShare;
      const v = light ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = Math.round(rnd() * alpha * 255);
    }
    x.putImageData(img, 0, 0);
  };

  try {
    out.grain = make(128, 128, (x, w, h) => noise(x, w, h, 0.11));

    out.paper = make(160, 160, (x, w, h) => {
      noise(x, w, h, 0.08, 0.35);
      // fibres : petits traits courbes très pâles, recopiés au bord pour que la tuile se raccorde
      x.lineCap = 'round';
      for (let i = 0; i < 70; i++) {
        const cx = rnd() * w;
        const cy = rnd() * h;
        const len = 4 + rnd() * 10;
        const a = rnd() * Math.PI;
        x.strokeStyle = rnd() < 0.5 ? 'rgba(90,70,40,.10)' : 'rgba(255,255,255,.35)';
        x.lineWidth = 0.6 + rnd() * 0.6;
        for (const [ox, oy] of [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]]) {
          x.beginPath();
          x.moveTo(cx + ox, cy + oy);
          x.quadraticCurveTo(cx + ox + Math.cos(a) * len * 0.5 + 2, cy + oy + Math.sin(a) * len * 0.5 - 2, cx + ox + Math.cos(a) * len, cy + oy + Math.sin(a) * len);
          x.stroke();
        }
      }
    });

    // Carreaux de métro biseautés (2 rangées décalées : la tuile se répète sans couture)
    out.tiles = make(64, 64, (x) => {
      const tile = (tx, ty, tw, th) => {
        const g = x.createLinearGradient(tx, ty, tx, ty + th);
        g.addColorStop(0, 'rgba(255,255,255,.75)');
        g.addColorStop(0.5, 'rgba(255,255,255,.12)');
        g.addColorStop(1, 'rgba(30,42,74,.09)');
        x.fillStyle = g;
        x.fillRect(tx + 1, ty + 1, tw - 2, th - 2);
        x.fillStyle = 'rgba(255,255,255,.6)'; // biseau éclairé en haut
        x.fillRect(tx + 2, ty + 1.5, tw - 4, 1.5);
        x.fillStyle = 'rgba(30,42,74,.14)'; // ombre en bas
        x.fillRect(tx + 2, ty + th - 3, tw - 4, 1.5);
      };
      x.fillStyle = 'rgba(30,42,74,.13)'; // joints
      x.fillRect(0, 0, 64, 64);
      tile(0, 0, 64, 32);
      tile(-32, 32, 64, 32);
      tile(32, 32, 64, 32);
    });

    // Bois : veines ondulées, périodiques en largeur (raccord sans couture)
    out.wood = make(256, 96, (x, w, h) => {
      for (let i = 0; i < 26; i++) {
        const y0 = rnd() * h;
        const amp = 1 + rnd() * 3.5;
        const k = 1 + Math.floor(rnd() * 3);
        const ph = rnd() * Math.PI * 2;
        x.strokeStyle = rnd() < 0.7 ? `rgba(40,22,10,${0.16 + rnd() * 0.2})` : `rgba(255,220,170,${0.08 + rnd() * 0.1})`;
        x.lineWidth = 0.6 + rnd() * 1.6;
        for (const oy of [-h, 0, h]) {
          x.beginPath();
          for (let px = 0; px <= w; px += 4) {
            const py = y0 + oy + Math.sin((px / w) * Math.PI * 2 * k + ph) * amp + Math.sin((px / w) * Math.PI * 2 * (k + 2) + ph * 2) * amp * 0.3;
            if (px === 0) x.moveTo(px, py);
            else x.lineTo(px, py);
          }
          x.stroke();
        }
      }
      // un nœud du bois
      const kx = 70 + rnd() * 120;
      const ky = 20 + rnd() * 56;
      for (let r = 2; r < 10; r += 2.2) {
        x.strokeStyle = `rgba(40,22,10,${0.22 - r * 0.015})`;
        x.lineWidth = 1;
        x.beginPath();
        x.ellipse(kx, ky, r * 1.8, r * 0.7, 0, 0, Math.PI * 2);
        x.stroke();
      }
      noise(x, w, h, 0.05, 0.4);
    });

    // Métal brossé : stries horizontales fines
    out.metal = make(200, 40, (x, w, h) => {
      for (let y = 0; y < h; y++) {
        const v = rnd();
        x.fillStyle = v < 0.5 ? `rgba(255,255,255,${0.015 + rnd() * 0.04})` : `rgba(0,0,0,${0.02 + rnd() * 0.05})`;
        x.fillRect(0, y, w, 1);
      }
      for (let i = 0; i < 60; i++) {
        x.fillStyle = `rgba(255,255,255,${0.03 + rnd() * 0.05})`;
        x.fillRect(rnd() * w, Math.floor(rnd() * h), 10 + rnd() * 50, 1);
      }
    });
  } catch (e) {
    /* canvas indisponible : le jeu garde ses aplats */
  }

  const root = document.documentElement.style;
  for (const [k, v] of Object.entries(out)) if (v) root.setProperty(`--tex-${k}`, `url(${v})`);
  return out;
})();
