import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

const router = Router();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const MAX_TEXT_CHARS = 15000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

function systemPrompt(lang) {
  if (lang === 'en') {
    return `You are an expert Swiss recruiter and ATS (Applicant Tracking System) consultant. You review CVs submitted by people applying for jobs in Switzerland and give concrete, actionable feedback based on Swiss recruiting conventions: reverse chronological order, a photo is customary, an "Arbeitszeugnis"/certificate of employment is expected from Swiss employers, CVs are usually 1-2 pages, clear contact details, and a closing with place/date/signature.

Respond ONLY with a valid JSON object (no markdown, no text before or after) with this exact shape:
{"score": <integer 0-100>, "summary": "<2-3 sentence overall assessment in English>", "strengths": ["<short strength>", ...], "issues": [{"category": "<short category name>", "detail": "<what's wrong>", "suggestion": "<concrete fix>"}, ...]}

Rules:
- "score" reflects how ready the CV is for a Swiss ATS + recruiter (100 = excellent, 0 = very poor).
- 2 to 5 items in "strengths".
- 3 to 8 items in "issues", ordered from most to least important.
- Be specific to what's actually in the CV text provided, not generic advice.`;
  }
  return `Eres un reclutador suizo experto y consultor de ATS (Applicant Tracking System). Revisas CVs de personas que buscan trabajo en Suiza y das feedback concreto y accionable según las convenciones suizas de reclutamiento: orden cronológico inverso, foto habitual, se espera mención de "Arbeitszeugnis"/certificado de trabajo de empleadores suizos, el CV suele ocupar 1-2 páginas, datos de contacto claros, y cierre con lugar/fecha/firma.

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto antes ni después) con esta forma exacta:
{"score": <entero 0-100>, "summary": "<valoración general en 2-3 frases, en español>", "strengths": ["<punto fuerte breve>", ...], "issues": [{"category": "<nombre corto de categoría>", "detail": "<qué está mal>", "suggestion": "<solución concreta>"}, ...]}

Reglas:
- "score" refleja qué tan preparado está el CV para un ATS + reclutador suizo (100 = excelente, 0 = muy deficiente).
- Entre 2 y 5 elementos en "strengths".
- Entre 3 y 8 elementos en "issues", ordenados de más a menos importante.
- Sé específico sobre lo que realmente hay en el texto del CV proporcionado, no des consejos genéricos.`;
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

router.post('/analyze', upload.single('cv'), async (req, res) => {
  if (!GROQ_API_KEY) {
    return res.status(503).json({ error: 'IA no configurada en el servidor (falta GROQ_API_KEY)' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Falta el archivo del CV (campo "cv")' });
  }
  const lang = req.body?.lang === 'en' ? 'en' : 'es';

  let text;
  try {
    text = await extractText(req.file);
  } catch {
    return res.status(422).json({ error: 'No se pudo leer el archivo. Comprueba que no esté dañado o protegido.' });
  }
  if (!text || !text.trim()) {
    return res
      .status(422)
      .json({ error: 'Formato no soportado. Sube un PDF o un DOCX con texto seleccionable (no un escaneo).' });
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
      return res
        .status(502)
        .json({ error: `Groq error (${groqRes.status}): ${errText || groqRes.statusText}` });
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      return res.status(502).json({ error: 'Respuesta de Groq sin contenido de texto' });
    }

    const result = sanitizeResult(extractJSON(content));
    if (!result) {
      return res.status(502).json({ error: 'La IA no devolvió un análisis con formato válido. Intenta de nuevo.' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Error desconocido' });
  }
});

export default router;
