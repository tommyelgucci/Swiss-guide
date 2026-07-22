import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

type Entry = { lang: string; title: string; text: string; url: string; kind: string };

const TOOL_LANGS = ['en', 'de', 'it', 'fr'];
const ALL_LANGS = ['es', 'de', 'en', 'fr', 'it', 'pt'];

const TOOLS: Record<string, { cvBuilder: string; cvAnalyzer: string; checklist: string; taxCalc: string; porPais: string; legal: string }> = {
  es: { cvBuilder: 'Creador de CV suizo', cvAnalyzer: 'Analizador de CV', checklist: 'Checklist de ausencias', taxCalc: 'Calculadora de impuestos', porPais: 'Guías por país de origen', legal: 'Aviso legal y privacidad' },
  de: { cvBuilder: 'Lebenslauf-Ersteller', cvAnalyzer: 'Lebenslauf-Analyse', checklist: 'Checkliste für Abwesenheit', taxCalc: 'Steuerrechner', porPais: 'Länderspezifische Leitfäden', legal: 'Impressum und Datenschutz' },
  en: { cvBuilder: 'Swiss CV builder', cvAnalyzer: 'CV analyzer', checklist: 'Absence checklist', taxCalc: 'Tax calculator', porPais: 'Guides by country of origin', legal: 'Legal notice and privacy' },
  fr: { cvBuilder: 'Créateur de CV suisse', cvAnalyzer: 'Analyseur de CV', checklist: "Checklist d'absence", taxCalc: "Calculateur d'impôts", porPais: 'Guides par pays d\'origine', legal: 'Mentions légales et confidentialité' },
  it: { cvBuilder: 'Creatore di CV svizzero', cvAnalyzer: 'Analizzatore di CV', checklist: 'Checklist assenze', taxCalc: 'Calcolatore imposte', porPais: 'Guide per paese di origine', legal: 'Note legali e privacy' },
  pt: { cvBuilder: 'Criador de currículo suíço', cvAnalyzer: 'Analisador de currículo', checklist: 'Checklist de ausências', taxCalc: 'Calculadora de impostos', porPais: 'Guias por país de origem', legal: 'Aviso legal e privacidade' },
};

export const GET: APIRoute = async () => {
  const entries: Entry[] = [];

  const guides = await getCollection('guias-universales');
  for (const g of guides) {
    const [lang, slug] = g.id.split('/');
    entries.push({ lang, title: g.data.titulo, text: g.data.resumen, url: `/${lang}/guias/${slug}`, kind: 'guide' });
  }

  const countryGuides = await getCollection('por-pais');
  for (const g of countryGuides) {
    const [lang, slug] = g.id.split('/');
    entries.push({ lang, title: g.data.titulo, text: g.data.resumen, url: `/${lang}/por-pais/${slug}`, kind: 'guide' });
  }

  for (const lang of ALL_LANGS) {
    entries.push({ lang, title: TOOLS[lang].taxCalc, text: '', url: `/${lang}/tax-calculator`, kind: 'tool' });
    entries.push({ lang, title: TOOLS[lang].legal, text: '', url: `/${lang}/legal`, kind: 'page' });
    entries.push({ lang, title: TOOLS[lang].checklist, text: '', url: `/${lang}/checklist-ausencias`, kind: 'tool' });
  }
  for (const lang of ['es', 'en']) {
    entries.push({ lang, title: TOOLS[lang].porPais, text: '', url: `/${lang}/por-pais`, kind: 'page' });
  }
  for (const lang of TOOL_LANGS) {
    entries.push({ lang, title: TOOLS[lang].cvBuilder, text: '', url: `/${lang}/cv-builder`, kind: 'tool' });
    entries.push({ lang, title: TOOLS[lang].cvAnalyzer, text: '', url: `/${lang}/cv-analyzer`, kind: 'tool' });
  }

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
