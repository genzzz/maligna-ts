/**
 * Browser-side progress observer for the maligna-ts ProgressManager.
 */

import { ProgressMeter, ProgressManager } from 'maligna-ts';
import type { ProgressObserver } from 'maligna-ts';

export interface ProgressEvent {
  type: 'start' | 'update' | 'complete';
  name: string;
  completedTasks: number;
  totalTasks: number;
  progress: number;
}

export type ProgressEventCallback = (event: ProgressEvent) => void;

export class BrowserProgressObserver implements ProgressObserver {
  private callback: ProgressEventCallback;

  constructor(callback: ProgressEventCallback) {
    this.callback = callback;
  }

  registerProgressMeter(progressMeter: ProgressMeter): void {
    this.callback({
      type: 'start',
      name: progressMeter.name,
      completedTasks: 0,
      totalTasks: progressMeter.totalTasks,
      progress: 0,
    });
  }

  completeTask(progressMeter: ProgressMeter): void {
    this.callback({
      type: 'update',
      name: progressMeter.name,
      completedTasks: progressMeter.completedTasks,
      totalTasks: progressMeter.totalTasks,
      progress: progressMeter.progress,
    });
  }

  unregisterProgressMeter(progressMeter: ProgressMeter): void {
    this.callback({
      type: 'complete',
      name: progressMeter.name,
      completedTasks: progressMeter.totalTasks,
      totalTasks: progressMeter.totalTasks,
      progress: 1,
    });
  }
}

export function registerProgressObserver(callback: ProgressEventCallback): BrowserProgressObserver {
  const observer = new BrowserProgressObserver(callback);
  ProgressManager.getInstance().registerProgressObserver(observer);
  return observer;
}

export function unregisterProgressObserver(observer: BrowserProgressObserver): void {
  ProgressManager.getInstance().unregisterProgressObserver(observer);
}
