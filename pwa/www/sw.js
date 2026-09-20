const CACHE='mon-oxygene-pwa-v49-personal-rainstick';
const CORE=[
  './','./index.html','./app.js','./sequence.js','./orientation.js','./compat-init.js','./responsive.js','./v41-phone-ui.js','./v44-rainstick.js',
  './styles.css','./landscape-force.css','./legacy.css','./responsive.css','./v37-fixes.css','./v38-responsive.css','./v39-landscape-fit.css','./v40-mobile-sequence.css','./v41-phone-ui.css',
  './manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png','./assets/apple-touch-icon.png','./assets/mon-oxygene-splash.png','./assets/mon-oxygene-start.png','./assets/settings_bg.jpg','./assets/curve_bg.jpg','./assets/lotus.png',
  './assets/rainstick/up-8.mp3','./assets/rainstick/down-8.mp3'
];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});