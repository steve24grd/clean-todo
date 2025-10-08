export class ApplicationError extends Error {
  constructor(public message: string, public status = 400) {
    super(message);
    this.name = new.target.name;
  }
}
