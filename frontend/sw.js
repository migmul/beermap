const CACHE_NAME = 'beermap-v1.6';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/base.css',
    './css/variables.css',
    './css/glassmorphism.css',
    './js/app.js',
    './js/api.js',
    './js/map.js',
    './js/ui.js',
    './js/utils.js'
];

// Installation du Service Worker et mise en cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Interception des requêtes (Stratégie: Cache falling back to network)
self.addEventListener('fetch', (event) => {
    // On ne cache pas les appels API backend
    if (event.request.url.includes('127.0.0.1') || event.request.url.includes('api')) return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});