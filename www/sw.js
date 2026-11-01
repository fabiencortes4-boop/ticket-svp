/* Ticket SVP ! — service worker : le jeu installé marche hors ligne.
   Tous les fichiers d'une version sont gardés ensemble dans un seul cache, et le jeu n'est servi que depuis
   ce cache : jamais un mélange de deux versions. Quand une nouvelle version est publiée, ce fichier change
   (nom du cache), le navigateur l'installe en arrière-plan en téléchargeant tout d'un coup, puis la page
   se recharge sur la nouvelle version complète. */
'use strict';

const CACHE = 'ticketsvp-1.4.2-d0191a1f54';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'privacy.html',
  'icon-512.png', 'icon-192.png', 'apple-touch-icon.png',
  'css/fonts.css', 'css/style.css',
  'fonts/lilita-one-latin.woff2', 'fonts/lilita-one-latin-ext.woff2',
  'fonts/nunito-latin.woff2', 'fonts/nunito-latin-ext.woff2',
  'fonts/press-start-2p-latin.woff2', 'fonts/press-start-2p-latin-ext.woff2',
  'js/util.js', 'js/i18n.js', 'js/lang-en.js', 'js/lang-es.js', 'js/lang-de.js', 'js/analytics.js', 'js/cloud.js', 'js/pwa.js', 'js/data.js', 'js/art.js', 'js/art-extra.js',
  'js/gen.js', 'js/modes.js', 'js/features.js', 'js/content.js', 'js/docs.js', 'js/audio.js', 'js/ads.js',
  'js/ui.js', 'js/game.js', 'js/main.js',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' contourne le cache HTTP du navigateur : on récupère vraiment la nouvelle version
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const nav = req.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    // Page d'accueil (avec ou sans ?testeur) : toujours celle de la version en cache
    const hit = nav ? (await cache.match('index.html')) : await cache.match(req);
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (err) {
      return nav ? cache.match('index.html') : Response.error();
    }
  }));
});
