// import ports - to implement
import type { CreateUserPort } from "../../ports/inbound/user/CreateUserPort";
// import outbounds - to access data sources
import type { UserRepository } from "../../ports/outbound/UserRepository";
// import entities
import { User } from "../../domain/entities/User";
import { ValidationError } from "../errors/ValidationError";

export class CreateUser implements CreateUserPort {
  // Constructor receives dependencies (not creating them internally)
  constructor(
    private userRepo: UserRepository, // receiving interface type
    private idFactory: () => string // receiving interface type
  ) {}

  // Use port types for input/output
  // getting actual data from http request
  async execute(input: CreateUserPort.Input): Promise<CreateUserPort.Output> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError("Email already in use");
    }

    let user: User;
    try {
      user = User.create(input.name, input.email, this.idFactory);
    } catch (e: any) {
      throw new ValidationError(e.message);
    }

    await this.userRepo.save(user);
    return { id: user.id, name: user.name, email: user.email };
  }
}
