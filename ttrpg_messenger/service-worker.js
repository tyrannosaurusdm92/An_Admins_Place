'use strict';
const CACHE='tablegate-v2-2026-07-28-organizer-detection-fix-v4';
const CORE=['./','./messenger.html','./manifest.webmanifest?v=20260728.4','./css/messenger.css?v=20260728.4','./css/organizer.css?v=20260728.4','./css/responsive.css?v=20260728.4','./js/vendor-jszip.min.js?v=20260728.4','./js/messenger-core.js?v=20260728.4','./js/organizer.js?v=20260728.4','./js/pwa.js?v=20260728.4','./js/bootstrap.js?v=20260728.4','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==location.origin)return;event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./messenger.html'))))});
