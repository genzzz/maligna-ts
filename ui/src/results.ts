/**
 * Results display and download.
 */

import { state } from './state';
import { showToast } from './toast';

export type PrimaryFormat = 'presentation' | 'html' | 'al' | 'tmx';

const DOWNLOAD_EXT: Record<PrimaryFormat, string> = {
  presentation: '.txt',
  html: '.html',
  al: '.al',
  tmx: '.tmx',
};

function setResultMode(mode: 'text' | 'html', codeLike = false): void {
  const pre = document.getElementById('result-output-pre') as HTMLElement | null;
  const html = document.getElementById('result-output-html') as HTMLElement | null;
  if (!pre || !html) return;

  if (mode === 'html') {
    pre.style.display = 'none';
    html.style.display = '';
    pre.classList.remove('result-code');
    return;
  }

  html.style.display = 'none';
  pre.style.display = '';
  if (codeLike) {
    pre.classList.add('result-code');
  } else {
    pre.classList.remove('result-code');
  }
}

function getSelectedContent(formatted: Record<string, string>, selectedFormat: PrimaryFormat): string {
  switch (selectedFormat) {
    case 'presentation':
      return formatted.presentation || '';
    case 'html':
      return formatted.html || '';
    case 'al':
      return formatted.al || '';
    case 'tmx':
      return formatted.tmx || '';
    default:
      return '';
  }
}

export function clearResults(): void {
  const pre = document.getElementById('result-output-pre');
  if (pre) pre.textContent = 'Processing...';
  const html = document.getElementById('result-output-html');
  if (html) html.innerHTML = 'Processing...';
  setResultMode('text');

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
  selectedFormat: PrimaryFormat;
}): void {
  const { formatted, alignmentCount, selectedFormat } = data;

  const pre = document.getElementById('result-output-pre');
  const htmlContainer = document.getElementById('result-output-html');

  if (selectedFormat === 'html') {
    setResultMode('html');
    if (htmlContainer) {
      htmlContainer.innerHTML = formatted.html || 'No HTML output available.';
    }
  } else {
    const content = getSelectedContent(formatted, selectedFormat);
    const codeLike = selectedFormat === 'al' || selectedFormat === 'tmx';
    setResultMode('text', codeLike);
    if (pre) pre.textContent = content;
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
    const formatSelect = document.getElementById('format-class') as HTMLSelectElement | null;
    const selectedFormat = (formatSelect?.value || 'presentation') as PrimaryFormat;

    let content = '';
    if (selectedFormat === 'html') {
      content = document.getElementById('result-output-html')?.innerHTML || '';
    } else {
      content = document.getElementById('result-output-pre')?.textContent || '';
    }

    downloadText(content, `maligna-result${DOWNLOAD_EXT[selectedFormat]}`);
  });
}
