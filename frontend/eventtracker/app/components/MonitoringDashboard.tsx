import React, { useState, useEffect } from 'react';
import { EventBase } from '../models/EventBase';
import { ScheduleItem } from '../models/ScheduleItem';
import { Card } from './Card';
import { Badge } from './Badge';
import { apiService } from '../services/apiService';
import { ApiEventMonitoringData } from '../config/api';

interface MonitoringDashboardProps {
  activeSessions: { event: EventBase; activeItems: ScheduleItem[] }[];
  events: EventBase[];
}

export function MonitoringDashboard({ activeSessions, events }: MonitoringDashboardProps) {
  const [monitoringData, setMonitoringData] = useState<Map<number, ApiEventMonitoringData>>(new Map());
  const [currentActiveSessions, setCurrentActiveSessions] = useState(activeSessions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentActiveSessions(activeSessions);
  }, [activeSessions]);

  useEffect(() => {
    let isMounted = true;
    
    const loadMonitoringData = async () => {
      if (!isMounted || events.length === 0) return;
      
      try {
        setLoading(false);
        const dataMap = new Map<number, ApiEventMonitoringData>();
        
        const promises = events.map(async (event) => {
          try {
            const data = await apiService.getEventMonitoring(parseInt(event.getId()));
            return { eventId: parseInt(event.getId()), data, success: true };
          } catch (err) {
            console.error(`Błąd ładowania monitoringu dla wydarzenia ${event.getId()}:`, err);
            return { eventId: parseInt(event.getId()), data: null, success: false };
          }
        });

        const results = await Promise.all(promises);
        results.forEach(result => {
          if (result.success && result.data) {
            dataMap.set(result.eventId, result.data);
          }
        });
        
        if (isMounted) {
          setMonitoringData(prev => {
            const merged = new Map(prev);
            dataMap.forEach((value, key) => merged.set(key, value));
            return merged;
          });
        }
      } catch (err) {
        console.error('Błąd ładowania danych monitoringu:', err);
      }
    };

    if (events.length > 0) {
      loadMonitoringData();
      
      const interval = setInterval(() => {
        if (isMounted) {
          loadMonitoringData();
        }
      }, 5000);
      
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [events]);

  if (loading && monitoringData.size === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Ładowanie danych monitoringu...</p>
      </div>
    );
  }

  let totalRegistrations = 0;
  let totalCheckedIn = 0;
  let totalWaiting = 0;
  
  monitoringData.forEach((data) => {
    totalRegistrations += data.totalRegistrations;
    totalCheckedIn += data.checkedInCount;
    totalWaiting += data.waitingListCount;
  });
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const activeSessionsCount = currentActiveSessions.reduce((sum, s) => sum + s.activeItems.length, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Aktywne sesje</div>
          <div className="text-4xl font-black text-gray-900">
            {activeSessionsCount}
          </div>
        </Card>
        <Card glass className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Wszystkie rejestracje</div>
          <div className="text-4xl font-black text-purple-700">
            {totalRegistrations}
          </div>
        </Card>
        <Card glass className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Zalogowani</div>
          <div className="text-4xl font-black text-green-700">
            {totalCheckedIn}
          </div>
        </Card>
        <Card glass className="p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">Lista oczekujących</div>
          <div className="text-4xl font-black text-yellow-700">
            {totalWaiting}
          </div>
        </Card>
      </div>

      {events.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Monitoring wydarzeń
          </h3>
          {events.map((event) => {
            const data = monitoringData.get(parseInt(event.getId()));
            if (!data) return null;
            
            return (
              <Card key={event.getId()} glass className="p-6">
                <div className="mb-4">
                  <h4 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">
                    {event.getName()}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">Rejestracje</div>
                      <div className="text-2xl font-black text-purple-700">{data.totalRegistrations}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">Zalogowani</div>
                      <div className="text-2xl font-black text-green-700">{data.checkedInCount}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">W kolejce</div>
                      <div className="text-2xl font-black text-yellow-700">{data.waitingListCount}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-600">Aktywne sesje</div>
                      <div className="text-2xl font-black text-gray-900">{data.activeSessionsCount}</div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {currentActiveSessions.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">
            Aktywne sesje w czasie rzeczywistym
          </h3>
          {currentActiveSessions.map(({ event, activeItems }) => (
            <Card key={event.getId()} glass className="p-6">
              <div className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-gray-900">
                    {event.getName()}
                  </h4>
                  <Badge variant="success">Aktywne</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {activeItems.map((item) => (
                  <div
                    key={item.getId()}
                    className="p-5 bg-gray-100 border-2 border-gray-400"
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <h5 className="text-lg font-black uppercase tracking-tight text-gray-900">
                        {item.getTitle()}
                      </h5>
                      <Badge variant="info">{item.getRoom()}</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 font-medium leading-relaxed">
                      {item.getDescription()}
                    </p>
                    <div className="flex items-center gap-6 text-xs text-gray-600 font-bold uppercase tracking-wide flex-wrap">
                      <span>🕐 {formatTime(item.getStartTime())} - {formatTime(item.getEndTime())}</span>
                      {item.getSpeaker() && item.getSpeaker() !== null && (
                        <span>🎤 {item.getSpeaker()!.getName()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card glass className="p-16 text-center">
          <p className="text-gray-600 font-medium text-lg">
            Brak aktywnych sesji w tym momencie
          </p>
        </Card>
      )}
    </div>
  );
}

