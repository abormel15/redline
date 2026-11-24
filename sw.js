/* Redline Desk — offline cache. The app shell and the PDF libraries are stored on install; the page itself is fetched
   from the network first so updates arrive, with the cached copy used when offline. Fonts and anything else fetched
   while online are kept for later. Version is replaced by the build. */
const VERSION = 'af72ecfb33';
const SHELL = 'rd-shell-' + VERSION, RUNTIME = 'rd-runtime';
const PRECACHE = ['./', 'index.html', 'manifest.webmanifest', 'lib/pdf.min.js', 'lib/pdf-lib.min.js', 'lib/pdf.worker.min.js',
  'lib/standard_fonts/LiberationSans-Regular.ttf', 'lib/standard_fonts/LiberationSans-Bold.ttf', 'lib/standard_fonts/LiberationSans-Italic.ttf', 'lib/standard_fonts/LiberationSans-BoldItalic.ttf',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('rd-shell-') && k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // only this site is cached; the account (Supabase) and anything else live go straight to the network
  if (url.origin !== location.origin) return;
  if (url.origin === location.origin && (req.mode === 'navigate' || /index\.html$/.test(url.pathname) || url.pathname.endsWith('/'))) {
    // pages: network first, cache fallback. The app itself is kept under one key ('index.html') whatever the query;
    // other pages next to it (guide/) are kept under their own address, so they never stand in for the app offline.
    const root = new URL(self.registration.scope).pathname, isApp = url.pathname === root || url.pathname === root + 'index.html';
    const key = isApp ? 'index.html' : url.pathname.replace(/\/$/, '/index.html');
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => { const copy = r.clone(); caches.open(SHELL).then(c => c.put(key, copy)); return r; })
      .catch(() => caches.match(key, { ignoreSearch: true })));
    return;
  }
  // everything else: cache first, then network (stored for next time)
  e.respondWith(caches.match(req, { ignoreSearch: url.origin === location.origin }).then(hit => hit || fetch(req).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(url.origin === location.origin ? SHELL : RUNTIME).then(c => c.put(req, copy)); }
    return r; }).catch(() => hit)));
});
