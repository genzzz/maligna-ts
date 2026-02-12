import { ProgressMeter } from './ProgressMeter';
import { ProgressObserver } from './ProgressObserver';

/**
 * Represents progress observer that writes progress to a writable stream.
 * Uses dots to indicate progress.
 */
export class WriterProgressObserver implements ProgressObserver {
  static readonly PROGRESS_CHAR = '.';

  private readonly writer: NodeJS.WriteStream | { write(s: string): void };
  private readonly size: number;
  private index = 0;

  constructor(
    writer: NodeJS.WriteStream | { write(s: string): void },
    size: number
  ) {
    this.writer = writer;
    this.size = size;
  }

  completeTask(progressMeter: ProgressMeter): void {
    const newIndex = Math.floor(this.size * progressMeter.progress);
    if (newIndex > this.index) {
      this.updateIndex(newIndex);
    }
  }

  private updateIndex(newIndex: number): void {
    for (; this.index < newIndex; ++this.index) {
      this.write(WriterProgressObserver.PROGRESS_CHAR);
    }
  }

  registerProgressMeter(progressMeter: ProgressMeter): void {
    this.write(
      `${progressMeter.name} [${progressMeter.totalTasks} ops] `
    );
  }

  unregisterProgressMeter(_progressMeter: ProgressMeter): void {
    this.index = 0;
    this.write('\n');
  }

  private write(s: string): void {
    this.writer.write(s);
  }
}
