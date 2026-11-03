import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client utility if key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Tab Classification Endpoint
app.post('/api/classify-tab', async (req, res) => {
  try {
    const { url, title, categories } = req.body;
    if (!url && !title) {
      return res.status(400).json({ error: 'URL or title is required' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API not configured on server',
        fallback: true,
      });
    }

    const categoryList =
      Array.isArray(categories) && categories.length > 0
        ? categories.map((c: any) => c.name || c).join(', ')
        : 'AI & Productivity, Development, Design & Creativity, Communication, Entertainment, Shopping, Research, Education, Finance, Social Media';

    const prompt = `Analyze this browser tab:
URL: ${url || 'Unknown'}
Title: ${title || 'Unknown'}

Allowed categories: [${categoryList}]

Categorize this tab into the single most fitting category from the allowed categories list.
Return strictly valid JSON:
{
  "categoryName": "Exact matching category name from allowed list",
  "confidence": 0.95,
  "reason": "Brief rationale"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('AI Tab Classification Error:', error);
    return res.status(500).json({ error: error.message || 'Classification failed' });
  }
});

// Live Weather Proxy with Open-Meteo
app.get('/api/weather', async (req, res) => {
  const { lat = '37.7749', lon = '-122.4194' } = req.query;
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`
    );
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();
    return res.json(data);
  } catch {
    return res.json({
      current: {
        temperature_2m: 21,
        relative_humidity_2m: 55,
        weather_code: 1,
        wind_speed_10m: 12,
      },
    });
  }
});

// Download Standalone Chrome Extension ZIP package with complete bundled client
app.get('/api/download-extension-zip', async (_req, res) => {
  try {
    const JSZip = (await import('jszip')).default;
    const fs = await import('fs');
    const zip = new JSZip();
    const distPath = path.resolve(__dirname, 'dist');

    if (!fs.existsSync(distPath)) {
      return res.status(404).json({ error: 'Extension not compiled yet. Run npm run build first.' });
    }

    function addDirToZip(dirPath: string, zipFolder: any) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const sub = zipFolder.folder(entry.name);
          if (sub) addDirToZip(fullPath, sub);
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, content);
        }
      }
    }

    addDirToZip(distPath, zip);

    const readmePath = path.resolve(__dirname, 'README.md');
    if (fs.existsSync(readmePath)) {
      zip.file('README.md', fs.readFileSync(readmePath, 'utf8'));
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="chromeos-extension.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Failed to create extension zip:', err);
    return res.status(500).json({ error: 'Failed to build extension zip package' });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChromeOS Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
