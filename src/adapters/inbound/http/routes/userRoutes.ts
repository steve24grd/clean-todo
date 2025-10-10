import { Router } from "express";
import type { CreateUserPort } from "../../../../ports/inbound/user/CreateUserPort";
import type { GetUserPort } from "../../../../ports/inbound/user/GetUserPort";

/*
Routes are decoupled from business logic; 
they only handle HTTP concerns (parsing requests, formatting responses)
*/

export function buildUserRoutes(
  createUser: CreateUserPort,
  getUser: GetUserPort
) {
  const router = Router();

  // Create a new user (expects { name, email } in body)
  router.post("/", async (req, res, next) => {
    try {
      const { name, email } = req.body ?? {};
      const out = await createUser.execute({ name, email });
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  // Get a user by ID
  router.get("/:id", async (req, res, next) => {
    try {
      const out = await getUser.execute(req.params.id);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
