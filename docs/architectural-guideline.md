## Clean Todo Architecture Guide

This document prescribes how this codebase is organized and how to extend it while preserving Clean Architecture (Hexagonal / Ports & Adapters) principles.

---

## 1) Architecture Overview

- Pattern: Clean Architecture (Hexagonal, Ports & Adapters)
- Direction: Dependencies point inward. Outer layers (web, DB) depend on inner layers (use cases, domain), never the reverse.
- Runtime: Bun + TypeScript + Express 5 for HTTP
- Persistence strategies:
  - In-memory (default) → v1 endpoints
  - Prisma/SQLite → mounted side-by-side as v2 endpoints

---

## 2) Project Structure

- src/
  - domain/ — Enterprise business rules (entities, invariants). No external deps.
  - use-cases/ — Application business rules. Implements inbound ports.
  - ports/
    - inbound/ — Interfaces for use case operations (what the app can do)
    - outbound/ — Interfaces for external dependencies (repositories)
  - adapters/
    - inbound/http/ — Express route factories and error handling
    - outbound/persistence/ — Repository implementations (InMemory..., Prisma...)
  - shared/ — Generic helpers (e.g., ID factory)
  - container.ts — DI wiring for in-memory adapters
  - container.prisma.ts — DI wiring for Prisma adapters
  - main.ts — Express app bootstrap, mounts v1 and v2 routes
- prisma/
  - schema.prisma — Prisma schema for SQLite
  - migrations/ — Applied database migrations
- tests/
  - prisma.usecases.test.ts — Integration-style tests for Prisma-backed use cases
- docs/ — Additional internal docs

---

## 3) Layer Responsibilities

- Domain (src/domain)
  - Owns core entities and invariants (e.g., Todo, User)
  - No dependencies on other layers or libraries
- Ports (src/ports)
  - Inbound ports: define use case contracts (InputDTO/OutputDTO/execute)
  - Outbound ports: define repository contracts (e.g., UserRepository)
- Use Cases (src/use-cases)
  - Implement inbound ports
  - Orchestrate domain logic and call outbound ports
  - Map domain objects to DTOs (InputDTO/OutputDTO types from ports)
- Adapters (src/adapters)
  - Inbound adapters: HTTP route factories that parse/validate requests and call use cases
  - Outbound adapters: Repository implementations (in-memory or Prisma)
- Composition (src/container*.ts)
  - Wire concrete adapters to ports and expose use cases
- Presentation (src/main.ts)
  - Launches server, mounts routes, registers error handler

---

## 4) Data Flow

Request → Express Route (inbound adapter) → Use Case (implements inbound port) → Repository Interface (outbound port) → Repository Impl (in-memory or Prisma) → DB (for Prisma) → back through the layers → JSON response.

Example (v2 Prisma routes in main.ts):
````ts path=src/main.ts mode=EXCERPT
app.use(
  "/v2/todos",
  buildTodoRoutes(
    prismaContainer.ports.inbound.createTodo,
    prismaContainer.ports.inbound.listTodos,
    prismaContainer.ports.inbound.completeTodo
  )
);
````

---

## 5) Dependency Rules

- Domain depends on nothing
- Use cases depend on:
  - Domain entities
  - Port interfaces (inbound and outbound)
- Adapters depend on:
  - Port interfaces
  - Frameworks (Express, Prisma)
- Containers compose concrete adapters into use cases
- Presentation (main.ts) depends on containers and HTTP adapters

Prohibited:
- Domain importing from use-cases/adapters
- Use-cases importing from adapters/frameworks
- Ports importing from adapters/frameworks

---

## 6) Naming Conventions

- Inbound ports: VerbNounPort.ts with namespaced InputDTO/OutputDTO types
````ts path=src/ports/inbound/user/CreateUserPort.ts mode=EXCERPT
export namespace CreateUserPort {
  export type InputDTO = { name: string; email: string };
  export type OutputDTO = { id: string; name: string; email: string };
}
export interface CreateUserPort {
  execute(input: CreateUserPort.InputDTO): Promise<CreateUserPort.OutputDTO>;
}
````
- Use cases: class VerbNoun implements VerbNounPort (e.g., CreateUser, ListTodos)
- Repositories (ports): NounRepository.ts (e.g., UserRepository)
- Repository implementations (adapters): InMemoryNounRepository, PrismaNounRepository
- Route factories: buildNounRoutes (e.g., buildTodoRoutes)
- Containers: buildContainer (in-memory), buildPrismaContainer (Prisma)
- IDs: newId() in shared/Id.ts

---

## 7) Technology Stack

- Runtime: Bun
- Language/Types: TypeScript
- Web: Express 5
- ORM: Prisma
- DB: SQLite
- Tests: bun test
- Error handling: ApplicationError, NotFoundError, ValidationError
- DI: Manual via container factories (no DI framework)
- Prisma Client management: Lightweight singleton with graceful shutdown

---

## 8) Design Patterns in Use

- Ports & Adapters (Hexagonal)
- Repository Pattern (outbound ports + adapter implementations)
- Dependency Injection via container factory functions
- Factory functions for HTTP routes (buildXRoutes)
- Domain Entities encapsulating invariants and behavior
- Error taxonomy with ApplicationError hierarchy
- Singleton wrapper for Prisma client

---

## 9) API Conventions

- Base health check: GET /health → { ok: true }
- Resources:
  - Users:
    - POST /users (v1) and POST /v2/users (v2)
    - GET /users/:id (v1) and GET /v2/users/:id (v2)
  - Todos:
    - POST /todos and POST /v2/todos
    - GET /todos and GET /v2/todos
      - Optional query: ?ownerId=<userId>
    - POST /todos/:id/complete and POST /v2/todos/:id/complete
- Versioning:
  - v1 endpoints use in-memory repositories
  - v2 endpoints use Prisma-backed repositories
  - Introduce new persistence-backed APIs under /v2 (or future /v3) to run side-by-side
- HTTP semantics:
  - 201 Created on successful POST creation
  - JSON responses
  - Error responses: { error: string } via centralized error handler
````ts path=src/adapters/inbound/http/errorHandler.ts mode=EXCERPT
if (err instanceof ApplicationError) {
  res.status(err.status).json({ error: err.message });
  return;
}
res.status(500).json({ error: "Internal Server Error" });
````

---

## 10) Database Strategy

- In-memory (default) for quick development and pure use-case tests
  - Implementations: InMemoryUserRepository, InMemoryTodoRepository
  - Container: buildContainer
- Prisma/SQLite for persistence
  - Schema: prisma/schema.prisma
  - Container: buildPrismaContainer
  - Routes: mounted under /v2/* to coexist with v1
  - Typical mapping strategy:
````ts path=src/adapters/outbound/persistence/PrismaTodoRepository.ts mode=EXCERPT
function rowToDomain(r: { id: string; title: string; ... }): Todo {
  return new Todo(r.id, r.title, r.description ?? null, r.ownerId ?? null,
                  r.isCompleted, r.createdAt, r.completedAt ?? undefined);
}
````
- Prisma schema shape (excerpt):
````prisma path=prisma/schema.prisma mode=EXCERPT
model User {
  id    String @id
  name  String
  email String @unique
  todos Todo[]
}
````
- Operations:
  - Generate client: bun run prisma:generate
  - Apply migration: bun run prisma:migrate
  - Inspect data: bun run prisma:studio

When to use which:
- In-memory for fast iteration, workshops, domain/use-case unit tests
- Prisma/SQLite for integration tests, realistic persistence, or shipping features that must persist data

---

## 11) Testing Strategy

- Unit (fast, isolated)
  - Domain entities (e.g., Todo.complete throws when already completed)
  - Use cases (mock repositories, verify business flow and DTO mapping)
- Integration (adapter + real dependencies)
  - Prisma repositories + use cases against a temporary SQLite DB
  - Example:
````ts path=tests/prisma.usecases.test.ts mode=EXCERPT
const userRepo = new PrismaUserRepository();
const createUser = new CreateUser(userRepo, newId);
const getUser = new GetUser(userRepo);
const created = await createUser.execute({ name, email });
expect(await getUser.execute(created.id)).toEqual(created);
````
- E2E (optional, not yet present)
  - Run Express server and hit HTTP endpoints with a client (e.g., supertest)
- Conventions
  - Prefer smallest scope that gives confidence (unit → integration → e2e)
  - Clear DB state before/after integration tests (see beforeAll in test)
  - Assert on DTOs (port OutputDTOs), not internal entity shapes

---

## 12) Extension Guidelines

Follow this checklist to add features while preserving architecture:

A. New Use Case (e.g., DeleteTodo)
1) Define inbound port
   - Create src/ports/inbound/todo/DeleteTodoPort.ts with namespaced InputDTO/OutputDTO
2) Implement use case
   - Add src/use-cases/todo/DeleteTodo.ts implementing DeleteTodoPort
   - Use outbound ports only; map to Output DTOs
3) Verify outbound ports
   - If repos need new capability, evolve src/ports/outbound/* (e.g., deleteById)
4) Implement adapters
   - In-memory: InMemoryTodoRepository implements new method(s)
   - Prisma: PrismaTodoRepository implements new method(s)
5) Wire containers
   - Add to src/container.ts and src/container.prisma.ts
6) Add routes
   - Update src/adapters/inbound/http/routes/todoRoutes.ts with a new handler using the injected port
7) Tests
   - Unit test the use case (mock repos)
   - Integration test Prisma path (like tests/prisma.usecases.test.ts style)
8) Documentation
   - If endpoint is persistent, mount under /v2 in main.ts; keep v1 if needed

B. API Endpoint Rules
- Keep routes thin: parse inputs, call use-case, return outputs
- Use route factory pattern and DI:
````ts path=src/adapters/inbound/http/routes/todoRoutes.ts mode=EXCERPT
export function buildTodoRoutes(createTodo, listTodos, completeTodo) {
  const router = Router();
  router.post("/", async (req, res, next) => { /* call use case */ });
  return router;
}
````
- Use 201 status for Creations; return JSON; delegate errors to errorHandler

C. Persistence Evolution
- For Prisma-backed features:
  - Update prisma/schema.prisma
  - bun run prisma:migrate (create migration)
  - bun run prisma:generate (refresh client)
  - Implement repository changes in Prisma adapters
  - Add or adjust v2 endpoints
- Keep row-to-domain mapping localized to adapters

D. Dependency Discipline (Do/Don’t)
- Do: have adapters depend on ports and frameworks
- Do: keep use-cases free of Express/Prisma imports
- Don’t: import adapters from use-cases or domain
- Don’t: return domain entities directly to HTTP; use port OutputDTOs

E. Naming/Placement Checklist
- Ports: src/ports/inbound|outbound with VerbNounPort / NounRepository
- Use Cases: src/use-cases/<area>/VerbNoun.ts
- Adapters:
  - inbound/http/routes/<area>Routes.ts
  - outbound/persistence/<Impl>Repository.ts
- Containers: add use case to both container.ts and container.prisma.ts
- Main: mount under /v1 (default) or /v2 (Prisma-backed)

---

## Appendix: Quick References

- Start dev server: bun run dev
- Prisma:
  - bun run prisma:generate
  - bun run prisma:migrate
  - bun run prisma:studio
- Health check: GET /health → { ok: true }

By following these guidelines, future development will remain testable, maintainable, and consistent with Clean Architecture.
