import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { LiveRecorder } from './components/LiveRecorder';
import { TripLogbook } from './components/TripLogbook';
import { GarageFleet } from './components/GarageFleet';
import { TaxReports } from './components/TaxReports';
import { AICoach } from './components/AICoach';
import { TripInspectorModal } from './components/TripInspectorModal';
import { Shield, RotateCcw } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, inspectingTrip, setInspectingTrip, resetAllData } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'live' && <LiveRecorder />}
        {activeTab === 'logbook' && <TripLogbook />}
        {activeTab === 'garage' && <GarageFleet />}
        {activeTab === 'tax' && <TaxReports />}
        {activeTab === 'coach' && <AICoach />}
      </main>

      {/* Trip Inspector Modal if inspecting */}
      {inspectingTrip && (
        <TripInspectorModal
          trip={inspectingTrip}
          onClose={() => setInspectingTrip(null)}
        />
      )}

      {/* Footer conforming to domain-design rules */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-slate-400">SafeDrive Vehicle Telematics & Trip Logger</span>
            <span>·</span>
            <span>IRS Standard Rate Compliant</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm('Reset to default sample vehicle trips and garage data?')) {
                  resetAllData();
                }
              }}
              className="hover:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>
            <span>·</span>
            <span>Telemetry v2.6</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
