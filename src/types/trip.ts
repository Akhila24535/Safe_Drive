export type TripPurpose = 'business' | 'personal' | 'commute' | 'medical' | 'charity';

export type WeatherCondition = 'clear' | 'rain' | 'night' | 'fog' | 'snow';

export type TelemetryEventType = 
  | 'harsh_brake' 
  | 'rapid_accel' 
  | 'sharp_turn' 
  | 'speeding' 
  | 'phone_distraction' 
  | 'pothole_hazard' 
  | 'fuel_stop';

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestampSeconds: number;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  speedMph: number;
  gForce?: number;
}

// [lat, lng, speedMph, elevationMeters, timestampSeconds]
export type RoutePoint = [number, number, number, number, number];

export interface TripScoreBreakdown {
  speedDiscipline: number; // 0 - 100
  smoothBraking: number; // 0 - 100
  gentleAcceleration: number; // 0 - 100
  phoneFree: number; // 0 - 100
  corneringSmoothness: number; // 0 - 100
}

export interface Trip {
  id: string;
  title: string;
  vehicleId: string;
  vehicleName: string;
  startTime: string; // ISO
  endTime: string; // ISO
  durationSeconds: number;
  distanceMiles: number;
  avgSpeedMph: number;
  maxSpeedMph: number;
  purpose: TripPurpose;
  reimbursementRate: number; // e.g. 0.67
  safetyScore: number; // 0 - 100
  scoreBreakdown: TripScoreBreakdown;
  events: TelemetryEvent[];
  routeCoordinates: RoutePoint[];
  fuelUsedGallons: number;
  estimatedCost: number;
  weather: WeatherCondition;
  startLocation: string;
  endLocation: string;
  notes: string;
  tags: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  type: 'electric' | 'hybrid' | 'gas' | 'diesel';
  licensePlate: string;
  vin: string;
  currentOdometer: number;
  efficiencyRating: string; // e.g., "120 MPGe" or "32 MPG"
  insuranceExpiry: string;
  nextServiceOdometer: number;
  nextServiceDate: string;
  color: string;
  isDefault: boolean;
  image?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  gallonsOrKwh: number;
  pricePerUnit: number;
  totalCost: number;
  odometer: number;
  isFullTank: boolean;
  station: string;
}
