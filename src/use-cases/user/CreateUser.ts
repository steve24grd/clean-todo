import type { CreateUserPort } from "../../ports/inbound/user/CreateUserPort";
import type { UserRepository } from "../../ports/outbound/UserRepository";
import { User } from "../../domain/entities/User";
import { ValidationError } from "../errors/ValidationError";

export class CreateUser implements CreateUserPort {
  constructor(
    private userRepo: UserRepository,
    private idFactory: () => string
  ) {}

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
