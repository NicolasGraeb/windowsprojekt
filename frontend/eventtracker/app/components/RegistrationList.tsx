import React from 'react';
import { Registration, RegistrationStatus } from '../models/Registration';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

interface RegistrationListProps {
  registrations: Registration[];
  onCancel: (id: string) => void;
}

export function RegistrationList({ registrations, onCancel }: RegistrationListProps) {
  const statusColors = {
    [RegistrationStatus.PENDING]: 'warning',
    [RegistrationStatus.CONFIRMED]: 'success',
    [RegistrationStatus.CANCELLED]: 'danger',
    [RegistrationStatus.WAITLIST]: 'info',
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

  if (registrations.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 font-medium text-lg">Brak rejestracji</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {registrations.map((registration) => {
        const participant = registration.getParticipant();
        const canCancel = registration.getStatus() === RegistrationStatus.CONFIRMED || 
                         registration.getStatus() === RegistrationStatus.PENDING;

        return (
          <Card key={registration.getId()} hover glass className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h4 className="text-xl font-black uppercase tracking-tight text-gray-900">
                    {participant.getFullName()}
                  </h4>
                  <Badge variant={statusColors[registration.getStatus()]}>
                    {registration.getStatus()}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600 font-medium">
                  <div>📧 {participant.getEmail()}</div>
                  <div>📞 {participant.getPhone()}</div>
                  <div>🏢 {participant.getOrganization()}</div>
                  <div className="pt-2 text-xs text-gray-500 font-bold uppercase tracking-wide">
                    Zarejestrowano: {formatDate(registration.getRegistrationDate())}
                  </div>
                </div>
              </div>
              {canCancel && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onCancel(registration.getId())}
                  className="ml-4"
                >
                  Anuluj
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

