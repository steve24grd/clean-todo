import { Todo } from "../../domain/entities/Todo";

export interface TodoRepository {
  save(todo: Todo): Promise<void>;
  findById(id: string): Promise<Todo | null>;
  listByOwner(ownerId: string | null): Promise<Todo[]>;
  listAll(): Promise<Todo[]>;
}
