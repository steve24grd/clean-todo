import { InMemoryUserRepository } from "./adapters/outbound/persistence/InMemoryUserRepository";
import { InMemoryTodoRepository } from "./adapters/outbound/persistence/InMemoryTodoRepository";

import { CreateUser } from "./use-cases/user/CreateUser";
import { GetUser } from "./use-cases/user/GetUser";
import { CreateTodo } from "./use-cases/todo/CreateTodo";
import { ListTodos } from "./use-cases/todo/ListTodos";
import { CompleteTodo } from "./use-cases/todo/CompleteTodo";
import { newId } from "./shared/Id";

// Ports (types only)
import type { CreateUserPort } from "./ports/inbound/user/CreateUserPort";
import type { GetUserPort } from "./ports/inbound/user/GetUserPort";
import type { CreateTodoPort } from "./ports/inbound/todo/CreateTodoPort";
import type { ListTodosPort } from "./ports/inbound/todo/ListTodosPort";
import type { CompleteTodoPort } from "./ports/inbound/todo/CompleteTodoPort";

export function buildContainer() {
  // Outbound adapters
  const userRepo = new InMemoryUserRepository();
  const todoRepo = new InMemoryTodoRepository();

  // Use case implementations (they implement inbound ports)
  const createUser: CreateUserPort = new CreateUser(userRepo, newId);
  const getUser: GetUserPort = new GetUser(userRepo);

  const createTodo: CreateTodoPort = new CreateTodo(todoRepo, newId, userRepo);
  const listTodos: ListTodosPort = new ListTodos(todoRepo);
  const completeTodo: CompleteTodoPort = new CompleteTodo(todoRepo);

  return {
    ports: {
      inbound: { createUser, getUser, createTodo, listTodos, completeTodo }
    },
    adapters: {
      outbound: { userRepo, todoRepo } // exposed for tests/debugging if desired
    }
  };
}
