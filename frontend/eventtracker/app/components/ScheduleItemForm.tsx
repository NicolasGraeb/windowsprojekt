'use client';

import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../models/ScheduleItem';
import { Speaker } from '../models/Speaker';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { Button } from './Button';

interface ScheduleItemFormProps {
  item?: ScheduleItem | null;
  speakers: Speaker[];
  onSave: (item: ScheduleItem) => void;
  onCancel: () => void;
}

export function ScheduleItemForm({ item, speakers, onSave, onCancel }: ScheduleItemFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [speakerId, setSpeakerId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (item) {
      setTitle(item.getTitle());
      setDescription(item.getDescription());
      setStartTime(new Date(item.getStartTime()).toISOString().slice(0, 16));
      setEndTime(new Date(item.getEndTime()).toISOString().slice(0, 16));
      setRoom(item.getRoom());
      setSpeakerId(item.getSpeaker()?.getId() || '');
    }
  }, [item]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Tytuł jest wymagany';
    if (!description.trim()) newErrors.description = 'Opis jest wymagany';
    if (!startTime) newErrors.startTime = 'Czas rozpoczęcia jest wymagany';
    if (!endTime) newErrors.endTime = 'Czas zakończenia jest wymagany';
    if (!room.trim()) newErrors.room = 'Sala jest wymagana';

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      newErrors.endTime = 'Czas zakończenia musi być późniejszy niż czas rozpoczęcia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const id = item?.getId() || `sch${Date.now()}`;
    const speaker = speakerId ? speakers.find(s => s.getId() === speakerId) || null : null;

    const newItem = new ScheduleItem(
      id,
      title,
      description,
      start,
      end,
      room,
      speaker
    );

    onSave(newItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tytuł"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
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
          label="Czas rozpoczęcia"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={errors.startTime}
          required
        />
        <Input
          label="Czas zakończenia"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={errors.endTime}
          required
        />
      </div>

      <Input
        label="Sala"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        error={errors.room}
        required
      />

      <Select
        label="Prelegent (opcjonalnie)"
        value={speakerId}
        onChange={(e) => setSpeakerId(e.target.value)}
        options={[
          { value: '', label: 'Brak prelegenta' },
          ...speakers.map(s => ({ value: s.getId(), label: `${s.getName()} (${s.getOrganization()})` }))
        ]}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary">
          {item ? 'Zaktualizuj' : 'Dodaj'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}


