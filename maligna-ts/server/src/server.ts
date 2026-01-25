import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { AlignmentService } from './services/AlignmentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Initialize alignment service
const alignmentService = new AlignmentService();

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function sendJson(res: http.ServerResponse, statusCode: number, data: unknown): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res: http.ServerResponse, statusCode: number, message: string): void {
  sendJson(res, statusCode, { error: message });
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // GET /api/examples - List available example files
    if (pathname === '/api/examples' && req.method === 'GET') {
      const examples = alignmentService.getExamplePairs();
      sendJson(res, 200, { examples });
      return;
    }

    // GET /api/examples/:name - Get example file content
    if (pathname.startsWith('/api/examples/') && req.method === 'GET') {
      const name = pathname.slice('/api/examples/'.length);
      const content = alignmentService.getExampleContent(name);
      if (content) {
        sendJson(res, 200, content);
      } else {
        sendError(res, 404, `Example '${name}' not found`);
      }
      return;
    }

    // GET /api/algorithms - List available alignment algorithms
    if (pathname === '/api/algorithms' && req.method === 'GET') {
      sendJson(res, 200, {
        algorithms: [
          { id: 'galechurch', name: 'Gale & Church', description: 'Classic sentence-length based alignment' },
          { id: 'poisson', name: 'Poisson', description: 'Poisson distribution based alignment' },
          { id: 'moore', name: 'Moore', description: 'Moore algorithm for sentence alignment' }
        ],
        formats: [
          { id: 'al', name: 'AL Format', description: 'Internal alignment format' },
          { id: 'presentation', name: 'Presentation', description: 'Human-readable side-by-side format' },
          { id: 'tmx', name: 'TMX', description: 'Translation Memory eXchange format' },
          { id: 'info', name: 'Info', description: 'Summary information about alignments' }
        ]
      });
      return;
    }

    // POST /api/align - Perform alignment
    if (pathname === '/api/align' && req.method === 'POST') {
      const body = await readBody(req);
      const params = JSON.parse(body) as {
        sourceText: string;
        targetText: string;
        algorithm?: string;
        format?: string;
        sourceLanguage?: string;
        targetLanguage?: string;
      };

      if (!params.sourceText || !params.targetText) {
        sendError(res, 400, 'sourceText and targetText are required');
        return;
      }

      const result = alignmentService.align({
        sourceText: params.sourceText,
        targetText: params.targetText,
        algorithm: params.algorithm || 'moore',
        format: params.format || 'presentation',
        sourceLanguage: params.sourceLanguage || 'en',
        targetLanguage: params.targetLanguage || 'pl',
      });

      sendJson(res, 200, result);
      return;
    }

    // POST /api/parse - Parse text files
    if (pathname === '/api/parse' && req.method === 'POST') {
      const body = await readBody(req);
      const params = JSON.parse(body) as {
        sourceText: string;
        targetText: string;
        splitAlgorithm?: string;
      };

      if (!params.sourceText || !params.targetText) {
        sendError(res, 400, 'sourceText and targetText are required');
        return;
      }

      const result = alignmentService.parse({
        sourceText: params.sourceText,
        targetText: params.targetText,
        splitAlgorithm: params.splitAlgorithm || 'sentence',
      });

      sendJson(res, 200, result);
      return;
    }

    // GET /api/health - Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
      return;
    }

    sendError(res, 404, 'API endpoint not found');
  } catch (error) {
    console.error('API error:', error);
    sendError(res, 500, error instanceof Error ? error.message : 'Internal server error');
  }
}

function serveStaticFile(res: http.ServerResponse, filePath: string): void {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`${new Date().toISOString()} ${req.method} ${pathname}`);

  // API routes
  if (pathname.startsWith('/api/')) {
    await handleApiRequest(req, res, pathname);
    return;
  }

  // Static files
  const publicDir = path.join(__dirname, '..', 'public');
  
  if (pathname === '/' || pathname === '/index.html') {
    serveStaticFile(res, path.join(publicDir, 'index.html'));
    return;
  }

  // Serve other static files
  const staticPath = path.join(publicDir, pathname);
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    serveStaticFile(res, staticPath);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                   mALIGNa-TS Test Server                        ║
╠══════════════════════════════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}                        ║
║                                                                  ║
║  API Endpoints:                                                  ║
║    GET  /api/health          - Health check                      ║
║    GET  /api/algorithms      - List alignment algorithms         ║
║    GET  /api/examples        - List example file pairs           ║
║    GET  /api/examples/:name  - Get example content               ║
║    POST /api/align           - Perform sentence alignment        ║
║    POST /api/parse           - Parse and split text              ║
║                                                                  ║
║  Web UI: http://localhost:${PORT}                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);
});
