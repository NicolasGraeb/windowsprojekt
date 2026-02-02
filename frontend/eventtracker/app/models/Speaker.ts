export class Speaker {
  private id: string;
  private name: string;
  private email: string;
  private bio: string;
  private organization: string;

  constructor(
    id: string,
    name: string,
    email: string,
    bio: string,
    organization: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.bio = bio;
    this.organization = organization;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getBio(): string {
    return this.bio;
  }

  getOrganization(): string {
    return this.organization;
  }

  setName(name: string): void {
    this.name = name;
  }

  setEmail(email: string): void {
    this.email = email;
  }

  setBio(bio: string): void {
    this.bio = bio;
  }

  setOrganization(organization: string): void {
    this.organization = organization;
  }
}


