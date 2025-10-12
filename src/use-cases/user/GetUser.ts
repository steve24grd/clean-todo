import type { GetUserPort } from "../../ports/inbound/user/GetUserPort";
import type { UserRepository } from "../../ports/outbound/UserRepository";
import { NotFoundError } from "../errors/NotFoundError";

export class GetUser implements GetUserPort {
  constructor(private userRepo: UserRepository) {}

  async execute(id: string): Promise<GetUserPort.OutputDTO> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError("User not found");
    // Map Domain Entity -> OutputDTO (Application -> Presentation boundary)
    return { id: user.id, name: user.name, email: user.email };
  }
}
