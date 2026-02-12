import { ProgressManager } from './ProgressManager';

/**
 * Represents progress meter. Processes inform it about task progress,
 * and it notifies its observers via ProgressManager.
 *
 * To improve performance observers are not notified of every completed task;
 * maximum number of notifications is controlled by steps parameter.
 */
export class ProgressMeter {
  static readonly DEFAULT_STEPS = 1000;

  private readonly _name: string;
  private readonly _totalTasks: number;
  private _completedTasks = 0;
  private _reportedSteps = 0;
  private readonly _tasksPerStep: number;

  constructor(name: string, totalTasks: number, steps = ProgressMeter.DEFAULT_STEPS) {
    this._name = name;
    this._totalTasks = totalTasks;
    if (steps <= totalTasks) {
      this._tasksPerStep = totalTasks / steps;
    } else {
      this._tasksPerStep = 1;
    }
  }

  completeTask(): void {
    this.completeTasks(1);
  }

  completeTasks(tasks: number): void {
    this._completedTasks += tasks;
    const currentSteps = Math.floor(this._completedTasks / this._tasksPerStep);
    if (currentSteps > this._reportedSteps || this._completedTasks >= this._totalTasks) {
      this._reportedSteps = currentSteps;
      ProgressManager.getInstance().completeTask(this);
    }
  }

  get totalTasks(): number {
    return this._totalTasks;
  }

  get completedTasks(): number {
    return this._completedTasks;
  }

  get progress(): number {
    if (this._totalTasks > 0) {
      return this._completedTasks / this._totalTasks;
    }
    return 0;
  }

  get name(): string {
    return this._name;
  }
}
