import { ProgressMeter } from './ProgressMeter';

/**
 * Represents progress observer that listens to progress events.
 */
export interface ProgressObserver {
  /**
   * Occurs when a progress meter is registered, at the beginning of a process.
   */
  registerProgressMeter(progressMeter: ProgressMeter): void;

  /**
   * Occurs when tasks are completed. Not every completed task may trigger
   * this event; number of notifications can be lower than actual tasks.
   */
  completeTask(progressMeter: ProgressMeter): void;

  /**
   * Occurs when a progress meter is unregistered, at the end of a process.
   */
  unregisterProgressMeter(progressMeter: ProgressMeter): void;
}
