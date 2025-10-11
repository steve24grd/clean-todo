I'll help you investigate why you can't find the adapter implementation for `CreateUserPort`. Let me start by examining the current file and searching for the interface and its implementations.

Great! I found the issue. Let me explain why you couldn't find the "adapter" for `CreateUserPort`:

## The Confusion: Terminology in Hexagonal Architecture

In your codebase, you're using **Hexagonal Architecture** (Ports and Adapters), but there's a terminology confusion happening here:

### What You're Looking For vs. What Exists

**The `CreateUserPort` interface** is defined here:

````typescript path=src/ports/inbound/user/CreateUserPort.ts mode=EXCERPT
export interface CreateUserPort {
  execute(input: CreateUserPort.Input): Promise<CreateUserPort.Output>;
}
````

**The implementation is NOT an "adapter" - it's a USE CASE:**

````typescript path=src/use-cases/user/CreateUser.ts mode=EXCERPT
export class CreateUser implements CreateUserPort {
  constructor(
    private userRepo: UserRepository,
    private idFactory: () => string
  ) {}
````

### Why This Naming Matters

In Hexagonal Architecture:

1. **Inbound Ports** (like `CreateUserPort`) are **interfaces** that define what the application can do
2. **Inbound Port Implementations** are **Use Cases** (like `CreateUser` class) - these are your **application core logic**, NOT adapters
3. **Inbound Adapters** are things like your HTTP routes (`userRoutes.ts`) that **call** the use cases

So the architecture flow is:
```
HTTP Request → Inbound Adapter (userRoutes.ts) → Use Case (CreateUser) → Outbound Port (UserRepository) → Outbound Adapter (InMemoryUserRepository)
```

### Where Everything Lives

- **Port Interface**: `src/ports/inbound/user/CreateUserPort.ts`
- **Implementation (Use Case)**: `src/use-cases/user/CreateUser.ts` ✅ This is what you were looking for!
- **Inbound Adapter**: `src/adapters/inbound/http/routes/userRoutes.ts` (receives HTTP requests and calls the use case)
- **Wiring**: `src/container.ts` (where the use case is instantiated)

The reason you couldn't find an "adapter" for `CreateUserPort` is because **use cases don't have adapters - they ARE the implementation of inbound ports**. The adapters are on the outside (HTTP routes, CLI, etc.) that call these use cases.
