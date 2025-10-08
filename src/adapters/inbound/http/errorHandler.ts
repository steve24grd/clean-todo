import type { NextFunction, Request, Response } from "express";
import { ApplicationError } from "../../../use-cases/errors/ApplicationError";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApplicationError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
}
