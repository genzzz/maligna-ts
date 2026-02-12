import './style.css';

import { state } from './state';
import { initTabs } from './tabs';
import { loadManifest } from './examples';
import { initDropzone } from './dropzone';
import { initCompare } from './compare';
import { initDownload, clearResults, displayResults } from './results';
import { showToast } from './toast';
import { runPipeline } from './engine';
import type { PipelineInput, StepProgress } from './engine';
import { registerProgressObserver, unregisterProgressObserver } from './progress';


// Import pipeline-ui for its side effect (registers window._pipeline)
import {
  createStep,
  clearAll,
  collectAllConfigs,
  applyPreset,
} from './pipeline-ui';

// ─── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadManifest();
  initPipelineButtons();
  initFormatOptions();
  initDropzone();
  initCompare();
  initDownload();
});

// ─── Pipeline Buttons ──────────────────────────────────────────────────────────

function initPipelineButtons(): void {
  // Add step buttons
  document.querySelectorAll('.add-step-bar .btn-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = (btn as HTMLElement).dataset.type;
      if (type) createStep(type);
    });
  });

  // Macro quick buttons
  document.querySelectorAll('.btn-macro').forEach(btn => {
    btn.addEventListener('click', () => {
      const macro = (btn as HTMLElement).dataset.macro;
      if (macro) applyPreset(macro);
    });
  });

  // Clear button
  document.getElementById('btn-clear-pipeline')?.addEventListener('click', () => {
    clearAll();
  });

  // Run button
  document.getElementById('btn-run')?.addEventListener('click', handleRunPipeline);
}

// ─── Format Options ────────────────────────────────────────────────────────────

function initFormatOptions(): void {
  const formatSelect = document.getElementById('format-class') as HTMLSelectElement;
  const widthGroup = document.getElementById('format-width-group');
  if (!formatSelect || !widthGroup) return;

  formatSelect.addEventListener('change', () => {
    widthGroup.style.display = formatSelect.value === 'presentation' ? '' : 'none';
  });
}

// ─── Run Pipeline ──────────────────────────────────────────────────────────────

function collectInput(): PipelineInput | null {
  const activeTab = document.querySelector('#input-tabs .tab.active') as HTMLElement | null;
  const tabName = activeTab?.dataset.tab || 'examples';

  if (tabName === 'examples') {
    if (!state.currentExample) {
      showToast('Select an example first', 'error');
      return null;
    }
    return {
      type: 'example',
      name: state.currentExample.name,
      sourceLang: state.currentExample.sourceLang,
      targetLang: state.currentExample.targetLang,
    };
  } else if (tabName === 'custom') {
    const sourceText = (document.getElementById('custom-source') as HTMLTextAreaElement)?.value.trim();
    const targetText = (document.getElementById('custom-target') as HTMLTextAreaElement)?.value.trim();
    if (!sourceText || !targetText) {
      showToast('Enter both source and target text', 'error');
      return null;
    }
    return {
      type: 'custom',
      sourceText,
      targetText,
      sourceLang: (document.getElementById('custom-source-lang') as HTMLInputElement)?.value || 'source',
      targetLang: (document.getElementById('custom-target-lang') as HTMLInputElement)?.value || 'target',
    };
  } else if (tabName === 'upload') {
    if (!state.uploadedAlContent) {
      showToast('Upload a file first', 'error');
      return null;
    }
    return {
      type: 'al',
      alContent: state.uploadedAlContent,
      sourceLang: (document.getElementById('upload-source-lang') as HTMLInputElement)?.value || 'source',
      targetLang: (document.getElementById('upload-target-lang') as HTMLInputElement)?.value || 'target',
    };
  }
  return null;
}

// ─── Progress UI ───────────────────────────────────────────────────────────────

function showProgress(): void {
  const container = document.getElementById('progress-container');
  if (container) container.style.display = '';
  const fill = document.getElementById('progress-fill');
  if (fill) (fill as HTMLElement).style.width = '0%';
  const label = document.getElementById('progress-label');
  if (label) label.textContent = 'Starting...';
  const steps = document.getElementById('progress-steps');
  if (steps) steps.innerHTML = '';
}

function hideProgress(): void {
  setTimeout(() => {
    const fill = document.getElementById('progress-fill');
    if (fill) (fill as HTMLElement).style.width = '100%';
  }, 200);
}

function onStepProgress(progress: StepProgress): void {
  if (!progress.done) {
    // Step starting
    const label = document.getElementById('progress-label');
    if (label) label.textContent = progress.name;
    const pct = (progress.index / progress.total) * 100;
    const fill = document.getElementById('progress-fill');
    if (fill) (fill as HTMLElement).style.width = pct + '%';

    const stepDiv = document.createElement('div');
    stepDiv.className = 'progress-step-item active';
    stepDiv.id = `progress-step-${progress.index}`;
    stepDiv.textContent = `[${progress.index + 1}/${progress.total}] ${progress.name}...`;
    document.getElementById('progress-steps')?.appendChild(stepDiv);
  } else {
    // Step complete
    const stepsContainer = document.getElementById('progress-steps');
    const lastStep = stepsContainer?.lastElementChild;
    if (lastStep) {
      lastStep.classList.remove('active');
      lastStep.classList.add('done');
      let text = lastStep.textContent?.replace('...', '') || '';
      text += ` \u2713 (${progress.alignmentCount} alignments`;
      if (progress.elapsed) text += `, ${progress.elapsed}ms`;
      text += ')';
      lastStep.textContent = text;
    }
  }
}

function onSubStepProgress(event: { name: string; progress: number }): void {
  const label = document.getElementById('progress-label');
  if (label) {
    label.textContent = `${event.name}: ${Math.round(event.progress * 100)}%`;
  }
}

// ─── Main Run Handler ──────────────────────────────────────────────────────────

async function handleRunPipeline(): Promise<void> {
  if (state.isRunning) return;

  // Collect input
  const input = collectInput();
  if (!input) return;

  // Collect pipeline steps
  const steps = await collectAllConfigs();
  if (steps.length === 0) {
    showToast('Add at least one pipeline step', 'error');
    return;
  }

  // Collect format options
  const formatClass = (document.getElementById('format-class') as HTMLSelectElement)?.value || 'presentation';
  const format = {
    class: formatClass,
    width: parseInt((document.getElementById('format-width') as HTMLInputElement)?.value, 10) || 100,
    sourceLang: '',
    targetLang: '',
  };

  // Add language info for TMX
  if (input.sourceLang) format.sourceLang = input.sourceLang;
  if (input.targetLang) format.targetLang = input.targetLang;

  const pipeline = { input, steps: steps as any, format };

  // UI: show progress
  state.isRunning = true;
  const runBtn = document.getElementById('btn-run') as HTMLButtonElement;
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.innerHTML = '<span class="run-icon">&#9203;</span> Running...';
  }

  showProgress();
  clearResults();

  // Register progress observer for sub-step progress (matrix computation etc.)
  const observer = registerProgressObserver((event) => {
    if (event.type === 'update') {
      onSubStepProgress({ name: event.name, progress: event.progress });
    }
  });

  try {
    const result = await runPipeline(pipeline, state.examples, onStepProgress);
    displayResults(result);
    hideProgress();
  } catch (err: any) {
    showToast('Pipeline failed: ' + err.message, 'error');
    hideProgress();
  } finally {
    unregisterProgressObserver(observer);
    state.isRunning = false;
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.innerHTML = '<span class="run-icon">&#9654;</span> Run Pipeline';
    }
  }
}

