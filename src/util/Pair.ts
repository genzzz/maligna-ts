/**
 * Simple generic pair type.
 */
export interface Pair<A, B> {
  first: A;
  second: B;
}

export function pair<A, B>(first: A, second: B): Pair<A, B> {
  return { first, second };
}
