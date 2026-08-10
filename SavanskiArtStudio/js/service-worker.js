const CACHE='savanski-art-studio-2026.08.08-v1';
const CORE=[
  '../studio.html','../css/palette.css','../css/studio.css','../assets/icon-192.png','../assets/icon-512.png',
  'backend-config.js','preset-data.js','core.js','canvas-engine.js','tools.js','filters.js','collage.js','map-tools.js','animation.js','backend-api.js','library.js','three-workspace.js','ui.js','three.global.js','three.addons.global.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('../studio.html'))))});
