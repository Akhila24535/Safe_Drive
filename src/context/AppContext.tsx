import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, Vehicle, FuelLog } from '../types/trip';
import { INITIAL_TRIPS, INITIAL_VEHICLES, INITIAL_FUEL_LOGS } from '../data/initialData';

export type NavTab = 'dashboard' | 'live' | 'logbook' | 'garage' | 'tax' | 'coach';
export type UnitSystem = 'miles' | 'km';

interface AppContextType {
  trips: Trip[];
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unit: UnitSystem;
  toggleUnit: () => void;
  formatDistance: (miles: number) => string;
  formatSpeed: (mph: number) => string;
  unitLabel: string;
  speedLabel: string;
  inspectingTrip: Trip | null;
  setInspectingTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  activeVehicle: Vehicle;
  setActiveVehicleId: (id: string) => void;
  addFuelLog: (log: FuelLog) => void;
  deleteFuelLog: (id: string) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRIPS: 'safedrive_trips_v1',
  VEHICLES: 'safedrive_vehicles_v1',
  FUEL_LOGS: 'safedrive_fuel_v1',
  ACTIVE_VEHICLE: 'safedrive_active_veh_v1',
  UNIT: 'safedrive_unit_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      return saved ? JSON.parse(saved) : INITIAL_TRIPS;
    } catch {
      return INITIAL_TRIPS;
    }
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
    } catch {
      return INITIAL_VEHICLES;
    }
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_FUEL_LOGS;
    } catch {
      return INITIAL_FUEL_LOGS;
    }
  });

  const [activeVehicleId, setActiveVehicleIdState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE);
      if (saved && INITIAL_VEHICLES.some(v => v.id === saved)) return saved;
      return INITIAL_VEHICLES[0]?.id || 'veh-1';
    } catch {
      return 'veh-1';
    }
  });

  const [unit, setUnit] = useState<UnitSystem>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.UNIT);
      return saved === 'km' ? 'km' : 'miles';
    } catch {
      return 'miles';
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [inspectingTrip, setInspectingTrip] = useState<Trip | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch (e) {
      console.error(e);
    }
  }, [trips]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error(e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(fuelLogs));
    } catch (e) {
      console.error(e);
    }
  }, [fuelLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNIT, unit);
    } catch (e) {
      console.error(e);
    }
  }, [unit]);

  const toggleUnit = () => {
    setUnit(prev => (prev === 'miles' ? 'km' : 'miles'));
  };

  const formatDistance = (miles: number): string => {
    if (unit === 'km') {
      return (miles * 1.60934).toFixed(1);
    }
    return miles.toFixed(1);
  };

  const formatSpeed = (mph: number): string => {
    if (unit === 'km') {
      return Math.round(mph * 1.60934).toString();
    }
    return Math.round(mph).toString();
  };

  const unitLabel = unit === 'miles' ? 'mi' : 'km';
  const speedLabel = unit === 'miles' ? 'mph' : 'km/h';

  const addTrip = (trip: Trip) => {
    setTrips(prev => [trip, ...prev]);
    // Also update vehicle odometer
    setVehicles(prev =>
      prev.map(v =>
        v.id === trip.vehicleId
          ? { ...v, currentOdometer: Math.round(v.currentOdometer + trip.distanceMiles) }
          : v
      )
    );
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
    if (inspectingTrip && inspectingTrip.id === id) {
      setInspectingTrip(prev => (prev ? { ...prev, ...updates } : null));
    }
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (inspectingTrip && inspectingTrip.id === id) {
      setInspectingTrip(null);
    }
  };

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const deleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return; // Keep at least one
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (activeVehicleId === id) {
      const remaining = vehicles.filter(v => v.id !== id);
      setActiveVehicleIdState(remaining[0]?.id || '');
    }
  };

  const setActiveVehicleId = (id: string) => {
    setActiveVehicleIdState(id);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, id);
    } catch (e) {
      console.error(e);
    }
  };

  const addFuelLog = (log: FuelLog) => {
    setFuelLogs(prev => [log, ...prev]);
  };

  const deleteFuelLog = (id: string) => {
    setFuelLogs(prev => prev.filter(f => f.id !== id));
  };

  const resetAllData = () => {
    setTrips(INITIAL_TRIPS);
    setVehicles(INITIAL_VEHICLES);
    setFuelLogs(INITIAL_FUEL_LOGS);
    setActiveVehicleIdState(INITIAL_VEHICLES[0].id);
    localStorage.clear();
  };

  const activeVehicle =
    vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || INITIAL_VEHICLES[0];

  return (
    <AppContext.Provider
      value={{
        trips,
        vehicles,
        fuelLogs,
        activeTab,
        setActiveTab,
        unit,
        toggleUnit,
        formatDistance,
        formatSpeed,
        unitLabel,
        speedLabel,
        inspectingTrip,
        setInspectingTrip,
        addTrip,
        updateTrip,
        deleteTrip,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        activeVehicle,
        setActiveVehicleId,
        addFuelLog,
        deleteFuelLog,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
