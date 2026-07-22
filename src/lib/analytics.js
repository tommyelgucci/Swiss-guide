// Cuenta de páginas vistas, agregada y anónima: solo se envía la ruta
// actual, nunca un identificador de la persona ni de la sesión. Sin
// cookies, sin localStorage, sin seguimiento entre visitas — el servidor
// solo suma un contador por ruta y día (ver server/lib/analyticsStore.js).
export function pingPageview() {
  try {
    const payload = JSON.stringify({ path: location.pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/pageview', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // La analítica nunca debe romper la carga de la página.
  }
}
