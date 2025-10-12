import type { UserRepository } from "../../../ports/outbound/UserRepository";
import { User } from "../../../domain/entities/User";
import { getPrisma } from "./prismaClient";

export class PrismaUserRepository implements UserRepository {
  private prisma = getPrisma();

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, name: user.name, email: user.email },
      update: { name: user.name, email: user.email }
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return new User(row.id, row.name, row.email);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!row) return null;
    return new User(row.id, row.name, row.email);
  }

  async list(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map((r) => new User(r.id, r.name, r.email));
  }
}

