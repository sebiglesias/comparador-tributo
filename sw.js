/**
 * Service Worker for Comparador Tributo PWA
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'comparador-tributo-v2-treemap';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/calculator.js',
    '/charts.js',
    '/app.js',
    '/manifest.json'
];

// Don't cache external CDN resources - always fetch from network
const CDN_URLS = [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Error caching files:', err);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // Always fetch CDN resources from network (don't cache external libraries)
    if (CDN_URLS.some(cdn => url.startsWith(cdn))) {
        event.respondWith(fetch(event.request));
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                
                // Clone the request
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response
                    const responseToCache = response.clone();
                    
                    // Cache the fetched response
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // Fallback for offline
                return caches.match('/index.html');
            })
    );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
