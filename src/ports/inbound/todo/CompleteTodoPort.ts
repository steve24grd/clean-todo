export namespace CompleteTodoPort {
  export type Output = {
    id: string;
    title: string;
    description: string | null;
    ownerId: string | null;
    isCompleted: boolean;
    completedAt: string | null;
  };
}

export interface CompleteTodoPort {
  execute(id: string): Promise<CompleteTodoPort.Output>;
}
