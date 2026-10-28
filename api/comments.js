// Comentarios de la tienda: GET los lista, POST agrega uno, DELETE (con ADMIN_KEY) borra uno.
// Se guardan en Upstash Redis (Vercel → Storage → Upstash Redis, conectado a este proyecto).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'delulu:comments';

async function redis(...cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const clean = (s, max) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const BLOCK = /(https?:\/\/|www\.|\.com\b|\.net\b|bit\.ly|t\.me\/)/i; // sin enlaces: corta casi todo el spam

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'storage', message: 'Los comentarios todavía no están conectados.' });
  try {
    if (req.method === 'GET') {
      const all = (await redis('HVALS', KEY)) || [];
      const list = all.map((x) => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean).sort((a, b) => b.date - a.date);
      const avg = list.length ? list.reduce((s, c) => s + c.rating, 0) / list.length : 0;
      return res.status(200).json({ comments: list.slice(0, 100), count: list.length, avg: Math.round(avg * 10) / 10 });
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      if (b.website) return res.status(200).json({ ok: true }); // trampa para bots
      const name = clean(b.name, 40), text = clean(b.text, 500), rating = Math.round(Number(b.rating));
      if (name.length < 2) return res.status(400).json({ error: 'Escribí tu nombre.' });
      if (text.length < 5) return res.status(400).json({ error: 'Contanos un poquito más.' });
      if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Elegí de 1 a 5 estrellas.' });
      if (BLOCK.test(text) || BLOCK.test(name)) return res.status(400).json({ error: 'Los comentarios no pueden llevar enlaces.' });
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
      const rl = `delulu:rl:${ip}`, n = await redis('INCR', rl);
      if (n === 1) await redis('EXPIRE', rl, 3600);
      if (n > 3) return res.status(429).json({ error: 'Ya dejaste varios comentarios. Probá más tarde.' });
      const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, text, rating, date: Date.now() };
      await redis('HSET', KEY, c.id, JSON.stringify(c));
      return res.status(201).json({ ok: true, comment: c });
    }
    if (req.method === 'DELETE') {
      if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Clave incorrecta.' });
      const id = clean(req.query?.id, 40);
      await redis('HDEL', KEY, id);
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Método no permitido.' });
  } catch (e) {
    return res.status(500).json({ error: 'No pudimos guardar tu comentario. Probá de nuevo.' });
  }
}
