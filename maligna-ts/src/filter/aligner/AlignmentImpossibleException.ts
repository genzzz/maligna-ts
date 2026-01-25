/**
 * Exception thrown when alignment is not possible.
 */
export class AlignmentImpossibleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlignmentImpossibleException';
  }
}
