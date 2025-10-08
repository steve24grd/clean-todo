import { ApplicationError } from "./ApplicationError";

export class ValidationError extends ApplicationError {
  constructor(msg: string) {
    super(msg, 400);
  }
}
