export namespace GetUserPort {
  export type Output = { id: string; name: string; email: string };
}

export interface GetUserPort {
  execute(id: string): Promise<GetUserPort.Output>;
}
