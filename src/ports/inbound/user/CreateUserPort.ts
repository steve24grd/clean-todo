export namespace CreateUserPort {
  export type Input = { name: string; email: string };
  export type Output = { id: string; name: string; email: string };
}

export interface CreateUserPort {
  execute(input: CreateUserPort.Input): Promise<CreateUserPort.Output>;
}
