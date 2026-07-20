# SwissGuide (nombre provisional)

Prototipo base en Astro para una guía multilingüe (ES/DE/EN/FR/IT/PT) sobre
vivir y trabajar en Suiza, dirigida a cualquier extranjero, con contenido
universal + módulos específicos por nacionalidad.

## Cómo arrancarlo (necesitas Node.js 18+)

```bash
cd swissguide
npm install
npm run dev
```

Abre http://localhost:4321/es/ — deberías ver la guía de LAMal listada.
Cambia a http://localhost:4321/en/ y verás la misma guía traducida.

## Estructura

```
src/
  content/
    config.ts                 # esquema tipado de las colecciones
    guias-universales/
      es/lamal.md              # mismo slug (lamal.md) en cada idioma
      en/lamal.md               # así el selector de idioma enlaza bien
      de/ fr/ it/ pt/            # (vacíos todavía, mismo patrón)
    por-pais/
      es-ES/permisos.md          # contenido específico para España (UE/EFTA)
      de-DE/ fr-FR/ it-IT/ pt-PT/ # (vacíos todavía)
      en-third/                   # terceros países que usan inglés (US, UK, CA...)
  pages/
    index.astro                 # redirige a /es/
    [lang]/index.astro          # portada por idioma (genera las 6 automáticamente)
    [lang]/guias/[slug].astro   # página de cada guía (genera todas automáticamente)
  layouts/Layout.astro
  components/LanguageSwitcher.astro
```

## Cómo añadir una guía nueva

1. Escribe el .md en `content/guias-universales/es/tu-slug.md` con el
   frontmatter que pide `config.ts`.
2. Traduce el mismo archivo a los otros 5 idiomas, **usando el mismo nombre
   de archivo** (tu-slug.md) en cada carpeta de idioma — así el selector de
   idioma sabe a qué página saltar.
3. Astro genera las rutas automáticamente, no hay que tocar código.

## Próximos pasos sugeridos

- [ ] Traducir lamal.md a de/fr/it/pt (falta contenido, solo está la estructura)
- [ ] Decidir diseño visual (puedo ayudarte con esto usando la skill de
      frontend-design cuando quieras)
- [ ] Página de índice por tema (trámites, vivienda, impuestos...) en vez de
      lista plana
- [ ] Selector "¿de qué país eres?" en el onboarding para mostrar el módulo
      por-pais correcto
- [ ] Subir a GitHub y conectar con Vercel/Netlify para despliegue automático
- [ ] Búsqueda (Pagefind funciona bien con sitios Astro estáticos y es gratis)

## Despliegue

Cuando esté en GitHub:
1. Ve a vercel.com (o netlify.com) → "Import Project" → conecta tu repo.
2. Detecta Astro automáticamente, no necesitas configurar nada.
3. Cada push a `main` despliega solo — mismo flujo que ya usas con CogniLab,
   pero sin lidiar con tokens de Hugging Face.
