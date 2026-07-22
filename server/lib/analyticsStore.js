import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'analytics-counts.json');

// Solo se guardan sumas por día y por ruta — nunca IP, user agent,
// cookies, ni ningún identificador de visitante. No hay forma de
// reconstruir visitas individuales a partir de estos datos.
let counts = null;
let dirty = false;

function load() {
  if (counts) return counts;
  try {
    counts = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    counts = {};
  }
  return counts;
}

export function recordPageview(pagePath) {
  const data = load();
  const day = new Date().toISOString().slice(0, 10);
  data[day] ??= {};
  data[day][pagePath] = (data[day][pagePath] || 0) + 1;
  dirty = true;
}

export function getCounts() {
  return load();
}

// Escribe a disco cada 10s si hubo cambios, en vez de en cada pageview,
// para no golpear el filesystem con cada visita.
const flushInterval = setInterval(() => {
  if (!dirty) return;
  dirty = false;
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(counts), 'utf8');
  } catch (err) {
    console.error('Failed to persist analytics counts', err);
  }
}, 10_000);
flushInterval.unref();
