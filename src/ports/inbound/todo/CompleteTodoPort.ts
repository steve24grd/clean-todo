export namespace CompleteTodoPort {
  /**
   * DTO: Data Transfer Object returned by the CompleteTodo use case.
   * Role: Carries updated todo data from Application (use case) back to the HTTP adapter.
   * Boundary: Crosses from Application (use case) to Presentation (adapter) layer.
   */
  export type OutputDTO = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    isCompleted: boolean;
    completedAt: string | null;
  };
}

export interface CompleteTodoPort {
  execute(id: string): Promise<CompleteTodoPort.OutputDTO>;
}
