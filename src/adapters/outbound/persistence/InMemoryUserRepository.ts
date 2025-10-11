// this is an outbound adapter
// import port
import type { UserRepository } from "../../../ports/outbound/UserRepository";
// import entity
import { User } from "../../../domain/entities/User";

// implement port
export class InMemoryUserRepository implements UserRepository {
  // instantiate Map
  /*
  It’s a Map (dictionary) that can hold many key–value pairs, 
  not a single pair and not a list/array. 
  Keys are user IDs (string), and values are User objects.
  */
  private store = new Map<string, User>();

  // implement methods
  // add user or update existing
  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  // find user by id
  async findById(id: string): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  // find user by email
  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const u of this.store.values()) {
      if (u.email === normalized) return u;
    }
    return null;
  }

  // list all users
  async list(): Promise<User[]> {
    return Array.from(this.store.values());
  }
}
