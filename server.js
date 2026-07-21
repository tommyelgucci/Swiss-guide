import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cvAnalyzerRoutes from './server/routes/cv-analyzer.js';
import contactRoutes from './server/routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = process.env.PORT || 4321;

const app = express();

// SnapDeploy pone el contenedor detrás de un proxy — sin esto, req.ip
// siempre sería la IP del proxy y el rate limiting por IP no serviría.
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
  })
);

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/cv-analyzer', cvAnalyzerRoutes);
app.use('/api/contact', contactRoutes);

app.use(express.static(distDir));

// Astro genera dist/404.html en el build; express.static no lo sirve solo
// para rutas sin match, así que lo hacemos explícito aquí con status 404.
app.use((req, res) => {
  res.status(404).sendFile(path.join(distDir, '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`SwissGuide corriendo en el puerto ${port}`);
});
