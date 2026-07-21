// Limitador simple en memoria por IP. Suficiente para un solo contenedor;
// no sobrevive un reinicio ni se comparte entre réplicas, pero evita el
// abuso más obvio de endpoints que cuestan dinero (Groq) o escriben en disco.
export function createRateLimiter({ windowMs, max }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);
    timestamps.push(now);
    hits.set(ip, timestamps);

    if (timestamps.length > max) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    next();
  };
}
