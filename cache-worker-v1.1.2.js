const CACHE_NAME = 'cache-v1.0.2';

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.url.match(/ton/)) {
        return fetch(request);
    }

    if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        let finalURL = request.url;

        event.respondWith(
            caches.match(request).then((response) => {
                if (response) {
                    return response;
                }

                return fetch(finalURL)
                    .then((responseToCache) => {
                        const responseForCache = responseToCache.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseForCache);
                        });
                        return responseToCache;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        console.log('Request:', request.url);
                        // Здесь можно добавить логику возврата запасного изображения или другого ответа
                        // return caches.match('/path/to/fallback/image.png');
                    });
            })
        );
    }
});
