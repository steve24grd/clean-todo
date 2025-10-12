import type { ListTodosPort } from "../../ports/inbound/todo/ListTodosPort";
import type { TodoRepository } from "../../ports/outbound/TodoRepository";

export class ListTodos implements ListTodosPort {
  constructor(private todoRepo: TodoRepository) {}

  async execute(ownerId?: string): Promise<ListTodosPort.OutputItemDTO[]> {
    const todos = ownerId
      ? await this.todoRepo.listByOwner(ownerId)
      : await this.todoRepo.listAll();

    // Map Domain Entity -> OutputItemDTO[] (Application -> Presentation boundary)
    return todos.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      ownerId: t.ownerId,
      isCompleted: t.isCompleted,
      createdAt: t.createdAt.toISOString(),
      completedAt: t.completedAt?.toISOString() ?? null
    }));
  }
}
