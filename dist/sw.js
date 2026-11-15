const cacheName = 'dynamic-shell-12';
const assets = [
  './', './index.html', './style.css', './app.mjs', './mobility.mjs', './exercise-photos.mjs',
  './app.webmanifest', './icon-192.png', './icon-512.png', './photos/mobility.jpg',
  './photos/arm-circles.jpg', './photos/open-gates.jpg', './photos/lateral-lunge.jpg',
  './photos/thread-the-needle.jpg', './photos/quad-stretch.jpg', './photos/straight-knee-calf.jpg',
  './photos/bent-knee-calf.jpg', './photos/cat-cow.jpg', './photos/bodyweight-squat.jpg',
  './photos/forearm-plank.jpg', './photos/mountain-climber.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('dynamic-shell-') && key !== cacheName).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
