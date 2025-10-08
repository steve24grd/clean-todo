import express from "express";
import { buildContainer } from "./container";
import { buildUserRoutes } from "./adapters/inbound/http/routes/userRoutes";
import { buildTodoRoutes } from "./adapters/inbound/http/routes/todoRoutes";
import { errorHandler } from "./adapters/inbound/http/errorHandler";

const app = express();
app.use(express.json());

const container = buildContainer();

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  "/users",
  buildUserRoutes(
    container.ports.inbound.createUser,
    container.ports.inbound.getUser
  )
);

app.use(
  "/todos",
  buildTodoRoutes(
    container.ports.inbound.createTodo,
    container.ports.inbound.listTodos,
    container.ports.inbound.completeTodo
  )
);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTTP server listening on http://localhost:${PORT}`);
});
