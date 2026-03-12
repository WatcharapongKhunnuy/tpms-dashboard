const CACHE_NAME = 'tpms-pro-v5';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/ws.js',
    './js/car3d.js',
    './js/chart.js',
    './js/alerts.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
