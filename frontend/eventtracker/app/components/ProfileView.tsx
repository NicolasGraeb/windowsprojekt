import React from 'react';
import { EventBase } from '../models/EventBase';
import { Registration, RegistrationStatus } from '../models/Registration';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { EventStatus } from '../models/EventBase';

interface ProfileViewProps {
  events: EventBase[];
  registrations: Registration[];
  onEventClick: (event: EventBase) => void;
}

export function ProfileView({ events, registrations, onEventClick }: ProfileViewProps) {
  const userRegistrations = registrations.filter(
    r => r.getStatus() === RegistrationStatus.CONFIRMED || r.getStatus() === RegistrationStatus.PENDING
  );

  const getUserEvents = () => {
    const eventIds = new Set(userRegistrations.map(r => r.getEventId()));
    return events.filter(e => eventIds.has(e.getId()));
  };

  const myEvents = getUserEvents();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const statusColors = {
    [EventStatus.PLANNED]: 'info',
    [EventStatus.ACTIVE]: 'success',
    [EventStatus.COMPLETED]: 'default',
  } as const;

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-2">
          Mój Profil
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center font-black text-2xl">
            JD
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
              Jan Kowalski
            </h3>
            <p className="text-gray-600 font-medium">jan.kowalski@example.com</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card glass className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Moje wydarzenia
            </div>
            <div className="text-3xl font-black text-gray-900">
              {myEvents.length}
            </div>
          </Card>
          <Card glass className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Potwierdzone
            </div>
            <div className="text-3xl font-black text-green-700">
              {userRegistrations.filter(r => r.getStatus() === RegistrationStatus.CONFIRMED).length}
            </div>
          </Card>
          <Card glass className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Oczekujące
            </div>
            <div className="text-3xl font-black text-yellow-700">
              {userRegistrations.filter(r => r.getStatus() === RegistrationStatus.PENDING).length}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
          Moje Wydarzenia
        </h3>
        {myEvents.length === 0 ? (
          <Card glass className="p-12 text-center">
            <p className="text-gray-600 font-medium text-lg">
              Nie jesteś zarejestrowany na żadne wydarzenie
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((event) => {
              const registration = userRegistrations.find(r => r.getEventId() === event.getId());
              return (
                <Card key={event.getId()} hover glass className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 flex-1 pr-4">
                        {event.getName()}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={statusColors[event.getStatus()]}>
                          {event.getStatus()}
                        </Badge>
                        <Badge variant="default">{event.getEventType()}</Badge>
                      </div>
                    </div>
                    {registration && (
                      <Badge 
                        variant={registration.getStatus() === RegistrationStatus.CONFIRMED ? 'success' : 'warning'}
                        className="mb-3"
                      >
                        {registration.getStatus()}
                      </Badge>
                    )}
                    <p className="text-gray-700 mb-4 font-medium leading-relaxed line-clamp-2">
                      {event.getDescription()}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600 font-medium">
                      <div className="flex items-start gap-2">
                        <span className="font-bold min-w-[20px]">📍</span>
                        <span>{event.getLocation()}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-bold min-w-[20px]">📅</span>
                        <span>{formatDate(event.getStartDate())} - {formatDate(event.getEndDate())}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEventClick(event)}
                    className="w-full"
                  >
                    Zobacz szczegóły
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

