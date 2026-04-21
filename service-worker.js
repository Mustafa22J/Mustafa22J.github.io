const CACHE_NAME = 'mj-portfolio-v5';
const urlsToCache = ['/', '/index.html', '/styles.css', '/script.js', '/manifest.json', '/Mustafa.png', '/Mustafa_Jawish_IT_Networking_CV.pdf'];

self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))); });
self.addEventListener('fetch', event => { event.respondWith(caches.match(event.request).then(response => response || fetch(event.request).then(fetchRes => { const clone = fetchRes.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)); return fetchRes; }))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key))))); });