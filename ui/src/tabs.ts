/**
 * Generic tab switching for .tab-bar containers.
 */

export function initTabs(): void {
  document.querySelectorAll('.tab-bar').forEach(bar => {
    bar.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = (tab as HTMLElement).dataset.tab;

        // Deactivate siblings
        bar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show target content
        const parent = bar.parentElement;
        if (!parent) return;
        parent.querySelectorAll(':scope > .tab-content').forEach(tc => {
          tc.classList.remove('active');
        });
        const target = document.getElementById(`tab-${targetTab}`);
        if (target) target.classList.add('active');
      });
    });
  });
}
