# mALIGNa TypeScript

TypeScript port of mALIGNa - a bitext alignment library and tool.

## Overview

mALIGNa is a library and command-line tool for aligning parallel texts (bitexts). It implements several well-known sentence alignment algorithms:

- **Gale & Church** - Length-based alignment using normal distribution (character counts)
- **Poisson** - Length-based alignment using Poisson distribution (sentence counts)
- **Moore** - Content-based alignment combining length and translation models (IBM Model 1)

## Installation

```bash
npm install
npm run build
```

## CLI Usage

### Align Command (Convenience)

The simplest way to align two text files:

```bash
# Align using Moore's algorithm (default)
node dist/cli.js align -s source.txt -t target.txt

# Align using Gale & Church
node dist/cli.js align -s source.txt -t target.txt -a galechurch

# Align using Poisson distribution
node dist/cli.js align -s source.txt -t target.txt -a poisson

# Output formats: al (default), txt, tmx, presentation, info
node dist/cli.js align -s source.txt -t target.txt -f presentation
node dist/cli.js align -s source.txt -t target.txt -f tmx -l en,de
```

### Pipeline Commands

For more control, use the individual pipeline commands:

```bash
# Parse text files into alignment format (paragraphs become unaligned segments)
node dist/cli.js parse -c txt source.txt target.txt > unaligned.al

# Apply a macro filter to align
cat unaligned.al | node dist/cli.js macro -c galechurch > aligned.al

# Format the output
cat aligned.al | node dist/cli.js format -c presentation
cat aligned.al | node dist/cli.js format -c info
cat aligned.al | node dist/cli.js format -c tmx -l en,de
```

### Modify and Select

```bash
# Split into sentences (modify filter)
cat paragraph.al | node dist/cli.js modify -c split

# Select only 1:1 alignments
cat aligned.al | node dist/cli.js select -c onetoone

# Select by quality fraction
cat aligned.al | node dist/cli.js select -c fraction -p 0.8
```

## Output Formats

- **al** - XML alignment format (default, can be used for further processing)
- **txt** - Plain text with source and target segments separated
- **tmx** - Translation Memory eXchange format
- **presentation** - Two-column side-by-side view
- **info** - Statistics about alignment categories (1-1, 1-2, 2-1, etc.)

## Algorithms

### Gale & Church

Classic length-based algorithm using character counts and normal distribution. Fast and effective for well-aligned parallel texts.

### Poisson

Length-based algorithm using sentence counts and Poisson distribution. Good for texts with consistent sentence structure.

### Moore

Advanced algorithm that combines:
1. Initial length-based alignment (Poisson)
2. Building a translation model (IBM Model 1) from high-confidence alignments
3. Re-alignment using both length and translation scores

This typically produces the best results but is slower.

## Library Usage

```typescript
import {
  PlaintextParser,
  GaleAndChurchMacro,
  AlFormatter,
  PresentationFormatter,
  InfoFormatter
} from 'maligna-ts';

// Parse input texts
const parser = new PlaintextParser();
const alignments = parser.parse([sourceText, targetText]);

// Apply alignment
const macro = new GaleAndChurchMacro();
const aligned = macro.apply(alignments);

// Format output
const formatter = new PresentationFormatter();
const output = formatter.format(aligned);
console.log(output);
```

## Credits

This is a TypeScript port of the original Java mALIGNa library.

Original project: https://github.com/loomchild/maligna

Algorithms based on:
- Gale, W. A., & Church, K. W. (1993). A Program for Aligning Sentences in Bilingual Corpora
- Moore, R. C. (2002). Fast and Accurate Sentence Alignment of Bilingual Corpora

## License

Same license as the original mALIGNa project.
