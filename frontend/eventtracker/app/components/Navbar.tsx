import React from 'react';
import { Button } from './Button';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onProfileClick: () => void;
}

export function Navbar({ currentView, onViewChange, onProfileClick }: NavbarProps) {
  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-40" style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.1)' }}>
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
              Event Tracker
            </h1>
            <div className="hidden md:flex gap-3">
              <Button
                variant={currentView === 'events' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onViewChange('events')}
              >
                Wydarzenia
              </Button>
              <Button
                variant={currentView === 'schedule' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onViewChange('schedule')}
              >
                Harmonogram
              </Button>
              <Button
                variant={currentView === 'registrations' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onViewChange('registrations')}
              >
                Rejestracje
              </Button>
              <Button
                variant={currentView === 'monitoring' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onViewChange('monitoring')}
              >
                Monitoring
              </Button>
            </div>
          </div>
          <button
            onClick={onProfileClick}
            className="flex items-center gap-3 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-bold uppercase tracking-wide text-sm"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))'
            }}
          >
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-black text-xs">
              JD
            </div>
            <span className="hidden sm:inline">Jan Kowalski</span>
          </button>
        </div>
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          <Button
            variant={currentView === 'events' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onViewChange('events')}
          >
            Wydarzenia
          </Button>
          <Button
            variant={currentView === 'schedule' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onViewChange('schedule')}
          >
            Harmonogram
          </Button>
          <Button
            variant={currentView === 'registrations' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onViewChange('registrations')}
          >
            Rejestracje
          </Button>
          <Button
            variant={currentView === 'monitoring' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onViewChange('monitoring')}
          >
            Monitoring
          </Button>
        </div>
      </div>
    </nav>
  );
}


