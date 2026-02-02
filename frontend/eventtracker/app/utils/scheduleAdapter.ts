import { ScheduleItem } from '../models/ScheduleItem';
import { Speaker } from '../models/Speaker';
import { ApiScheduleItem, ApiSpeaker } from '../config/api';

export function mapApiScheduleItemToScheduleItem(apiItem: ApiScheduleItem, speakers: Speaker[] = []): ScheduleItem {
  const speaker = apiItem.scheduleItemSpeakers?.[0]?.speaker 
    ? speakers.find(s => s.getId() === apiItem.scheduleItemSpeakers![0].speaker!.id.toString()) || null
    : null;

  return new ScheduleItem(
    apiItem.id.toString(),
    apiItem.title,
    apiItem.description || '',
    new Date(apiItem.startAt),
    new Date(apiItem.endAt),
    apiItem.room || '',
    speaker
  );
}

export function mapScheduleItemToApiScheduleItem(item: ScheduleItem, eventId: number): Partial<ApiScheduleItem> {
  const title = item.getTitle()?.trim();
  const description = item.getDescription()?.trim();
  const room = item.getRoom()?.trim();
  
  if (!title || title.length === 0) {
    throw new Error('Tytuł jest wymagany');
  }
  
  const startAt = item.getStartTime();
  const endAt = item.getEndTime();
  
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
    throw new Error('Nieprawidłowe daty');
  }
  
  if (startAt >= endAt) {
    throw new Error('Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia');
  }
  
  const apiItem: any = {
    eventId: eventId,
    title: title,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
  };
  
  if (description && description.length > 0) {
    apiItem.description = description;
  }
  
  if (room && room.length > 0) {
    apiItem.room = room;
  }
  
  console.log('Mapowanie ScheduleItem do API:', apiItem);
  return apiItem;
}
