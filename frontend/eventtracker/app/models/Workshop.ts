import { EventBase } from './EventBase';

export class Workshop extends EventBase {
  private maxParticipants: number;
  private requiresMaterials: boolean;
  private materialsCost: number;

  constructor(
    id: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date,
    location: string,
    maxParticipants: number,
    requiresMaterials: boolean,
    materialsCost: number
  ) {
    super(id, name, description, startDate, endDate, location);
    this.maxParticipants = maxParticipants;
    this.requiresMaterials = requiresMaterials;
    this.materialsCost = materialsCost;
  }

  getEventType(): string {
    return 'Warsztat';
  }

  getCapacity(): number {
    return this.maxParticipants;
  }

  getRequiresMaterials(): boolean {
    return this.requiresMaterials;
  }

  getMaterialsCost(): number {
    return this.materialsCost;
  }

  setMaxParticipants(count: number): void {
    this.maxParticipants = count;
  }

  setRequiresMaterials(requires: boolean): void {
    this.requiresMaterials = requires;
  }

  setMaterialsCost(cost: number): void {
    this.materialsCost = cost;
  }
}


