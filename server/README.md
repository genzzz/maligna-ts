# mALIGNa Test Server

A simple HTTP server for testing the mALIGNa sentence alignment library.

## Features

- **Web UI** for interactive testing at `http://localhost:3000`
- **REST API** endpoints for programmatic access
- **Pre-loaded examples** from the examples directory
- **Multiple output formats**: HTML, JSON, TMX, AL, Plain Text
- **Alignment algorithms**: Poisson (length-based) and Moore (content-based)

## Quick Start

1. **Build the main library first** (from the project root):
   ```bash
   npm install
   npm run build
   ```

2. **Install and start the server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Open your browser** to `http://localhost:3000`

## API Endpoints

### GET /api/examples

List available example file pairs.

**Response:**
```json
{
  "success": true,
  "data": [
    { "name": "GPL License (EN-PL)", "source": "gpl-en.txt", "target": "gpl-pl.txt" },
    ...
  ]
}
```

### GET /api/example/:name

Get the content of a specific example pair.

**Response:**
```json
{
  "success": true,
  "data": {
    "source": "...",
    "target": "..."
  }
}
```

### POST /api/align

Perform sentence alignment on provided texts.

**Request Body:**
```json
{
  "examplePair": "GPL License (EN-PL)",  // OR provide sourceText/targetText
  "sourceText": "...",                    // Custom source text
  "targetText": "...",                    // Custom target text
  "splitMethod": "sentence",              // "sentence" or "paragraph"
  "alignMethod": "poisson",               // "poisson" or "moore"
  "outputFormat": "html",                 // "html", "json", "txt", "al", "tmx"
  "selectOneToOne": false,                // Filter to 1-1 alignments only
  "fractionThreshold": 0.85               // Optional: filter by score fraction
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": "...",
    "format": "html"
  },
  "stats": {
    "totalAlignments": 150,
    "oneToOneCount": 120,
    "processingTimeMs": 523
  }
}
```

## Development

```bash
# Build TypeScript
npm run build

# Start server
npm start

# Build and start
npm run dev
```

## Example cURL Commands

```bash
# List examples
curl http://localhost:3000/api/examples

# Get example content
curl http://localhost:3000/api/example/GPL%20License%20(EN-PL)

# Align using example
curl -X POST http://localhost:3000/api/align \
  -H "Content-Type: application/json" \
  -d '{
    "examplePair": "Poznan Small (DE-PL)",
    "splitMethod": "sentence",
    "alignMethod": "poisson",
    "outputFormat": "json",
    "selectOneToOne": true
  }'

# Align custom text
curl -X POST http://localhost:3000/api/align \
  -H "Content-Type: application/json" \
  -d '{
    "sourceText": "Hello world. How are you?",
    "targetText": "Hallo Welt. Wie geht es Ihnen?",
    "splitMethod": "sentence",
    "alignMethod": "poisson",
    "outputFormat": "json"
  }'
```
