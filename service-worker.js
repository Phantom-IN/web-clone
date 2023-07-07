<!DOCTYPE html>
<html><head></head><body>const VERSION = 'e219-934e-5ce5';
const CACHE_KEYS = {
  PRE_CACHE: `precache-${VERSION}`,
  RUNTIME: `runtime-${VERSION}`
};

// URLS that we do not want to end up in the cache
const EXCLUDED_URLS = [
  'admin',
  '.netlify',
  'https://identity.netlify.com/v1/netlify-identity-widget.js',
  '/imprint',
  'https://www.ilithya.net/analytics/'
];

// URLS that we want to be cached when the worker is installed
const PRE_CACHE_URLS = [
  '/', 
  '/fonts/gallaudetregular-webfont.woff',
  '/fonts/gallaudetregular-webfont.woff2',
  '/images/loading.gif',
  '/images/about/ilithya.jpg',
  '/images/codeart/bubbleslamp.gif',
  '/images/codeart/butterfly.gif',
  '/images/codeart/crystals.gif',
  '/images/codeart/dahlias.gif',
  '/images/codeart/elasticlampshade.gif',
  '/images/codeart/eye.gif',
  '/images/codeart/flowers.gif',
  '/images/codeart/neumorphism.gif',
  '/images/codeart/polaroidworld.gif',
  '/images/codeart/spiderweb.gif',
  '/images/codeart/wire.gif',
  '/images/anydayshaders/balloons.gif',
  '/images/anydayshaders/dripping.gif',
  '/images/anydayshaders/exhale.gif',
  '/images/anydayshaders/feathers.gif',
  '/images/anydayshaders/glitchysculpture.gif',
  '/images/anydayshaders/hieroglyphs.gif',
  '/images/anydayshaders/lustrous.gif',
  '/images/anydayshaders/rivers.gif',
  '/images/anydayshaders/scrambled.gif',
  '/images/anydayshaders/streetart.gif',
  '/images/anydayshaders/sunsetclouds.gif',
  '/images/anydayshaders/trippyicecream.gif'
];

// You might want to bypass a certain host
const IGNORED_HOSTS = ['localhost', 'ilithya.net', ];

/**
 * Takes an array of strings and puts them in a named cache store
 *
 * @param {String} cacheName
 * @param {Array} items=[]
 */
const addItemsToCache = function(cacheName, items = []) {
  caches.open(cacheName).then(cache =&gt; cache.addAll(items));
};

self.addEventListener('install', evt =&gt; {
  self.skipWaiting();

  addItemsToCache(CACHE_KEYS.PRE_CACHE, PRE_CACHE_URLS);
});

self.addEventListener('activate', evt =&gt; {
  // Look for any old caches that don't match our set and clear them out
  evt.waitUntil(
    caches
      .keys()
      .then(cacheNames =&gt; {
        return cacheNames.filter(item =&gt; !Object.values(CACHE_KEYS).includes(item));
      })
      .then(itemsToDelete =&gt; {
        return Promise.all(
          itemsToDelete.map(item =&gt; {
            return caches.delete(item);
          })
        );
      })
      .then(() =&gt; self.clients.claim())
  );
});

self.addEventListener('fetch', evt =&gt; {
  const {hostname} = new URL(evt.request.url);

  // Check we do not want to ignore this host
  if (IGNORED_HOSTS.indexOf(hostname) &gt;= 0) {
    return;
  }

  // Check we do not want to ignore this URL
  if (EXCLUDED_URLS.some(page =&gt; evt.request.url.indexOf(page) &gt; -1)) {
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(cachedResponse =&gt; {
      // Item found in cache so return
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nothing found so load up the request from the network
      return caches.open(CACHE_KEYS.RUNTIME).then(cache =&gt; {
        return fetch(evt.request)
          .then(response =&gt; {
            // Put the new response in cache and return it
            return cache.put(evt.request, response.clone()).then(() =&gt; {
              return response;
            });
          })
          .catch(ex =&gt; {
            return;
          });
      });
    })
  );
});</body></html>