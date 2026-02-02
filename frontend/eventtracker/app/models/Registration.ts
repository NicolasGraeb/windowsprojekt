import { Participant } from './Participant';

export enum RegistrationStatus {
  PENDING = 'oczekująca',
  CONFIRMED = 'potwierdzona',
  CANCELLED = 'anulowana',
  WAITLIST = 'lista oczekujących'
}

export class Registration {
  private id: string;
  private eventId: string;
  private participant: Participant;
  private registrationDate: Date;
  private status: RegistrationStatus;

  constructor(
    id: string,
    eventId: string,
    participant: Participant,
    registrationDate: Date,
    status: RegistrationStatus = RegistrationStatus.PENDING
  ) {
    this.id = id;
    this.eventId = eventId;
    this.participant = participant;
    this.registrationDate = registrationDate;
    this.status = status;
  }

  getId(): string {
    return this.id;
  }

  getEventId(): string {
    return this.eventId;
  }

  getParticipant(): Participant {
    return this.participant;
  }

  getRegistrationDate(): Date {
    return this.registrationDate;
  }

  getStatus(): RegistrationStatus {
    return this.status;
  }

  setStatus(status: RegistrationStatus): void {
    this.status = status;
  }

  cancel(): void {
    this.status = RegistrationStatus.CANCELLED;
  }

  confirm(): void {
    this.status = RegistrationStatus.CONFIRMED;
  }

  moveToWaitlist(): void {
    this.status = RegistrationStatus.WAITLIST;
  }
}


