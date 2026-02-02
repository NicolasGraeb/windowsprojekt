import { Speaker } from './Speaker';

export class ScheduleItem {
  private id: string;
  private title: string;
  private description: string;
  private startTime: Date;
  private endTime: Date;
  private room: string;
  private speaker: Speaker | null;

  constructor(
    id: string,
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    room: string,
    speaker: Speaker | null = null
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.room = room;
    this.speaker = speaker;
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date {
    return this.endTime;
  }

  getRoom(): string {
    return this.room;
  }

  getSpeaker(): Speaker | null {
    return this.speaker;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  setStartTime(time: Date): void {
    this.startTime = time;
  }

  setEndTime(time: Date): void {
    this.endTime = time;
  }

  setRoom(room: string): void {
    this.room = room;
  }

  setSpeaker(speaker: Speaker | null): void {
    this.speaker = speaker;
  }
}


