import { Router } from "express";
import type { CreateUserPort } from "../../../../ports/inbound/user/CreateUserPort";
import type { GetUserPort } from "../../../../ports/inbound/user/GetUserPort";

export function buildUserRoutes(
  createUser: CreateUserPort,
  getUser: GetUserPort
) {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const { name, email } = req.body ?? {};
      const out = await createUser.execute({ name, email });
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

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
