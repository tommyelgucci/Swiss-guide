import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://firststeps-in-ch.containers.snapdeploy.app';
const ALL_LANGS = ['es', 'de', 'en', 'fr', 'it', 'pt'];
const TOOL_LANGS = ['en', 'de', 'it', 'fr'];

export const GET: APIRoute = async () => {
  const urls: string[] = [`${SITE}/`];

  for (const lang of ALL_LANGS) {
    urls.push(`${SITE}/${lang}/`);
    urls.push(`${SITE}/${lang}/legal/`);
  }

  for (const lang of TOOL_LANGS) {
    urls.push(`${SITE}/${lang}/cv-builder/`);
    urls.push(`${SITE}/${lang}/cv-analyzer/`);
    urls.push(`${SITE}/${lang}/checklist-ausencias/`);
  }

  const guides = await getCollection('guias-universales');
  for (const guide of guides) {
    const [lang, slug] = guide.slug.split('/');
    urls.push(`${SITE}/${lang}/guias/${slug}/`);
  }

  const countryGuides = await getCollection('por-pais');
  for (const lang of ['es', 'en']) {
    urls.push(`${SITE}/${lang}/por-pais/`);
  }
  for (const guide of countryGuides) {
    const [lang, slug] = guide.slug.split('/');
    urls.push(`${SITE}/${lang}/por-pais/${slug}/`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
