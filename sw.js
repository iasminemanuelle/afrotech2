/* Service worker — deixa o jogo jogável offline depois da 1ª visita
 * (só funciona quando hospedado em http/https: GitHub Pages, Netlify, servidor da escola).
 * Ao publicar uma nova versão, mude CACHE para forçar a atualização. */
var CACHE = 'afrotech-v2-0.8.0';
var FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/fonts/PressStart2P.woff2',
  './assets/fonts/VT323.woff2',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './css/mobile.css',
  './css/style.css',
  './js/main.js',
  './js/content/dialogues.js',
  './js/content/glossary.js',
  './js/content/quiz.js',
  './js/core/audio.js',
  './js/core/config.js',
  './js/core/input.js',
  './js/core/music.js',
  './js/core/state.js',
  './js/gfx/art.js',
  './js/gfx/characters.js',
  './js/gfx/pixel.js',
  './js/gfx/tiles.js',
  './js/quantum/bloch.js',
  './js/quantum/qsim.js',
  './js/systems/dialogue.js',
  './js/systems/dice.js',
  './js/ui/create.js',
  './js/ui/extras.js',
  './js/ui/hud.js',
  './js/ui/lousa.js',
  './js/ui/minigames.js',
  './js/ui/panel.js',
  './js/ui/quiz.js',
  './js/ui/report.js',
  './js/ui/shop.js',
  './js/ui/simulator.js',
  './js/ui/touch.js',
  './js/ui/trip.js',
  './js/ui/ui.js',
  './js/world/maps.js',
  './js/world/world.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    });
  }));
});
