import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Trip, TripPurpose, TelemetryEvent, RoutePoint } from '../types/trip';
import { PRESET_SIMULATION_ROUTES } from '../data/initialData';
import { TripMap } from './TripMap';
import confetti from 'canvas-confetti';
import {
  Play,
  Square,
  Pause,
  AlertOctagon,
  Smartphone,
  Gauge,
  Flame,
  CornerDownRight,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Navigation,
  Compass,
  AlertTriangle
} from 'lucide-react';

export const LiveRecorder: React.FC = () => {
  const { activeVehicle, addTrip, formatDistance, formatSpeed, unitLabel, speedLabel, setActiveTab } = useApp();

  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'simulated' | 'device'>('simulated');
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_SIMULATION_ROUTES[0].id);
  const [simSpeedMultiplier, setSimSpeedMultiplier] = useState<number>(2); // 1x, 2x, 5x

  // Live Telemetry states
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSpeedMph, setCurrentSpeedMph] = useState(0);
  const [maxSpeedMph, setMaxSpeedMph] = useState(0);
  const [distanceMiles, setDistanceMiles] = useState(0);
  const [gForceLat, setGForceLat] = useState(0.0);
  const [gForceLong, setGForceLong] = useState(0.0);
  const [safetyScore, setSafetyScore] = useState(100);
  const [recentAlert, setRecentAlert] = useState<{ text: string; type: 'brake' | 'accel' | 'phone' | 'hazard' } | null>(null);

  // Live points & events
  const [recordedPoints, setRecordedPoints] = useState<RoutePoint[]>([]);
  const [recordedEvents, setRecordedEvents] = useState<TelemetryEvent[]>([]);

  // Finish Trip Modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [tripTitle, setTripTitle] = useState('Commute Trip');
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>('business');
  const [tripNotes, setTripNotes] = useState('');

  // Refs for animation & geolocation
  const timerRef = useRef<number | null>(null);
  const simIndexRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  const selectedRoutePreset = PRESET_SIMULATION_ROUTES.find(r => r.id === selectedPresetId) || PRESET_SIMULATION_ROUTES[0];

  // Start live trip
  const handleStartTrip = () => {
    setIsRecording(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    setCurrentSpeedMph(0);
    setMaxSpeedMph(0);
    setDistanceMiles(0);
    setSafetyScore(100);
    setRecentAlert(null);
    setRecordedEvents([]);

    if (recordingMode === 'simulated') {
      simIndexRef.current = 0;
      const initialPt = selectedRoutePreset.points[0];
      setRecordedPoints([initialPt]);
    } else {
      // Device GPS Geolocation
      if (navigator.geolocation) {
        setRecordedPoints([]);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const speedMph = pos.coords.speed ? pos.coords.speed * 2.23694 : 0;
            const newPt: RoutePoint = [
              pos.coords.latitude,
              pos.coords.longitude,
              speedMph,
              pos.coords.altitude || 10,
              elapsedSeconds,
            ];
            setRecordedPoints(prev => [...prev, newPt]);
            setCurrentSpeedMph(speedMph);
            setMaxSpeedMph(prev => Math.max(prev, speedMph));
          },
          (err) => {
            console.warn('Geolocation error, falling back to simulated:', err);
            setRecordingMode('simulated');
          },
          { enableHighAccuracy: true, maximumAge: 1000 }
        );
      }
    }
  };

  // Pause / Resume
  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Main tick loop
  useEffect(() => {
    if (!isRecording || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 1000 / simSpeedMultiplier;

    timerRef.current = window.setInterval(() => {
      setElapsedSeconds(sec => sec + 1);

      if (recordingMode === 'simulated') {
        const points = selectedRoutePreset.points;
        simIndexRef.current += 1;

        if (simIndexRef.current >= points.length) {
          // Loop or reach destination
          simIndexRef.current = points.length - 1;
        }

        const targetPoint = points[simIndexRef.current];
        // Calculate progressive interpolation or jitter
        const jitter = (Math.random() - 0.5) * 2;
        const targetSpeed = Math.max(0, targetPoint[2] + jitter);

        setCurrentSpeedMph(targetSpeed);
        setMaxSpeedMph(prev => Math.max(prev, targetSpeed));

        // Update distance
        setDistanceMiles(prev => prev + (targetSpeed / 3600));

        // Subtle realistic G-forces
        const longForce = (Math.random() - 0.48) * 0.12;
        const latForce = (Math.random() - 0.5) * 0.15;
        setGForceLong(parseFloat(longForce.toFixed(2)));
        setGForceLat(parseFloat(latForce.toFixed(2)));

        setRecordedPoints(prev => {
          const ptWithTime: RoutePoint = [
            targetPoint[0],
            targetPoint[1],
            targetSpeed,
            targetPoint[3],
            prev.length > 0 ? prev[prev.length - 1][4] + 1 : 0,
          ];
          return [...prev, ptWithTime];
        });
      } else {
        // Device mode distance estimation
        setDistanceMiles(prev => prev + (currentSpeedMph / 3600));
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused, recordingMode, selectedRoutePreset, simSpeedMultiplier, currentSpeedMph]);

  // Clean up geolocation on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Telemetry Event Trigger Simulators
  const triggerHarshBrake = () => {
    if (!isRecording) return;
    const currentCoord = recordedPoints[recordedPoints.length - 1] || selectedRoutePreset.points[0];
    const newEvent: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      type: 'harsh_brake',
      timestampSeconds: elapsedSeconds,
      lat: currentCoord[0],
      lng: currentCoord[1],
      severity: 'high',
      description: `Harsh brake detected. Deceleration: -0.42G from ${Math.round(currentSpeedMph)} mph`,
      speedMph: currentSpeedMph,
      gForce: -0.42,
    };

    setGForceLong(-0.42);
    setCurrentSpeedMph(prev => Math.max(0, prev - 18));
    setSafetyScore(prev => Math.max(50, prev - 6));
    setRecordedEvents(prev => [...prev, newEvent]);
    setRecentAlert({ text: 'Harsh Braking Detected (-0.42G)', type: 'brake' });
    setTimeout(() => setRecentAlert(null), 3000);
  };

  const triggerRapidAccel = () => {
    if (!isRecording) return;
    const currentCoord = recordedPoints[recordedPoints.length - 1] || selectedRoutePreset.points[0];
    const newEvent: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      type: 'rapid_accel',
      timestampSeconds: elapsedSeconds,
      lat: currentCoord[0],
      lng: currentCoord[1],
      severity: 'medium',
      description: `Rapid acceleration detected (+0.36G throttle surge)`,
      speedMph: currentSpeedMph,
      gForce: 0.36,
    };

    setGForceLong(0.36);
    setCurrentSpeedMph(prev => prev + 14);
    setSafetyScore(prev => Math.max(50, prev - 4));
    setRecordedEvents(prev => [...prev, newEvent]);
    setRecentAlert({ text: 'Rapid Acceleration Detected (+0.36G)', type: 'accel' });
    setTimeout(() => setRecentAlert(null), 3000);
  };

  const triggerPhoneDistraction = () => {
    if (!isRecording) return;
    const currentCoord = recordedPoints[recordedPoints.length - 1] || selectedRoutePreset.points[0];
    const newEvent: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      type: 'phone_distraction',
      timestampSeconds: elapsedSeconds,
      lat: currentCoord[0],
      lng: currentCoord[1],
      severity: 'medium',
      description: 'Phone motion / handling detected while driving at speed',
      speedMph: currentSpeedMph,
    };

    setSafetyScore(prev => Math.max(50, prev - 8));
    setRecordedEvents(prev => [...prev, newEvent]);
    setRecentAlert({ text: 'Phone Motion Detected! Keep Eyes on Road', type: 'phone' });
    setTimeout(() => setRecentAlert(null), 3000);
  };

  const triggerPotholeHazard = () => {
    if (!isRecording) return;
    const currentCoord = recordedPoints[recordedPoints.length - 1] || selectedRoutePreset.points[0];
    const newEvent: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      type: 'pothole_hazard',
      timestampSeconds: elapsedSeconds,
      lat: currentCoord[0],
      lng: currentCoord[1],
      severity: 'low',
      description: 'Surface impact / pothole logged at current coordinate',
      speedMph: currentSpeedMph,
    };

    setRecordedEvents(prev => [...prev, newEvent]);
    setRecentAlert({ text: 'Road Hazard / Pothole Logged', type: 'hazard' });
    setTimeout(() => setRecentAlert(null), 3000);
  };

  // Stop trip & trigger finish modal
  const handleStopTrip = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setIsRecording(false);
    setIsPaused(false);
    setTripTitle(`${selectedRoutePreset.name} Drive`);
    setShowFinishModal(true);

    if (safetyScore >= 88) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Save trip to context
  const handleSaveCompletedTrip = () => {
    const avgSpeed = elapsedSeconds > 0 ? (distanceMiles / (elapsedSeconds / 3600)) : 0;
    const finalPoints = recordedPoints.length > 0 ? recordedPoints : selectedRoutePreset.points;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      title: tripTitle || 'Logged Trip',
      vehicleId: activeVehicle.id,
      vehicleName: `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`,
      startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds: Math.max(elapsedSeconds, 60),
      distanceMiles: Math.max(parseFloat(distanceMiles.toFixed(1)), 0.5),
      avgSpeedMph: Math.round(avgSpeed) || 35,
      maxSpeedMph: Math.round(maxSpeedMph) || 55,
      purpose: tripPurpose,
      reimbursementRate: 0.67,
      safetyScore: Math.round(safetyScore),
      scoreBreakdown: {
        speedDiscipline: Math.min(100, Math.max(60, safetyScore + 2)),
        smoothBraking: Math.min(100, Math.max(60, safetyScore - 3)),
        gentleAcceleration: Math.min(100, Math.max(60, safetyScore - 2)),
        phoneFree: recordedEvents.some(e => e.type === 'phone_distraction') ? 70 : 100,
        corneringSmoothness: Math.min(100, Math.max(75, safetyScore + 1)),
      },
      events: recordedEvents,
      routeCoordinates: finalPoints,
      fuelUsedGallons: activeVehicle.type === 'electric' ? 0 : parseFloat((distanceMiles / 30).toFixed(2)),
      estimatedCost: parseFloat((distanceMiles * 0.12).toFixed(2)),
      weather: 'clear',
      startLocation: selectedRoutePreset.points[0] ? 'Origin Point' : 'Bay Area',
      endLocation: selectedRoutePreset.points[selectedRoutePreset.points.length - 1] ? 'Destination Point' : 'Destination',
      notes: tripNotes,
      tags: [tripPurpose === 'business' ? 'Tax Deductible' : 'Personal', 'Live Recorded'],
    };

    addTrip(newTrip);
    setShowFinishModal(false);
    setActiveTab('logbook');
  };

  // Speedometer needle calculation (0 to 120 mph mapped to -120deg to +120deg)
  const maxDialSpeed = 120;
  const clampedSpeed = Math.min(currentSpeedMph, maxDialSpeed);
  const needleAngle = -120 + (clampedSpeed / maxDialSpeed) * 240;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Section: Vehicle banner & Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Live Trip & Telemetry HUD</h1>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time speed monitoring, harsh deceleration detection, and safety scoring
            </p>
          </div>
        </div>

        {/* Mode & Speed controls */}
        {!isRecording && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setRecordingMode('simulated')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  recordingMode === 'simulated'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Route Simulation
              </button>
              <button
                onClick={() => setRecordingMode('device')}
                className={`px-3 py-1 font-medium rounded transition-colors ${
                  recordingMode === 'device'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Device GPS (Live)
              </button>
            </div>

            {recordingMode === 'simulated' && (
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                {PRESET_SIMULATION_ROUTES.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.distanceEst})</option>
                ))}
              </select>
            )}
          </div>
        )}

        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sim Multiplier:</span>
            {[1, 2, 5].map((multiplier) => (
              <button
                key={multiplier}
                onClick={() => setSimSpeedMultiplier(multiplier)}
                className={`px-2 py-0.5 text-xs font-mono rounded ${
                  simSpeedMultiplier === multiplier
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {multiplier}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main HUD Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Speedometer & Accelerometer Column (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Recent Event Banner Overlay */}
          {recentAlert && (
            <div className={`absolute top-4 left-4 right-4 z-20 px-4 py-2.5 rounded-lg border flex items-center gap-3 text-xs font-semibold shadow-lg transition-all animate-pulse ${
              recentAlert.type === 'brake' ? 'bg-rose-950/90 border-rose-600 text-rose-200' :
              recentAlert.type === 'accel' ? 'bg-amber-950/90 border-amber-600 text-amber-200' :
              recentAlert.type === 'phone' ? 'bg-purple-950/90 border-purple-600 text-purple-200' :
              'bg-blue-950/90 border-blue-600 text-blue-200'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{recentAlert.text}</span>
            </div>
          )}

          {/* HUD Top Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              <span className="font-mono text-slate-300">
                {isRecording ? (isPaused ? 'RECORDER PAUSED' : 'LIVE TELEMETRY STREAM') : 'STANDBY READY'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Speed Limit:</span>
              <span className="px-2 py-0.5 bg-white text-slate-950 font-bold font-mono rounded text-[11px] border-2 border-slate-950">
                {selectedRoutePreset.speedLimitMph}
              </span>
            </div>
          </div>

          {/* Central Speedometer SVG Dial */}
          <div className="flex flex-col items-center justify-center my-2">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                {/* Background Track */}
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeDasharray="420"
                  strokeDashoffset="120"
                  transform="rotate(120 120 120)"
                />

                {/* Active Speed Arc */}
                <circle
                  cx="120"
                  cy="120"
                  r="95"
                  fill="none"
                  stroke={currentSpeedMph > selectedRoutePreset.speedLimitMph + 10 ? '#ef4444' : '#10b981'}
                  strokeWidth="14"
                  strokeDasharray="420"
                  strokeDashoffset={420 - (clampedSpeed / maxDialSpeed) * 300}
                  strokeLinecap="round"
                  transform="rotate(120 120 120)"
                  className="transition-all duration-300 ease-out"
                />

                {/* Subtle Dial Tick Marks */}
                {[0, 20, 40, 60, 80, 100, 120].map((val) => {
                  const angle = -120 + (val / 120) * 240;
                  const rad = (angle - 90) * (Math.PI / 180);
                  const x1 = 120 + 82 * Math.cos(rad);
                  const y1 = 120 + 82 * Math.sin(rad);
                  const x2 = 120 + 72 * Math.cos(rad);
                  const y2 = 120 + 72 * Math.sin(rad);
                  return (
                    <line
                      key={val}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#475569"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Needle */}
                <g transform={`rotate(${needleAngle} 120 120)`} className="transition-transform duration-200 ease-out">
                  <line x1="120" y1="120" x2="120" y2="40" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="120" cy="120" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                </g>
              </svg>

              {/* Digital Speed Center Value */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight tabular-nums">
                  {formatSpeed(currentSpeedMph)}
                </span>
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400 mt-1 font-semibold">
                  {speedLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry Sensor Gauges: G-Force meter & Live Safety Score */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            {/* G-Force Sensor */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Longitudinal Accel</span>
              <span className={`text-base font-bold font-mono tabular-nums ${
                gForceLong < -0.3 ? 'text-rose-400' : gForceLong > 0.3 ? 'text-amber-400' : 'text-slate-200'
              }`}>
                {gForceLong > 0 ? `+${gForceLong}` : gForceLong} G
              </span>
              <span className="text-[10px] text-slate-500 block">Threshold: ±0.35G</span>
            </div>

            {/* Lateral Cornering Sensor */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Lateral Force</span>
              <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
                {Math.abs(gForceLat)} G
              </span>
              <span className="text-[10px] text-slate-500 block">Cornering turn</span>
            </div>

            {/* Dynamic Safety Score */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">Live Safety Index</span>
              <span className={`text-base font-bold font-mono tabular-nums ${
                safetyScore >= 90 ? 'text-emerald-400' : safetyScore >= 80 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {Math.round(safetyScore)}
              </span>
              <span className="text-[10px] text-slate-500 block">/ 100 Safe</span>
            </div>
          </div>
        </div>

        {/* Right Column: Route Map & Live Stats & Triggers (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Live Route Map Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Route Breadcrumbs</span>
              </span>
              <span className="font-mono text-slate-400">
                {recordedPoints.length} GPS Points
              </span>
            </div>

            <TripMap
              routePoints={recordedPoints.length > 0 ? recordedPoints : selectedRoutePreset.points}
              events={recordedEvents}
              activePointIndex={recordedPoints.length > 0 ? recordedPoints.length - 1 : 0}
              className="h-48 w-full rounded-lg"
            />

            {/* Trip Stats Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Time</span>
                <span className="font-bold font-mono text-white tabular-nums">
                  {Math.floor(elapsedSeconds / 60)}:
                  {String(elapsedSeconds % 60).padStart(2, '0')}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="font-bold font-mono text-emerald-400 tabular-nums">
                  {formatDistance(distanceMiles)} {unitLabel}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Tax Value</span>
                <span className="font-bold font-mono text-white tabular-nums">
                  ${(distanceMiles * 0.67).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Simulation Trigger Pad */}
          {isRecording && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Interactive Telemetry Triggers
                </span>
                <span className="text-[10px] text-slate-500">Test safety scoring response</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={triggerHarshBrake}
                  className="p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 transition-colors font-medium text-left"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Harsh Brake</span>
                </button>

                <button
                  onClick={triggerRapidAccel}
                  className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-2 transition-colors font-medium text-left"
                >
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Rapid Accel</span>
                </button>

                <button
                  onClick={triggerPhoneDistraction}
                  className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 flex items-center gap-2 transition-colors font-medium text-left"
                >
                  <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Phone Motion</span>
                </button>

                <button
                  onClick={triggerPotholeHazard}
                  className="p-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 flex items-center gap-2 transition-colors font-medium text-left"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Mark Hazard</span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Trip Action Button Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            {!isRecording ? (
              <button
                onClick={handleStartTrip}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-[0.99]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Begin Driving Trip</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTogglePause}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? 'Resume Trip' : 'Pause Trip'}</span>
                </button>

                <button
                  onClick={handleStopTrip}
                  className="py-3 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Finish & Save</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Trip Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Trip Completed!</h2>
                <p className="text-xs text-slate-400">Review and classify your drive for tax & fleet records</p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                  {formatDistance(distanceMiles)} {unitLabel}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Duration</span>
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  {Math.floor(elapsedSeconds / 60)} min
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Safety Score</span>
                <span className={`text-sm font-bold font-mono tabular-nums ${
                  safetyScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {Math.round(safetyScore)}/100
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Trip Name</label>
                <input
                  type="text"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Client Site Visit, Commute"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Purpose Classification</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['business', 'personal', 'commute'] as TripPurpose[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTripPurpose(p)}
                      className={`py-1.5 px-3 rounded capitalize font-medium transition-colors ${
                        tripPurpose === p
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Notes / Expense Details</label>
                <textarea
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  placeholder="Optional trip notes or client name..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveCompletedTrip}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors shadow-sm"
              >
                Save to Logbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
