'use strict';
const CACHE = 'superbot-intelligence-v1.0.0-corpus-split-1';
const CORE = [
  './', './superbot.html', './bot.css', './service-worker.js',
  './js/config.js', './js/utils.js', './js/storage.js', './js/memory.js',
  './js/intelligence-corpus-part-1.js', './js/intelligence-corpus-part-2.js',
  './js/intelligence-corpus-part-3.js', './js/retrieval.js', './js/tools.js',
  './js/llm-client.js', './js/orchestrator.js', './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => {
    const network = fetch(event.request).then(response => {
      if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => cached || caches.match('./superbot.html'));
    return cached || network;
  }));
});
