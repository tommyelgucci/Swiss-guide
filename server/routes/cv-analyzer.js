import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { createRateLimiter } from '../lib/rateLimit.js';

const router = Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const MAX_TEXT_CHARS = 15000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// El análisis llama a una API de pago (Groq) por cada request — sin límite
// esto es un vector de abuso de costo. Máximo 10 análisis por IP cada hora.
const analyzeRateLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });

router.get('/status', (req, res) => {
  res.json({ enabled: Boolean(GROQ_API_KEY) });
});

async function extractText(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  if (
    file.mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return value;
  }
  return null;
}

const SYSTEM_PROMPTS = {
  en: `You are an expert Swiss recruiter and ATS (Applicant Tracking System) consultant. You review CVs submitted by people applying for jobs in Switzerland and give concrete, actionable feedback based on Swiss recruiting conventions: reverse chronological order, a photo is customary, an "Arbeitszeugnis"/certificate of employment is expected from Swiss employers, CVs are usually 1-2 pages, clear contact details, and a closing with place/date/signature.

Respond ONLY with a valid JSON object (no markdown, no text before or after) with this exact shape:
{"score": <integer 0-100>, "summary": "<2-3 sentence overall assessment in English>", "strengths": ["<short strength>", ...], "issues": [{"category": "<short category name>", "detail": "<what's wrong>", "suggestion": "<concrete fix>"}, ...]}

Rules:
- "score" reflects how ready the CV is for a Swiss ATS + recruiter (100 = excellent, 0 = very poor).
- 2 to 5 items in "strengths".
- 3 to 8 items in "issues", ordered from most to least important.
- Be specific to what's actually in the CV text provided, not generic advice.`,
  de: `Du bist ein erfahrener Schweizer Recruiter und ATS-Berater (Applicant Tracking System). Du prüfst Lebensläufe von Personen, die sich in der Schweiz bewerben, und gibst konkretes, umsetzbares Feedback nach Schweizer Rekrutierungskonventionen: umgekehrte chronologische Reihenfolge, ein Foto ist üblich, ein Arbeitszeugnis wird von Schweizer Arbeitgebern erwartet, Lebensläufe umfassen meist 1-2 Seiten, klare Kontaktdaten, und ein Abschluss mit Ort/Datum/Unterschrift.

Antworte AUSSCHLIESSLICH mit einem gültigen JSON-Objekt (kein Markdown, kein Text davor oder danach) in genau dieser Form:
{"score": <ganze Zahl 0-100>, "summary": "<Gesamtbewertung in 2-3 Sätzen, auf Deutsch>", "strengths": ["<kurze Stärke>", ...], "issues": [{"category": "<kurzer Kategoriename>", "detail": "<was ist falsch>", "suggestion": "<konkrete Lösung>"}, ...]}

Regeln:
- "score" spiegelt wider, wie bereit der Lebenslauf für ein Schweizer ATS + Recruiter ist (100 = ausgezeichnet, 0 = sehr mangelhaft).
- 2 bis 5 Elemente in "strengths".
- 3 bis 8 Elemente in "issues", nach Wichtigkeit geordnet.
- Beziehe dich konkret auf den bereitgestellten Lebenslauftext, keine generischen Ratschläge.`,
  it: `Sei un esperto recruiter svizzero e consulente ATS (Applicant Tracking System). Rivedi i CV di persone che cercano lavoro in Svizzera e dai un feedback concreto e attuabile secondo le convenzioni svizzere di reclutamento: ordine cronologico inverso, la foto è abituale, ci si aspetta la menzione dell'Arbeitszeugnis/certificato di lavoro dai datori di lavoro svizzeri, i CV occupano di solito 1-2 pagine, dati di contatto chiari, e una chiusura con luogo/data/firma.

Rispondi SOLO con un oggetto JSON valido (senza markdown, senza testo prima o dopo) con questa forma esatta:
{"score": <intero 0-100>, "summary": "<valutazione generale in 2-3 frasi, in italiano>", "strengths": ["<punto di forza breve>", ...], "issues": [{"category": "<nome breve della categoria>", "detail": "<cosa non va>", "suggestion": "<soluzione concreta>"}, ...]}

Regole:
- "score" riflette quanto il CV sia pronto per un ATS + recruiter svizzero (100 = eccellente, 0 = molto scarso).
- Da 2 a 5 elementi in "strengths".
- Da 3 a 8 elementi in "issues", ordinati dal più al meno importante.
- Sii specifico su ciò che è realmente presente nel testo del CV fornito, non dare consigli generici.`,
  fr: `Vous êtes un recruteur suisse expert et consultant ATS (Applicant Tracking System). Vous examinez les CV de personnes postulant à des emplois en Suisse et donnez un retour concret et actionnable selon les conventions suisses de recrutement : ordre chronologique inversé, une photo est habituelle, un certificat de travail (Arbeitszeugnis) est attendu des employeurs suisses, les CV comptent généralement 1-2 pages, des coordonnées claires, et une conclusion avec lieu/date/signature.

Répondez UNIQUEMENT avec un objet JSON valide (sans markdown, sans texte avant ou après) selon cette forme exacte :
{"score": <entier 0-100>, "summary": "<évaluation générale en 2-3 phrases, en français>", "strengths": ["<point fort bref>", ...], "issues": [{"category": "<nom de catégorie court>", "detail": "<ce qui ne va pas>", "suggestion": "<solution concrète>"}, ...]}

Règles :
- "score" reflète le degré de préparation du CV pour un ATS + recruteur suisse (100 = excellent, 0 = très insuffisant).
- 2 à 5 éléments dans "strengths".
- 3 à 8 éléments dans "issues", classés du plus au moins important.
- Soyez précis sur ce qui figure réellement dans le texte du CV fourni, pas de conseils génériques.`,
};

function systemPrompt(lang) {
  return SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;
}

function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function sanitizeResult(parsed) {
  if (!parsed || typeof parsed !== 'object') return null;
  const score = Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null;
  const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
    : [];
  const issues = Array.isArray(parsed.issues)
    ? parsed.issues
        .filter(
          (i) =>
            i &&
            typeof i.category === 'string' &&
            typeof i.detail === 'string' &&
            typeof i.suggestion === 'string',
        )
        .map((i) => ({
          category: i.category.trim(),
          detail: i.detail.trim(),
          suggestion: i.suggestion.trim(),
        }))
    : [];
  if (score === null || !summary || !issues.length) return null;
  return { score, summary, strengths, issues };
}

function handleUpload(req, res, next) {
  upload.single('cv')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res
        .status(413)
        .json({ error: 'File exceeds the 5 MB limit.' });
    }
    return res
      .status(400)
      .json({ error: 'Could not process the uploaded file.' });
  });
}

router.post('/analyze', analyzeRateLimit, handleUpload, async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(503).json({ error: 'AI not configured on the server (missing GROQ_API_KEY)' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Missing CV file (field "cv")' });
  }
  const ALLOWED_LANGS = ['en', 'de', 'it', 'fr'];
  const lang = ALLOWED_LANGS.includes(req.body?.lang) ? req.body.lang : 'en';

  let text;
  try {
    text = await extractText(req.file);
  } catch {
    return res.status(422).json({ error: 'Could not read the file. Check that it is not corrupted or password-protected.' });
  }
  if (!text || !text.trim()) {
    return res
      .status(422)
      .json({ error: 'Unsupported format. Upload a PDF or DOCX with selectable text (not a scan).' });
  }

  const cleanText = text.trim().slice(0, MAX_TEXT_CHARS);

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt(lang) },
          { role: 'user', content: cleanText },
        ],
        max_tokens: 1800,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text().catch(() => '');
      console.error(`Groq error (${groqRes.status}): ${errText || groqRes.statusText}`);
      return res
        .status(502)
        .json({ error: 'The AI service is temporarily unavailable. Please try again in a moment.' });
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ error: 'Respuesta de Groq sin contenido de texto' });
    }

    const result = sanitizeResult(extractJSON(content));
    if (!result) {
      return res.status(502).json({ error: 'The AI did not return a validly formatted analysis. Please try again.' });
    }
    res.json(result);
  } catch (err) {
    console.error('CV analysis failed', err);
    res.status(500).json({ error: 'Something went wrong while analyzing your CV. Please try again.' });
  }
});

export default router;
