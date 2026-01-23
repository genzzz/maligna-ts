# mALIGNa TypeScript

Sentence alignment tool for bilingual corpora - TypeScript implementation.

## Introduction

mALIGNa is a program for aligning documents on the sentence level.
It contains implementations of alignment algorithms:
- **Length-based algorithms** (Gale and Church, Poisson distribution)
- **Content-based algorithms** (Moore's algorithm using IBM Model 1)
- Combinations and variations of these algorithms

The aim of alignment is to obtain a bilingual corpus that can be used for:
- Creating translation memories
- Translation by analogy
- Modelling probabilistic dictionaries
- Machine translation training data

## Installation

```bash
npm install maligna
```

Or for CLI usage:

```bash
npm install -g maligna
```

## Library Usage

```typescript
import {
  Alignment,
  PlaintextParser,
  SentenceSplitAlgorithm,
  TrimCleanAlgorithm,
  Modifier,
  PoissonMacro,
  MooreMacro,
  OneToOneSelector,
  PlaintextFormatter,
} from 'maligna';

// Parse input texts
const parser = new PlaintextParser(sourceText, targetText);
let alignments = parser.parse();

// Split into sentences
const sentenceSplitter = new Modifier(new SentenceSplitAlgorithm());
alignments = sentenceSplitter.apply(alignments);

// Trim whitespace
const trimmer = new Modifier(new TrimCleanAlgorithm());
alignments = trimmer.apply(alignments);

// Align using Poisson distribution (length-based)
const aligner = new PoissonMacro();
alignments = aligner.apply(alignments);

// Or use Moore's algorithm for better quality
// const aligner = new MooreMacro();
// alignments = aligner.apply(alignments);

// Select only 1-1 alignments
const selector = new OneToOneSelector();
alignments = selector.apply(alignments);

// Format output
const formatter = new PlaintextFormatter();
const result = formatter.formatSeparate(alignments);
console.log('Source:', result.source);
console.log('Target:', result.target);
```

## CLI Usage

The CLI provides several commands that can be piped together:

### Parse Command

Converts external formats to native .al format:

```bash
maligna parse -c txt source.txt target.txt > aligned.al
maligna parse -c tmx translations.tmx --source-lang en --target-lang de > aligned.al
```

### Modify Command

Modifies segments (split, trim, merge):

```bash
cat aligned.al | maligna modify -c split-sentence | maligna modify -c trim > sentences.al
```

### Align Command

Aligns segments using specified algorithm:

```bash
cat sentences.al | maligna align -c viterbi -a poisson -n word > aligned.al
```

### Select Command

Selects alignments based on criteria:

```bash
cat aligned.al | maligna select -c one-to-one > filtered.al
cat aligned.al | maligna select -c fraction -f 0.85 > best.al
```

### Macro Command

Executes predefined alignment workflows:

```bash
cat sentences.al | maligna macro -c poisson > aligned.al
cat sentences.al | maligna macro -c moore > aligned.al
```

### Format Command

Converts .al format to output formats:

```bash
cat aligned.al | maligna format -c txt source-out.txt target-out.txt
cat aligned.al | maligna format -c tmx --source-lang en --target-lang pl > output.tmx
cat aligned.al | maligna format -c html > output.html
```

### Compare Command

Compares two alignment files:

```bash
maligna compare reference.al result.al
```

## Complete Example

```bash
# Full alignment pipeline
maligna parse -c txt source.txt target.txt | \
maligna modify -c split-sentence | \
maligna modify -c trim | \
maligna macro -c poisson | \
maligna select -c one-to-one | \
maligna format -c txt source-aligned.txt target-aligned.txt
```

## Algorithms

### Poisson Distribution (Gale and Church style)

Fast alignment based on sentence lengths. Assumes that the ratio of sentence 
lengths follows a Poisson distribution.

### Moore's Algorithm

More accurate alignment that:
1. First aligns using length-based algorithm
2. Selects best 1-1 alignments
3. Trains a translation model (IBM Model 1) on those alignments
4. Re-aligns using the translation model

## Formats

### .al Format (Native)

JSON-based format storing all alignment information:

```json
{
  "alignments": [
    {
      "score": 0.5,
      "sourceSegments": ["Hello world"],
      "targetSegments": ["Hallo Welt"]
    }
  ]
}
```

### TMX Format

Standard Translation Memory eXchange format.

### TXT Format

Plain text with one segment per line.

## API Reference

### Core Types

- `Alignment` - Represents n-to-m segment alignment
- `Category` - Alignment category (1-1, 2-1, etc.)

### Calculators

- `PoissonDistributionCalculator` - Length-based scoring
- `NormalDistributionCalculator` - Alternative length-based scoring
- `TranslationCalculator` - Content-based scoring using IBM Model 1

### Filters

- `Aligner` - Applies alignment algorithm
- `Modifier` - Modifies segments
- `OneToOneSelector` - Keeps only 1-1 alignments
- `FractionSelector` - Keeps best fraction
- `PoissonMacro` - Complete Poisson alignment
- `MooreMacro` - Complete Moore alignment

### Parsers

- `PlaintextParser` - Parse plain text files
- `TmxParser` - Parse TMX files
- `AlParser` - Parse native .al files

### Formatters

- `PlaintextFormatter` - Output plain text
- `TmxFormatter` - Output TMX
- `AlFormatter` - Output native .al
- `HtmlFormatter` - Output HTML table
- `PresentationFormatter` - Human-readable output

## License

MIT

## Original Authors

- Jarek Lipski (loomchild) - Original Java implementation
- Jimmy O'Regan - Documentation

## References

1. "A new tool for the bilingual text aligning at the sentence level" - Krzysztof Jassem, Jarek Lipski
2. "A Program for Aligning Sentences in Bilingual Corpora" - William A. Gale, Kenneth Ward Church
3. "Fast and Accurate Sentence Alignment of Bilingual Corpora" - Robert C. Moore
