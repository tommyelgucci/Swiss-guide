import { defineConfig } from 'astro/config';

// Documentación i18n: https://docs.astro.build/en/guides/internationalization/
export default defineConfig({
  site: 'https://firststeps-in-ch.containers.snapdeploy.app', // cámbialo cuando compres el dominio propio
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'de', 'en', 'fr', 'it', 'pt'],
    routing: {
      prefixDefaultLocale: true, // fuerza /es/ también para el idioma por defecto (más claro para SEO)
    },
  },
  // El sitemap se genera con un endpoint propio en src/pages/sitemap.xml.ts
  // — @astrojs/sitemap (paquete oficial) no es compatible con esta versión
  // de Astro (crashea el build), así que evitamos esa dependencia.
});
