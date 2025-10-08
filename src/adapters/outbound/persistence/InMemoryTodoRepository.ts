import type { TodoRepository } from "../../../ports/outbound/TodoRepository";
import { Todo } from "../../../domain/entities/Todo";

export class InMemoryTodoRepository implements TodoRepository {
  private store = new Map<string, Todo>();

  async save(todo: Todo): Promise<void> {
    this.store.set(todo.id, todo);
  }

  async findById(id: string): Promise<Todo | null> {
    return this.store.get(id) ?? null;
  }

  async listByOwner(ownerId: string | null): Promise<Todo[]> {
    return Array.from(this.store.values()).filter((t) => t.ownerId === ownerId);
  }

  async listAll(): Promise<Todo[]> {
    return Array.from(this.store.values());
  }
}
