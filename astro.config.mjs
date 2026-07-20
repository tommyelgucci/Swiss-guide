import { defineConfig } from 'astro/config';

// Documentación i18n: https://docs.astro.build/en/guides/internationalization/
export default defineConfig({
  site: 'https://tudominio.ch', // cámbialo cuando compres el dominio
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'de', 'en', 'fr', 'it', 'pt'],
    routing: {
      prefixDefaultLocale: true, // fuerza /es/ también para el idioma por defecto (más claro para SEO)
    },
  },
});
