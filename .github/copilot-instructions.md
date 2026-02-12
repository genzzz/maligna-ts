# Copilot instructions for maligna-ts

## Big picture
- `maligna-ts` is a TypeScript/Node.js sentence-alignment toolkit ported from Java maligna; the root folder is the package.
- Core data type is `Alignment` (`src/coretypes/Alignment.ts`): immutable source segments, target segments, and `score`.
- Scores are in log space: `score = -ln(probability)` (`src/util/util.ts`), so lower is better; `-Infinity` means human-verified alignment.
- Main pipeline contract is `Filter.apply(alignmentList: Alignment[]): Alignment[]` (`src/filter/Filter.ts`).
- Architecture is library-first: CLI (`src/cli/index.ts`) and UI (`ui/`) compose library primitives from `src/`.

## Architecture map
- Public API surface is centralized in `src/index.ts`; export new public symbols there.
- Parsers (`src/parser/`) convert text/XML into `Alignment[]`; formatters (`src/formatter/`) serialize `Alignment[]`.
- Alignment logic is layered: calculators (`src/calculator/`) + algorithms (`src/filter/aligner/align/`) + aligners/selectors/modifiers/macros (`src/filter/`).
- Macros and meta filters are implemented in folder `index.ts` files (`src/filter/macro/index.ts`, `src/filter/meta/index.ts`) rather than one file per class.
- `decorateFilter()` in `src/filter/meta/index.ts` is critical: wrap aligners/macros to preserve `score === -Infinity` segments.
- Dynamic programming uses `FullMatrix`/`BandMatrix` and adaptive widening in `AdaptiveBandAlgorithm`.

## Data and flow patterns
- Default interchange format is `.al` XML (`src/parser/AlParser.ts`, `src/formatter/AlFormatter.ts`) and CLI subcommands are designed to pipe it through stdin/stdout.
- CLI subcommands in `src/cli/index.ts`: `parse`, `format`, `align`, `modify`, `select`, `compare`, `macro`, `model`.
- Typical flow (README): parse → modify → macro/align → select → format.
- Category priors come from `BEST_CATEGORY_MAP` / `MOORE_CATEGORY_MAP` in `src/coretypes/CategoryDefaults.ts`.

## Codebase-specific conventions
- Preserve Java float behavior: use `Math.fround()` in numeric paths (many calculators/algorithms rely on it).
- Keep filters functionally pure: return new arrays; do not mutate input alignments.
- Error style is simple `throw new Error(...)`; only custom exception is `PositionOutsideBandException` (`src/matrix/BandMatrix.ts`).
- Progress reporting is global singleton-based (`ProgressManager`); CLI registers `WriterProgressObserver` unless verbosity is `quiet`.
- Runtime deps are intentionally minimal (`commander`, `fast-xml-parser`).

## Developer workflows
- Requirements: Node `>=24` (`package.json` engines).
- Build library + CLI: `npm run build` (tsup, outputs `dist/` including CJS/ESM/types).
- Run CLI after build: `npm run start -- <subcommand>` (executes `dist/cli/index.cjs`).
- Type check: `npm run typecheck`; extra unused analysis: `npm run analyze:unused`.
- Tests: `npm run test` / `npm run test:watch` (Vitest).
- UI dev server: `cd ui && npm run dev`.

## Testing patterns
- Tests mirror `src/` under `tests/` and use Vitest without a mocking framework.
- Reuse helpers in `tests/util/TestUtil.ts` (`createAlignmentList`, `assertAlignmentListEquals`, `assertAlignmentListContains`).
- Common regression style is formatter/parser round-trip validation and deterministic alignment list assertions.