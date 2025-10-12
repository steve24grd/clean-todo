// imports
import express from "express";
import { buildContainer } from "./container";
import { buildUserRoutes } from "./adapters/inbound/http/routes/userRoutes";
import { buildTodoRoutes } from "./adapters/inbound/http/routes/todoRoutes";
import { errorHandler } from "./adapters/inbound/http/errorHandler";
import { buildPrismaContainer } from "./container.prisma";

// express init
const app = express(); // instantiate core object
app.use(express.json()); // register JSON parser middleware

const container = buildContainer(); // dependency injection container
const prismaContainer = buildPrismaContainer(); // dependency injection container (Prisma-backed)

// register routes
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  "/users",
  buildUserRoutes( // Passes use-case (inbound + outbound ports implementation)
    container.ports.inbound.createUser, // Handles user creation logic
    container.ports.inbound.getUser // Handles user retrieval logic
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

// Prisma-backed v2 routes (additional endpoints)
app.use(
  "/v2/users",
  buildUserRoutes(
    prismaContainer.ports.inbound.createUser,
    prismaContainer.ports.inbound.getUser
  )
);

app.use(
  "/v2/todos",
  buildTodoRoutes(
    prismaContainer.ports.inbound.createTodo,
    prismaContainer.ports.inbound.listTodos,
    prismaContainer.ports.inbound.completeTodo
  )
);

/*
Global Error Handler Registration
- Catches all errors thrown by route handlers or middleware
- Must be registered AFTER all routes 
(Express processes middleware in order)
- If error is ApplicationError (custom business error): Returns appropriate HTTP status with error message
- Otherwise: Logs the error and returns 500 Internal Server Error
- Prevents unhandled errors from crashing the server and provides consistent error responses
*/
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Starts the HTTP server
// Begins listening for incoming HTTP requests
app.listen(PORT, () => { // Binds to the specified por
  console.log(`HTTP server listening on http://localhost:${PORT}`);
});
