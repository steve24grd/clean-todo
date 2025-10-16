import { describe, test, expect, beforeEach } from "bun:test";
import { CreateUser } from "../src/use-cases/user/CreateUser";
import { ValidationError } from "../src/use-cases/errors/ValidationError";
import type { UserRepository } from "../src/ports/outbound/UserRepository";
import { User } from "../src/domain/entities/User";

class MockUserRepository implements UserRepository {
  saved: User[] = [];
  byEmail = new Map<string, User>();
  byId = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.saved.push(user);
    this.byId.set(user.id, user);
    this.byEmail.set(user.email, user);
  }
  async findById(id: string): Promise<User | null> {
    return this.byId.get(id) ?? null;
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.byEmail.get(email.trim().toLowerCase()) ?? null;
  }
  async list(): Promise<User[]> {
    return Array.from(this.byId.values());
  }
}

describe("CreateUser use case (unit, DI)", () => {
  let repo: MockUserRepository;
  let idFactory: () => string;

  beforeEach(() => {
    repo = new MockUserRepository();
    idFactory = () => "fixed-id-1";
  });

  test("creates a user when email not in use (success path)", async () => {
    const uc = new CreateUser(repo, idFactory);

    const out = await uc.execute({ name: "  Alice ", email: " Alice@EXAMPLE.com " });

    // DTO mapping and normalization
    expect(out).toEqual({ id: "fixed-id-1", name: "Alice", email: "alice@example.com" });

    // Repository interaction (DI ensures isolation; no external systems)
    expect(repo.saved.length).toBe(1);
    const saved = repo.saved[0]!;
    expect(saved).toBeInstanceOf(User);
    expect(saved.id).toBe("fixed-id-1");
    expect(saved.name).toBe("Alice");
    expect(saved.email).toBe("alice@example.com");
  });

  test("fails with ValidationError when email already exists", async () => {
    // Arrange existing user in mock repo
    const existing = new User("u-1", "Alice", "alice@example.com");
    repo.byEmail.set("alice@example.com", existing);

    const uc = new CreateUser(repo, idFactory);

    try {
      await uc.execute({ name: "Alice", email: "alice@example.com" });
      throw new Error("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).toBe("Email already in use");
    }
  });

  test("fails with ValidationError for invalid email", async () => {
    const uc = new CreateUser(repo, idFactory);

    try {
      await uc.execute({ name: "Bob", email: "invalid-email" });
      throw new Error("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).toBe("Email appears invalid");
      // No persistence should have happened
      expect(repo.saved.length).toBe(0);
    }
  });

  test("fails with ValidationError for empty name (after trimming)", async () => {
    const uc = new CreateUser(repo, idFactory);

    try {
      await uc.execute({ name: "   ", email: "bob@example.com" });
      throw new Error("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).toBe("Name cannot be empty");
    }
  });

  test("uses injected idFactory (demonstrates DI)", async () => {
    let counter = 41;
    const customIdFactory = () => `id-${++counter}`;
    const uc = new CreateUser(repo, customIdFactory);
    const out = await uc.execute({ name: "Charlie", email: "charlie@example.com" });
    expect(out.id).toBe("id-42");
  });
});

