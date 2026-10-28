# Delulu Journal ✦

Soñá. Planeá. Repetí.

Página web de **Delulu Journal by Ensso** ([@delulu.journal](https://www.instagram.com/delulu.journal/)): libretas de cuero hechas a mano en Guatemala.

Esta es la **tienda**: la página para armar y pedir tu libreta.

- **Pedí tu libreta** en 4 pasos (tamaño, color del cuero, elástico y charm) con vista 3D que se gira con el dedo.
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

Para cambiar los colores de elástico, charms o el usuario de Instagram, editá `src/js/05-brand.js`.

## Correr y publicar

```bash
npm install
npm run build      # crea dist/index.html
npm run dev        # versión sin minificar en http://localhost:3000
```

Vercel usa `vercel.json`: corre `npm run build` y publica la carpeta `dist`.
