import { ProgressMeter } from './ProgressMeter';
import { ProgressObserver } from './ProgressObserver';

/**
 * Represents manager for all tasks in progress and their observers. Singleton.
 */
export class ProgressManager {
  private static instance = new ProgressManager();

  private progressMeterMap = new Map<string, ProgressMeter>();
  private progressObserverList: ProgressObserver[] = [];

  static getInstance(): ProgressManager {
    return ProgressManager.instance;
  }

  private constructor() {}

  getProgressMeter(name: string): ProgressMeter {
    const progressMeter = this.progressMeterMap.get(name);
    if (!progressMeter) {
      throw new Error(`Progress meter: ${name} does not exist.`);
    }
    return progressMeter;
  }

  registerProgressMeter(progressMeter: ProgressMeter): void {
    if (this.progressMeterMap.has(progressMeter.name)) {
      throw new Error(`Progress meter: ${progressMeter.name} already exists.`);
    }
    this.progressMeterMap.set(progressMeter.name, progressMeter);
    for (const observer of this.progressObserverList) {
      observer.registerProgressMeter(progressMeter);
    }
  }

  unregisterProgressMeter(progressMeter: ProgressMeter): void {
    if (!this.progressMeterMap.delete(progressMeter.name)) {
      throw new Error(`Progress meter: ${progressMeter.name} does not exist.`);
    }
    for (const observer of this.progressObserverList) {
      observer.unregisterProgressMeter(progressMeter);
    }
  }

  completeTask(progressMeter: ProgressMeter): void {
    for (const observer of this.progressObserverList) {
      observer.completeTask(progressMeter);
    }
  }

  registerProgressObserver(progressObserver: ProgressObserver): void {
    this.progressObserverList.push(progressObserver);
  }

  unregisterProgressObserver(progressObserver: ProgressObserver): void {
    const index = this.progressObserverList.indexOf(progressObserver);
    if (index === -1) {
      throw new Error(`Unknown observer ${progressObserver}`);
    }
    this.progressObserverList.splice(index, 1);
  }

  getProgressObserverList(): ProgressObserver[] {
    return this.progressObserverList;
  }
}
