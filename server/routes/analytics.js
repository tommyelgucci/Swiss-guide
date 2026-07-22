import { Router } from 'express';
import { recordPageview, getCounts } from '../lib/analyticsStore.js';
import { createRateLimiter } from '../lib/rateLimit.js';
import { adminTokenMatches } from '../lib/adminAuth.js';

const router = Router();

// Generoso a propósito: es tráfico normal de navegación, no un formulario.
const pageviewRateLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 300 });

router.post('/pageview', pageviewRateLimit, (req, res) => {
  const { path: pagePath } = req.body || {};
  if (typeof pagePath !== 'string' || !pagePath.startsWith('/') || pagePath.length > 200) {
    return res.status(400).end();
  }
  recordPageview(pagePath);
  res.status(204).end();
});

// Mismo token compartido que /api/contact. Sin CONTACT_ADMIN_TOKEN
// configurado, este endpoint está desactivado por completo.
router.get('/', (req, res) => {
  if (!adminTokenMatches(req.query.token)) {
    return res.status(404).end();
  }
  res.json(getCounts());
});

export default router;
