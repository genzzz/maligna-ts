# mALIGNa-ts

Sentence alignment toolkit for bilingual corpora.

> **Status:** This project is in active development and is **not production-ready** yet.

`mALIGNa-ts` is a TypeScript/Node.js port of the original Java [maligna](https://github.com/loomchild/maligna), preserving core sentence-alignment algorithms and CLI workflow.

## Highlights

- Multiple alignment strategies (length-based, translation-based, hybrid workflows)
- End-to-end CLI pipeline: parse → modify → align → select → format
- Library API for Node.js apps and browser integrations
- CJS + ESM package outputs

## Requirements

- Node.js **v24+**

## Installation (GitHub only)

This package is currently installed directly from GitHub:

```bash
npm i genzzz/maligna-ts
```

Optional pinned install examples:

```bash
npm i genzzz/maligna-ts#v0.0.1
npm i genzzz/maligna-ts#<commit-sha>
```

## CLI usage

Build first:

```bash
npm run build
```

Then run:

```bash
npm run start -- --help
```

### Example CLI pipeline

```bash
maligna parse -c txt source.txt target.txt | \
maligna modify -c split-sentence | \
maligna modify -c trim | \
maligna macro -c galechurch | \
maligna select -c one-to-one | \
maligna format -c presentation
```

## Library usage (functional example)

```ts
import {
  PlaintextParser,
  Modifier,
  SentenceSplitAlgorithm,
  TrimCleanAlgorithm,
  GaleAndChurchMacro,
  decorateFilter,
  PresentationFormatter,
} from 'maligna-ts';

const sourceText = `This is a short source text. It has two sentences.`;
const targetText = `Dies ist ein kurzer Zieltext. Er hat zwei Sätze.`;

const parser = new PlaintextParser(sourceText, targetText);
let alignmentList = parser.parse();

const splitFilter = new Modifier(new SentenceSplitAlgorithm(), new SentenceSplitAlgorithm());
alignmentList = splitFilter.apply(alignmentList);

const trimFilter = new Modifier(new TrimCleanAlgorithm(), new TrimCleanAlgorithm());
alignmentList = trimFilter.apply(alignmentList);

const alignFilter = decorateFilter(new GaleAndChurchMacro());
alignmentList = alignFilter.apply(alignmentList);

const formatter = new PresentationFormatter();
console.log(formatter.format(alignmentList));
```

## Package metadata

- Name: `maligna-ts`
- Display name: `mALIGNa-ts`
- Description: `Sentence alignment toolkit`
- Version: `0.0.1`
- License: `Apache-2.0`
- Repository: https://github.com/genzzz/maligna-ts.git
- Homepage: https://github.com/genzzz/maligna-ts/

## Contributing

Contributions are welcome from everyone.

- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Issues: https://github.com/genzzz/maligna-ts/issues

## Authors

- Genci Shabani — TypeScript version author
- Jarek Lipski — original Java project, design and algorithms
- Jimmy O'Regan — translation of the original README to English

## License

Licensed under Apache License 2.0.
See [LICENSE](LICENSE).

## What to improve next (professionalization roadmap)

1. Add GitHub Actions CI (Node 24) for `build`, `test`, and package smoke tests.
2. Add release automation (semantic versioning + changelog generation).
3. Add static quality tooling (`eslint`, formatting, dependency/unused export checks).
4. Add npm tarball verification workflow (`npm pack --dry-run` + CJS/ESM consumer fixtures).
5. Expand integration tests for CLI pipelines and model training edge cases.
6. Add benchmark suite for alignment algorithms across larger corpora.
