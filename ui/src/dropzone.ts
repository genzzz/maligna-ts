/**
 * Drag-and-drop file upload for .al / .tmx files.
 */

import { state } from './state';

function truncatePreview(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '\n\n... (truncated)';
}

function handleFileUpload(file: File): void {
  const reader = new FileReader();
  reader.onload = () => {
    const content = reader.result as string;
    state.uploadedAlContent = content;

    // Detect format
    const isTmx = content.includes('<tmx') || content.includes('<TMX');
    const format = isTmx ? 'TMX' : 'AL';

    const formatGroup = document.getElementById('upload-format-group');
    if (formatGroup) formatGroup.style.display = '';
    const formatBadge = document.getElementById('upload-format-badge');
    if (formatBadge) formatBadge.textContent = format;

    const previewGroup = document.getElementById('upload-preview-group');
    if (previewGroup) previewGroup.style.display = '';
    const preview = document.getElementById('upload-preview') as HTMLTextAreaElement;
    if (preview) preview.value = truncatePreview(content, 3000);

    const langRow = document.getElementById('upload-lang-row');
    if (langRow) langRow.style.display = isTmx ? '' : 'none';
  };
  reader.readAsText(file);
}

export function initDropzone(): void {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer?.files.length) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files?.length) {
      handleFileUpload(fileInput.files[0]);
    }
  });
}
