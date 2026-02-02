import React from 'react';
import { ScheduleItem } from '../models/ScheduleItem';
import { Speaker } from '../models/Speaker';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

interface ScheduleViewProps {
  items: ScheduleItem[];
  speakers: Speaker[];
  onAddItem: () => void;
  onEditItem: (item: ScheduleItem) => void;
  isCreator?: boolean;
}

export function ScheduleView({ items, speakers, onAddItem, onEditItem, isCreator = false }: ScheduleViewProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const sortedItems = [...items].sort((a, b) => 
    a.getStartTime().getTime() - b.getStartTime().getTime()
  );

  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-6 font-medium text-lg">Brak elementów w harmonogramie</p>
        {isCreator && (
          <Button onClick={onAddItem}>
            Dodaj pierwszy element
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">Harmonogram</h3>
        {isCreator && (
          <Button onClick={onAddItem}>
            + Dodaj element
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {sortedItems.map((item) => (
          <Card key={item.getId()} hover glass className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h4 className="text-xl font-black uppercase tracking-tight text-gray-900">
                    {item.getTitle()}
                  </h4>
                  <Badge variant="info">{item.getRoom()}</Badge>
                </div>
                <p className="text-gray-700 mb-4 font-medium leading-relaxed">
                  {item.getDescription()}
                </p>
                <div className="flex items-center gap-6 text-sm text-gray-600 font-medium flex-wrap">
                  <span className="flex items-center gap-2">
                    <span className="font-bold">🕐</span>
                    {formatTime(item.getStartTime())} - {formatTime(item.getEndTime())}
                  </span>
                  {item.getSpeaker() && (
                    <span className="flex items-center gap-2">
                      <span className="font-bold">🎤</span>
                      {item.getSpeaker().getName()} ({item.getSpeaker().getOrganization()})
                    </span>
                  )}
                </div>
              </div>
              {isCreator && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditItem(item)}
                  className="ml-4"
                >
                  Edytuj
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

