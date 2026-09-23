// Keeps the app on the phone so it opens with no network (استراحة Wi‑Fi is
// often weak). The file list and version are written into the built copy by
// tool/pwa.dart at deploy time; this source copy is only the template.
'use strict';

const VERSION = 'f11a8cd8';
const FILES = ['./', 'assets/AssetManifest.bin', 'assets/AssetManifest.bin.json', 'assets/FontManifest.json', 'assets/assets/fonts/OFL-ReadexPro.txt', 'assets/assets/fonts/OFL-ReemKufi.txt', 'assets/assets/fonts/ReadexPro-Variable.ttf', 'assets/assets/fonts/ReemKufi-Variable.ttf', 'assets/fonts/MaterialIcons-Regular.otf', 'assets/packages/wakelock_plus/assets/no_sleep.js', 'assets/shaders/ink_sparkle.frag', 'assets/shaders/stretch_effect.frag', 'canvaskit/canvaskit.js', 'canvaskit/canvaskit.wasm', 'favicon.png', 'flutter.js', 'flutter_bootstrap.js', 'icons/Icon-192.png', 'icons/Icon-512.png', 'icons/Icon-maskable-192.png', 'icons/Icon-maskable-512.png', 'index.html', 'main.dart.js', 'manifest.json', 'version.json'];
const CACHE = 'app-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// The page itself tries the network first (for updates) but gives up after
// three seconds; everything else comes from the phone first.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        }),
        new Promise((_, reject) => setTimeout(reject, 3000)),
      ]).catch(() => caches.match(request).then((cached) => cached || caches.match('./'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })),
  );
});
