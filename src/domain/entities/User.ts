/*
Declares a User entity class and exports it for use in other modules.
This follows the Entity pattern in Domain-Driven Design (DDD), 
representing a core business object with identity
*/
export class User {
  constructor(
    public readonly id: string, // immutable
    public name: string,
    public email: string
  ) {
    // data normalization
    this.name = name.trim();
    this.email = email.trim().toLowerCase();

    /*
    Why throw errors in constructor?
    - Fail-fast principle: Invalid objects are never created
    - Invariant protection: Ensures all User instances are valid
    - Clean Architecture: Domain entities enforce their own business rules
    */

    // validation
    if (!this.name) throw new Error("Name cannot be empty");
    if (!this.email.includes("@")) throw new Error("Email appears invalid");
  }

  // factory method
  // Static method (called on class, not instance
  // idFactory: Dependency injection of ID generation logic
  static create(name: string, email: string, idFactory: () => string): User {
    const id = idFactory();
    return new User(id, name, email);
  }
}
