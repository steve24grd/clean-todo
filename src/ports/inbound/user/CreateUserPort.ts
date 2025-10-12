/*
## Current Approach (Using Namespace)

````typescript path=src/ports/inbound/user/CreateUserPort.ts mode=EXCERPT
export namespace CreateUserPort {
  export type Input = { name: string; email: string };
  export type Output = { id: string; name: string; email: string };
}

export interface CreateUserPort {
  execute(input: CreateUserPort.Input): Promise<CreateUserPort.Output>;
}
````

## Why Use Namespace?

The namespace pattern provides **scoping and organization** benefits:

### 1. **Avoids Name Collisions**
With namespace, `Input` and `Output` are scoped to `CreateUserPort`. This means you can have:
- `CreateUserPort.Input`
- `UpdateUserPort.Input`
- `DeleteUserPort.Input`

All in the same file without conflicts.

### 2. **Better Discoverability**
When using the interface, TypeScript's autocomplete shows you related types:
```typescript
// Type "CreateUserPort." and you'll see:
// - CreateUserPort.Input
// - CreateUserPort.Output
// - CreateUserPort.execute
```

### 3. **Clearer Intent**
It's immediately clear that `Input` and `Output` belong to `CreateUserPort`, not some generic types.

## Your Proposed Approach

```typescript
type Input = { name: string; email: string };
type Output = { id: string; name: string; email: string };

export interface CreateUserPort {
  execute(input: Input): Promise<Output>;
}
```

**Problems with this:**
- ❌ `Input` and `Output` are too generic - they'll conflict with other ports
- ❌ You'd need to rename them like `CreateUserInput`, `CreateUserOutput` (more verbose)
- ❌ Less organized - types are "floating" rather than grouped with their interface

## The Pattern in Action

This is a common TypeScript pattern for **port interfaces** in Clean Architecture because:
1. Each port has its own input/output types
2. The namespace keeps them organized together
3. It's self-documenting - you know exactly which port the types belong to

**In summary:** You *could* use separate types, but you'd need to give them unique names anyway (like `CreateUserInput`), which is essentially what the namespace does but with better organization and discoverability.
#

*/
export namespace CreateUserPort {
  /**
   * DTO: Data Transfer Object for creating a new user.
   * Role: Carries data from HTTP inbound adapter to the CreateUser use case.
   * Boundary: Crosses from Presentation (adapter) to Application (use case) layer.
   */
  export type InputDTO = { name: string; email: string };

  /**
   * DTO: Data Transfer Object returned by the CreateUser use case.
   * Role: Carries data from Application (use case) back to the HTTP adapter for response.
   * Boundary: Crosses from Application (use case) to Presentation (adapter) layer.
   */
  export type OutputDTO = { id: string; name: string; email: string };
}

export interface CreateUserPort {
  execute(input: CreateUserPort.InputDTO): Promise<CreateUserPort.OutputDTO>;
}
