const CACHE_VERSION = 'word-trainer-v2.26';
const CONTENT_CACHE = 'word-trainer-homework-v1';
const APP_SHELL = ['./', './index.html', './type.html', './manifest.webmanifest'];

async function sha256Hex(data) {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(async keys => {
      const contentCache = await caches.open(CONTENT_CACHE);
      const oldAppCaches = keys.filter(key => key.startsWith('word-trainer-v') && key !== CACHE_VERSION);
      for (const key of oldAppCaches) {
        const oldCache = await caches.open(key);
        for (const request of await oldCache.keys()) {
          if (new URL(request.url).pathname.includes('/homework/')) {
            const response = await oldCache.match(request);
            if (response) await contentCache.put(request, response);
          }
        }
      }
      await Promise.all(oldAppCaches.map(key => caches.delete(key)));
    })
      .then(() => self.clients.claim())
  );
});

async function rangeResponse(request, cachedResponse) {
  const range = request.headers.get('range');
  if (!range || !cachedResponse) return cachedResponse;
  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return new Response(null, { status:416 });

  const buffer = await cachedResponse.arrayBuffer();
  const size = buffer.byteLength;
  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
    return new Response(null, { status:416, headers:{'Content-Range':`bytes */${size}`} });
  }

  const headers = new Headers(cachedResponse.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(buffer.slice(start, end + 1), { status:206, statusText:'Partial Content', headers });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    const shellPage = url.pathname.endsWith('/type.html') ? './type.html' : './index.html';
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) caches.open(CACHE_VERSION).then(cache => cache.put(shellPage, response.clone()));
          return response;
        })
        .catch(() => caches.match(shellPage))
    );
    return;
  }

  if (request.headers.has('range')) {
    event.respondWith(
      caches.open(CONTENT_CACHE).then(cache => cache.match(url.href, { ignoreSearch:true }))
        .then(cached => cached ? rangeResponse(request, cached) : fetch(request))
    );
    return;
  }

  if (url.origin === self.location.origin && url.pathname.includes('/homework/')) {
    event.respondWith(fetch(request).catch(() => caches.open(CONTENT_CACHE).then(cache => cache.match(url.href, { ignoreSearch:true }))));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request, { ignoreSearch:true }).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) caches.open(CACHE_VERSION).then(cache => cache.put(request, response.clone()));
          return response;
        });
      })
    );
  }
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_DAY' || !Array.isArray(event.data.urls)) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CONTENT_CACHE);
    const entries = event.data.urls.map(item => {
      const relativeUrl = typeof item === 'string' ? item : item?.url;
      const expectedHash = typeof item === 'object' ? String(item?.sha256 || '').toLowerCase() : '';
      const url = new URL(relativeUrl, self.registration.scope);
      if (url.origin !== self.location.origin || !url.pathname.includes('/homework/')) throw new Error('Invalid cache URL');
      if (!/^[a-f0-9]{64}$/.test(expectedHash)) throw new Error('Invalid content hash');
      return { url, expectedHash };
    });
    try {
      const downloads = [];
      for (const entry of entries) {
        const cached = await cache.match(entry.url.href);
        if (cached) {
          const cachedHash = await sha256Hex(await cached.clone().arrayBuffer());
          if (cachedHash === entry.expectedHash) continue;
        }

        const response = await fetch(entry.url.href, { cache:'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.arrayBuffer();
        if (!body.byteLength) throw new Error('Empty response');
        if (await sha256Hex(body) !== entry.expectedHash) throw new Error('Content changed during update');
        downloads.push({
          url:entry.url.href,
          response:new Response(body, {
            status:response.status,
            statusText:response.statusText,
            headers:response.headers
          })
        });
      }
      for (const download of downloads) {
        await cache.put(download.url, download.response);
      }
      event.source?.postMessage({ type:'DAY_CACHED', day:event.data.day });
    } catch (error) {
      const alreadyCached = await Promise.all(entries.map(async entry => {
        const response = await cache.match(entry.url.href);
        return response && await sha256Hex(await response.arrayBuffer()) === entry.expectedHash;
      }));
      event.source?.postMessage({
        type:alreadyCached.every(Boolean) ? 'DAY_CACHED' : 'DAY_CACHE_FAILED',
        day:event.data.day
      });
    }
  })());
});
