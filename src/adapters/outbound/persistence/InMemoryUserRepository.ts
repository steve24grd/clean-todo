import type { UserRepository } from "../../../ports/outbound/UserRepository";
import { User } from "../../../domain/entities/User";

export class InMemoryUserRepository implements UserRepository {
  private store = new Map<string, User>();

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const u of this.store.values()) {
      if (u.email === normalized) return u;
    }
    return null;
  }

  async list(): Promise<User[]> {
    return Array.from(this.store.values());
  }
}
