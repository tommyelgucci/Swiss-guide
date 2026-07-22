// Pequeño helper compartido por los botones "toggle" del header (menú
// hamburguesa, tema claro/oscuro): conecta un botón a una función que
// decide el siguiente estado y sincroniza aria-expanded automáticamente.
// El import real también evita que Astro/Vite inline estos scripts tan
// pequeños en el HTML — algo que rompería con la CSP estricta del sitio.
export function wireToggle(buttonId, onToggle) {
  const btn = document.getElementById(buttonId);
  btn.addEventListener('click', () => {
    const isOpen = onToggle();
    btn.setAttribute('aria-expanded', String(isOpen));
  });
  return btn;
}
