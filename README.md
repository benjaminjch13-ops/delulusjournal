# Delulu Journal ✦

Soñá. Planeá. Repetí.

Página web de **Delulu Journal by Ensso** ([@delulu.journal](https://www.instagram.com/delulu.journal/)): libretas de cuero hechas a mano en Guatemala.

Esta es la **tienda**: la página para armar y pedir tu libreta.

- **Pedí tu libreta** en 5 pasos (tamaño, libritos por dentro, color del cuero, elástico y charm) con vista 3D que se gira con el dedo.
- **Ficha técnica**: al terminar se descarga una imagen con todo el pedido para mandarla por DM a Instagram. Enlace directo: `/#pedir`.
- Redes: Instagram [@delulu.journal](https://www.instagram.com/delulu.journal/).

La versión completa con el editor de libretas digitales vive en el repositorio `delulusV2`.

## Cómo está hecho

Sin frameworks: HTML, CSS y JavaScript que se juntan en un solo archivo.

```
src/head.html      fuentes y título
src/body.html      estructura de pantallas e íconos
src/styles.css     todos los estilos
src/js/*.js        por módulos (se cargan en orden por nombre)
  05-brand.js      marca: colores, logo, tamaños, cueros, elásticos y charms del pedido
  10-25, 60        dibujo de la libreta (3D y portada para la ficha)
  95-order.js      el flujo "Pedí tu libreta"
  96-ficha.js      la ficha técnica que se descarga
  99-shop.js       arranque de la tienda
build.mjs          junta todo en dist/index.html (minificado)
```

Precios, tamaños, cueros, elásticos e Instagram están en `src/js/05-brand.js` (`DL_SIZES`, `DL_SHIP`). Los charms son fotos reales recortadas en `src/js/06-charms.js`. La imagen para compartir el enlace es `public/og.jpg`.

## Correr y publicar

```bash
npm install
npm run build      # crea dist/index.html
npm run dev        # versión sin minificar en http://localhost:3000
```

## Opiniones

La sección de opiniones usa `api/comments.js` (función de Vercel) y guarda los comentarios en Upstash Redis:

1. En Vercel, abrí el proyecto → **Storage** → **Create** → **Upstash for Redis** (plan gratis) y conectalo a este proyecto. Eso crea solo las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
2. En **Settings → Environment Variables** agregá `ADMIN_KEY` con una clave que solo vos sepás.
3. Volvé a publicar (Deployments → Redeploy).

Para borrar una opinión: abrí `delulusjournal.vercel.app/#admin`, escribí tu clave y aparece el botón de borrar en cada opinión. Las opiniones no aceptan enlaces y cada persona puede dejar hasta 3 por hora.

Vercel usa `vercel.json`: corre `npm run build` y publica la carpeta `dist`.
