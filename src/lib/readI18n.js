// Astro/Vite empaquetan como archivo externo cualquier <script> con un
// import real; los que no importan nada y son pequeños a veces quedan
// inline en el HTML (Astro 5+), lo que el CSP estricto bloquea. Este
// import trivial fuerza el empaquetado externo de forma confiable, sin
// depender de un umbral de tamaño que puede cambiar entre builds.
export function readI18n(id) {
  return JSON.parse(document.getElementById(id).textContent);
}
