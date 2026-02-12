/**
 * Example loading and display.
 */

import { state } from './state';
import type { ExampleInfo, ExampleData } from './state';
import { showToast } from './toast';

function fromExamples(path: string): string {
  return `${import.meta.env.BASE_URL}examples/${path}`;
}

function truncatePreview(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '\n\n... (truncated)';
}

export function updateCompareRefOptions(exampleMeta: ExampleInfo | null): void {
  const select = document.getElementById('compare-ref-select') as HTMLSelectElement;
  if (!select) return;
  select.innerHTML = '<option value="">Select reference...</option>';
  if (exampleMeta?.references.human) {
    select.innerHTML += '<option value="human">Human Reference</option>';
  }
  if (exampleMeta?.references.moore) {
    select.innerHTML += '<option value="moore">Moore Reference</option>';
  }
  select.innerHTML += '<option value="upload">Upload .al File</option>';
}

export async function loadManifest(): Promise<void> {
  try {
    const res = await fetch(fromExamples('manifest.json'));
    state.examples = await res.json();

    const select = document.getElementById('example-select') as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = '<option value="">Choose an example...</option>';
    state.examples.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.name;
      opt.textContent = `${ex.displayName} (${ex.sourceLang} \u2192 ${ex.targetLang})`;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => loadExample(select.value));
  } catch (err: any) {
    showToast('Failed to load examples: ' + err.message, 'error');
  }
}

export async function loadExample(name: string): Promise<void> {
  if (!name) {
    state.currentExample = null;
    state.currentExampleMeta = null;
    const meta = document.getElementById('example-meta');
    if (meta) meta.style.display = 'none';
    (document.getElementById('example-source-preview') as HTMLTextAreaElement).value = '';
    (document.getElementById('example-target-preview') as HTMLTextAreaElement).value = '';
    updateCompareRefOptions(null);
    return;
  }

  try {
    const ex = state.examples.find(e => e.name === name);
    if (!ex) throw new Error(`Example not found: ${name}`);

    const [sourceText, targetText] = await Promise.all([
      fetch(fromExamples(`txt/${ex.sourceFile}`)).then(r => r.text()),
      fetch(fromExamples(`txt/${ex.targetFile}`)).then(r => r.text()),
    ]);

    const data: ExampleData = {
      name,
      sourceText,
      targetText,
      sourceLang: ex.sourceLang,
      targetLang: ex.targetLang,
    };
    state.currentExample = data;
    state.currentExampleMeta = ex;

    // Show meta
    const meta = document.getElementById('example-meta');
    if (meta) meta.style.display = '';
    const badgeSource = document.getElementById('badge-source-lang');
    if (badgeSource) badgeSource.textContent = `Source: ${ex.sourceLang}`;
    const badgeTarget = document.getElementById('badge-target-lang');
    if (badgeTarget) badgeTarget.textContent = `Target: ${ex.targetLang}`;
    const sizeKb = Math.round((ex.sourceSize + ex.targetSize) / 1024);
    const badgeSize = document.getElementById('badge-size');
    if (badgeSize) badgeSize.textContent = `${sizeKb} KB`;

    // Show refs
    const refsDiv = document.getElementById('meta-refs');
    if (refsDiv) {
      const refs: string[] = [];
      if (ex.references.human) refs.push('Human');
      if (ex.references.moore) refs.push('Moore');
      if (ex.references.split) refs.push('Split');
      refsDiv.textContent = refs.length > 0 ? `References: ${refs.join(', ')}` : '';
    }

    // Preview
    (document.getElementById('example-source-preview') as HTMLTextAreaElement).value =
      truncatePreview(sourceText, 2000);
    (document.getElementById('example-target-preview') as HTMLTextAreaElement).value =
      truncatePreview(targetText, 2000);

    // Update compare ref options
    updateCompareRefOptions(ex);
  } catch (err: any) {
    showToast('Failed to load example: ' + err.message, 'error');
  }
}
