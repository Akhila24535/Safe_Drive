import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RoutePoint, TelemetryEvent } from '../types/trip';

interface TripMapProps {
  routePoints: RoutePoint[];
  events?: TelemetryEvent[];
  activePointIndex?: number | null;
  interactive?: boolean;
  className?: string;
  zoom?: number;
}

export const TripMap: React.FC<TripMapProps> = ({
  routePoints,
  events = [],
  activePointIndex = null,
  className = 'h-72 w-full rounded-lg overflow-hidden',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentCarMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (routePoints.length === 0) return;

    // Dispose previous map if exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const firstCoord: [number, number] = [routePoints[0][0], routePoints[0][1]];

    const map = L.map(mapContainerRef.current, {
      center: firstCoord,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Add zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // CartoDB Dark Matter tiles for ultra-sleek telemetry dashboard
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // LatLng array
    const latLngs: [number, number][] = routePoints.map(p => [p[0], p[1]]);

    // Draw route polyline with glowing teal/emerald stroke
    const polyline = L.polyline(latLngs, {
      color: '#10b981',
      weight: 4,
      opacity: 0.85,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map);

    // Start marker
    const startIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(16,185,129,0.8);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker(latLngs[0], { icon: startIcon })
      .bindPopup('<strong style="color: #0f172a;">Trip Origin</strong>')
      .addTo(map);

    // End marker
    const endIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="background-color: #3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    L.marker(latLngs[latLngs.length - 1], { icon: endIcon })
      .bindPopup('<strong style="color: #0f172a;">Destination</strong>')
      .addTo(map);

    // Telemetry event markers
    events.forEach(evt => {
      let color = '#f59e0b'; // amber
      if (evt.type === 'harsh_brake') color = '#ef4444'; // red
      if (evt.type === 'rapid_accel') color = '#eab308'; // yellow
      if (evt.type === 'pothole_hazard') color = '#8b5cf6'; // purple

      const eventIcon = L.divIcon({
        className: 'custom-event-icon',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 4px; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
          <div style="width: 4px; height: 4px; background: #ffffff; border-radius: 50%;"></div>
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([evt.lat, evt.lng], { icon: eventIcon })
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a; padding: 4px;">
            <div style="font-weight: bold; text-transform: capitalize; margin-bottom: 2px;">${evt.type.replace('_', ' ')}</div>
            <div>${evt.description}</div>
            <div style="margin-top: 4px; color: #64748b;">Speed: ${evt.speedMph} mph</div>
          </div>
        `)
        .addTo(map);
    });

    // Fit bounds to polyline
    map.fitBounds(polyline.getBounds(), { padding: [35, 35] });

    // Invalidation fix for container size rendering
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [routePoints, events]);

  // Handle scrubber car position change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || activePointIndex === null || !routePoints[activePointIndex]) {
      if (currentCarMarkerRef.current) {
        currentCarMarkerRef.current.remove();
        currentCarMarkerRef.current = null;
      }
      return;
    }

    const pt = routePoints[activePointIndex];
    const latLng: [number, number] = [pt[0], pt[1]];

    if (!currentCarMarkerRef.current) {
      const carIcon = L.divIcon({
        className: 'car-scrubber-icon',
        html: `<div style="background-color: #38bdf8; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 14px #38bdf8; display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; background-color: #0f172a; border-radius: 50%;"></div>
        </div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      currentCarMarkerRef.current = L.marker(latLng, { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
    } else {
      currentCarMarkerRef.current.setLatLng(latLng);
    }
  }, [activePointIndex, routePoints]);

  return (
    <div className={`relative ${className} bg-slate-900 border border-slate-800`}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
