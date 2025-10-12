import type { CreateTodoPort } from "../../ports/inbound/todo/CreateTodoPort";
import type { TodoRepository } from "../../ports/outbound/TodoRepository";
import type { UserRepository } from "../../ports/outbound/UserRepository";
import { Todo } from "../../domain/entities/Todo";
import { NotFoundError } from "../errors/NotFoundError";
import { ValidationError } from "../errors/ValidationError";

export class CreateTodo implements CreateTodoPort {
  constructor(
    private todoRepo: TodoRepository,
    private idFactory: () => string,
    private userRepo: UserRepository
  ) {}

  async execute(input: CreateTodoPort.InputDTO): Promise<CreateTodoPort.OutputDTO> {
    const ownerId = input.ownerId ?? null;

    if (ownerId) {
      const owner = await this.userRepo.findById(ownerId);
      if (!owner) throw new NotFoundError("Owner user not found");
    }

    let todo: Todo;
    try {
      todo = Todo.create(
        {
          title: input.title,
          ...(input.description !== undefined && { description: input.description }),
          ownerId
        },
        this.idFactory
      );
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
      createdAt: todo.createdAt.toISOString()
    };
  }
}
