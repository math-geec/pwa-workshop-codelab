/*
Copyright 2021 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// 
import { warmStrategyCache, offlineFallback } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Set up page cache
// Cache First caching strategy, allow for other pages to be added to the cache as needed
const pageCache = new CacheFirst({
  cacheName: 'page-cache',
//   workbox strategies can take plugins to affect the lifecycle of saving and retrieving content from cache
  plugins: [
    new CacheableResponsePlugin({
     // only cache good server response
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
     // each item in cache will be flushed after 30 days
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

// register a new routine, any requests that's a page navigation will be managed by cache first strategy
registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// Set up asset cache
registerRoute(
     // if the type of request is style(CSS), script(JS), worker(Web Worker)
     ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
     new StaleWhileRevalidate({
       cacheName: 'asset-cache',
       plugins: [
         new CacheableResponsePlugin({
           statuses: [0, 200],
         }),
       ],
     }),
   );

// Set up offline fallback
offlineFallback({
     pageFallback: '/offline.html',
   });
   
   