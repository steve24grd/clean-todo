import { expect, test, beforeAll } from "bun:test";
import { getPrisma } from "../src/adapters/outbound/persistence/prismaClient";
import { PrismaUserRepository } from "../src/adapters/outbound/persistence/PrismaUserRepository";
import { PrismaTodoRepository } from "../src/adapters/outbound/persistence/PrismaTodoRepository";
import { CreateUser } from "../src/use-cases/user/CreateUser";
import { GetUser } from "../src/use-cases/user/GetUser";
import { CreateTodo } from "../src/use-cases/todo/CreateTodo";
import { ListTodos } from "../src/use-cases/todo/ListTodos";
import { CompleteTodo } from "../src/use-cases/todo/CompleteTodo";
import { newId } from "../src/shared/Id";

beforeAll(async () => {
  // Clean tables
  const prisma = getPrisma();
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
});

test("Prisma-backed use cases: create/get user", async () => {
  const userRepo = new PrismaUserRepository();
  const createUser = new CreateUser(userRepo, newId);
  const getUser = new GetUser(userRepo);

  const created = await createUser.execute({ name: "Alice", email: "alice@example.com" });
  expect(created.name).toBe("Alice");
  expect(created.email).toBe("alice@example.com");

  const fetched = await getUser.execute(created.id);
  expect(fetched).toEqual(created);
});

test("Prisma-backed use cases: create/list/complete todo", async () => {
  const userRepo = new PrismaUserRepository();
  const todoRepo = new PrismaTodoRepository();

  const createUser = new CreateUser(userRepo, newId);
  const owner = await createUser.execute({ name: "Bob", email: "bob@example.com" });

  const createTodo = new CreateTodo(todoRepo, newId, userRepo);
  const listTodos = new ListTodos(todoRepo);
  const completeTodo = new CompleteTodo(todoRepo);

  const todo = await createTodo.execute({ title: "Buy milk", description: "2%", ownerId: owner.id });
  expect(todo.title).toBe("Buy milk");
  expect(todo.isCompleted).toBe(false);

  const listed = await listTodos.execute(owner.id);
  expect(listed.length).toBeGreaterThanOrEqual(1);
  const found = listed.find((t) => t.id === todo.id);
  expect(found).toBeTruthy();

  const completed = await completeTodo.execute(todo.id);
  expect(completed.isCompleted).toBe(true);
  expect(completed.completedAt).not.toBeNull();
});

