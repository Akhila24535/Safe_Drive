import React from 'react';
import { useApp } from '../context/AppContext';
import { Trip } from '../types/trip';
import {
  ShieldCheck,
  Navigation,
  DollarSign,
  Fuel,
  ArrowUpRight,
  Play,
  Calendar,
  AlertTriangle,
  Car,
  Clock,
  Sparkles
} from 'lucide-react';
import { DEFAULT_VEHICLE_IMG } from '../data/initialData';

export const Dashboard: React.FC = () => {
  const {
    trips,
    activeVehicle,
    setActiveTab,
    setInspectingTrip,
    formatDistance,
    formatSpeed,
    unitLabel,
    speedLabel
  } = useApp();

  // Aggregate Metrics
  const totalMiles = trips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const businessTrips = trips.filter(t => t.purpose === 'business');
  const businessMiles = businessTrips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const personalMiles = totalMiles - businessMiles;
  const taxDeduction = businessMiles * 0.67;
  const totalDurationSec = trips.reduce((sum, t) => sum + t.durationSeconds, 0);

  const avgSafetyScore = trips.length > 0
    ? Math.round(trips.reduce((sum, t) => sum + t.safetyScore, 0) / trips.length)
    : 100;

  const totalHarshBrakes = trips.reduce((sum, t) => sum + t.events.filter(e => e.type === 'harsh_brake').length, 0);
  const totalRapidAccels = trips.reduce((sum, t) => sum + t.events.filter(e => e.type === 'rapid_accel').length, 0);

  // Safety category discount calculation
  let insuranceDiscountTier = 'Preferred Safe Tier';
  let discountEst = '18% Avg Discount';
  if (avgSafetyScore >= 95) {
    insuranceDiscountTier = 'Elite Safety Tier';
    discountEst = '24% Avg Discount';
  } else if (avgSafetyScore < 85) {
    insuranceDiscountTier = 'Standard Driver Tier';
    discountEst = '5% Avg Discount';
  }

  // Days of week data for mini-chart
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayDistances = [18.4, 34.2, 8.5, 22.0, 4.8, 18.5, 12.0];
  const maxDayDist = Math.max(...dayDistances, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* KPI Stat Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Distance Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Distance Logged</span>
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                {formatDistance(totalMiles)}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">{unitLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <span>{formatDistance(businessMiles)} {unitLabel} business</span>
              <span>·</span>
              <span>{trips.length} trips</span>
            </div>
          </div>
        </div>

        {/* Safety Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Fleet Safety Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-extrabold font-mono tabular-nums ${
                avgSafetyScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {avgSafetyScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <span className="text-emerald-400">{insuranceDiscountTier}</span>
              <span>·</span>
              <span>{discountEst}</span>
            </div>
          </div>
        </div>

        {/* Tax Deductible Expense Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">IRS Mileage Deduction</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                ${taxDeduction.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <span>Standard 2026 IRS rate</span>
              <span>·</span>
              <span className="text-slate-300 font-mono">$0.67/mi</span>
            </div>
          </div>
        </div>

        {/* Active Vehicle & Service Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Primary Vehicle</span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-white block truncate">
              {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-mono">
              <span>Odo: {activeVehicle.currentOdometer.toLocaleString()} mi</span>
              <span>·</span>
              <span className="text-slate-300">{activeVehicle.efficiencyRating.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Record Banner Split */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Ready for Departure</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Ready to log your next vehicle trip?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automatic G-force telemetry, harsh braking detection, IRS mileage deduction tracking, and GPS route recording in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('coach')}
            className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Safety Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className="px-5 py-2.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-all flex items-center gap-2 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Live HUD</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Telemetry Discipline + Weekly Chart + Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Telemetry Breakdown + Weekly Mileage Bar Chart */}
        <div className="lg:col-span-7 space-y-8">
          {/* Telematics Discipline Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Driving Habit Diagnostics</h3>
              <span className="text-xs text-slate-400">Based on {trips.length} verified trips</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Speed Compliance</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">96.8%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Within limit +5mph</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Harsh Braking</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">{totalHarshBrakes}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Events recorded</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Rapid Accels</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">{totalRapidAccels}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Events recorded</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">Distraction Free</span>
                <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">100%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Zero phone handling</span>
              </div>
            </div>
          </div>

          {/* Weekly Distance Activity Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Weekly Mileage Distribution</h3>
                <span className="text-xs text-slate-400">Daily logged driving distance ({unitLabel})</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
                  <span>Business</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-700 rounded-sm inline-block" />
                  <span>Personal</span>
                </span>
              </div>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2">
              {daysOfWeek.map((day, idx) => {
                const dist = dayDistances[idx];
                const heightPercent = Math.max(12, Math.round((dist / maxDayDist) * 100));
                const isBusiness = idx % 2 === 0;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono tabular-nums text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatDistance(dist)}
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t transition-all ${
                        isBusiness ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-mono text-slate-400">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Recent Trips & Garage Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Trips Header & Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Recent Trips</h3>
              <button
                onClick={() => setActiveTab('logbook')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>View All ({trips.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {trips.slice(0, 3).map((trip) => {
                const durationMin = Math.round(trip.durationSeconds / 60);
                const isBusiness = trip.purpose === 'business';

                return (
                  <div
                    key={trip.id}
                    onClick={() => setInspectingTrip(trip)}
                    className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                        {trip.title}
                      </span>
                      <span className={`text-xs font-mono font-bold tabular-nums ${
                        trip.safetyScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {trip.safetyScore} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>{formatDistance(trip.distanceMiles)} {unitLabel}</span>
                        <span>·</span>
                        <span>{durationMin} min</span>
                      </div>
                      <span className="text-[11px] font-medium capitalize text-slate-300">
                        {isBusiness ? `$${(trip.distanceMiles * 0.67).toFixed(2)} Tax Value` : 'Personal'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle Fleet Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="h-32 w-full relative bg-slate-950">
              <img
                src={activeVehicle.image || DEFAULT_VEHICLE_IMG}
                alt={activeVehicle.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">Active Vehicle</span>
                  <h4 className="text-sm font-bold text-white">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveTab('garage')}
                  className="text-xs text-slate-300 hover:text-white underline font-medium"
                >
                  Manage Garage
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-3 text-xs border-t border-slate-800/80">
              <div>
                <span className="text-slate-500 block">Next Service</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  in {(activeVehicle.nextServiceOdometer - activeVehicle.currentOdometer).toLocaleString()} mi
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Insurance Expiry</span>
                <span className="font-mono text-slate-200">{activeVehicle.insuranceExpiry}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
