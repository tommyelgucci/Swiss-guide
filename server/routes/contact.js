import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRateLimiter } from '../lib/rateLimit.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'contact-submissions.jsonl');

const ADMIN_TOKEN = process.env.CONTACT_ADMIN_TOKEN;

const MAX_QUESTION_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 200;

// Máximo 5 envíos por IP cada 10 minutos.
const contactRateLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 });

function tokenMatches(provided) {
  if (!ADMIN_TOKEN || typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(ADMIN_TOKEN);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

router.post('/', contactRateLimit, (req, res) => {
  const { question, email, lang, page } = req.body || {};

  if (typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ error: 'Question is too long.' });
  }
  if (email !== undefined && email !== null && email !== '') {
    if (typeof email !== 'string' || email.length > MAX_EMAIL_LENGTH || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email.' });
    }
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question: question.trim(),
    email: email ? email.trim() : null,
    lang: typeof lang === 'string' ? lang.slice(0, 5) : null,
    page: typeof page === 'string' ? page.slice(0, 200) : null,
    createdAt: new Date().toISOString(),
  };

  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(dataFile, JSON.stringify(entry) + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to persist contact submission', err);
    return res.status(500).json({ error: 'Could not save your message.' });
  }

  res.status(201).json({ ok: true });
});

// Panel mínimo de lectura, protegido por un token compartido (variable de
// entorno CONTACT_ADMIN_TOKEN). Sin token configurado, el endpoint está
// deshabilitado por completo — no expone nada por accidente.
router.get('/', (req, res) => {
  if (!tokenMatches(req.query.token)) {
    return res.status(404).end();
  }
  if (!fs.existsSync(dataFile)) {
    return res.json([]);
  }
  const lines = fs.readFileSync(dataFile, 'utf8').trim().split('\n').filter(Boolean);
  const entries = lines.map((l) => JSON.parse(l)).reverse();
  res.json(entries);
});

export default router;
