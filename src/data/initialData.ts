import { Trip, Vehicle, FuelLog, RoutePoint, TelemetryEvent } from '../types/trip';

// Generated vehicle image path
export const DEFAULT_VEHICLE_IMG = '/src/assets/images/vehicle_suv_studio_1793767835319.jpg';
export const DRIVER_AVATAR_IMG = '/src/assets/images/driver_profile_avatar_1793767835035.jpg';

// Route 1: SF Downtown to Palo Alto Stanford Research Park (Highway 101/280 commute)
const ROUTE_SF_TO_PALO_ALTO: RoutePoint[] = [
  [37.7891, -122.4014, 18, 12, 0],
  [37.7850, -122.4035, 25, 14, 60],
  [37.7780, -122.4072, 32, 16, 120],
  [37.7650, -122.4080, 45, 18, 180],
  [37.7450, -122.4050, 58, 22, 240],
  [37.7200, -122.4020, 64, 25, 300],
  [37.6950, -122.3980, 68, 15, 360],
  [37.6650, -122.3950, 66, 10, 420],
  [37.6350, -122.3990, 62, 8, 480], // near SFO
  [37.6100, -122.4050, 42, 9, 540], // mild slowdown
  [37.5850, -122.3850, 65, 12, 600],
  [37.5600, -122.3550, 67, 14, 660], // San Mateo
  [37.5300, -122.3250, 69, 16, 720],
  [37.5000, -122.2850, 68, 18, 780], // Redwood City
  [37.4700, -122.2450, 64, 22, 840],
  [37.4450, -122.2050, 52, 28, 900], // Palo Alto exit
  [37.4350, -122.1850, 38, 32, 960],
  [37.4280, -122.1700, 28, 40, 1020],
  [37.4220, -122.1620, 15, 45, 1080], // Arrival Stanford Park
];

const EVENTS_SF_TO_PALO_ALTO: TelemetryEvent[] = [
  {
    id: 'evt-101',
    type: 'harsh_brake',
    timestampSeconds: 540,
    lat: 37.6100,
    lng: -122.4050,
    severity: 'medium',
    description: 'Sudden congestion near SFO exit. Deceleration: 0.38G',
    speedMph: 42,
    gForce: -0.38,
  },
  {
    id: 'evt-102',
    type: 'rapid_accel',
    timestampSeconds: 600,
    lat: 37.5850,
    lng: -122.3850,
    severity: 'low',
    description: 'Quick merge back to highway speed. Accel: 0.32G',
    speedMph: 65,
    gForce: 0.32,
  },
];

// Route 2: Marina District to Mission & Market (Urban Errands)
const ROUTE_SF_URBAN: RoutePoint[] = [
  [37.8024, -122.4363, 15, 6, 0],
  [37.7980, -122.4320, 22, 14, 60],
  [37.7920, -122.4280, 24, 28, 120],
  [37.7860, -122.4240, 20, 35, 180],
  [37.7800, -122.4200, 18, 22, 240],
  [37.7730, -122.4180, 25, 18, 300],
  [37.7680, -122.4150, 22, 14, 360],
  [37.7620, -122.4120, 12, 12, 420],
];

const EVENTS_SF_URBAN: TelemetryEvent[] = [
  {
    id: 'evt-201',
    type: 'pothole_hazard',
    timestampSeconds: 180,
    lat: 37.7860,
    lng: -122.4240,
    severity: 'low',
    description: 'Road surface irregularity / pothole on Van Ness Ave',
    speedMph: 20,
  },
];

// Route 3: Skyline Blvd to Half Moon Bay (Scenic Coastal & Twisty pass)
const ROUTE_COASTAL: RoutePoint[] = [
  [37.5210, -122.3900, 35, 120, 0],
  [37.5150, -122.4050, 38, 160, 60],
  [37.5080, -122.4200, 34, 210, 120],
  [37.4980, -122.4350, 30, 250, 180],
  [37.4890, -122.4450, 32, 280, 240],
  [37.4800, -122.4550, 36, 210, 300],
  [37.4720, -122.4650, 42, 140, 360],
  [37.4650, -122.4750, 45, 60, 420],
  [37.4620, -122.4850, 35, 20, 480],
  [37.4600, -122.4950, 25, 8, 540],
];

const EVENTS_COASTAL: TelemetryEvent[] = [
  {
    id: 'evt-301',
    type: 'sharp_turn',
    timestampSeconds: 180,
    lat: 37.4980,
    lng: -122.4350,
    severity: 'low',
    description: 'Highway 92 mountain switchback. Lateral G: 0.29G',
    speedMph: 30,
    gForce: 0.29,
  },
];

// Route 4: SFO International Airport to Financial District (Late Night Client Pickup)
const ROUTE_AIRPORT: RoutePoint[] = [
  [37.6213, -122.3790, 20, 5, 0],
  [37.6400, -122.3900, 55, 12, 60],
  [37.6700, -122.3960, 65, 15, 120],
  [37.7000, -122.4010, 68, 18, 180],
  [37.7300, -122.4040, 65, 22, 240],
  [37.7600, -122.4070, 58, 20, 300],
  [37.7800, -122.4020, 35, 15, 360],
  [37.7920, -122.3980, 18, 10, 420],
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    name: 'Primary Commuter',
    make: 'Tesla',
    model: 'Model Y Long Range',
    year: 2024,
    type: 'electric',
    licensePlate: '8XYZ492',
    vin: '5YJ3E1EB8NF182934',
    currentOdometer: 14850,
    efficiencyRating: '122 MPGe (28 kWh/100mi)',
    insuranceExpiry: '2027-04-15',
    nextServiceOdometer: 18000,
    nextServiceDate: '2027-02-10',
    color: 'Midnight Silver Metallic',
    isDefault: true,
    image: DEFAULT_VEHICLE_IMG,
  },
  {
    id: 'veh-2',
    name: 'Weekend SUV',
    make: 'Toyota',
    model: 'RAV4 Hybrid AWD',
    year: 2023,
    type: 'hybrid',
    licensePlate: '7ABC183',
    vin: '2T3KWRFV5NW294810',
    currentOdometer: 26400,
    efficiencyRating: '40 MPG Combined',
    insuranceExpiry: '2026-11-20',
    nextServiceOdometer: 30000,
    nextServiceDate: '2027-01-15',
    color: 'Blueprint Blue',
    isDefault: false,
  },
];

export const INITIAL_TRIPS: Trip[] = [
  {
    id: 'trip-101',
    title: 'Client Strategy & Engineering Sync',
    vehicleId: 'veh-1',
    vehicleName: 'Tesla Model Y Long Range',
    startTime: '2026-11-02T08:15:00Z',
    endTime: '2026-11-02T09:02:00Z',
    durationSeconds: 2820,
    distanceMiles: 34.2,
    avgSpeedMph: 43.6,
    maxSpeedMph: 69.2,
    purpose: 'business',
    reimbursementRate: 0.67,
    safetyScore: 92,
    scoreBreakdown: {
      speedDiscipline: 95,
      smoothBraking: 84,
      gentleAcceleration: 90,
      phoneFree: 100,
      corneringSmoothness: 96,
    },
    events: EVENTS_SF_TO_PALO_ALTO,
    routeCoordinates: ROUTE_SF_TO_PALO_ALTO,
    fuelUsedGallons: 0,
    estimatedCost: 3.85,
    weather: 'clear',
    startLocation: 'Financial District, San Francisco',
    endLocation: 'Stanford Research Park, Palo Alto',
    notes: 'Q4 Product Roadmap review with partner engineering team.',
    tags: ['Client Meeting', 'Highway 101', 'Tax Deductible'],
  },
  {
    id: 'trip-102',
    title: 'Downtown Banking & Office Supplies',
    vehicleId: 'veh-1',
    vehicleName: 'Tesla Model Y Long Range',
    startTime: '2026-11-01T13:40:00Z',
    endTime: '2026-11-01T14:05:00Z',
    durationSeconds: 1500,
    distanceMiles: 4.8,
    avgSpeedMph: 19.2,
    maxSpeedMph: 28.5,
    purpose: 'business',
    reimbursementRate: 0.67,
    safetyScore: 96,
    scoreBreakdown: {
      speedDiscipline: 98,
      smoothBraking: 94,
      gentleAcceleration: 95,
      phoneFree: 100,
      corneringSmoothness: 97,
    },
    events: EVENTS_SF_URBAN,
    routeCoordinates: ROUTE_SF_URBAN,
    fuelUsedGallons: 0,
    estimatedCost: 0.65,
    weather: 'clear',
    startLocation: 'Marina Boulevard, SF',
    endLocation: 'Mission St & 1st St, SF',
    notes: 'Pick up notarized compliance contracts and mail courier.',
    tags: ['Errand', 'Urban', 'Business Expense'],
  },
  {
    id: 'trip-103',
    title: 'Coastal Ridge Weekend Drive',
    vehicleId: 'veh-2',
    vehicleName: 'Toyota RAV4 Hybrid AWD',
    startTime: '2026-10-31T10:15:00Z',
    endTime: '2026-10-31T11:00:00Z',
    durationSeconds: 2700,
    distanceMiles: 18.5,
    avgSpeedMph: 36.4,
    maxSpeedMph: 48.0,
    purpose: 'personal',
    reimbursementRate: 0.67,
    safetyScore: 97,
    scoreBreakdown: {
      speedDiscipline: 96,
      smoothBraking: 98,
      gentleAcceleration: 97,
      phoneFree: 100,
      corneringSmoothness: 94,
    },
    events: EVENTS_COASTAL,
    routeCoordinates: ROUTE_COASTAL,
    fuelUsedGallons: 0.48,
    estimatedCost: 2.30,
    weather: 'clear',
    startLocation: 'Skyline Boulevard Summit',
    endLocation: 'Half Moon Bay Harbor',
    notes: 'Family weekend brunch trip and coast hike.',
    tags: ['Personal', 'Scenic', 'Weekend'],
  },
  {
    id: 'trip-104',
    title: 'SFO Airport Executive Pick-Up',
    vehicleId: 'veh-1',
    vehicleName: 'Tesla Model Y Long Range',
    startTime: '2026-10-29T21:45:00Z',
    endTime: '2026-10-29T22:20:00Z',
    durationSeconds: 2100,
    distanceMiles: 15.3,
    avgSpeedMph: 48.2,
    maxSpeedMph: 68.0,
    purpose: 'business',
    reimbursementRate: 0.67,
    safetyScore: 98,
    scoreBreakdown: {
      speedDiscipline: 99,
      smoothBraking: 97,
      gentleAcceleration: 98,
      phoneFree: 100,
      corneringSmoothness: 98,
    },
    events: [],
    routeCoordinates: ROUTE_AIRPORT,
    fuelUsedGallons: 0,
    estimatedCost: 1.80,
    weather: 'night',
    startLocation: 'San Francisco International Airport (SFO)',
    endLocation: 'Financial District, SF',
    notes: 'Transported visiting advisory board members to hotel.',
    tags: ['Client Pickup', 'Night Drive', 'Deductible'],
  },
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  {
    id: 'fuel-1',
    vehicleId: 'veh-1',
    date: '2026-11-01',
    gallonsOrKwh: 48.2,
    pricePerUnit: 0.36,
    totalCost: 17.35,
    odometer: 14820,
    isFullTank: true,
    station: 'Tesla Supercharger - Emeryville',
  },
  {
    id: 'fuel-2',
    vehicleId: 'veh-2',
    date: '2026-10-28',
    gallonsOrKwh: 11.4,
    pricePerUnit: 4.89,
    totalCost: 55.75,
    odometer: 26380,
    isFullTank: true,
    station: 'Chevron - San Mateo El Camino',
  },
];

export const PRESET_SIMULATION_ROUTES = [
  {
    id: 'highway-commute',
    name: 'Bay Area Expressway (SF to Silicon Valley)',
    description: 'High-speed flow, lane merges, and sudden traffic waves',
    durationEst: '25 min (Simulated)',
    distanceEst: '34.2 mi',
    points: ROUTE_SF_TO_PALO_ALTO,
    speedLimitMph: 65,
  },
  {
    id: 'downtown-urban',
    name: 'San Francisco Downtown Grid',
    description: 'Frequent stop lights, pedestrian crosswalks, tight turns',
    durationEst: '12 min (Simulated)',
    distanceEst: '4.8 mi',
    points: ROUTE_SF_URBAN,
    speedLimitMph: 25,
  },
  {
    id: 'mountain-pass',
    name: 'Skyline Ridge & Coastal Pass',
    description: 'Elevation gradients, twisty switchbacks, gentle deceleration',
    durationEst: '18 min (Simulated)',
    distanceEst: '18.5 mi',
    points: ROUTE_COASTAL,
    speedLimitMph: 45,
  },
];
