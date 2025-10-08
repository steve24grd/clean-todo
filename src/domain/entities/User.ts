export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string
  ) {
    this.name = name.trim();
    this.email = email.trim().toLowerCase();

    if (!this.name) throw new Error("Name cannot be empty");
    if (!this.email.includes("@")) throw new Error("Email appears invalid");
  }

  static create(name: string, email: string, idFactory: () => string): User {
    const id = idFactory();
    return new User(id, name, email);
  }
}
