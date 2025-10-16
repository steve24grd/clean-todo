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

  // Use port DTO types for input/output
  // getting actual data from http request (InputDTO crosses Presentation -> Application boundary)
  async execute(input: CreateUserPort.InputDTO): Promise<CreateUserPort.OutputDTO> {
    // inbound port manipulation
    const email = input.email.trim().toLowerCase();

    // utilize outbound ports
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

    // utilize outbound ports
    await this.userRepo.save(user);
    // Map Domain Entity -> OutputDTO (Application -> Presentation boundary)
    return { id: user.id, name: user.name, email: user.email };
  }
}
