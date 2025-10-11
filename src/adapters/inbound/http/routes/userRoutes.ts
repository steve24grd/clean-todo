// creates a modular, mountable route handler
import { Router } from "express";

// Import port interfaces to use as types
import type { CreateUserPort } from "../../../../ports/inbound/user/CreateUserPort";
import type { GetUserPort } from "../../../../ports/inbound/user/GetUserPort";

/*
Routes are decoupled from business logic; 
- they only handle HTTP concerns (parsing requests, formatting responses)
- Business logic lives in use cases (implementations of the ports)
- This separation allows you to swap HTTP 
for GraphQL, gRPC, CLI, etc., without changing business logic
*/

/*
Factory Function Pattern:
- Dependency Injection - accepts port implementations as parameters
- Returns a configured Express router
- Enables testability - you can inject mock implementations in tests
- Follows Hexagonal Architecture - the adapter (routes) depends on ports, 
not concrete use cases
*/
export function buildUserRoutes(
  createUser: CreateUserPort, // receiving interface type
  getUser: GetUserPort // receiving interface type
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
