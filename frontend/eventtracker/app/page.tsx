'use client';

import React, { useState, useEffect } from 'react';
import { EventBase, EventStatus } from './models/EventBase';
import { Conference } from './models/Conference';
import { Seminar } from './models/Seminar';
import { Workshop } from './models/Workshop';
import { ScheduleItem } from './models/ScheduleItem';
import { Participant } from './models/Participant';
import { useEventStore } from './hooks/useEventStore';
import { useAuth } from './contexts/AuthContext';
import { apiService } from './services/apiService';
import { EventCard } from './components/EventCard';
import { EventForm } from './components/EventForm';
import { ScheduleView } from './components/ScheduleView';
import { ScheduleItemForm } from './components/ScheduleItemForm';
import { RegistrationForm } from './components/RegistrationForm';
import { RegistrationList } from './components/RegistrationList';
import { EventRegistrationsView } from './components/EventRegistrationsView';
import { MonitoringDashboard } from './components/MonitoringDashboard';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProfileView } from './components/ProfileView';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';

type View = 'events' | 'schedule' | 'registrations' | 'monitoring' | 'profile';
type EventView = 'list' | 'form' | 'schedule' | 'registrations';

export default function Home() {
  const { isAuthenticated, loading: authLoading, logout, user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState<View>('events');
  const [eventView, setEventView] = useState<EventView>('list');
  const [selectedEvent, setSelectedEvent] = useState<EventBase | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventBase | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<Map<string, { isRegistered: boolean; status?: string; registrationId?: number }>>(new Map());
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ScheduleItem | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEventRegistrationsModalOpen, setIsEventRegistrationsModalOpen] = useState(false);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<EventBase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    events,
    schedules,
    registrations,
    allSpeakers,
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
  } = useEventStore();

  useEffect(() => {
    if (isAuthenticated && user && events.length > 0) {
      const loadRegistrationStatuses = async () => {
        const statusMap = new Map<string, { isRegistered: boolean; status?: string; registrationId?: number }>();
        for (const event of events) {
          const eventWithCreator = event as any;
          const isCreator = user && eventWithCreator.createdByUserId === user.id;
          if (!isCreator) {
            try {
              const status = await apiService.checkRegistration(parseInt(event.getId()));
              statusMap.set(event.getId(), status);
            } catch (err) {
              statusMap.set(event.getId(), { isRegistered: false });
            }
          }
        }
        setEventRegistrations(statusMap);
      };
      loadRegistrationStatuses();
    }
  }, [isAuthenticated, user, events]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const loadMyRegistrations = async () => {
        try {
          const regs = await apiService.getMyRegistrations();
          setMyRegistrations(regs);
        } catch (err) {
          console.error('Błąd ładowania moich rejestracji:', err);
        }
      };
      loadMyRegistrations();
    }
  }, [isAuthenticated, user]);

  const handleEventEdit = (event: EventBase) => {
    setEditingEvent(event);
    setEventView('form');
  };

  const handleEventSave = async (event: EventBase) => {
    try {
      if (editingEvent && editingEvent.getId() === event.getId()) {
        await updateEvent(event);
      } else {
        await addEvent(event);
      }
      setEditingEvent(null);
      setEventView('list');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania wydarzenia');
    }
  };

  const handleEventDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
      try {
        await deleteEvent(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania wydarzenia');
      }
    }
  };

  const handleEventArchive = async (id: string) => {
    try {
      await archiveEvent(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas archiwizacji wydarzenia');
    }
  };

  const handleScheduleItemSave = (item: ScheduleItem) => {
    if (!selectedEvent) return;
    
    if (editingScheduleItem && editingScheduleItem.getId() === item.getId()) {
      updateScheduleItem(selectedEvent.getId(), item);
    } else {
      addScheduleItem(selectedEvent.getId(), item);
    }
    setEditingScheduleItem(null);
    setIsScheduleModalOpen(false);
  };

  const handleRegistrationSubmit = async (participant: Participant) => {
    if (!selectedEvent) return;
    
    try {
      await registerParticipant(selectedEvent.getId(), participant);
      setIsRegistrationModalOpen(false);
      alert('Rejestracja zakończona pomyślnie!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas rejestracji');
    }
  };

  const [activeSessions, setActiveSessions] = useState<{ event: EventBase; activeItems: ScheduleItem[] }[]>([]);

  useEffect(() => {
    const updateActiveSessions = () => {
      const sessions = getActiveSessions();
      setActiveSessions(sessions);
    };

    updateActiveSessions();
    const interval = setInterval(updateActiveSessions, 2000);
    return () => clearInterval(interval);
  }, [getActiveSessions, events, schedules]);
  const filteredEvents = events.filter(e => {
    if (currentView !== 'events' && e.getIsArchived()) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      e.getName().toLowerCase().includes(query) ||
      e.getDescription().toLowerCase().includes(query) ||
      e.getLocation().toLowerCase().includes(query) ||
      e.getEventType().toLowerCase().includes(query)
    );
  });

  const getViewTitle = () => {
    switch (currentView) {
      case 'events': return 'Wydarzenia';
      case 'schedule': return 'Harmonogram';
      case 'registrations': return 'Rejestracje';
      case 'monitoring': return 'Monitoring';
      case 'profile': return 'Mój Profil';
      default: return 'Dashboard';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {showLogin ? (
          <LoginForm
            onSuccess={() => {}}
            onSwitchToRegister={() => setShowLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={() => {}}
            onSwitchToLogin={() => setShowLogin(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view as View);
          if (view !== 'profile') {
            setEventView('list');
            setSelectedEvent(null);
          }
        }}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          title={getViewTitle()} 
          onSearch={(query) => setSearchQuery(query)}
          onProfileClick={() => {
            setCurrentView('profile');
            setEventView('list');
            setSelectedEvent(null);
          }}
        />
        <main className="flex-1 p-8 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Ładowanie danych...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Błąd: {error}</p>
          </div>
        )}
        {!loading && !error && (
        <>
        {currentView === 'events' && (
          <div>
            {eventView === 'list' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">
                    Lista wydarzeń
                  </h2>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setEditingEvent(null);
                      setEventView('form');
                    }}
                  >
                    + Nowe wydarzenie
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.map((event) => {
                    const eventWithCreator = event as any;
                    const isCreator = user && eventWithCreator.createdByUserId === user.id;
                    return (
                      <EventCard
                        key={event.getId()}
                        event={event}
                        isCreator={isCreator}
                        onEdit={isCreator ? handleEventEdit : undefined}
                        onDelete={isCreator ? handleEventDelete : undefined}
                        onArchive={isCreator ? handleEventArchive : undefined}
                        onRegister={!isCreator ? async (eventId) => {
                          if (!user) return;
                          const participant = new Participant(
                            user.id.toString(),
                            user.firstName,
                            user.lastName,
                            user.email,
                            '',
                            ''
                          );
                          try {
                            await registerParticipant(eventId, participant);
                            setEventRegistrations(prev => {
                              const newMap = new Map(prev);
                              newMap.set(eventId, { isRegistered: true, status: 'registered' });
                              return newMap;
                            });
                            const regs = await apiService.getMyRegistrations();
                            setMyRegistrations(regs);
                            alert('Zostałeś zapisany na wydarzenie!');
                          } catch (error) {
                            alert(error instanceof Error ? error.message : 'Błąd podczas zapisywania');
                          }
                        } : undefined}
                        isRegistered={eventRegistrations.get(event.getId())?.isRegistered || false}
                        registrationStatus={eventRegistrations.get(event.getId())?.status}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {eventView === 'form' && (
              <Card glass className="p-8 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingEvent ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
                </h2>
                <EventForm
                  event={editingEvent}
                  onSave={handleEventSave}
                  onCancel={() => {
                    setEditingEvent(null);
                    setEventView('list');
                  }}
                />
              </Card>
            )}

            {eventView === 'schedule' && selectedEvent && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEvent(null);
                      setEventView('list');
                    }}
                  >
                    ← Powrót do listy
                  </Button>
                </div>
                {(() => {
                  const eventWithCreator = events.find(e => e.getId() === selectedEvent.getId());
                  const isCreator = user && eventWithCreator && 'createdByUserId' in eventWithCreator && 
                    (eventWithCreator as any).createdByUserId === user.id;
                  return (
                    <ScheduleView
                      isCreator={isCreator}
                      items={getScheduleForEvent(selectedEvent.getId())}
                      speakers={allSpeakers}
                      onAddItem={() => {
                        setEditingScheduleItem(null);
                        setIsScheduleModalOpen(true);
                      }}
                      onEditItem={(item) => {
                        setEditingScheduleItem(item);
                        setIsScheduleModalOpen(true);
                      }}
                    />
                  );
                })()}
              </div>
            )}

            {eventView === 'registrations' && selectedEvent && (() => {
              const eventWithCreator = selectedEvent as any;
              const isCreator = user && eventWithCreator.createdByUserId === user.id;
              
              if (!isCreator) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Możesz zobaczyć rejestracje tylko dla swoich wydarzeń.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(null);
                        setEventView('list');
                      }}
                    >
                      ← Powrót do listy
                    </Button>
                  </div>
                );
              }
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(null);
                        setEventView('list');
                      }}
                    >
                      ← Powrót do listy
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setIsRegistrationModalOpen(true)}
                    >
                      + Nowa rejestracja
                    </Button>
                  </div>
                  <EventRegistrationsView 
                    eventId={selectedEvent.getId()}
                    onCancel={cancelRegistration}
                  />
                </div>
              );
            })()}
          </div>
        )}

        {currentView === 'schedule' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <Card
                  key={event.getId()}
                  hover
                  glass
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(event);
                    setCurrentView('events');
                    setEventView('schedule');
                  }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {event.getName()}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {getScheduleForEvent(event.getId()).length} elementów w harmonogramie
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'registrations' && (
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-8">
              Rejestracje wydarzeń
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">Brak wydarzeń do wyświetlenia</p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const eventWithCreator = event as any;
                  const isCreator = user && eventWithCreator.createdByUserId === user.id;
                  
                  return (
                    <Card
                      key={event.getId()}
                      hover
                      glass
                      className="p-6 cursor-pointer"
                      onClick={() => {
                        console.log('Kliknięto wydarzenie:', event.getName(), 'isCreator:', isCreator, 'user:', user?.id, 'createdByUserId:', eventWithCreator.createdByUserId);
                        if (isCreator) {
                          setSelectedEventForRegistrations(event);
                          setIsEventRegistrationsModalOpen(true);
                        } else {
                          alert('Możesz zobaczyć rejestracje tylko dla swoich wydarzeń');
                        }
                      }}
                    >
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {event.getName()}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        {isCreator ? 'Zobacz rejestracje' : 'Tylko dla organizatora'}
                      </p>
                      {user && (
                        <p className="text-xs text-gray-500 mt-2">
                          User ID: {user.id}, Event Creator: {eventWithCreator.createdByUserId || 'brak'}
                        </p>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {currentView === 'monitoring' && (
          <MonitoringDashboard
            activeSessions={activeSessions}
            events={events}
          />
        )}

        {currentView === 'my-registrations' && (
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-8">
              Moje rejestracje
            </h2>
            {myRegistrations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 font-medium text-lg">Nie masz żadnych rejestracji</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRegistrations.map((reg) => {
                  const event = events.find(e => e.getId() === reg.eventId.toString());
                  if (!event) return null;
                  
                  return (
                    <Card key={reg.id} hover glass className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">
                          {event.getName()}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {event.getDescription()}
                        </p>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>Status: <span className="font-bold">{reg.status === 'registered' ? 'Zapisano' : reg.status === 'waiting' ? 'W kolejce' : reg.status}</span></div>
                          <div>Data rejestracji: {new Date(reg.registeredAt).toLocaleDateString('pl-PL')}</div>
                          {reg.waitingPosition && (
                            <div>Pozycja w kolejce: {reg.waitingPosition}</div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={async () => {
                          try {
                            await cancelRegistration(reg.id.toString());
                            const regs = await apiService.getMyRegistrations();
                            setMyRegistrations(regs);
                            setEventRegistrations(prev => {
                              const newMap = new Map(prev);
                              newMap.set(reg.eventId.toString(), { isRegistered: false });
                              return newMap;
                            });
                            alert('Rejestracja została anulowana');
                          } catch (error) {
                            alert(error instanceof Error ? error.message : 'Błąd podczas anulowania');
                          }
                        }}
                      >
                        Anuluj rejestrację
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentView === 'profile' && (
          <ProfileView
            events={events}
            registrations={registrations}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setCurrentView('events');
              setEventView('list');
            }}
          />
        )}
        </>
        )}

        </main>
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setEditingScheduleItem(null);
          }}
          title={editingScheduleItem ? 'Edytuj element harmonogramu' : 'Nowy element harmonogramu'}
          size="lg"
        >
          <ScheduleItemForm
            item={editingScheduleItem}
            speakers={allSpeakers}
            onSave={handleScheduleItemSave}
            onCancel={() => {
              setIsScheduleModalOpen(false);
              setEditingScheduleItem(null);
            }}
          />
        </Modal>

        <Modal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          title="Rejestracja uczestnika"
          size="md"
        >
          <RegistrationForm
            onSubmit={handleRegistrationSubmit}
            onCancel={() => setIsRegistrationModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isEventRegistrationsModalOpen}
          onClose={() => {
            setIsEventRegistrationsModalOpen(false);
            setSelectedEventForRegistrations(null);
          }}
          title={selectedEventForRegistrations ? `Rejestracje - ${selectedEventForRegistrations.getName()}` : 'Rejestracje'}
          size="xl"
        >
          {selectedEventForRegistrations && (
            <EventRegistrationsView
              eventId={selectedEventForRegistrations.getId()}
              onCancel={async (id) => {
                try {
                  await cancelRegistration(id);
                } catch (error) {
                  alert(error instanceof Error ? error.message : 'Błąd podczas anulowania');
                }
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
