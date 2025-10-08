export namespace CreateTodoPort {
  export type Input = { title: string; description?: string; ownerId?: string | null };
  export type Output = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    isCompleted: boolean;
    createdAt: string;
  };
}

export interface CreateTodoPort {
  execute(input: CreateTodoPort.Input): Promise<CreateTodoPort.Output>;
}
