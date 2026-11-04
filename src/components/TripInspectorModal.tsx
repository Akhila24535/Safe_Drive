import React, { useState } from 'react';
import { Trip, TripPurpose } from '../types/trip';
import { useApp } from '../context/AppContext';
import { TripMap } from './TripMap';
import { SpeedElevationScrubber } from './SpeedElevationScrubber';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Clock, 
  MapPin, 
  Receipt, 
  Gauge, 
  AlertTriangle,
  Zap,
  Check
} from 'lucide-react';

interface TripInspectorModalProps {
  trip: Trip;
  onClose: () => void;
}

export const TripInspectorModal: React.FC<TripInspectorModalProps> = ({ trip, onClose }) => {
  const { formatDistance, formatSpeed, unitLabel, speedLabel, updateTrip, deleteTrip } = useApp();
  const [activeScrubberIndex, setActiveScrubberIndex] = useState<number | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(trip.notes);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const durationMin = Math.round(trip.durationSeconds / 60);
  const taxDeduction = (trip.distanceMiles * trip.reimbursementRate).toFixed(2);

  const handlePurposeChange = (newPurpose: TripPurpose) => {
    updateTrip(trip.id, { purpose: newPurpose });
  };

  const handleSaveNotes = () => {
    updateTrip(trip.id, { notes: notesText });
    setIsEditingNotes(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this trip log?')) {
      deleteTrip(trip.id);
      onClose();
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Trip ID', 'Title', 'Vehicle', 'Start Time', 'End Time', 'Distance (mi)', 'Duration (s)', 'Safety Score', 'Purpose', 'Tax Deduction ($)', 'Start Location', 'End Location', 'Notes'].join(','),
      [
        trip.id,
        `"${trip.title}"`,
        `"${trip.vehicleName}"`,
        trip.startTime,
        trip.endTime,
        trip.distanceMiles,
        trip.durationSeconds,
        trip.safetyScore,
        trip.purpose,
        taxDeduction,
        `"${trip.startLocation}"`,
        `"${trip.endLocation}"`,
        `"${trip.notes.replace(/"/g, '""')}"`,
      ].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SafeDrive_${trip.id}_${trip.startTime.split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyTripSummary = () => {
    const summary = `SafeDrive Trip Report: ${trip.title}
Date: ${new Date(trip.startTime).toLocaleDateString()}
Distance: ${formatDistance(trip.distanceMiles)} ${unitLabel} | Duration: ${durationMin} min
Safety Score: ${trip.safetyScore}/100
Purpose: ${trip.purpose.toUpperCase()} (${trip.purpose === 'business' ? `$${taxDeduction} IRS Deduction` : 'Personal'})
Vehicle: ${trip.vehicleName}
Route: ${trip.startLocation} -> ${trip.endLocation}`;
    navigator.clipboard.writeText(summary);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-tight">{trip.title}</h2>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-400">{trip.vehicleName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{new Date(trip.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span>·</span>
              <span>{new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>·</span>
              <span className="capitalize">{trip.weather} weather</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              title="Download CSV"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Trip"
              className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Distance</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {formatDistance(trip.distanceMiles)}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-mono">{unitLabel}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Duration</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">{durationMin}</span>
              <span className="text-xs text-slate-500 ml-1 font-mono">min</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Avg Speed</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {formatSpeed(trip.avgSpeedMph)}
              </span>
              <span className="text-xs text-slate-500 ml-1 font-mono">{speedLabel}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <span className="text-xs text-slate-400 block mb-1">Safety Rating</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-bold font-mono tabular-nums ${
                  trip.safetyScore >= 90 ? 'text-emerald-400' : trip.safetyScore >= 80 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {trip.safetyScore}
                </span>
                <span className="text-xs text-slate-500 font-mono">/100</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-400 block mb-1">IRS Tax Value</span>
              <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {trip.purpose === 'business' ? `$${taxDeduction}` : '$0.00'}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {trip.purpose === 'business' ? 'at $0.67/mi' : 'Personal trip'}
              </span>
            </div>
          </div>

          {/* Interactive Map & Synchronized Scrubber */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Route: {trip.startLocation} → {trip.endLocation}</span>
              </div>
              <span className="font-mono text-slate-500">
                {trip.events.length} Telematics Event{trip.events.length === 1 ? '' : 's'}
              </span>
            </div>

            <TripMap
              routePoints={trip.routeCoordinates}
              events={trip.events}
              activePointIndex={activeScrubberIndex}
              className="h-80 w-full rounded-lg"
            />

            <SpeedElevationScrubber
              routePoints={trip.routeCoordinates}
              events={trip.events}
              activeIndex={activeScrubberIndex}
              onSelectIndex={setActiveScrubberIndex}
            />
          </div>

          {/* Telematics Safety Breakdown & Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Score Breakdown */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safety Discipline Subscores</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Speed Compliance</span>
                    <span className="font-mono tabular-nums text-slate-200">{trip.scoreBreakdown.speedDiscipline}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${trip.scoreBreakdown.speedDiscipline}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Smooth Deceleration & Braking</span>
                    <span className="font-mono tabular-nums text-slate-200">{trip.scoreBreakdown.smoothBraking}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${trip.scoreBreakdown.smoothBraking}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Gentle Throttle & Acceleration</span>
                    <span className="font-mono tabular-nums text-slate-200">{trip.scoreBreakdown.gentleAcceleration}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${trip.scoreBreakdown.gentleAcceleration}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Phone-Free Driving Stability</span>
                    <span className="font-mono tabular-nums text-slate-200">{trip.scoreBreakdown.phoneFree}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${trip.scoreBreakdown.phoneFree}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300">Cornering & Lateral Force</span>
                    <span className="font-mono tabular-nums text-slate-200">{trip.scoreBreakdown.corneringSmoothness}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${trip.scoreBreakdown.corneringSmoothness}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Telemetry Incident Logs */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Recorded Telemetry Events ({trip.events.length})</span>
              </h3>

              {trip.events.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/40 mx-auto mb-2" />
                  <span>Flawless cruise: Zero harsh brakes, sudden accelerations, or phone distractions.</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {trip.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs flex items-start gap-2.5"
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                        evt.type === 'harsh_brake' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-200 capitalize">
                            {evt.type.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            +{Math.floor(evt.timestampSeconds / 60)}m{evt.timestampSeconds % 60}s
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{evt.description}</p>
                        {evt.gForce !== undefined && (
                          <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">
                            Force: {Math.abs(evt.gForce)}G
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Classification & Notes Section */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Trip Purpose Classification
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                  {(['business', 'personal', 'commute', 'medical', 'charity'] as TripPurpose[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePurposeChange(p)}
                      className={`px-3 py-1 text-xs font-medium rounded capitalize transition-colors ${
                        trip.purpose === p
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={copyTripSummary}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Receipt className="w-3.5 h-3.5" />}
                <span>{copiedNotice ? 'Summary Copied!' : 'Copy Summary'}</span>
              </button>
            </div>

            {/* Notes */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-300">Trip & Client Notes</span>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Edit Notes
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    placeholder="Add purpose, passengers, or deductible tax notes..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setNotesText(trip.notes);
                        setIsEditingNotes(false);
                      }}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-500 text-slate-950 rounded hover:bg-emerald-400"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  {trip.notes || 'No specific notes recorded for this trip.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
