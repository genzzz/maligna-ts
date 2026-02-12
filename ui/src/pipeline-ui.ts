/**
 * Pipeline step builder — dynamic form generation and config collection.
 * Port of pipeline.js to TypeScript.
 */

let stepCounter = 0;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toggle(id: string, show: boolean): void {
  const el = document.getElementById(id);
  if (el) {
    if (show) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  }
}

function getRadioValue(name: string): string | null {
  const checked = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
  return checked ? checked.value : null;
}

function getCheckedValues(name: string): string[] {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(cb => (cb as HTMLInputElement).value);
}

function getVal(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null;
  return el ? el.value : '';
}

function intVal(id: string, def: number): number {
  const v = parseInt(getVal(id), 10);
  return isNaN(v) ? def : v;
}

function floatVal(id: string, def: number): number {
  const v = parseFloat(getVal(id));
  return isNaN(v) ? def : v;
}

function readFileInput(id: string): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (!input?.files?.length) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsText(input.files[0]);
  });
}

// ─── Step Templates ────────────────────────────────────────────────────────────

function createModifyConfig(stepId: string): string {
  return `
    <div class="form-group">
      <label>Modifier Class</label>
      <select class="select step-class-select" data-step="${stepId}" onchange="window._pipeline.onModifyClassChange('${stepId}')">
        <option value="split-sentence">Split Sentence</option>
        <option value="split-word">Split Word</option>
        <option value="split-paragraph">Split Paragraph</option>
        <option value="trim">Trim</option>
        <option value="lowercase">Lowercase</option>
        <option value="filter-non-words">Filter Non-Words</option>
        <option value="merge">Merge</option>
        <option value="unify-rare-words">Unify Rare Words</option>
      </select>
    </div>
    <div class="form-group">
      <label>Apply To</label>
      <div class="radio-group">
        <label class="radio-option">
          <input type="radio" name="modify-part-${stepId}" value="both" checked>
          <span>Both</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="modify-part-${stepId}" value="source">
          <span>Source</span>
        </label>
        <label class="radio-option">
          <input type="radio" name="modify-part-${stepId}" value="target">
          <span>Target</span>
        </label>
      </div>
    </div>
    <div class="conditional" id="modify-merge-opts-${stepId}">
      <div class="form-group">
        <label>Separator</label>
        <input type="text" class="input" id="modify-separator-${stepId}" value="" placeholder="e.g., \\n or \\t">
      </div>
    </div>
    <div class="conditional" id="modify-rare-opts-${stepId}">
      <div class="form-row">
        <div class="form-group flex-1">
          <label>Max Word Count</label>
          <input type="number" class="input" id="modify-max-words-${stepId}" value="5000">
        </div>
        <div class="form-group flex-1">
          <label>Min Occurrence</label>
          <input type="number" class="input" id="modify-min-occ-${stepId}" value="2">
        </div>
      </div>
    </div>
  `;
}

function createAlignConfig(stepId: string): string {
  return `
    <div class="form-group">
      <label>Algorithm</label>
      <select class="select step-class-select" data-step="${stepId}" onchange="window._pipeline.onAlignClassChange('${stepId}')">
        <option value="viterbi">Viterbi</option>
        <option value="fb">Forward-Backward</option>
        <option value="one-to-one">One-to-One</option>
        <option value="unify">Unify</option>
      </select>
    </div>
    <div class="conditional visible" id="align-hmm-opts-${stepId}">
      <div class="form-group">
        <label>Search Method</label>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="align-search-${stepId}" value="iterative-band" checked onchange="window._pipeline.onSearchChange('${stepId}')">
            <span>Iterative Band</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="align-search-${stepId}" value="band" onchange="window._pipeline.onSearchChange('${stepId}')">
            <span>Band</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="align-search-${stepId}" value="exhaustive" onchange="window._pipeline.onSearchChange('${stepId}')">
            <span>Exhaustive</span>
          </label>
        </div>
      </div>
      <div class="conditional visible" id="align-band-opts-${stepId}">
        <div class="form-row">
          <div class="form-group flex-1">
            <label>Band Radius</label>
            <input type="number" class="input" id="align-radius-${stepId}" value="20">
          </div>
          <div class="form-group flex-1 conditional visible" id="align-iterative-opts-${stepId}">
            <label>Increment Ratio</label>
            <input type="number" class="input" id="align-increment-${stepId}" value="1.5" step="0.1">
          </div>
          <div class="form-group flex-1 conditional visible" id="align-margin-group-${stepId}">
            <label>Min Margin</label>
            <input type="number" class="input" id="align-margin-${stepId}" value="5">
          </div>
        </div>
      </div>
      <div class="form-group">
        <label>Calculators</label>
        <div class="checkbox-group">
          <label class="checkbox-option">
            <input type="checkbox" name="align-calc-${stepId}" value="normal" checked onchange="window._pipeline.onCalcChange('${stepId}')">
            <span>Normal</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" name="align-calc-${stepId}" value="poisson" onchange="window._pipeline.onCalcChange('${stepId}')">
            <span>Poisson</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" name="align-calc-${stepId}" value="translation" onchange="window._pipeline.onCalcChange('${stepId}')">
            <span>Translation</span>
          </label>
          <label class="checkbox-option">
            <input type="checkbox" name="align-calc-${stepId}" value="oracle" onchange="window._pipeline.onCalcChange('${stepId}')">
            <span>Oracle</span>
          </label>
        </div>
      </div>
      <div class="conditional visible" id="align-counter-opts-${stepId}">
        <div class="form-group">
          <label>Counter</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" name="align-counter-${stepId}" value="char" checked>
              <span>Char</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="align-counter-${stepId}" value="word">
              <span>Word</span>
            </label>
          </div>
        </div>
      </div>
      <div class="conditional" id="align-translation-opts-${stepId}">
        <div class="form-group">
          <label>Translation Corpus (.al)</label>
          <input type="file" class="input" id="align-translation-corpus-${stepId}" accept=".al,.xml">
        </div>
        <div class="form-group">
          <label>EM Iterations</label>
          <input type="number" class="input input-sm" id="align-iterations-${stepId}" value="4" min="1">
        </div>
      </div>
      <div class="conditional" id="align-oracle-opts-${stepId}">
        <div class="form-group">
          <label>Oracle Reference (.al)</label>
          <input type="file" class="input" id="align-oracle-corpus-${stepId}" accept=".al,.xml">
        </div>
      </div>
      <div class="form-group">
        <label>Category Map</label>
        <div class="radio-group">
          <label class="radio-option">
            <input type="radio" name="align-catmap-${stepId}" value="best" checked>
            <span>Best (Default)</span>
          </label>
          <label class="radio-option">
            <input type="radio" name="align-catmap-${stepId}" value="moore">
            <span>Moore</span>
          </label>
        </div>
      </div>
    </div>
    <div class="conditional" id="align-onetoone-opts-${stepId}">
      <div class="form-group">
        <label class="checkbox-option">
          <input type="checkbox" id="align-strict-${stepId}">
          <span>Strict one-to-one</span>
        </label>
      </div>
    </div>
    <div class="conditional" id="align-unify-opts-${stepId}">
      <div class="form-group">
        <label>Unification Reference (.al)</label>
        <input type="file" class="input" id="align-unify-corpus-${stepId}" accept=".al,.xml">
      </div>
    </div>
  `;
}

function createSelectConfig(stepId: string): string {
  return `
    <div class="form-group">
      <label>Selector Class</label>
      <select class="select step-class-select" data-step="${stepId}" onchange="window._pipeline.onSelectClassChange('${stepId}')">
        <option value="one-to-one">One-to-One</option>
        <option value="fraction">Fraction (Top N%)</option>
        <option value="probability">Probability Threshold</option>
        <option value="intersection">Intersection</option>
        <option value="difference">Difference</option>
      </select>
    </div>
    <div class="conditional" id="select-fraction-opts-${stepId}">
      <div class="form-group">
        <label>Fraction</label>
        <div class="slider-container">
          <input type="range" min="0" max="1" step="0.01" value="0.5"
            id="select-fraction-${stepId}"
            oninput="document.getElementById('select-fraction-val-${stepId}').textContent = this.value">
          <span class="slider-value" id="select-fraction-val-${stepId}">0.5</span>
        </div>
      </div>
    </div>
    <div class="conditional" id="select-probability-opts-${stepId}">
      <div class="form-group">
        <label>Probability Threshold</label>
        <div class="slider-container">
          <input type="range" min="0" max="1" step="0.01" value="0.5"
            id="select-probability-${stepId}"
            oninput="document.getElementById('select-probability-val-${stepId}').textContent = this.value">
          <span class="slider-value" id="select-probability-val-${stepId}">0.5</span>
        </div>
      </div>
    </div>
    <div class="conditional" id="select-ref-opts-${stepId}">
      <div class="form-group">
        <label>Reference Alignment (.al)</label>
        <input type="file" class="input" id="select-ref-${stepId}" accept=".al,.xml">
      </div>
    </div>
  `;
}

function createMacroConfig(stepId: string): string {
  return `
    <div class="form-group">
      <label>Macro</label>
      <select class="select step-class-select" data-step="${stepId}">
        <option value="galechurch">Gale &amp; Church</option>
        <option value="poisson">Poisson</option>
        <option value="moore">Moore</option>
        <option value="translation">Translation</option>
        <option value="poisson-translation">Poisson + Translation</option>
      </select>
    </div>
    <p class="dim" style="font-size: 0.75rem; padding: 4px 0;">
      Macros run a complete predefined pipeline internally.
      No additional configuration needed.
    </p>
  `;
}

// ─── Step CRUD ─────────────────────────────────────────────────────────────────

function updateStepLabel(stepId: string): void {
  const el = document.getElementById(stepId);
  if (!el) return;
  const select = el.querySelector('.step-class-select') as HTMLSelectElement | null;
  const label = document.getElementById(`${stepId}-label`);
  if (select && label) {
    label.textContent = select.options[select.selectedIndex].text;
  }
}

export function createStep(type: string, presetClass?: string): string | null {
  const stepId = `step-${++stepCounter}`;
  const typeLabels: Record<string, string> = {
    modify: 'Modify',
    align: 'Align',
    select: 'Select',
    macro: 'Macro',
  };

  let configHtml: string;
  switch (type) {
    case 'modify': configHtml = createModifyConfig(stepId); break;
    case 'align': configHtml = createAlignConfig(stepId); break;
    case 'select': configHtml = createSelectConfig(stepId); break;
    case 'macro': configHtml = createMacroConfig(stepId); break;
    default: return null;
  }

  const stepEl = document.createElement('div');
  stepEl.className = `pipeline-step step-${type}`;
  stepEl.id = stepId;
  stepEl.dataset.type = type;
  stepEl.innerHTML = `
    <div class="step-header" onclick="window._pipeline.toggleStep('${stepId}')">
      <div class="step-title">
        <span class="step-badge">${typeLabels[type]}</span>
        <span class="step-class" id="${stepId}-label">${presetClass || '...'}</span>
      </div>
      <div class="step-actions">
        <button class="step-btn" onclick="event.stopPropagation(); window._pipeline.moveStep('${stepId}', -1)" title="Move up">&#9650;</button>
        <button class="step-btn" onclick="event.stopPropagation(); window._pipeline.moveStep('${stepId}', 1)" title="Move down">&#9660;</button>
        <button class="step-btn step-btn-delete" onclick="event.stopPropagation(); window._pipeline.removeStep('${stepId}')" title="Remove">&#10005;</button>
      </div>
    </div>
    <div class="step-body" id="${stepId}-body">
      ${configHtml}
    </div>
  `;

  const container = document.getElementById('pipeline-steps');
  const emptyMsg = document.getElementById('pipeline-empty');
  if (emptyMsg) emptyMsg.style.display = 'none';
  container?.appendChild(stepEl);

  // Set preset class if provided
  if (presetClass) {
    const select = stepEl.querySelector('.step-class-select') as HTMLSelectElement | null;
    if (select) {
      select.value = presetClass;
      select.dispatchEvent(new Event('change'));
    }
  }

  updateStepLabel(stepId);
  return stepId;
}

export function removeStep(stepId: string): void {
  const el = document.getElementById(stepId);
  if (el) el.remove();
  const container = document.getElementById('pipeline-steps');
  const emptyMsg = document.getElementById('pipeline-empty');
  if (emptyMsg && container && container.children.length <= 1) {
    emptyMsg.style.display = '';
  }
}

export function moveStep(stepId: string, direction: number): void {
  const el = document.getElementById(stepId);
  if (!el) return;
  const container = document.getElementById('pipeline-steps');
  if (!container) return;
  if (direction === -1 && el.previousElementSibling && el.previousElementSibling.id !== 'pipeline-empty') {
    container.insertBefore(el, el.previousElementSibling);
  } else if (direction === 1 && el.nextElementSibling) {
    container.insertBefore(el.nextElementSibling, el);
  }
}

export function toggleStep(stepId: string): void {
  const body = document.getElementById(`${stepId}-body`);
  if (body) body.classList.toggle('collapsed');
}

export function clearAll(): void {
  const container = document.getElementById('pipeline-steps');
  const emptyMsg = document.getElementById('pipeline-empty');
  if (!container) return;
  Array.from(container.children).forEach(child => {
    if ((child as HTMLElement).id !== 'pipeline-empty') child.remove();
  });
  if (emptyMsg) emptyMsg.style.display = '';
}

// ─── Conditional Visibility ────────────────────────────────────────────────────

export function onModifyClassChange(stepId: string): void {
  updateStepLabel(stepId);
  const el = document.getElementById(stepId);
  if (!el) return;
  const cls = (el.querySelector('.step-class-select') as HTMLSelectElement).value;
  toggle(`modify-merge-opts-${stepId}`, cls === 'merge');
  toggle(`modify-rare-opts-${stepId}`, cls === 'unify-rare-words');
}

export function onAlignClassChange(stepId: string): void {
  updateStepLabel(stepId);
  const el = document.getElementById(stepId);
  if (!el) return;
  const cls = (el.querySelector('.step-class-select') as HTMLSelectElement).value;
  const isHmm = cls === 'viterbi' || cls === 'fb';
  toggle(`align-hmm-opts-${stepId}`, isHmm);
  toggle(`align-onetoone-opts-${stepId}`, cls === 'one-to-one');
  toggle(`align-unify-opts-${stepId}`, cls === 'unify');
}

export function onSearchChange(stepId: string): void {
  const search = getRadioValue(`align-search-${stepId}`);
  const isBand = search === 'band' || search === 'iterative-band';
  const isIterative = search === 'iterative-band';
  toggle(`align-band-opts-${stepId}`, isBand);
  toggle(`align-iterative-opts-${stepId}`, isIterative);
  toggle(`align-margin-group-${stepId}`, isIterative);
}

export function onCalcChange(stepId: string): void {
  const calcs = getCheckedValues(`align-calc-${stepId}`);
  const needsCounter = calcs.includes('normal') || calcs.includes('poisson');
  const needsTranslation = calcs.includes('translation');
  const needsOracle = calcs.includes('oracle');
  toggle(`align-counter-opts-${stepId}`, needsCounter);
  toggle(`align-translation-opts-${stepId}`, needsTranslation);
  toggle(`align-oracle-opts-${stepId}`, needsOracle);
}

export function onSelectClassChange(stepId: string): void {
  updateStepLabel(stepId);
  const el = document.getElementById(stepId);
  if (!el) return;
  const cls = (el.querySelector('.step-class-select') as HTMLSelectElement).value;
  toggle(`select-fraction-opts-${stepId}`, cls === 'fraction');
  toggle(`select-probability-opts-${stepId}`, cls === 'probability');
  toggle(`select-ref-opts-${stepId}`, cls === 'intersection' || cls === 'difference');
}

// ─── Config Collection ─────────────────────────────────────────────────────────

interface StepConfig {
  type: string;
  config: Record<string, any>;
  stepId: string;
}

function collectStepConfig(stepEl: HTMLElement): StepConfig {
  const type = stepEl.dataset.type!;
  const cls = (stepEl.querySelector('.step-class-select') as HTMLSelectElement).value;
  const stepId = stepEl.id;

  const config: Record<string, any> = { class: cls };

  switch (type) {
    case 'modify': {
      config.part = getRadioValue(`modify-part-${stepId}`);
      if (cls === 'merge') {
        config.separator = getVal(`modify-separator-${stepId}`) || '';
      }
      if (cls === 'unify-rare-words') {
        config.maxWordCount = intVal(`modify-max-words-${stepId}`, 5000);
        config.minOccurrenceCount = intVal(`modify-min-occ-${stepId}`, 2);
      }
      break;
    }
    case 'align': {
      if (cls === 'viterbi' || cls === 'fb') {
        config.search = getRadioValue(`align-search-${stepId}`);
        config.radius = intVal(`align-radius-${stepId}`, 20);
        config.increment = floatVal(`align-increment-${stepId}`, 1.5);
        config.margin = intVal(`align-margin-${stepId}`, 5);
        config.calculators = getCheckedValues(`align-calc-${stepId}`);
        config.counter = getRadioValue(`align-counter-${stepId}`);
        config.categoryMap = getRadioValue(`align-catmap-${stepId}`);
        config.iterations = intVal(`align-iterations-${stepId}`, 4);
      } else if (cls === 'one-to-one') {
        const strictEl = document.getElementById(`align-strict-${stepId}`) as HTMLInputElement | null;
        config.strict = strictEl ? strictEl.checked : false;
      }
      break;
    }
    case 'select': {
      if (cls === 'fraction') {
        config.fraction = floatVal(`select-fraction-${stepId}`, 0.5);
      } else if (cls === 'probability') {
        config.probability = floatVal(`select-probability-${stepId}`, 0.5);
      }
      break;
    }
    case 'macro': {
      // No additional config needed
      break;
    }
  }

  return { type, config, stepId };
}

export async function collectAllConfigs(): Promise<Array<{ type: string; config: Record<string, any> }>> {
  const container = document.getElementById('pipeline-steps');
  if (!container) return [];

  const stepEls = Array.from(container.querySelectorAll('.pipeline-step')) as HTMLElement[];
  const steps: Array<{ type: string; config: Record<string, any> }> = [];

  for (const stepEl of stepEls) {
    const step = collectStepConfig(stepEl);

    // Read file inputs
    if (step.type === 'align') {
      if (step.config.calculators?.includes('translation')) {
        step.config.translationCorpusContent = await readFileInput(`align-translation-corpus-${step.stepId}`);
      }
      if (step.config.calculators?.includes('oracle')) {
        step.config.oracleContent = await readFileInput(`align-oracle-corpus-${step.stepId}`);
      }
      if (step.config.class === 'unify') {
        step.config.unificationContent = await readFileInput(`align-unify-corpus-${step.stepId}`);
      }
    }
    if (step.type === 'select' && (step.config.class === 'intersection' || step.config.class === 'difference')) {
      step.config.referenceContent = await readFileInput(`select-ref-${step.stepId}`);
    }

    steps.push({ type: step.type, config: step.config });
  }

  return steps;
}

// ─── Presets ───────────────────────────────────────────────────────────────────

export function applyPreset(macroName: string): void {
  clearAll();
  switch (macroName) {
    case 'galechurch':
      createStep('modify', 'split-sentence');
      createStep('modify', 'trim');
      createStep('macro', 'galechurch');
      break;
    case 'poisson':
      createStep('modify', 'split-sentence');
      createStep('modify', 'trim');
      createStep('macro', 'poisson');
      break;
    case 'moore':
      createStep('modify', 'split-sentence');
      createStep('modify', 'trim');
      createStep('macro', 'moore');
      break;
    case 'translation':
      createStep('modify', 'split-sentence');
      createStep('modify', 'trim');
      createStep('macro', 'translation');
      break;
    case 'poisson-translation':
      createStep('modify', 'split-sentence');
      createStep('modify', 'trim');
      createStep('macro', 'poisson-translation');
      break;
  }
}

// ─── Global API (for inline onclick handlers) ──────────────────────────────────

// Expose pipeline functions on window for inline HTML event handlers
declare global {
  interface Window {
    _pipeline: typeof pipelineApi;
  }
}

const pipelineApi = {
  createStep,
  removeStep,
  moveStep,
  toggleStep,
  clearAll,
  collectAllConfigs,
  applyPreset,
  onModifyClassChange,
  onAlignClassChange,
  onSearchChange,
  onCalcChange,
  onSelectClassChange,
};

window._pipeline = pipelineApi;
