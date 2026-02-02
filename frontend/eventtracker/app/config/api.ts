export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5164/api';

export interface ApiEvent {
  id: number;
  name: string;
  description?: string;
  status: string;
  startAt: string;
  endAt: string;
  location?: string;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: number;
  eventType?: string;
  trackCount?: number;
  hasExhibition?: boolean;
  registrationFee?: number;
  topic?: string;
  isInteractive?: boolean;
  materialsRequired?: string;
  workshopFee?: number;
  skillLevel?: number;
}

export interface ApiParticipant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface ApiRegistration {
  id: number;
  eventId: number;
  participantId: number;
  status: string;
  registeredAt: string;
  cancelledAt?: string;
  checkedInAt?: string;
  waitingPosition?: number;
  participant?: ApiParticipant;
}

export interface ApiScheduleItem {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  room?: string;
  createdAt: string;
  scheduleItemSpeakers?: Array<{
    speakerId: number;
    speaker?: ApiSpeaker;
  }>;
}

export interface ApiSpeaker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
}

export interface ApiEventMonitoringData {
  eventId: number;
  eventName: string;
  status: string;
  totalRegistrations: number;
  checkedInCount: number;
  waitingListCount: number;
  activeSessionsCount: number;
  lastUpdate: string;
}

export interface ApiActiveSession {
  scheduleItemId: number;
  title: string;
  startAt: string;
  endAt: string;
  room?: string;
  speakerCount: number;
  isActive: boolean;
}
