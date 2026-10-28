/* Ticket SVP ! — service worker : le jeu installé marche hors ligne.
   Stratégie « cache d'abord, mise à jour en arrière-plan » : le jeu s'ouvre instantanément depuis le cache,
   et la version en ligne la plus récente est téléchargée pour le lancement suivant. */
'use strict';

const CACHE = 'ticketsvp-v1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'privacy.html',
  'icon-512.png', 'icon-192.png', 'apple-touch-icon.png',
  'css/fonts.css', 'css/style.css',
  'fonts/lilita-one-latin.woff2', 'fonts/lilita-one-latin-ext.woff2',
  'fonts/nunito-latin.woff2', 'fonts/nunito-latin-ext.woff2',
  'fonts/press-start-2p-latin.woff2', 'fonts/press-start-2p-latin-ext.woff2',
  'js/util.js', 'js/analytics.js', 'js/cloud.js', 'js/pwa.js', 'js/data.js', 'js/art.js', 'js/art-extra.js',
  'js/gen.js', 'js/modes.js', 'js/features.js', 'js/docs.js', 'js/audio.js', 'js/ads.js',
  'js/ui.js', 'js/game.js', 'js/main.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) {
      e.waitUntil(fresh);
      return cached;
    }
    return fresh;
  }));
});
