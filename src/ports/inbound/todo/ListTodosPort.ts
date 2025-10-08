export namespace ListTodosPort {
  export type OutputItem = {
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
  execute(ownerId?: string): Promise<ListTodosPort.OutputItem[]>;
}
