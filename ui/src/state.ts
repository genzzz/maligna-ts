/**
 * Shared application state.
 */

export interface ExampleInfo {
  name: string;
  displayName: string;
  sourceLang: string;
  targetLang: string;
  sourceFile: string;
  targetFile: string;
  sourceSize: number;
  targetSize: number;
  references: {
    human?: string;
    moore?: string;
    split?: string;
  };
}

export interface ExampleData {
  name: string;
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
}

export const state = {
  examples: [] as ExampleInfo[],
  currentExample: null as ExampleData | null,
  currentExampleMeta: null as ExampleInfo | null,
  lastAlResult: null as string | null,
  uploadedAlContent: null as string | null,
  compareRefContent: null as string | null,
  isRunning: false,
};
