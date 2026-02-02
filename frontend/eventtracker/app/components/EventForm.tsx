'use client';

import React, { useState, useEffect } from 'react';
import { EventBase, EventStatus } from '../models/EventBase';
import { Conference } from '../models/Conference';
import { Seminar } from '../models/Seminar';
import { Workshop } from '../models/Workshop';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Button } from './Button';

interface EventFormProps {
  event?: EventBase | null;
  onSave: (event: EventBase) => void;
  onCancel: () => void;
}

export function EventForm({ event, onSave, onCancel }: EventFormProps) {
  const [eventType, setEventType] = useState<'conference' | 'seminar' | 'workshop'>('conference');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<EventStatus>(EventStatus.PLANNED);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [tracks, setTracks] = useState('');
  const [topic, setTopic] = useState('');
  const [requiresMaterials, setRequiresMaterials] = useState(false);
  const [materialsCost, setMaterialsCost] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (event) {
      setName(event.getName());
      setDescription(event.getDescription());
      setStartDate(new Date(event.getStartDate()).toISOString().slice(0, 16));
      setEndDate(new Date(event.getEndDate()).toISOString().slice(0, 16));
      setLocation(event.getLocation());
      setStatus(event.getStatus());
      
      if (event instanceof Conference) {
        setEventType('conference');
        setMaxAttendees(event.getCapacity().toString());
        setTracks(event.getTracks().toString());
      } else if (event instanceof Seminar) {
        setEventType('seminar');
        setMaxAttendees(event.getCapacity().toString());
        setTopic(event.getTopic());
      } else if (event instanceof Workshop) {
        setEventType('workshop');
        setMaxAttendees(event.getCapacity().toString());
        setRequiresMaterials(event.getRequiresMaterials());
        setMaterialsCost(event.getMaterialsCost().toString());
      }
    }
  }, [event]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nazwa jest wymagana';
    if (!description.trim()) newErrors.description = 'Opis jest wymagany';
    if (!startDate) newErrors.startDate = 'Data rozpoczęcia jest wymagana';
    if (!endDate) newErrors.endDate = 'Data zakończenia jest wymagana';
    if (!location.trim()) newErrors.location = 'Lokalizacja jest wymagana';
    if (!maxAttendees || parseInt(maxAttendees) <= 0) {
      newErrors.maxAttendees = 'Pojemność musi być większa od 0';
    }

    if (eventType === 'conference' && (!tracks || parseInt(tracks) <= 0)) {
      newErrors.tracks = 'Liczba ścieżek musi być większa od 0';
    }

    if (eventType === 'seminar' && !topic.trim()) {
      newErrors.topic = 'Temat jest wymagany';
    }

    if (eventType === 'workshop' && requiresMaterials && (!materialsCost || parseFloat(materialsCost) < 0)) {
      newErrors.materialsCost = 'Koszt materiałów musi być nieujemny';
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'Data zakończenia musi być późniejsza niż data rozpoczęcia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const id = event?.getId() || `e${Date.now()}`;

    let newEvent: EventBase;

    if (eventType === 'conference') {
      newEvent = new Conference(
        id,
        name,
        description,
        start,
        end,
        location,
        parseInt(maxAttendees),
        parseInt(tracks)
      );
    } else if (eventType === 'seminar') {
      newEvent = new Seminar(
        id,
        name,
        description,
        start,
        end,
        location,
        parseInt(maxAttendees),
        topic
      );
    } else {
      newEvent = new Workshop(
        id,
        name,
        description,
        start,
        end,
        location,
        parseInt(maxAttendees),
        requiresMaterials,
        parseFloat(materialsCost || '0')
      );
    }

    newEvent.setStatus(status);
    if (event?.getIsArchived()) {
      newEvent.archive();
    }

    onSave(newEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Typ wydarzenia"
        value={eventType}
        onChange={(e) => setEventType(e.target.value as any)}
        options={[
          { value: 'conference', label: 'Konferencja' },
          { value: 'seminar', label: 'Seminarium' },
          { value: 'workshop', label: 'Warsztat' },
        ]}
        disabled={!!event}
      />

      <Input
        label="Nazwa wydarzenia"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        required
      />

      <Textarea
        label="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        rows={4}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data rozpoczęcia"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
          required
        />
        <Input
          label="Data zakończenia"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errors.endDate}
          required
        />
      </div>

      <Input
        label="Lokalizacja"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        error={errors.location}
        required
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as EventStatus)}
        options={[
          { value: EventStatus.PLANNED, label: 'Planowane' },
          { value: EventStatus.ACTIVE, label: 'Aktywne' },
          { value: EventStatus.COMPLETED, label: 'Zakończone' },
        ]}
      />

      <Input
        label="Maksymalna liczba uczestników"
        type="number"
        value={maxAttendees}
        onChange={(e) => setMaxAttendees(e.target.value)}
        error={errors.maxAttendees}
        min="1"
        required
      />

      {eventType === 'conference' && (
        <Input
          label="Liczba ścieżek"
          type="number"
          value={tracks}
          onChange={(e) => setTracks(e.target.value)}
          error={errors.tracks}
          min="1"
          required
        />
      )}

      {eventType === 'seminar' && (
        <Input
          label="Temat"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          error={errors.topic}
          required
        />
      )}

      {eventType === 'workshop' && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresMaterials"
              checked={requiresMaterials}
              onChange={(e) => setRequiresMaterials(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="requiresMaterials" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Wymaga materiałów
            </label>
          </div>
          {requiresMaterials && (
            <Input
              label="Koszt materiałów (PLN)"
              type="number"
              value={materialsCost}
              onChange={(e) => setMaterialsCost(e.target.value)}
              error={errors.materialsCost}
              min="0"
              step="0.01"
            />
          )}
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary">
          {event ? 'Zaktualizuj' : 'Utwórz'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}


