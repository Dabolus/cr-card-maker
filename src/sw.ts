import { clientsClaim, setCacheNameDetails } from 'workbox-core';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

clientsClaim();

if (import.meta.env.DEV) {
  console.groupCollapsed('Workbox precache manifest');
  self.__WB_MANIFEST.forEach((entry) => console.info(entry));
  console.groupEnd();
} else {
  setCacheNameDetails({ prefix: 'crcm' });
  precacheAndRoute(self.__WB_MANIFEST);
  cleanupOutdatedCaches();
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
}
