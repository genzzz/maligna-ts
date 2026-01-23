import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import {
  Alignment,
  PlaintextParser,
  SentenceSplitAlgorithm,
  ParagraphSplitAlgorithm,
  TrimCleanAlgorithm,
  LowercaseCleanAlgorithm,
  NormalizeWhitespaceCleanAlgorithm,
  Modifier,
  PoissonMacro,
  MooreMacro,
  OneToOneSelector,
  FractionSelector,
  PlaintextFormatter,
  HtmlFormatter,
  TmxFormatter,
  AlFormatter,
} from 'maligna';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.txt': 'text/plain',
};

// Path to examples directory
const EXAMPLES_DIR = join(__dirname, '..', '..', 'examples', 'txt');
const PUBLIC_DIR = join(__dirname, '..', 'public');

/**
 * Available example file pairs
 */
const EXAMPLE_PAIRS = [
  { name: 'GPL License (EN-PL)', source: 'gpl-en.txt', target: 'gpl-pl.txt' },
  { name: 'Help (EN-PL)', source: 'help-en.txt', target: 'help-pl.txt' },
  { name: 'Poznan (DE-PL)', source: 'poznan-de.txt', target: 'poznan-pl.txt' },
  { name: 'Poznan Small (DE-PL)', source: 'poznan-small-de.txt', target: 'poznan-small-pl.txt' },
  { name: 'Stallman Ch1 (EN-PL)', source: 'stallman-ch1-en.txt', target: 'stallman-ch1-pl.txt' },
  {name: 'Express (EN-FR)', source: 'express-en.txt', target: 'express-fr.txt' },
];

interface AlignmentRequest {
  sourceText?: string;
  targetText?: string;
  examplePair?: string;
  splitMethod: 'sentence' | 'paragraph';
  alignMethod: 'poisson' | 'moore';
  outputFormat: 'html' | 'txt' | 'tmx' | 'al' | 'json';
  selectOneToOne: boolean;
  fractionThreshold?: number;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  stats?: {
    totalAlignments: number;
    oneToOneCount: number;
    processingTimeMs: number;
  };
}

/**
 * Parse JSON body from request
 */
async function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Send JSON response
 */
function sendJson(res: ServerResponse, data: ApiResponse, statusCode = 200): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Send static file
 */
async function sendStaticFile(res: ServerResponse, filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

/**
 * Load example files
 */
async function loadExamplePair(pairName: string): Promise<{ source: string; target: string }> {
  const pair = EXAMPLE_PAIRS.find(p => p.name === pairName);
  if (!pair) {
    throw new Error(`Example pair not found: ${pairName}`);
  }
  
  const [source, target] = await Promise.all([
    fs.readFile(join(EXAMPLES_DIR, pair.source), 'utf-8'),
    fs.readFile(join(EXAMPLES_DIR, pair.target), 'utf-8'),
  ]);
  
  return { source, target };
}

/**
 * Perform alignment with given options
 */
async function performAlignment(options: AlignmentRequest): Promise<{
  alignments: Alignment[];
  formattedOutput: string;
  stats: { totalAlignments: number; oneToOneCount: number };
}> {
  let sourceText: string;
  let targetText: string;

  // Get text from example or custom input
  if (options.examplePair) {
    const pair = await loadExamplePair(options.examplePair);
    sourceText = pair.source;
    targetText = pair.target;
  } else if (options.sourceText && options.targetText) {
    sourceText = options.sourceText;
    targetText = options.targetText;
  } else {
    throw new Error('Either examplePair or sourceText/targetText must be provided');
  }

  // Parse input texts
  const parser = new PlaintextParser(sourceText, targetText);
  let alignments = parser.parse();

  // Split into segments
  const splitAlgorithm = options.splitMethod === 'paragraph'
    ? new ParagraphSplitAlgorithm()
    : new SentenceSplitAlgorithm();
  const splitter = new Modifier(splitAlgorithm);
  alignments = splitter.apply(alignments);

  // Clean/normalize text
  const trimmer = new Modifier(new TrimCleanAlgorithm());
  alignments = trimmer.apply(alignments);

  const normalizer = new Modifier(new NormalizeWhitespaceCleanAlgorithm());
  alignments = normalizer.apply(alignments);

  // Perform alignment
  const aligner = options.alignMethod === 'moore'
    ? new MooreMacro()
    : new PoissonMacro();
  alignments = aligner.apply(alignments);

  // Store total count before filtering
  const totalAlignments = alignments.length;

  // Apply selection filters
  if (options.selectOneToOne) {
    const oneToOneSelector = new OneToOneSelector();
    alignments = oneToOneSelector.apply(alignments);
  }

  if (options.fractionThreshold !== undefined && options.fractionThreshold > 0) {
    const fractionSelector = new FractionSelector(options.fractionThreshold);
    alignments = fractionSelector.apply(alignments);
  }

  // Count 1-1 alignments
  const oneToOneCount = alignments.filter(
    a => a.getSourceSegmentList().length === 1 && a.getTargetSegmentList().length === 1
  ).length;

  // Format output
  let formattedOutput: string;
  switch (options.outputFormat) {
    case 'html':
      formattedOutput = new HtmlFormatter().format(alignments);
      break;
    case 'tmx':
      formattedOutput = new TmxFormatter('en', 'pl').format(alignments);
      break;
    case 'al':
      formattedOutput = new AlFormatter().format(alignments);
      break;
    case 'json':
      formattedOutput = JSON.stringify(
        alignments.map(a => ({
          source: a.getSourceSegmentList(),
          target: a.getTargetSegmentList(),
          category: a.getCategory().toString(),
          score: a.score,
        })),
        null,
        2
      );
      break;
    case 'txt':
    default:
      formattedOutput = new PlaintextFormatter().format(alignments);
      break;
  }

  return {
    alignments,
    formattedOutput,
    stats: { totalAlignments, oneToOneCount },
  };
}

/**
 * Handle API routes
 */
async function handleApi(req: IncomingMessage, res: ServerResponse, pathname: string): Promise<void> {
  // CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // GET /api/examples - List available example pairs
    if (pathname === '/api/examples' && req.method === 'GET') {
      sendJson(res, {
        success: true,
        data: EXAMPLE_PAIRS.map(p => ({ name: p.name, source: p.source, target: p.target })),
      });
      return;
    }

    // GET /api/example/:name - Get content of specific example
    if (pathname.startsWith('/api/example/') && req.method === 'GET') {
      const pairName = decodeURIComponent(pathname.replace('/api/example/', ''));
      const pair = await loadExamplePair(pairName);
      sendJson(res, { success: true, data: pair });
      return;
    }

    // POST /api/align - Perform alignment
    if (pathname === '/api/align' && req.method === 'POST') {
      const startTime = Date.now();
      const body = await parseBody(req);
      const options: AlignmentRequest = JSON.parse(body);

      const result = await performAlignment(options);
      const processingTimeMs = Date.now() - startTime;

      sendJson(res, {
        success: true,
        data: {
          output: result.formattedOutput,
          format: options.outputFormat,
        },
        stats: {
          ...result.stats,
          processingTimeMs,
        },
      });
      return;
    }

    // 404 for unknown API routes
    sendJson(res, { success: false, error: 'Not Found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    sendJson(res, { success: false, error: message }, 500);
  }
}

/**
 * Main request handler
 */
async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // API routes
  if (pathname.startsWith('/api/')) {
    await handleApi(req, res, pathname);
    return;
  }

  // Static files
  if (pathname === '/' || pathname === '/index.html') {
    await sendStaticFile(res, join(PUBLIC_DIR, 'index.html'));
    return;
  }

  // Other static files
  const staticPath = join(PUBLIC_DIR, pathname);
  await sendStaticFile(res, staticPath);
}

// Create and start server
const server = createServer((req, res) => {
  handleRequest(req, res).catch(error => {
    console.error('Request error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  });
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔧 mALIGNa Test Server                                 ║
║                                                          ║
║   Server running at http://localhost:${PORT}               ║
║                                                          ║
║   API Endpoints:                                         ║
║   • GET  /api/examples     - List example pairs          ║
║   • GET  /api/example/:name - Get example content        ║
║   • POST /api/align        - Perform alignment           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
