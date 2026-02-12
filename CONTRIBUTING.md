# Contributing to mALIGNa-ts

Thanks for your interest in contributing to `mALIGNa-ts`.

## Development status

This project is in active development and is not production-ready yet.
Breaking changes may happen between minor updates.

## Getting started

1. Use Node.js v24 or newer.
2. Fork and clone the repository.
3. Install dependencies:

```bash
npm install
```

4. Build and test locally:

```bash
npm run build
npm run test
```

## Contribution workflow

1. Create a branch from `master`.
2. Keep changes focused and minimal.
3. Add or update tests when changing behavior.
4. Run:

```bash
npm run typecheck
npm run analyze:unused
npm run test
```

5. Open a Pull Request with:
   - clear summary
   - motivation and approach
   - before/after behavior

## Code style and architecture

- Keep filters and calculators pure and deterministic.
- Preserve score semantics (`score = -ln(probability)`).
- Avoid mutating `Alignment` data.
- Follow existing directory structure and barrel export conventions.

## Reporting issues

Please open issues at:

- https://github.com/genzzz/maligna-ts/issues

Include reproducible input, command used, expected behavior, and actual output.
