export enum EventStatus {
  PLANNED = 'planowane',
  ACTIVE = 'aktywne',
  COMPLETED = 'zakończone'
}

export abstract class EventBase {
  protected id: string;
  protected name: string;
  protected description: string;
  protected startDate: Date;
  protected endDate: Date;
  protected status: EventStatus;
  protected location: string;
  protected isArchived: boolean;

  constructor(
    id: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.location = location;
    this.status = EventStatus.PLANNED;
    this.isArchived = false;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getStartDate(): Date {
    return this.startDate;
  }

  getEndDate(): Date {
    return this.endDate;
  }

  getStatus(): EventStatus {
    return this.status;
  }

  getLocation(): string {
    return this.location;
  }

  getIsArchived(): boolean {
    return this.isArchived;
  }

  setName(name: string): void {
    this.name = name;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setStartDate(date: Date): void {
    this.startDate = date;
  }

  setEndDate(date: Date): void {
    this.endDate = date;
  }

  setStatus(status: EventStatus): void {
    this.status = status;
  }

  setLocation(location: string): void {
    this.location = location;
  }

  archive(): void {
    this.isArchived = true;
  }

  unarchive(): void {
    this.isArchived = false;
  }

  abstract getEventType(): string;
  abstract getCapacity(): number;
}


