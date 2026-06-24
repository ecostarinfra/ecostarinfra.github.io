const CACHE = 'lotus-valley-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/lotus-valley-map.webp',
  '/lotus-valley-map.jpeg',
  '/manifest.json',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
];

// Install: cache all core assets
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    ).then(()=>self.clients.claim())
  );
});

// Fetch: serve from cache first, fall back to network
// Firebase/Firestore requests always go to network (never cache)
self.addEventListener('fetch', e=>{
  const url = e.request.url;

  // Never cache Firebase, Firestore, or auth requests
  if(url.includes('firestore.googleapis.com') ||
     url.includes('firebase') ||
     url.includes('googleapis.com') ||
     url.includes('gstatic.com')){
    e.respondWith(fetch(e.request));
    return;
  }

  // Cache-first for everything else (HTML, map image, manifest)
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached) return cached;
      return fetch(e.request).then(response=>{
        // Cache successful GET responses
        if(e.request.method==='GET' && response.status===200){
          const clone = response.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
