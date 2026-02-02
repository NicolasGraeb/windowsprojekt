export class Participant {
  private id: string;
  private firstName: string;
  private lastName: string;
  private email: string;
  private phone: string;
  private organization: string;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    organization: string
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.organization = organization;
  }

  getId(): string {
    return this.id;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string {
    return this.phone;
  }

  getOrganization(): string {
    return this.organization;
  }

  setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  setLastName(lastName: string): void {
    this.lastName = lastName;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setPhone(phone: string): void {
    this.phone = phone;
  }

  setOrganization(organization: string): void {
    this.organization = organization;
  }
}


