# mALIGNa-TS Test Server

HTTP server for testing the mALIGNa-TS sentence alignment library.

## Quick Start

```bash
# Build the main library first (from maligna-ts directory)
cd ..
npm install
npm run build

# Then build and run the server
cd server
npm install
npm run build
npm start
```

Open http://localhost:3000 in your browser.

## API Endpoints

### Health Check
```
GET /api/health
```

### List Algorithms
```
GET /api/algorithms
```

### List Examples
```
GET /api/examples
```

### Get Example Content
```
GET /api/examples/:name
```

### Perform Alignment
```
POST /api/align
Content-Type: application/json

{
  "sourceText": "Hello world.",
  "targetText": "Witaj świecie.",
  "algorithm": "moore",     // galechurch, poisson, moore
  "format": "presentation", // al, presentation, tmx, info
  "sourceLanguage": "en",
  "targetLanguage": "pl"
}
```

### Parse Text (Split into Segments)
```
POST /api/parse
Content-Type: application/json

{
  "sourceText": "Hello. World.",
  "targetText": "Witaj. Świecie.",
  "splitAlgorithm": "sentence"  // sentence, word, paragraph
}
```

## Features

- Interactive web UI for testing alignment
- Load example text pairs (GPL, Help docs, Stallman biography, Poznań)
- Support for all alignment algorithms (Moore, Gale & Church, Poisson)
- Multiple output formats (Presentation, AL, TMX, Info)
- View alignments as formatted text, table, or raw JSON
- Processing time statistics
