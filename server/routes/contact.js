import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'contact-submissions.jsonl');

const ADMIN_TOKEN = process.env.CONTACT_ADMIN_TOKEN;

const MAX_QUESTION_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 200;

// Limitador simple en memoria: máximo 5 envíos por IP cada 10 minutos.
const submissionsByIp = new Map();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (submissionsByIp.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  submissionsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

router.post('/', (req, res) => {
  const ip = req.ip || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many submissions, please try again later.' });
  }

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
  if (!ADMIN_TOKEN || req.query.token !== ADMIN_TOKEN) {
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
