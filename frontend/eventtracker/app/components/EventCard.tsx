import React from 'react';
import { EventBase, EventStatus } from '../models/EventBase';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

interface EventCardProps {
  event: EventBase;
  onEdit?: (event: EventBase) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  isCreator?: boolean;
  onRegister?: (eventId: string) => void;
  isRegistered?: boolean;
  registrationStatus?: string;
}

export function EventCard({ event, onEdit, onDelete, onArchive, isCreator = false, onRegister, isRegistered = false, registrationStatus }: EventCardProps) {
  const statusColors = {
    [EventStatus.PLANNED]: 'info',
    [EventStatus.ACTIVE]: 'success',
    [EventStatus.COMPLETED]: 'default',
  } as const;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card hover glass className="p-6">
      <div className="mb-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex-1 pr-4">
            {event.getName()}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusColors[event.getStatus()]}>
              {event.getStatus()}
            </Badge>
            <Badge variant="default">{event.getEventType()}</Badge>
          </div>
        </div>
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
          <div className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">👥</span>
            <span>Pojemność: {event.getCapacity()} osób</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-4 border-t-2 border-gray-300">
        {isCreator ? (
          <>
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(event)}>
                Edytuj
              </Button>
            )}
            {!event.getIsArchived() && onArchive && (
              <Button variant="ghost" size="sm" onClick={() => onArchive(event.getId())}>
                Archiwizuj
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" size="sm" onClick={() => onDelete(event.getId())}>
                Usuń
              </Button>
            )}
          </>
        ) : (
          isRegistered ? (
            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" disabled className="opacity-75">
                {registrationStatus === 'waiting' ? 'W kolejce' : 'Zapisano'}
              </Button>
              {registrationStatus === 'waiting' && (
                <span className="text-xs text-gray-600">Oczekiwanie na miejsce</span>
              )}
            </div>
          ) : (
            onRegister && (
              <Button variant="primary" size="sm" onClick={() => onRegister(event.getId())}>
                Zapisz się
              </Button>
            )
          )
        )}
      </div>
    </Card>
  );
}

