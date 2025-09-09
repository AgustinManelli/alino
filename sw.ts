import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Escucha el evento 'push'
self.addEventListener("push", (event) => {
  const data = event.data?.json();

  if (!data) return;

  const options = {
    body: data.body,
    // Icono principal de la notificación (pequeño, a la izquierda)
    icon: data.icon || "/manifest-icon-192.maskable.png",
    // Insignia para la barra de estado (monocromática, solo en Android)
    // badge: data.badge || "/badge-96x96.png",
    // Imagen grande dentro de la notificación
    // image: data.image,
    // Datos extra que podemos usar al hacer clic
    data: {
      url: data.data?.url || "/", // URL a la que se navegará
    },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Escucha el evento 'notificationclick'
// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(self.clients.openWindow("https://app.alino.online"));
// });

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    (async () => {
      try {
        // Obtener todas las client windows (incluye no-controladas)
        const windowClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        // Intentar encontrar primero una visible del mismo origen
        let client = windowClients.find((c) => {
          try {
            return (
              new URL(c.url).origin === self.location.origin &&
              c.visibilityState === "visible"
            );
          } catch {
            return false;
          }
        });

        // Si no hay visible, tomar cualquier client del mismo origen
        if (!client) {
          client = windowClients.find((c) => {
            try {
              return new URL(c.url).origin === self.location.origin;
            } catch {
              return false;
            }
          });
        }

        if (client) {
          // Enfocar la ventana encontrada
          await client.focus();

          // Si el client soporta navigate (WindowClient.navigate), úsalo.
          // Si no, enviamos un postMessage para que la app haga la navegación internamente.
          const targetUrl = new URL(url, self.location.origin).href;
          // @ts-ignore WindowClient may have navigate in some browsers
          if (typeof (client as any).navigate === "function") {
            try {
              // intenta navegar la ventana ya abierta
              await (client as any).navigate(targetUrl);
            } catch {
              // si falla, envía mensaje para que la app lo maneje
              client.postMessage({
                type: "notification-click",
                url: targetUrl,
              });
            }
          } else {
            client.postMessage({ type: "notification-click", url: targetUrl });
          }

          return;
        }

        // Si no hay clients abiertos: abrir una ventana (o abrir la PWA si está instalada)
        await self.clients.openWindow(new URL(url, self.location.origin).href);
      } catch (err) {
        // último recurso: abrir ventana
        await self.clients.openWindow(url);
      }
    })()
  );
});
