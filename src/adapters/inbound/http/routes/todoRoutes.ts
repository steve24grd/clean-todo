import { Router } from "express";
import type { CreateTodoPort } from "../../../../ports/inbound/todo/CreateTodoPort";
import type { ListTodosPort } from "../../../../ports/inbound/todo/ListTodosPort";
import type { CompleteTodoPort } from "../../../../ports/inbound/todo/CompleteTodoPort";

export function buildTodoRoutes(
  createTodo: CreateTodoPort,
  listTodos: ListTodosPort,
  completeTodo: CompleteTodoPort
) {
  const router = Router();

  router.post("/", async (req, res, next) => {
    try {
      const { title, description, ownerId } = req.body ?? {};
      const out = await createTodo.execute({ title, description, ownerId });
      res.status(201).json(out);
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const ownerId = (req.query.ownerId as string) || undefined;
      const out = await listTodos.execute(ownerId);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  router.post("/:id/complete", async (req, res, next) => {
    try {
      const out = await completeTodo.execute(req.params.id);
      res.json(out);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
