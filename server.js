import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = process.env.PORT || 4321;

const app = express();

// Rutas de API futuras van aquí, antes del estático (ej: app.use('/api', apiRouter))

app.use(express.static(distDir));

app.listen(port, () => {
  console.log(`SwissGuide corriendo en el puerto ${port}`);
});
