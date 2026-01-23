/**
 * Pair utility class for holding two values.
 */
export class Pair<F, S> {
  constructor(
    public readonly first: F,
    public readonly second: S
  ) {}

  equals(other: Pair<F, S>): boolean {
    return this.first === other.first && this.second === other.second;
  }

  toString(): string {
    return `(${this.first}, ${this.second})`;
  }
}
