/**
 * Results display and download.
 */

import { state } from './state';
import { showToast } from './toast';

export function clearResults(): void {
  const ids = ['result-presentation', 'result-info', 'result-al', 'result-tmx'];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.textContent = 'Processing...';
  }
  const html = document.getElementById('result-html');
  if (html) html.innerHTML = 'Processing...';

  const count = document.getElementById('result-count');
  if (count) count.textContent = '';

  const dlBtn = document.getElementById('btn-download');
  if (dlBtn) (dlBtn as HTMLElement).style.display = 'none';

  const compareResults = document.getElementById('compare-results');
  if (compareResults) compareResults.style.display = 'none';
}

export function displayResults(data: {
  formatted: Record<string, string>;
  alignmentCount: number;
}): void {
  const { formatted, alignmentCount } = data;

  const pres = document.getElementById('result-presentation');
  if (pres) pres.textContent = formatted.presentation || '';
  const info = document.getElementById('result-info');
  if (info) info.textContent = formatted.info || '';
  const al = document.getElementById('result-al');
  if (al) al.textContent = formatted.al || '';
  const tmx = document.getElementById('result-tmx');
  if (tmx) tmx.textContent = formatted.tmx || '';

  // HTML result — inject the actual HTML
  const htmlContainer = document.getElementById('result-html');
  if (htmlContainer) {
    if (formatted.html) {
      htmlContainer.innerHTML = formatted.html;
    } else {
      htmlContainer.textContent = 'No HTML output available.';
    }
  }

  const countEl = document.getElementById('result-count');
  if (countEl) countEl.textContent = `${alignmentCount} alignments`;

  const dlBtn = document.getElementById('btn-download');
  if (dlBtn) (dlBtn as HTMLElement).style.display = '';

  // Store AL result for compare/download
  state.lastAlResult = formatted.al || null;

  showToast(`Pipeline complete: ${alignmentCount} alignments`, 'success');
}

function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function initDownload(): void {
  document.getElementById('btn-download')?.addEventListener('click', () => {
    if (!state.lastAlResult) return;

    // Find active result tab
    const activeTab = document.querySelector('#result-tabs .tab.active') as HTMLElement | null;
    const tabName = activeTab?.dataset.tab || 'result-al';
    let content = '';
    let ext = '.al';

    switch (tabName) {
      case 'result-presentation':
        content = document.getElementById('result-presentation')?.textContent || '';
        ext = '.txt';
        break;
      case 'result-html':
        content = document.getElementById('result-html')?.innerHTML || '';
        ext = '.html';
        break;
      case 'result-info':
        content = document.getElementById('result-info')?.textContent || '';
        ext = '.txt';
        break;
      case 'result-al':
        content = state.lastAlResult;
        ext = '.al';
        break;
      case 'result-tmx':
        content = document.getElementById('result-tmx')?.textContent || '';
        ext = '.tmx';
        break;
      default:
        content = state.lastAlResult;
        ext = '.al';
    }

    downloadText(content, `maligna-result${ext}`);
  });
}
