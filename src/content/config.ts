import { defineCollection, z } from 'astro:content';

// Guías universales: mismo contenido temático, una versión por idioma.
// El "slug" debe coincidir entre idiomas (ej. lamal.md en es/, de/, en/...)
// para poder enlazar el selector de idioma a la página equivalente.
const guiasUniversales = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    tema: z.enum(['tramites', 'trabajo', 'vivienda', 'impuestos', 'salud', 'vivir']),
    minutosLectura: z.number(),
    fechaActualizacion: z.date(),
    fuentesOficiales: z.array(z.string().url()).optional(),
  }),
});

// Guías específicas por nacionalidad. Cada carpeta (es-ES, de-DE, en-third, etc.)
// representa un país o grupo migratorio, no un idioma de interfaz.
const porPais = defineCollection({
  type: 'content',
  schema: z.object({
    titulo: z.string(),
    resumen: z.string(),
    // clave: separamos idioma de estatus migratorio, porque "inglés" mezcla
    // nacionalidades UE (irrelevante, casi nadie) y terceros países (US, UK, CA...)
    categoriaMigratoria: z.enum(['ue-efta', 'tercer-pais']),
    paisesCubiertos: z.array(z.string()),
    minutosLectura: z.number(),
    fechaActualizacion: z.date(),
  }),
});

export const collections = {
  'guias-universales': guiasUniversales,
  'por-pais': porPais,
};
