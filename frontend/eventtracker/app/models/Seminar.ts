import { EventBase } from './EventBase';

export class Seminar extends EventBase {
  private maxParticipants: number;
  private topic: string;

  constructor(
    id: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
    maxParticipants: number,
    topic: string
  ) {
    super(id, name, description, startDate, endDate, location);
    this.maxParticipants = maxParticipants;
    this.topic = topic;
  }

  getEventType(): string {
    return 'Seminarium';
  }

  getCapacity(): number {
    return this.maxParticipants;
  }

  getTopic(): string {
    return this.topic;
  }

  setMaxParticipants(count: number): void {
    this.maxParticipants = count;
  }

  setTopic(topic: string): void {
    this.topic = topic;
  }
}


