import { ApplicationError } from "./ApplicationError";

export class NotFoundError extends ApplicationError {
  constructor(msg = "Resource not found") {
    super(msg, 404);
  }
}
