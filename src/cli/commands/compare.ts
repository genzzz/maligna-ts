import * as fs from 'fs';
import { AlParser } from '../../parser/AlParser.js';
import { Alignment } from '../../core/Alignment.js';

export function compareCommand(file1: string, file2: string): void {
  const content1 = fs.readFileSync(file1, 'utf-8');
  const content2 = fs.readFileSync(file2, 'utf-8');

  const parser1 = new AlParser(content1);
  const parser2 = new AlParser(content2);

  const alignments1 = parser1.parse();
  const alignments2 = parser2.parse();

  const stats = compareAlignments(alignments1, alignments2);

  console.log('='.repeat(60));
  console.log('ALIGNMENT COMPARISON');
  console.log('='.repeat(60));
  console.log(`File 1: ${file1} (${alignments1.length} alignments)`);
  console.log(`File 2: ${file2} (${alignments2.length} alignments)`);
  console.log('-'.repeat(60));
  console.log(`Matching alignments: ${stats.matching}`);
  console.log(`Only in file 1: ${stats.onlyInFirst}`);
  console.log(`Only in file 2: ${stats.onlyInSecond}`);
  console.log('-'.repeat(60));
  console.log(`Precision: ${(stats.precision * 100).toFixed(2)}%`);
  console.log(`Recall: ${(stats.recall * 100).toFixed(2)}%`);
  console.log(`F1 Score: ${(stats.f1 * 100).toFixed(2)}%`);
  console.log('='.repeat(60));
}

interface ComparisonStats {
  matching: number;
  onlyInFirst: number;
  onlyInSecond: number;
  precision: number;
  recall: number;
  f1: number;
}

function compareAlignments(
  alignments1: Alignment[],
  alignments2: Alignment[]
): ComparisonStats {
  // Build position maps for comparison
  const positions1 = buildPositionSet(alignments1);
  const positions2 = buildPositionSet(alignments2);

  let matching = 0;
  for (const pos of positions1) {
    if (positions2.has(pos)) {
      matching++;
    }
  }

  const onlyInFirst = positions1.size - matching;
  const onlyInSecond = positions2.size - matching;

  const precision = positions1.size > 0 ? matching / positions1.size : 0;
  const recall = positions2.size > 0 ? matching / positions2.size : 0;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    matching,
    onlyInFirst,
    onlyInSecond,
    precision,
    recall,
    f1,
  };
}

function buildPositionSet(alignments: Alignment[]): Set<string> {
  const positions = new Set<string>();
  let sourcePos = 0;
  let targetPos = 0;

  for (const alignment of alignments) {
    const sourceCount = alignment.getSourceSegmentList().length;
    const targetCount = alignment.getTargetSegmentList().length;

    // Create a position key based on start positions and counts
    const key = `${sourcePos}:${sourceCount}-${targetPos}:${targetCount}`;
    positions.add(key);

    sourcePos += sourceCount;
    targetPos += targetCount;
  }

  return positions;
}
