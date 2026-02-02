import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'events', label: 'Wydarzenia', icon: '📅' },
    { id: 'schedule', label: 'Harmonogram', icon: '📋' },
    { id: 'registrations', label: 'Rejestracje', icon: '👥' },
    { id: 'my-registrations', label: 'Moje rejestracje', icon: '✅' },
    { id: 'monitoring', label: 'Monitoring', icon: '📊' },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-lg border-r-2 border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-lg">
            ET
          </div>
          <span className="text-xl font-bold text-gray-800">Event Tracker</span>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${currentView === item.id
                    ? 'bg-transparent border-2 border-purple-500 text-purple-700 shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t-2 border-gray-200">
        <button
          onClick={() => onViewChange('profile')}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
            ${currentView === 'profile'
              ? 'bg-transparent border-2 border-purple-500 text-purple-700 shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            JK
          </div>
          <span className="font-medium">Jan Kowalski</span>
        </button>
      </div>
    </aside>
  );
}

