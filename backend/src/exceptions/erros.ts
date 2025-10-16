export class DuplicatedItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicatedItemError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}