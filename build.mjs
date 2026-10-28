// Builds journaly.html from src/: head + minified CSS + body + minified JS (modules in file-name order).
// Usage: node build.mjs [--dev]   (--dev skips minification, for debugging)
// Output: dist/index.html (the whole app in one file)
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const here = new URL('.', import.meta.url).pathname;
const dev = process.argv.includes('--dev');
const read = (p) => readFileSync(here + p, 'utf8');

const jsFiles = readdirSync(here + 'src/js').filter((f) => f.endsWith('.js')).sort();
let js = jsFiles.map((f) => `/* ${f} */\n` + read('src/js/' + f)).join('\n');
let css = read('src/styles.css');

if (!dev) {
  const { minify } = require('terser');
  const out = await minify(js, { ecma: 2020, compress: { passes: 2 }, mangle: true, format: { comments: false } });
  js = out.code;
  const { transform } = require('lightningcss');
  css = transform({ filename: 'styles.css', code: Buffer.from(css), minify: true }).code.toString();
}

const icon = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#386660"/><path d="M32 10c2 12 6 18 22 22-16 4-20 10-22 22-2-12-6-18-22-22 16-4 20-10 22-22z" fill="#F6E08A"/></svg>');
const meta = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="Armá tu Delulu Journal de cuero en 4 pasos y pedila por DM. A5 Q220 · A6 Q150. Hecha a mano en Guatemala.">
<meta name="theme-color" content="#386660">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_GT">
<meta property="og:site_name" content="Delulu Journal">
<meta property="og:title" content="Delulu Journal · Armá tu libreta de cuero">
<meta property="og:image" content="https://delulusjournal.vercel.app/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Libretas Delulu Journal de cuero con charms">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Delulu Journal · Armá tu libreta de cuero">
<meta name="twitter:description" content="Elegí tamaño, cuero, elástico y charm. A5 Q220 · A6 Q150. Hecha a mano en Guatemala.">
<meta name="twitter:image" content="https://delulusjournal.vercel.app/og.jpg">
<link rel="apple-touch-icon" href="/og-icon.png">
<meta property="og:url" content="https://delulusjournal.vercel.app/">
<meta property="og:description" content="Armá tu libreta de cuero en 4 pasos: tamaño, cuero, elástico y charm. A5 Q220 · A6 Q150 · hecha a mano en Guatemala.">
<link rel="icon" href="${icon}">`;
const html = `<!doctype html>\n<html lang="es">\n<head>\n${meta}\n${read('src/head.html').trim()}\n<style>${css}</style>\n</head>\n<body>\n${read('src/body.html').trim()}\n<script>${js}</script>\n</body>\n</html>\n`;
mkdirSync(here + 'dist', { recursive: true });
if (existsSync(here + 'public')) cpSync(here + 'public', here + 'dist', { recursive: true }); // og.png and other static files
writeFileSync(here + 'dist/index.html', html);
console.log(`dist/index.html ${(html.length / 1024).toFixed(1)} KB (${jsFiles.length} modules${dev ? ', dev' : ''})`);
