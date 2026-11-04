import React from 'react';
import { useApp, NavTab } from '../context/AppContext';
import { Shield, Play, Radio, Car } from 'lucide-react';
import { DRIVER_AVATAR_IMG } from '../data/initialData';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, unit, toggleUnit } = useApp();

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'live', label: 'Live Recorder' },
    { id: 'logbook', label: 'Logbook' },
    { id: 'garage', label: 'Garage & Fleet' },
    { id: 'tax', label: 'Tax Reports' },
    { id: 'coach', label: 'AI Coach' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap text-left"
          >
            SafeDrive
          </button>
        </div>

        {/* Zone 2: Nav Links (Clean single-line text with subtle hover/active states) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-2 ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Quick Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Unit Toggle Button */}
          <button
            onClick={toggleUnit}
            title={`Switch to ${unit === 'miles' ? 'Kilometers' : 'Miles'}`}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded-md border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 transition-colors whitespace-nowrap"
          >
            {unit === 'miles' ? 'MPH / MI' : 'KM/H / KM'}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={() => setActiveTab('live')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all whitespace-nowrap shrink-0 shadow-sm ${
              activeTab === 'live'
                ? 'bg-emerald-600 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {activeTab === 'live' ? (
              <>
                <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
                <span>Recorder Active</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Trip</span>
              </>
            )}
          </button>

          {/* Profile thumbnail */}
          <div className="hidden sm:block w-8 h-8 rounded-full overflow-hidden border border-slate-700/80 shrink-0">
            <img
              src={DRIVER_AVATAR_IMG}
              alt="Driver profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-800/60 px-4 py-2 flex items-center justify-between overflow-x-auto gap-3 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2 py-1 rounded transition-colors ${
              activeTab === item.id
                ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
