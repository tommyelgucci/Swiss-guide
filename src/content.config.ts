import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Guías universales: mismo contenido temático, una versión por idioma.
// El "id" (antes "slug") debe coincidir entre idiomas (ej. lamal.md en
// es/, de/, en/...) para poder enlazar el selector de idioma a la
// página equivalente.
const guiasUniversales = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guias-universales' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    tema: z.enum(['tramites', 'trabajo', 'vivienda', 'impuestos', 'salud', 'vivir', 'educacion']),
    minutosLectura: z.number(),
    fechaActualizacion: z.date(),
    fuentesOficiales: z.array(z.string().url()).optional(),
  }),
});

// Guías específicas por nacionalidad. Igual que guias-universales, la carpeta
// es el idioma de interfaz (es/, en/...) y el id identifica la guía.
const porPais = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/por-pais' }),
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    // clave: separamos idioma de estatus migratorio, porque "inglés" mezcla
    // nacionalidades UE (irrelevante, casi nadie) y terceros países (US, UK, CA...)
    categoriaMigratoria: z.enum(['ue-efta', 'tercer-pais']),
    paisesCubiertos: z.array(z.string()),
    minutosLectura: z.number(),
    fechaActualizacion: z.date(),
    fuentesOficiales: z.array(z.string().url()).optional(),
  }),
});

export const collections = {
  'guias-universales': guiasUniversales,
  'por-pais': porPais,
};
