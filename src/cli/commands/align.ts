import * as fs from 'fs';
import * as readline from 'readline';
import { AlParser } from '../../parser/AlParser.js';
import { AlFormatter } from '../../formatter/AlFormatter.js';
import { Alignment } from '../../core/Alignment.js';
import { BEST_CATEGORY_MAP } from '../../core/CategoryDefaults.js';
import { Calculator } from '../../calculator/Calculator.js';
import { PoissonDistributionCalculator } from '../../calculator/length/PoissonDistributionCalculator.js';
import { TranslationCalculator } from '../../calculator/content/TranslationCalculator.js';
import { SplitCounter, CharCounter } from '../../calculator/length/Counter.js';
import { Aligner } from '../../filter/aligner/Aligner.js';
import { ViterbiAlgorithm } from '../../filter/aligner/ViterbiAlgorithm.js';
import { FullMatrixFactory } from '../../matrix/FullMatrix.js';

interface AlignOptions {
  calculator: string;
  algorithm: string;
  normalize: string;
  training?: string;
}

export function alignCommand(options: AlignOptions): void {
  const lines: string[] = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on('line', (line) => {
    lines.push(line);
  });

  rl.on('close', () => {
    const input = lines.join('\n');
    processAlign(input, options);
  });
}

function processAlign(input: string, options: AlignOptions): void {
  const parser = new AlParser(input);
  const alignments = parser.parse();

  // Create counter based on normalization
  const counter =
    options.normalize === 'char' ? new CharCounter() : new SplitCounter();

  // Create calculator
  let calculator: Calculator;

  if (options.algorithm === 'translation') {
    // Load training data if provided
    let trainingAlignments: Alignment[];
    if (options.training) {
      const trainingContent = fs.readFileSync(options.training, 'utf-8');
      const trainingParser = new AlParser(trainingContent);
      trainingAlignments = trainingParser.parse();
    } else {
      // Use input as training data
      trainingAlignments = alignments;
    }
    calculator = new TranslationCalculator(trainingAlignments);
  } else {
    // Default to Poisson
    calculator = new PoissonDistributionCalculator(counter, alignments);
  }

  // Create algorithm
  const algorithm = new ViterbiAlgorithm(
    calculator,
    BEST_CATEGORY_MAP,
    new FullMatrixFactory()
  );

  // Create aligner filter
  const aligner = new Aligner(algorithm);
  const result = aligner.apply(alignments);

  // Output
  const formatter = new AlFormatter();
  console.log(formatter.format(result));
}
