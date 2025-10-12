// Prisma-backed container wiring: mirrors container.ts but uses Prisma repositories
import { PrismaUserRepository } from "./adapters/outbound/persistence/PrismaUserRepository";
import { PrismaTodoRepository } from "./adapters/outbound/persistence/PrismaTodoRepository";

import type { CreateUserPort } from "./ports/inbound/user/CreateUserPort";
import type { GetUserPort } from "./ports/inbound/user/GetUserPort";
import type { CreateTodoPort } from "./ports/inbound/todo/CreateTodoPort";
import type { ListTodosPort } from "./ports/inbound/todo/ListTodosPort";
import type { CompleteTodoPort } from "./ports/inbound/todo/CompleteTodoPort";

import { CreateUser } from "./use-cases/user/CreateUser";
import { GetUser } from "./use-cases/user/GetUser";
import { CreateTodo } from "./use-cases/todo/CreateTodo";
import { ListTodos } from "./use-cases/todo/ListTodos";
import { CompleteTodo } from "./use-cases/todo/CompleteTodo";
import { newId } from "./shared/Id";

export function buildPrismaContainer() {
  const userRepo = new PrismaUserRepository();
  const todoRepo = new PrismaTodoRepository();

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
      outbound: { userRepo, todoRepo }
    }
  };
}

