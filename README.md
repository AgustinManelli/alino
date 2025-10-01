# <img src="https://github.com/user-attachments/assets/2fd60d98-7ea1-412d-9c96-b27f59bbeb28" alt="Alino logo" width="80" />

**Tu espacio para estar organizado.**

[![Vercel](https://img.shields.io/badge/deploy-vercel-black)]() [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]() [![Status](https://img.shields.io/badge/status-beta-yellowgreen)]()

---

## Tabla de contenidos

* [Aplicación](#aplicación)
* [Resumen](#resumen)
* [Características](#características)
* [Screenshots / GIF](#screenshots--gif)
* [Tecnologías](#tecnologías)
* [Arquitectura](#arquitectura)
* [Cómo contribuir](#cómo-contribuir)
* [Roadmap](#roadmap)
* [Changelog](#changelog)
* [Licencia](#licencia)
* [Contacto](#contacto)

---

## Aplicación

> **URL:** `https://app.alino.online`

---

## Resumen

Alino es una aplicación moderna y minimalista para gestionar tareas, listas y notas. Está pensada para uso personal y colaboración en equipos pequeños, con reordenamiento intuitivo, sincronización en tiempo real y soporte PWA para uso en móviles.

---

## Características

* **Gestión de tareas y listas:** crear/editar/eliminar listas y tareas.
* **Carpetas:** agrupa listas en carpetas para mejor organización visual.
* **Reordenamiento (Drag & Drop):** drag & drop para reordenar elementos, usando un sistema de indexación lexicográfico (LexoRank) para índices "infinitos".
* **Colaboración en tiempo real:** compartir listas y sincronización instantánea con Supabase Realtime.
* **PWA:** instalación en dispositivos móviles y comportamiento offline básico.
* **Autenticación y seguridad:** Autenticación mediante Supabase Auth.
* **Diseño responsivo:** funcional en escritorio, tablet y móvil.

---

## Screenshots / GIF
![presentation](https://github.com/user-attachments/assets/f2ec0116-5647-4761-a7fb-c480cc922cb2)

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/user-attachments/assets/844ee81a-fcfa-4c89-9941-851df30cb7aa">
        <img src="https://github.com/user-attachments/assets/844ee81a-fcfa-4c89-9941-851df30cb7aa" alt="shared-lists" width="300" style="height:auto;"/>
      </a>
      <br/>Listas compartidas
    </td>
    <td align="center">
      <a href="https://github.com/user-attachments/assets/7da8f80a-f9aa-4691-9504-3abb20691f72">
        <img src="https://github.com/user-attachments/assets/7da8f80a-f9aa-4691-9504-3abb20691f72" alt="lists" width="300" style="height:auto;"/>
      </a>
      <br/>Creación de listas
    </td>
    <td align="center">
      <a href="https://github.com/user-attachments/assets/3d1f22a9-e70b-4dee-81a2-8f7e38c242ea">
        <img src="https://github.com/user-attachments/assets/3d1f22a9-e70b-4dee-81a2-8f7e38c242ea" alt="folders" width="300" style="height:auto;"/>
      </a>
      <br/>Carpetas
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/user-attachments/assets/3e25f236-9931-4b66-8c2b-6450e14df2dc">
        <img src="https://github.com/user-attachments/assets/3e25f236-9931-4b66-8c2b-6450e14df2dc" alt="widgets" width="300" style="height:auto;"/>
      </a>
      <br/>Widgets
    </td>
    <td align="center">
      <a href="https://github.com/user-attachments/assets/71770041-8678-4fa9-9786-d9d8671c0d96">
        <img src="https://github.com/user-attachments/assets/71770041-8678-4fa9-9786-d9d8671c0d96" alt="notifications" width="300" style="height:auto;"/>
      </a>
      <br/>Notificaciones
    </td>
  </tr>
</table>

---

## Tecnologías

* **Frontend:** Next.js
* **Lenguaje:** TypeScript
* **Backend / Base de datos:** Supabase (Postgres, Auth, Realtime)
* **Estado:** Zustand
* **Drag & Drop:** dnd-kit
* **Reordenamiento lexicográfico:** LexoRank
* **Estilos:** CSS Modules
* **Despliegue:** Vercel

---

## Arquitectura

* **Next.js (App / Pages):** UI, rutas, SSR.
* **Supabase:** almacenamiento de datos, autenticación, y realtime para sincronización colaborativa.
* **Zustand:** store global para estado cliente.
* **IndexedDB:** cache local para soporte offline (PWA).

---

## Cómo contribuir

Gracias por querer contribuir 🙌. Sigue estos pasos:

1. Haz fork del repositorio.
2. Crea una rama: `git checkout -b feature/mi-cambio`.
3. Haz tus cambios con commits claros (`git commit -m "feat: añade X"`).
4. Ejecuta `npm run lint` y `npm run test` si aplica.
5. Abre un Pull Request describiendo los cambios.

---

## Roadmap

* Autoguardado y versiones de listas
* Mejor soporte offline y sincronización conflict-free
* Integraciones: Google Calendar, Webhooks
* Templates de listas compartibles
* Soporte de recordatorios y notificaciones locales

---

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## Contacto

**Correo de soporte:** [ayuda@alino.online](mailto:ayuda@alino.online)

Repositorio: [https://github.com/AgustinManelli/alino](https://github.com/AgustinManelli/alino)
