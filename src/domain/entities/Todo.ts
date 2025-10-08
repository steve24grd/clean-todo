export class Todo {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public ownerId: string | null,
    public isCompleted: boolean = false,
    public readonly createdAt: Date = new Date(),
    public completedAt?: Date
  ) {
    this.title = title.trim();
    if (this.title.length < 3) {
      throw new Error("Title must be at least 3 characters");
    }
  }

  complete() {
    if (this.isCompleted) {
      throw new Error("Todo is already completed");
    }
    this.isCompleted = true;
    this.completedAt = new Date();
  }

  assignTo(ownerId: string | null) {
    this.ownerId = ownerId;
  }

  static create(
    params: { title: string; description?: string; ownerId?: string | null },
    idFactory: () => string
  ): Todo {
    const id = idFactory();
    return new Todo(
      id,
      params.title,
      params.description ?? null,
      params.ownerId ?? null,
      false
    );
  }
}
