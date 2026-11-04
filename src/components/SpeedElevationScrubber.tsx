import React from 'react';
import { RoutePoint, TelemetryEvent } from '../types/trip';
import { useApp } from '../context/AppContext';

interface SpeedElevationScrubberProps {
  routePoints: RoutePoint[];
  events: TelemetryEvent[];
  activeIndex: number | null;
  onSelectIndex: (index: number | null) => void;
}

export const SpeedElevationScrubber: React.FC<SpeedElevationScrubberProps> = ({
  routePoints,
  events,
  activeIndex,
  onSelectIndex,
}) => {
  const { formatSpeed, speedLabel } = useApp();

  if (!routePoints || routePoints.length === 0) {
    return <div className="text-xs text-slate-500 py-4">No telemetry coordinates available.</div>;
  }

  // Calculate bounds
  const speeds = routePoints.map(p => p[2]);
  const elevations = routePoints.map(p => p[3]);
  const maxSpeed = Math.max(...speeds, 50);
  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const elevRange = Math.max(maxElev - minElev, 20);

  const activePoint = activeIndex !== null && routePoints[activeIndex] ? routePoints[activeIndex] : null;

  // Generate SVG path for speed
  const width = 800;
  const height = 120;
  const paddingX = 10;
  const paddingY = 15;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  const pointsCount = routePoints.length;
  const getX = (index: number) => paddingX + (index / (pointsCount - 1 || 1)) * plotWidth;
  const getSpeedY = (speed: number) => height - paddingY - (speed / maxSpeed) * plotHeight;
  const getElevY = (elev: number) => height - paddingY - ((elev - minElev) / elevRange) * (plotHeight * 0.5);

  const speedPoints = routePoints.map((p, i) => `${getX(i)},${getSpeedY(p[2])}`).join(' ');
  const speedArea = `${getX(0)},${height - paddingY} ${speedPoints} ${getX(pointsCount - 1)},${height - paddingY}`;

  const elevPoints = routePoints.map((p, i) => `${getX(i)},${getElevY(p[3])}`).join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full inline-block" />
            <span>Speed Profile ({speedLabel})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-0.5 bg-sky-400/60 rounded-full inline-block" />
            <span>Elevation (m)</span>
          </div>
        </div>

        {activePoint ? (
          <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-300">
            <span>T+{Math.round(activePoint[4])}s</span>
            <span>·</span>
            <span className="text-emerald-400 font-bold">{formatSpeed(activePoint[2])} {speedLabel}</span>
            <span>·</span>
            <span className="text-sky-300">{Math.round(activePoint[3])}m alt</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Hover or drag across graph to inspect points</span>
        )}
      </div>

      {/* SVG Timeline Graph */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-28 cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const index = Math.min(Math.max(0, Math.round(relX * (pointsCount - 1))), pointsCount - 1);
            onSelectIndex(index);
          }}
          onMouseLeave={() => onSelectIndex(null)}
        >
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#334155" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />

          {/* Elevation line */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            points={elevPoints}
          />

          {/* Speed area fill */}
          <polygon
            fill="url(#speedGradient)"
            points={speedArea}
          />

          {/* Speed line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={speedPoints}
          />

          {/* Event indicators on the graph */}
          {events.map((evt) => {
            const evtPtIndex = routePoints.findIndex(p => Math.abs(p[4] - evt.timestampSeconds) < 40);
            if (evtPtIndex === -1) return null;
            const x = getX(evtPtIndex);
            const y = getSpeedY(routePoints[evtPtIndex][2]);
            const isBrake = evt.type === 'harsh_brake';
            const color = isBrake ? '#ef4444' : '#f59e0b';

            return (
              <g key={evt.id}>
                <line x1={x} y1={y} x2={x} y2={height - paddingY} stroke={color} strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={x} cy={y} r="4" fill={color} stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          })}

          {/* Active scrubber cursor */}
          {activeIndex !== null && (
            <g>
              <line
                x1={getX(activeIndex)}
                y1={paddingY}
                x2={getX(activeIndex)}
                y2={height - paddingY}
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(activeIndex)}
                cy={getSpeedY(routePoints[activeIndex][2])}
                r="5"
                fill="#38bdf8"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Timeline Range Slider */}
        <div className="mt-2 flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono">0:00</span>
          <input
            type="range"
            min="0"
            max={pointsCount - 1}
            value={activeIndex ?? 0}
            onChange={(e) => onSelectIndex(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="text-[11px] text-slate-500 font-mono">
            {Math.floor((routePoints[pointsCount - 1]?.[4] || 0) / 60)}:
            {String(Math.floor((routePoints[pointsCount - 1]?.[4] || 0) % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};
