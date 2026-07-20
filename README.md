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

## Herramientas

Además de las guías, `src/pages/[lang]/cv-builder.astro` es una herramienta
interactiva (formulario + preview en vivo + export a PDF vía impresión del
navegador) para crear un CV en formato suizo. Solo disponible en ES/EN por
ahora (mucho texto de interfaz que traducir). Todo el estado se guarda en
`localStorage`, no hay backend involucrado — el PDF se genera con CSS de
impresión (`@media print`), sin librerías extra.

`src/pages/[lang]/cv-analyzer.astro` + `server/routes/cv-analyzer.js` son el
analizador de CV tipo ATS: subes un PDF/DOCX, el backend extrae el texto
(`pdf-parse`/`mammoth`) y se lo pasa a Groq (mismo patrón que el backend de
Aloenglish: `GET /status` para saber si la IA está configurada, `GROQ_API_KEY`
+ `GROQ_MODEL` como env vars, `response_format: json_object` + parseo con
fallback). Devuelve puntuación, valoración general, puntos fuertes y una
lista de mejoras concretas según convenciones suizas de reclutamiento.

## Próximos pasos sugeridos

- [ ] Traducir lamal.md a de/fr/it/pt (falta contenido, solo está la estructura)
- [ ] Decidir diseño visual (puedo ayudarte con esto usando la skill de
      frontend-design cuando quieras)
- [ ] Página de índice por tema (trámites, vivienda, impuestos...) en vez de
      lista plana
- [ ] Selector "¿de qué país eres?" en el onboarding para mostrar el módulo
      por-pais correcto
- [ ] Búsqueda (Pagefind funciona bien con sitios Astro estáticos y es gratis)

## Servir el build en producción

Astro genera el sitio como HTML estático en `dist/`. `server.js` es un
servidor Express mínimo que sirve ese `dist/` — se usa en vez de un hosting
puramente estático porque el sitio puede dejar de ser 100% estático más
adelante (búsqueda con backend, formularios, auth, etc.): las rutas nuevas
se añaden en `server.js` antes del `express.static`, sin cambiar de
plataforma de deploy.

```bash
npm run build   # genera dist/
npm run serve   # sirve dist/ con Express en $PORT (default 4321)
```

## Deploy en SnapDeploy

1. Conectar el repo/rama en el dashboard de SnapDeploy.
2. **Root Directory**: raíz del repo (no es un monorepo, a diferencia de
   Aloenglish/BrainBit) — `Dockerfile Path` y `Build Context` se quedan en
   su valor por default (`Dockerfile` y `.`).
3. `PORT` y `GROQ_MODEL` se auto-detectan del `.env.example` en la raíz.
   `GROQ_API_KEY` se agrega **a mano** con "+ Add Custom Variable" en el
   dashboard (no está en el `.env.example` a propósito, para que no quede
   en un campo de auto-detección en texto plano). Clave en
   https://console.groq.com/keys. Sin esta variable, el analizador de CV
   sigue online pero deshabilitado con un aviso — el resto del sitio
   funciona igual.
