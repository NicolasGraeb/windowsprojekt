'use client';

import React, { useState, useEffect } from 'react';
import { Registration, RegistrationStatus } from '../models/Registration';
import { useEventStore } from '../hooks/useEventStore';
import { RegistrationList } from './RegistrationList';

interface EventRegistrationsViewProps {
  eventId: string;
  onCancel: (id: string) => void;
}

export function EventRegistrationsView({ eventId, onCancel }: EventRegistrationsViewProps) {
  const { getRegistrationsForEvent } = useEventStore();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const regs = await getRegistrationsForEvent(eventId);
        setRegistrations(regs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Błąd ładowania rejestracji');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadRegistrations();
    }
  }, [eventId]); // Usunięto getRegistrationsForEvent z dependency array

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Ładowanie rejestracji...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Błąd: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">
          Lista zapisanych uczestników
        </h3>
        <p className="text-gray-600 font-medium">
          Liczba zapisanych: <span className="font-bold text-purple-700">{registrations.length}</span>
        </p>
      </div>
      <RegistrationList registrations={registrations} onCancel={onCancel} />
    </div>
  );
}
