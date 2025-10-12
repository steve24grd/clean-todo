import type { TodoRepository } from "../../../ports/outbound/TodoRepository";
import { Todo } from "../../../domain/entities/Todo";
import { getPrisma } from "./prismaClient";

function rowToDomain(r: {
  id: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  isCompleted: boolean;
  createdAt: Date;
  completedAt: Date | null;
}): Todo {
  return new Todo(
    r.id,
    r.title,
    r.description ?? null,
    r.ownerId ?? null,
    r.isCompleted,
    r.createdAt,
    r.completedAt ?? undefined
  );
}

export class PrismaTodoRepository implements TodoRepository {
  private prisma = getPrisma();

  async save(todo: Todo): Promise<void> {
    await this.prisma.todo.upsert({
      where: { id: todo.id },
      create: {
        id: todo.id,
        title: todo.title,
        description: todo.description,
        ownerId: todo.ownerId,
        isCompleted: todo.isCompleted,
        createdAt: todo.createdAt,
        completedAt: todo.completedAt ?? null
      },
      update: {
        title: todo.title,
        description: todo.description,
        ownerId: todo.ownerId,
        isCompleted: todo.isCompleted,
        // keep createdAt from entity to preserve original timestamp
        createdAt: todo.createdAt,
        completedAt: todo.completedAt ?? null
      }
    });
  }

  async findById(id: string): Promise<Todo | null> {
    const row = await this.prisma.todo.findUnique({ where: { id } });
    if (!row) return null;
    return rowToDomain(row);
  }

  async listByOwner(ownerId: string | null): Promise<Todo[]> {
    const rows = await this.prisma.todo.findMany({ where: { ownerId: ownerId ?? null } });
    return rows.map(rowToDomain);
  }

  async listAll(): Promise<Todo[]> {
    const rows = await this.prisma.todo.findMany();
    return rows.map(rowToDomain);
  }
}

