import crypto from 'node:crypto';

const ADMIN_TOKEN = process.env.CONTACT_ADMIN_TOKEN;

// Comparación de tiempo constante para evitar un side-channel de timing.
// Un solo token protege /api/contact y /api/analytics — sin la variable
// de entorno configurada, ambos quedan desactivados (404).
export function adminTokenMatches(provided) {
  if (!ADMIN_TOKEN || typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(ADMIN_TOKEN);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
