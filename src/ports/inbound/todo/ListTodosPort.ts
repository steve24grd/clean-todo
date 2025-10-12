export namespace ListTodosPort {
  /**
   * DTO: Data Transfer Object for a single todo item in the ListTodos result set.
   * Role: Carries todo data from Application (use case) back to the HTTP adapter.
   * Boundary: Crosses from Application (use case) to Presentation (adapter) layer.
   */
  export type OutputItemDTO = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    isCompleted: boolean;
    createdAt: string;
    completedAt: string | null;
  };
}

export interface ListTodosPort {
  execute(ownerId?: string): Promise<ListTodosPort.OutputItemDTO[]>;
}
