import type { CompleteTodoPort } from "../../ports/inbound/todo/CompleteTodoPort";
import type { TodoRepository } from "../../ports/outbound/TodoRepository";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";

export class CompleteTodo implements CompleteTodoPort {
  constructor(private todoRepo: TodoRepository) {}

  async execute(id: string): Promise<CompleteTodoPort.OutputDTO> {
    const todo = await this.todoRepo.findById(id);
    if (!todo) throw new NotFoundError("Todo not found");

    try {
      todo.complete();
    } catch (e: any) {
      throw new ValidationError(e.message);
    }

    await this.todoRepo.save(todo);

    // Map Domain Entity -> OutputDTO (Application -> Presentation boundary)
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      ownerId: todo.ownerId,
      isCompleted: todo.isCompleted,
      completedAt: todo.completedAt?.toISOString() ?? null
    };
  }
}
