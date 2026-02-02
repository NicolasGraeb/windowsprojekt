import { EventBase, EventStatus } from './EventBase';

export class Conference extends EventBase {
  private maxAttendees: number;
  private tracks: number;

  constructor(
    id: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
    maxAttendees: number,
    tracks: number
  ) {
    super(id, name, description, startDate, endDate, location);
    this.maxAttendees = maxAttendees;
    this.tracks = tracks;
  }

  getEventType(): string {
    return 'Konferencja';
  }

  getCapacity(): number {
    return this.maxAttendees;
  }

  getTracks(): number {
    return this.tracks;
  }

  setMaxAttendees(count: number): void {
    this.maxAttendees = count;
  }

  setTracks(count: number): void {
    this.tracks = count;
  }
}


