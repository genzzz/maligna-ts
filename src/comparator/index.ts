import { Alignment } from '../coretypes';

/**
 * Represents the result of alignment compare.
 * Contains common alignment list and non-matching, corresponding left and right
 * alignment list groups. Number of elements on leftGroupList and rightGroupList is equal.
 */
export class Diff {
  readonly commonList: Alignment[];
  readonly leftGroupList: Alignment[][];
  readonly rightGroupList: Alignment[][];
  readonly leftList: Alignment[];
  readonly rightList: Alignment[];

  constructor(
    commonList: Alignment[],
    leftGroupList: Alignment[][],
    rightGroupList: Alignment[][]
  ) {
    if (leftGroupList.length !== rightGroupList.length) {
      throw new Error('Left and right list lengths must be equal.');
    }
    this.commonList = commonList;
    this.leftGroupList = leftGroupList;
    this.rightGroupList = rightGroupList;
    this.leftList = leftGroupList.flat();
    this.rightList = rightGroupList.flat();
  }
}

/**
 * Compares left and right alignment list.
 * Uses a longest common subsequence approach to find matching alignments.
 */
export function compare(
  leftAlignmentList: Alignment[],
  rightAlignmentList: Alignment[]
): Diff {
  if (leftAlignmentList.length > 0 && rightAlignmentList.length > 0) {
    const occurrenceArray = createOccurrenceArray(
      leftAlignmentList,
      rightAlignmentList
    );

    const indexArray = new Array<number>(leftAlignmentList.length);
    for (let i = 0; i < indexArray.length; ++i) {
      indexArray[i] = occurrenceArray[i].length;
    }

    let bestLength = -1;
    let bestIndexArray: number[] | null = null;

    do {
      const len = length(indexArray, occurrenceArray);
      if (len >= bestLength) {
        bestLength = len;
        bestIndexArray = [...indexArray];
      }
    } while (next(indexArray, occurrenceArray));

    return createDiff(
      leftAlignmentList,
      rightAlignmentList,
      bestIndexArray!,
      occurrenceArray
    );
  } else {
    return new Diff([], [leftAlignmentList], [rightAlignmentList]);
  }
}

function makeAlignmentKey(al: Alignment): string {
  return JSON.stringify({ s: al.sourceSegmentList, t: al.targetSegmentList });
}

function createOccurrenceArray(
  leftAlignmentList: Alignment[],
  rightAlignmentList: Alignment[]
): number[][] {
  const rightOccurrenceMap = new Map<string, number[]>();

  for (let position = 0; position < rightAlignmentList.length; ++position) {
    const alignment = rightAlignmentList[position];
    const key = makeAlignmentKey(alignment);
    let occurrenceList = rightOccurrenceMap.get(key);
    if (!occurrenceList) {
      occurrenceList = [];
      rightOccurrenceMap.set(key, occurrenceList);
    }
    occurrenceList.push(position);
  }

  const occurrenceArray: number[][] = new Array(leftAlignmentList.length);

  for (let i = 0; i < leftAlignmentList.length; ++i) {
    const alignment = leftAlignmentList[i];
    const key = makeAlignmentKey(alignment);
    const list = rightOccurrenceMap.get(key);
    occurrenceArray[i] = list ? [...list] : [];
  }

  return occurrenceArray;
}

function next(indexArray: number[], occurrenceArray: number[][]): boolean {
  for (let i = indexArray.length - 1; i >= 0; --i) {
    if (indexArray[i] > 0) {
      let k = i - 1;
      while (k >= 0 && indexArray[k] === occurrenceArray[k].length) {
        --k;
      }

      if (
        k >= 0 &&
        occurrenceArray[k][indexArray[k]] >=
          occurrenceArray[i][indexArray[i] - 1]
      ) {
        continue;
      }

      --indexArray[i];

      let position = occurrenceArray[i][indexArray[i]];

      for (let m = i + 1; m < indexArray.length; ++m) {
        let n = 0;
        while (
          n < occurrenceArray[m].length &&
          position > occurrenceArray[m][n]
        ) {
          ++n;
        }

        if (n < occurrenceArray[m].length) {
          position = occurrenceArray[m][n];
        }

        indexArray[m] = n;
      }

      return true;
    }
  }

  return false;
}

function length(indexArray: number[], occurrenceArray: number[][]): number {
  let len = 0;
  for (let i = 0; i < indexArray.length; ++i) {
    if (indexArray[i] < occurrenceArray[i].length) {
      ++len;
    }
  }
  return len;
}

function createDiff(
  leftAlignmentList: Alignment[],
  rightAlignmentList: Alignment[],
  indexArray: number[],
  occurrenceArray: number[][]
): Diff {
  const commonList: Alignment[] = [];
  const leftList: Alignment[][] = [];
  const rightList: Alignment[][] = [];

  let previousLeftPosition = 0;
  let previousRightPosition = 0;

  for (let i = 0; i < indexArray.length; ++i) {
    if (indexArray[i] < occurrenceArray[i].length) {
      const commonAlignment = leftAlignmentList[i];
      commonList.push(commonAlignment);

      const leftPosition = i;
      const rightPosition = occurrenceArray[i][indexArray[i]];

      if (
        leftPosition > previousLeftPosition ||
        rightPosition > previousRightPosition
      ) {
        const leftGroup = leftAlignmentList.slice(
          previousLeftPosition,
          leftPosition
        );
        leftList.push(leftGroup);

        const rightGroup = rightAlignmentList.slice(
          previousRightPosition,
          rightPosition
        );
        rightList.push(rightGroup);
      }

      previousLeftPosition = leftPosition + 1;
      previousRightPosition = rightPosition + 1;
    }
  }

  return new Diff(commonList, leftList, rightList);
}
