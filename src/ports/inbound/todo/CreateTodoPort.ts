export namespace CreateTodoPort {
  /**
   * DTO: Data Transfer Object for creating a new todo.
   * Role: Carries data from HTTP inbound adapter to the CreateTodo use case.
   * Boundary: Crosses from Presentation (adapter) to Application (use case) layer.
   */
  export type InputDTO = { title: string; description?: string; ownerId?: string | null };

  /**
   * DTO: Data Transfer Object returned by the CreateTodo use case.
   * Role: Carries todo data from Application (use case) back to the HTTP adapter for response.
   * Boundary: Crosses from Application (use case) to Presentation (adapter) layer.
   */
  export type OutputDTO = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    isCompleted: boolean;
    createdAt: string;
  };
}

export interface CreateTodoPort {
  execute(input: CreateTodoPort.InputDTO): Promise<CreateTodoPort.OutputDTO>;
}
