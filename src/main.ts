// imports
import express from "express";
import { buildContainer } from "./container";
import { buildUserRoutes } from "./adapters/inbound/http/routes/userRoutes";
import { buildTodoRoutes } from "./adapters/inbound/http/routes/todoRoutes";
import { errorHandler } from "./adapters/inbound/http/errorHandler";

// express init
const app = express(); // instantiate core object
app.use(express.json()); // register JSON parser middleware

const container = buildContainer(); // dependency injection container

// register routes
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(
  "/users",
  buildUserRoutes( // Passes inbound ports (use cases) to the route builder
    container.ports.inbound.createUser, // Handles user creation logic
    container.ports.inbound.getUser // Handles user retrieval logic
  )
);

app.use(
  "/todos",
  buildTodoRoutes( // Passes three inbound ports to the route builder
    container.ports.inbound.createTodo, // Handles todo creation logic
    container.ports.inbound.listTodos, // Handles listing todos
    container.ports.inbound.completeTodo // Handles marking todos as complete
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
