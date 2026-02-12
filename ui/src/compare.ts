/**
 * Compare alignment results with reference alignments.
 */

import { state } from './state';
import { showToast } from './toast';
import { compareAlignments } from './engine';

function fromExamples(path: string): string {
  return `${import.meta.env.BASE_URL}examples/${path}`;
}

export function initCompare(): void {
  // Toggle compare section
  document.getElementById('compare-toggle')?.addEventListener('click', () => {
    const body = document.getElementById('compare-body');
    const header = document.getElementById('compare-toggle')?.querySelector('h3');
    if (!body || !header) return;
    if (body.style.display === 'none') {
      body.style.display = '';
      header.innerHTML = '&#9650; Compare with Reference';
    } else {
      body.style.display = 'none';
      header.innerHTML = '&#9660; Compare with Reference';
    }
  });

  // Compare button
  document.getElementById('btn-compare')?.addEventListener('click', runCompare);

  // Upload trigger
  const refSelect = document.getElementById('compare-ref-select') as HTMLSelectElement;
  refSelect?.addEventListener('change', () => {
    if (refSelect.value === 'upload') {
      (document.getElementById('compare-file-input') as HTMLInputElement)?.click();
    }
  });

  // File upload for reference
  const fileInput = document.getElementById('compare-file-input') as HTMLInputElement;
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.length) {
      const reader = new FileReader();
      reader.onload = () => {
        state.compareRefContent = reader.result as string;
        showToast('Reference file loaded', 'success');
      };
      reader.readAsText(fileInput.files[0]);
    }
  });
}

async function runCompare(): Promise<void> {
  if (!state.lastAlResult) {
    showToast('No alignment result to compare. Run the pipeline first.', 'error');
    return;
  }

  const refSelect = document.getElementById('compare-ref-select') as HTMLSelectElement;
  const refType = refSelect?.value;

  let refContent: string | undefined;

  if (refType === 'human' || refType === 'moore') {
    if (!state.currentExampleMeta) {
      showToast('No example loaded', 'error');
      return;
    }
    const refFile = state.currentExampleMeta.references[refType];
    if (!refFile) {
      showToast(`No ${refType} reference for this example`, 'error');
      return;
    }
    try {
      const refDir = refType === 'human' ? 'align/human' : 'align/moore';
      const res = await fetch(fromExamples(`${refDir}/${refFile}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      refContent = await res.text();
    } catch (err: any) {
      showToast('Failed to load reference: ' + err.message, 'error');
      return;
    }
  } else if (refType === 'upload') {
    if (!state.compareRefContent) {
      showToast('No reference file uploaded', 'error');
      return;
    }
    refContent = state.compareRefContent;
  } else {
    showToast('Select a reference first', 'error');
    return;
  }

  try {
    const data = compareAlignments(refContent!, state.lastAlResult, 80);

    const results = document.getElementById('compare-results');
    if (results) results.style.display = '';

    const precision = document.getElementById('metric-precision');
    if (precision) precision.textContent = String(data.precision);
    const recall = document.getElementById('metric-recall');
    if (recall) recall.textContent = String(data.recall);
    const common = document.getElementById('metric-common');
    if (common) common.textContent = `${data.commonCount} / ${data.leftCount}`;
    const diff = document.getElementById('compare-diff');
    if (diff) diff.textContent = data.diffFormatted || 'No differences found.';
  } catch (err: any) {
    showToast('Compare failed: ' + err.message, 'error');
  }
}
