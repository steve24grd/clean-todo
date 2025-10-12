export namespace GetUserPort {
  /**
   * DTO: Data Transfer Object returned by the GetUser use case.
   * Role: Carries user data from Application (use case) back to the HTTP adapter.
   * Boundary: Crosses from Application (use case) to Presentation (adapter) layer.
   */
  export type OutputDTO = { id: string; name: string; email: string };
}

export interface GetUserPort {
  execute(id: string): Promise<GetUserPort.OutputDTO>;
}
