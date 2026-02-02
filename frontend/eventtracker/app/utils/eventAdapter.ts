import { ApiEvent } from '../config/api';
import { EventBase, EventStatus } from '../models/EventBase';
import { Conference } from '../models/Conference';
import { Seminar } from '../models/Seminar';
import { Workshop } from '../models/Workshop';

export interface EventWithCreator extends EventBase {
  createdByUserId?: number;
}

export function mapApiEventToEventBase(apiEvent: ApiEvent): EventWithCreator {
  const startDate = new Date(apiEvent.startAt);
  const endDate = new Date(apiEvent.endAt);
  
  let status: EventStatus;
  switch (apiEvent.status.toLowerCase()) {
    case 'planowane':
      status = EventStatus.PLANNED;
      break;
    case 'aktywne':
      status = EventStatus.ACTIVE;
      break;
    case 'zakończone':
      status = EventStatus.COMPLETED;
      break;
    default:
      status = EventStatus.PLANNED;
  }

  const isArchived = apiEvent.status === 'Archiwizowane';

  let eventBase: EventWithCreator;

  if (apiEvent.eventType === 'Conference' || apiEvent.trackCount !== undefined) {
    const conference = new Conference(
      apiEvent.id.toString(),
      apiEvent.name,
      apiEvent.description || '',
      startDate,
      endDate,
      apiEvent.location || '',
      apiEvent.maxParticipants,
      apiEvent.trackCount || 0
    );
    conference.setStatus(status);
    if (isArchived) conference.archive();
    eventBase = conference;
  } else if (apiEvent.eventType === 'Seminar' || apiEvent.topic !== undefined) {
    const seminar = new Seminar(
      apiEvent.id.toString(),
      apiEvent.name,
      apiEvent.description || '',
      startDate,
      endDate,
      apiEvent.location || '',
      apiEvent.maxParticipants,
      apiEvent.topic || ''
    );
    seminar.setStatus(status);
    if (isArchived) seminar.archive();
    eventBase = seminar;
  } else if (apiEvent.eventType === 'Workshop' || apiEvent.materialsRequired !== undefined) {
    const workshop = new Workshop(
      apiEvent.id.toString(),
      apiEvent.name,
      apiEvent.description || '',
      startDate,
      endDate,
      apiEvent.location || '',
      apiEvent.maxParticipants,
      !!apiEvent.materialsRequired,
      apiEvent.workshopFee || 0
    );
    workshop.setStatus(status);
    if (isArchived) workshop.archive();
    eventBase = workshop;
  } else {
    const defaultEvent = new Conference(
      apiEvent.id.toString(),
      apiEvent.name,
      apiEvent.description || '',
      startDate,
      endDate,
      apiEvent.location || '',
      apiEvent.maxParticipants,
      0
    );
    defaultEvent.setStatus(status);
    if (isArchived) defaultEvent.archive();
    eventBase = defaultEvent;
  }

  eventBase.createdByUserId = apiEvent.createdByUserId;

  return eventBase;
}

export function mapEventBaseToApiEvent(event: EventBase): Partial<ApiEvent> {
  const base: Partial<ApiEvent> = {
    name: event.getName(),
    description: event.getDescription(),
    startAt: event.getStartDate().toISOString(),
    endAt: event.getEndDate().toISOString(),
    location: event.getLocation(),
    maxParticipants: event.getCapacity(),
    status: event.getStatus() === EventStatus.PLANNED ? 'Planowane' :
            event.getStatus() === EventStatus.ACTIVE ? 'Aktywne' : 'Zakończone',
  };

  if (event instanceof Conference) {
    base.eventType = 'Conference';
    base.trackCount = event.getTracks();
  } else if (event instanceof Seminar) {
    base.eventType = 'Seminar';
    base.topic = event.getTopic();
  } else if (event instanceof Workshop) {
    base.eventType = 'Workshop';
    base.materialsRequired = event.getRequiresMaterials() ? 'Tak' : undefined;
    base.workshopFee = event.getMaterialsCost();
  }

  return base;
}
