'use client';

import { useState, useCallback, useEffect } from 'react';
import { EventBase, EventStatus } from '../models/EventBase';
import { Conference } from '../models/Conference';
import { Seminar } from '../models/Seminar';
import { Workshop } from '../models/Workshop';
import { ScheduleItem } from '../models/ScheduleItem';
import { Speaker } from '../models/Speaker';
import { Participant } from '../models/Participant';
import { Registration, RegistrationStatus } from '../models/Registration';
import { apiService } from '../services/apiService';
import { mapApiEventToEventBase, mapEventBaseToApiEvent } from '../utils/eventAdapter';
import { mapApiParticipantToParticipant, mapParticipantToApiParticipant } from '../utils/participantAdapter';
import { mapApiScheduleItemToScheduleItem, mapScheduleItemToApiScheduleItem } from '../utils/scheduleAdapter';

export function useEventStore() {
  const [events, setEvents] = useState<EventBase[]>([]);
  const [schedules, setSchedules] = useState<Map<string, ScheduleItem[]>>(new Map());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allSpeakers] = useState<Speaker[]>([]); // TODO: dodać API dla speakers
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiEvents = await apiService.getEvents();
      const mappedEvents = apiEvents.map(mapApiEventToEventBase);
      setEvents(mappedEvents);

      const apiParticipants = await apiService.getParticipants();
      const mappedParticipants = apiParticipants.map(mapApiParticipantToParticipant);
      setAllParticipants(mappedParticipants);

      const schedulesMap = new Map<string, ScheduleItem[]>();
      for (const event of mappedEvents) {
        try {
          const apiScheduleItems = await apiService.getEventSchedule(parseInt(event.getId()));
          const mappedItems = apiScheduleItems.map(apiItem => 
            mapApiScheduleItemToScheduleItem(apiItem, allSpeakers)
          );
          schedulesMap.set(event.getId(), mappedItems);
        } catch (err) {
          console.error(`Błąd ładowania harmonogramu dla wydarzenia ${event.getId()}:`, err);
          schedulesMap.set(event.getId(), []);
        }
      }
      setSchedules(schedulesMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd ładowania danych');
      console.error('Błąd ładowania danych:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = useCallback(async (event: EventBase) => {
    try {
      const apiEvent = mapEventBaseToApiEvent(event);
      const created = await apiService.createEvent(apiEvent);
      const mappedEvent = mapApiEventToEventBase(created);
      setEvents(prev => [...prev, mappedEvent]);
      return mappedEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd tworzenia wydarzenia');
    }
  }, []);

  const updateEvent = useCallback(async (event: EventBase) => {
    try {
      const apiEvent = mapEventBaseToApiEvent(event);
      const updated = await apiService.updateEvent(parseInt(event.getId()), apiEvent);
      const mappedEvent = mapApiEventToEventBase(updated);
      setEvents(prev => prev.map(e => e.getId() === event.getId() ? mappedEvent : e));
      return mappedEvent;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd aktualizacji wydarzenia');
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await apiService.deleteEvent(parseInt(id));
      setEvents(prev => prev.filter(e => e.getId() !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd usuwania wydarzenia');
    }
  }, []);

  const archiveEvent = useCallback(async (id: string) => {
    try {
      await apiService.archiveEvent(parseInt(id));
      setEvents(prev => prev.map(e => {
        if (e.getId() === id) {
          e.archive();
        }
        return e;
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd archiwizacji wydarzenia');
    }
  }, []);

  const addScheduleItem = useCallback(async (eventId: string, item: ScheduleItem) => {
    try {
      const apiItem = mapScheduleItemToApiScheduleItem(item, parseInt(eventId));
      console.log('Wysyłanie elementu harmonogramu:', apiItem);
      const created = await apiService.addScheduleItem(apiItem);
      console.log('Otrzymano utworzony element:', created);
      const mappedItem = mapApiScheduleItemToScheduleItem(created, allSpeakers);
      
      setSchedules(prev => {
        const newSchedules = new Map(prev);
        const eventSchedule = newSchedules.get(eventId) || [];
        newSchedules.set(eventId, [...eventSchedule, mappedItem]);
        return newSchedules;
      });
      
      return mappedItem;
    } catch (err) {
      console.error('Błąd dodawania elementu harmonogramu:', err);
      throw new Error(err instanceof Error ? err.message : 'Błąd dodawania elementu harmonogramu');
    }
  }, [allSpeakers]);

  const updateScheduleItem = useCallback(async (eventId: string, item: ScheduleItem) => {
    try {
      setSchedules(prev => {
        const newSchedules = new Map(prev);
        const eventSchedule = newSchedules.get(eventId) || [];
        const updatedSchedule = eventSchedule.map(i => 
          i.getId() === item.getId() ? item : i
        );
        newSchedules.set(eventId, updatedSchedule);
        return newSchedules;
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd aktualizacji elementu harmonogramu');
    }
  }, []);

  const getScheduleForEvent = useCallback((eventId: string): ScheduleItem[] => {
    return schedules.get(eventId) || [];
  }, [schedules]);

  const registerParticipant = useCallback(async (eventId: string, participant: Participant): Promise<Registration> => {
    try {
      const apiRegistration = await apiService.registerParticipant(parseInt(eventId));
      
      const newRegistration = new Registration(
        apiRegistration.id.toString(),
        eventId,
        participant,
        new Date(apiRegistration.registeredAt),
        apiRegistration.status === 'registered' || apiRegistration.status === 'checked_in' ? RegistrationStatus.CONFIRMED :
        apiRegistration.status === 'waiting' ? RegistrationStatus.WAITLIST :
        apiRegistration.status === 'cancelled' ? RegistrationStatus.CANCELLED :
        RegistrationStatus.PENDING
      );

      setRegistrations(prev => [...prev, newRegistration]);
      return newRegistration;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd rejestracji uczestnika');
    }
  }, []);

  const cancelRegistration = useCallback(async (registrationId: string) => {
    try {
      await apiService.cancelRegistration(parseInt(registrationId));
      setRegistrations(prev => {
        const updated = prev.map(r => {
          if (r.getId() === registrationId) {
            r.cancel();
          }
          return r;
        });
        return updated;
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Błąd anulowania rejestracji');
    }
  }, []);

  const getRegistrationsForEvent = useCallback(async (eventId: string): Promise<Registration[]> => {
    try {
      const apiRegistrations = await apiService.getEventRegistrations(parseInt(eventId));
      
      const mappedRegistrations: Registration[] = [];
      for (const apiReg of apiRegistrations) {
        if (apiReg.participant) {
          const participant = mapApiParticipantToParticipant(apiReg.participant);
          const registration = new Registration(
            apiReg.id.toString(),
            eventId,
            participant,
            new Date(apiReg.registeredAt),
            apiReg.status === 'registered' || apiReg.status === 'checked_in' ? RegistrationStatus.CONFIRMED :
            apiReg.status === 'waiting' ? RegistrationStatus.WAITLIST :
            apiReg.status === 'cancelled' ? RegistrationStatus.CANCELLED :
            RegistrationStatus.PENDING
          );
          mappedRegistrations.push(registration);
        }
      }
      
      setRegistrations(prev => {
        const filtered = prev.filter(r => r.getEventId() !== eventId);
        return [...filtered, ...mappedRegistrations];
      });
      
      return mappedRegistrations;
    } catch (err) {
      console.error('Błąd pobierania rejestracji:', err);
      return [];
    }
  }, []);

  const getActiveSessions = useCallback((): { event: EventBase; activeItems: ScheduleItem[] }[] => {
    const now = new Date();
    const activeEvents = events.filter(e => e.getStatus() === EventStatus.ACTIVE);
    
    return activeEvents.map(event => {
      const eventSchedule = schedules.get(event.getId()) || [];
      const activeItems = eventSchedule.filter(item => {
        const start = item.getStartTime();
        const end = item.getEndTime();
        return now >= start && now <= end;
      });
      return { event, activeItems };
    }).filter(result => result.activeItems.length > 0);
  }, [events, schedules]);

  return {
    events,
    schedules,
    registrations,
    allSpeakers,
    allParticipants,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    archiveEvent,
    addScheduleItem,
    updateScheduleItem,
    getScheduleForEvent,
    registerParticipant,
    cancelRegistration,
    getRegistrationsForEvent,
    getActiveSessions,
    refreshData: loadInitialData,
  };
}
