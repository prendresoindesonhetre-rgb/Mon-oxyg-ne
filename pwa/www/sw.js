// Service worker de Mon Oxygène : l'appli web reste utilisable sans connexion.
// Il ne s'occupe que des fichiers de l'appli ; les autres pages du site (confidentialité, Régie) passent sans être touchées.
const CACHE = 'mon-oxygene-v101';
const VERSION = '?v=101';
const CODE = ['style.css', 'respiration.js', 'baton-de-pluie.js', 'plus.js', 'app.js'];
const FICHIERS = [
  './', './index.html', './manifest.webmanifest',
  ...CODE.map(f => './' + f + VERSION),
  './assets/settings_bg.webp', './assets/curve_bg.jpg', './assets/lotus.png',
  './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png',
  './assets/presets/ralentir.png', './assets/presets/retrouver-calme.png', './assets/presets/equilibre.png',
  './assets/presets/retrouver-dynamisme.png', './assets/presets/dynamiser.png',
  './assets/rainstick/ambient-rainstick.mp3'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  const portee = new URL(self.registration.scope);
  if (url.origin !== portee.origin || !url.pathname.startsWith(portee.pathname)) return;
  const chemin = url.pathname.slice(portee.pathname.length);

  // La page de l'appli : d'abord le réseau (pour les mises à jour), sinon la copie gardée.
  if (chemin === '' || chemin === 'index.html') {
    e.respondWith(fetch(req, { cache: 'no-store' })
      .then(r => { const copie = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', copie)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  // Code et images de l'appli : la copie gardée, sinon le réseau.
  if (CODE.includes(chemin) || chemin === 'manifest.webmanifest' || chemin.startsWith('assets/')) {
    e.respondWith(caches.match(req).then(trouve => trouve || fetch(req).then(r => {
      if (r.ok) { const copie = r.clone(); caches.open(CACHE).then(c => c.put(req, copie)); }
      return r;
    })));
  }
});
