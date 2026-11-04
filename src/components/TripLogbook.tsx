import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trip, TripPurpose } from '../types/trip';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Trash2,
  Calendar,
  ShieldCheck,
  Check,
  DollarSign
} from 'lucide-react';

export const TripLogbook: React.FC = () => {
  const {
    trips,
    vehicles,
    activeVehicle,
    setInspectingTrip,
    deleteTrip,
    addTrip,
    formatDistance,
    formatSpeed,
    unitLabel,
    speedLabel
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<'all' | TripPurpose>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');

  // Manual Trip Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDistance, setManualDistance] = useState('');
  const [manualDuration, setManualDuration] = useState('30');
  const [manualPurpose, setManualPurpose] = useState<TripPurpose>('business');
  const [manualNotes, setManualNotes] = useState('');
  const [manualStartLoc, setManualStartLoc] = useState('');
  const [manualEndLoc, setManualEndLoc] = useState('');

  // Filtering
  const filteredTrips = trips.filter((trip) => {
    // Purpose filter
    if (purposeFilter !== 'all' && trip.purpose !== purposeFilter) return false;
    // Vehicle filter
    if (vehicleFilter !== 'all' && trip.vehicleId !== vehicleFilter) return false;
    // Grade filter
    if (gradeFilter === 'A' && trip.safetyScore < 90) return false;
    if (gradeFilter === 'B' && (trip.safetyScore < 80 || trip.safetyScore >= 90)) return false;
    if (gradeFilter === 'C' && trip.safetyScore >= 80) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        trip.title.toLowerCase().includes(q) ||
        trip.startLocation.toLowerCase().includes(q) ||
        trip.endLocation.toLowerCase().includes(q) ||
        trip.notes.toLowerCase().includes(q) ||
        trip.vehicleName.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleCreateManualTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const distNum = parseFloat(manualDistance) || 5.0;
    const durNum = (parseInt(manualDuration, 10) || 30) * 60;

    const newTrip: Trip = {
      id: `trip-man-${Date.now()}`,
      title: manualTitle || 'Manual Mileage Entry',
      vehicleId: activeVehicle.id,
      vehicleName: `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`,
      startTime: new Date(Date.now() - durNum * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: durNum,
      distanceMiles: distNum,
      avgSpeedMph: Math.round(distNum / (durNum / 3600)) || 35,
      maxSpeedMph: 55,
      purpose: manualPurpose,
      reimbursementRate: 0.67,
      safetyScore: 95,
      scoreBreakdown: {
        speedDiscipline: 95,
        smoothBraking: 95,
        gentleAcceleration: 95,
        phoneFree: 100,
        corneringSmoothness: 95,
      },
      events: [],
      routeCoordinates: [
        [37.7749, -122.4194, 25, 10, 0],
        [37.7833, -122.4167, 30, 15, durNum],
      ],
      fuelUsedGallons: activeVehicle.type === 'electric' ? 0 : parseFloat((distNum / 30).toFixed(2)),
      estimatedCost: parseFloat((distNum * 0.12).toFixed(2)),
      weather: 'clear',
      startLocation: manualStartLoc || 'Office / Start',
      endLocation: manualEndLoc || 'Client / Destination',
      notes: manualNotes,
      tags: ['Manual Entry', manualPurpose === 'business' ? 'Tax Deductible' : 'Personal'],
    };

    addTrip(newTrip);
    setShowManualModal(false);
    setManualTitle('');
    setManualDistance('');
    setManualNotes('');
  };

  const handleExportFullCSV = () => {
    const headers = [
      'Trip ID',
      'Title',
      'Vehicle',
      'Date',
      'Start Time',
      'End Time',
      'Distance (miles)',
      'Duration (min)',
      'Avg Speed (mph)',
      'Safety Score',
      'Purpose',
      'IRS Tax Deduction ($)',
      'Start Location',
      'End Location',
      'Notes',
    ];

    const rows = filteredTrips.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.vehicleName}"`,
      t.startTime.split('T')[0],
      t.startTime,
      t.endTime,
      t.distanceMiles,
      Math.round(t.durationSeconds / 60),
      t.avgSpeedMph,
      t.safetyScore,
      t.purpose,
      (t.purpose === 'business' ? t.distanceMiles * 0.67 : 0).toFixed(2),
      `"${t.startLocation.replace(/"/g, '""')}"`,
      `"${t.endLocation.replace(/"/g, '""')}"`,
      `"${t.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SafeDrive_Trip_Logbook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Trip Logbook & Inspection</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse complete driving telemetry records, verify tax classifications, and inspect routes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>

          <button
            onClick={handleExportFullCSV}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, route city, or client notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter dropdowns & tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Purpose Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
            {(['all', 'business', 'personal', 'commute'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPurposeFilter(p)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  purposeFilter === p
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Vehicle selector */}
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Safety Scores</option>
            <option value="A">Grade A (90+)</option>
            <option value="B">Grade B (80-89)</option>
            <option value="C">Needs Review (&lt;80)</option>
          </select>
        </div>
      </div>

      {/* High-Density Logbook Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-medium">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Trip Title & Origin / Destination</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4 text-right">Distance</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4 text-right">Avg Speed</th>
                <th className="py-3 px-4 text-center">Safety Score</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-right">IRS Value</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No trips found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const durationMin = Math.round(trip.durationSeconds / 60);
                  const isBusiness = trip.purpose === 'business';
                  const taxVal = (trip.distanceMiles * 0.67).toFixed(2);

                  return (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setInspectingTrip(trip)}
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        <div>{new Date(trip.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {trip.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {trip.startLocation} → {trip.endLocation}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {trip.vehicleName.split(' ')[0]} {trip.vehicleName.split(' ')[1]}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-200 tabular-nums whitespace-nowrap">
                        {formatDistance(trip.distanceMiles)} {unitLabel}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {durationMin} min
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 tabular-nums whitespace-nowrap">
                        {formatSpeed(trip.avgSpeedMph)} {speedLabel}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`inline-block font-mono font-bold tabular-nums text-xs ${
                          trip.safetyScore >= 90 ? 'text-emerald-400' : trip.safetyScore >= 80 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {trip.safetyScore}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="capitalize font-medium text-slate-300">
                          {trip.purpose}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                        {isBusiness ? (
                          <span className="text-emerald-400">${taxVal}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setInspectingTrip(trip)}
                            title="Inspect Route & Telemetry"
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-700/60 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this trip log?')) deleteTrip(trip.id);
                            }}
                            title="Delete"
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Trip Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Manual Mileage Entry</h2>
            <p className="text-xs text-slate-400">
              Log a business or personal drive without live GPS recording
            </p>

            <form onSubmit={handleCreateManualTrip} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Trip Title</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Supplier Factory Audit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Distance (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={manualDistance}
                    onChange={(e) => setManualDistance(e.target.value)}
                    placeholder="24.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Est. Duration (min)</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="35"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Purpose</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['business', 'personal', 'commute'] as TripPurpose[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setManualPurpose(p)}
                      className={`py-1.5 rounded capitalize font-medium transition-colors ${
                        manualPurpose === p
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Start Location</label>
                  <input
                    type="text"
                    value={manualStartLoc}
                    onChange={(e) => setManualStartLoc(e.target.value)}
                    placeholder="Office HQ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">End Location</label>
                  <input
                    type="text"
                    value={manualEndLoc}
                    onChange={(e) => setManualEndLoc(e.target.value)}
                    placeholder="Downtown Client"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Notes</label>
                <textarea
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  rows={2}
                  placeholder="Client project details for tax records..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
