import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle, FuelLog } from '../types/trip';
import { DEFAULT_VEHICLE_IMG } from '../data/initialData';
import {
  Car,
  Plus,
  Wrench,
  Fuel,
  Zap,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Trash2,
  DollarSign
} from 'lucide-react';

export const GarageFleet: React.FC = () => {
  const {
    vehicles,
    activeVehicle,
    setActiveVehicleId,
    addVehicle,
    deleteVehicle,
    fuelLogs,
    addFuelLog,
    deleteFuelLog,
    formatDistance,
    unitLabel
  } = useApp();

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showAddFuelModal, setShowAddFuelModal] = useState(false);

  // New Vehicle State
  const [vehName, setVehName] = useState('');
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState('2024');
  const [vehType, setVehType] = useState<'electric' | 'hybrid' | 'gas' | 'diesel'>('electric');
  const [vehPlate, setVehPlate] = useState('');
  const [vehOdometer, setVehOdometer] = useState('');
  const [vehEfficiency, setVehEfficiency] = useState('32 MPG');

  // Fuel / Charging Log State
  const [fuelUnits, setFuelUnits] = useState('');
  const [fuelPricePerUnit, setFuelPricePerUnit] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState(activeVehicle.currentOdometer.toString());
  const [fuelStation, setFuelStation] = useState('');

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      name: vehName || `${vehMake} ${vehModel}`,
      make: vehMake || 'Toyota',
      model: vehModel || 'Camry',
      year: parseInt(vehYear, 10) || 2024,
      type: vehType,
      licensePlate: vehPlate || 'NEW-CAR',
      vin: `1HGCR2F${Date.now().toString().slice(-8)}`,
      currentOdometer: parseInt(vehOdometer, 10) || 12000,
      efficiencyRating: vehEfficiency || '30 MPG',
      insuranceExpiry: '2027-06-30',
      nextServiceOdometer: (parseInt(vehOdometer, 10) || 12000) + 5000,
      nextServiceDate: '2027-04-15',
      color: 'Solid Black',
      isDefault: false,
      image: DEFAULT_VEHICLE_IMG,
    };

    addVehicle(newVeh);
    setShowAddVehicleModal(false);
    setVehName('');
    setVehMake('');
    setVehModel('');
    setVehPlate('');
    setVehOdometer('');
  };

  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const units = parseFloat(fuelUnits) || 10;
    const price = parseFloat(fuelPricePerUnit) || 3.89;
    const total = units * price;

    const log: FuelLog = {
      id: `fuel-${Date.now()}`,
      vehicleId: activeVehicle.id,
      date: new Date().toISOString().split('T')[0],
      gallonsOrKwh: units,
      pricePerUnit: price,
      totalCost: parseFloat(total.toFixed(2)),
      odometer: parseInt(fuelOdometer, 10) || activeVehicle.currentOdometer,
      isFullTank: true,
      station: fuelStation || 'Local Fuel Station',
    };

    addFuelLog(log);
    setShowAddFuelModal(false);
    setFuelUnits('');
    setFuelPricePerUnit('');
    setFuelStation('');
  };

  const vehicleFuelLogs = fuelLogs.filter(f => f.vehicleId === activeVehicle.id);
  const totalFuelSpent = vehicleFuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Garage Fleet & Vehicle Maintenance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your vehicles, track scheduled maintenance intervals, and log fuel/charging costs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddFuelModal(true)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Fuel className="w-3.5 h-3.5 text-emerald-400" />
            <span>Log Fuel / Charge</span>
          </button>
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((veh) => {
          const isActive = veh.id === activeVehicle.id;
          const milesToService = veh.nextServiceOdometer - veh.currentOdometer;

          return (
            <div
              key={veh.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                isActive ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20' : 'border-slate-800'
              }`}
            >
              {/* Photo Banner */}
              <div className="h-44 w-full relative bg-slate-950">
                <img
                  src={veh.image || DEFAULT_VEHICLE_IMG}
                  alt={veh.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  {isActive ? (
                    <span className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-emerald-500 text-slate-950 rounded-md">
                      ACTIVE CAR
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveVehicleId(veh.id)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700 rounded-md transition-colors"
                    >
                      Set Active
                    </button>
                  )}
                  {vehicles.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${veh.name} from garage?`)) deleteVehicle(veh.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded bg-slate-950/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-xs font-mono text-emerald-400 capitalize">{veh.type} · {veh.efficiencyRating}</span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {veh.year} {veh.make} {veh.model}
                  </h3>
                </div>
              </div>

              {/* Specs & Health Strip */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Odometer</span>
                    <span className="font-bold font-mono text-white tabular-nums">
                      {veh.currentOdometer.toLocaleString()} {unitLabel}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">License Plate</span>
                    <span className="font-bold font-mono text-slate-200 uppercase">
                      {veh.licensePlate}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Service Due In</span>
                    <span className={`font-bold font-mono tabular-nums ${
                      milesToService <= 1000 ? 'text-amber-400' : 'text-slate-200'
                    }`}>
                      {milesToService > 0 ? `${milesToService.toLocaleString()} mi` : 'Overdue'}
                    </span>
                  </div>
                </div>

                {/* Maintenance Items */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                  <span className="font-semibold text-slate-300 block">Upcoming Service Schedule</span>
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{veh.type === 'electric' ? 'Cabin Filter & Brake Inspection' : 'Oil & Filter Change'}</span>
                    </div>
                    <span className="font-mono text-slate-300">Target: {veh.nextServiceOdometer.toLocaleString()} mi</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Insurance Policy Expiry</span>
                    </div>
                    <span className="font-mono text-slate-300">{veh.insuranceExpiry}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fuel & EV Charging Expense Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Fuel & EV Charging History</h3>
            <span className="text-xs text-slate-400">
              For {activeVehicle.name} · Total Logged: ${totalFuelSpent.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setShowAddFuelModal(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fill-Up / Charge</span>
          </button>
        </div>

        {vehicleFuelLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No fuel or charging receipts logged for this vehicle yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-medium">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Station / Location</th>
                  <th className="py-2.5 px-3 text-right">Volume (Gal / kWh)</th>
                  <th className="py-2.5 px-3 text-right">Price / Unit</th>
                  <th className="py-2.5 px-3 text-right">Total Cost</th>
                  <th className="py-2.5 px-3 text-right">Odometer</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {vehicleFuelLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-300">{log.date}</td>
                    <td className="py-2.5 px-3 font-sans text-white">{log.station}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300 tabular-nums">{log.gallonsOrKwh}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">${log.pricePerUnit.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold tabular-nums">${log.totalCost.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">{log.odometer.toLocaleString()} mi</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteFuelLog(log.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Add Vehicle to Garage</h2>
            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={vehMake}
                    onChange={(e) => setVehMake(e.target.value)}
                    placeholder="e.g. Ford, Tesla, BMW"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    placeholder="e.g. F-150 Lightning"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Model Year</label>
                  <input
                    type="number"
                    value={vehYear}
                    onChange={(e) => setVehYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Powertrain</label>
                  <select
                    value={vehType}
                    onChange={(e) => setVehType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="electric">Electric (EV)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="gas">Gasoline</option>
                    <option value="diesel">Diesel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Current Odometer</label>
                  <input
                    type="number"
                    required
                    value={vehOdometer}
                    onChange={(e) => setVehOdometer(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">License Plate</label>
                  <input
                    type="text"
                    value={vehPlate}
                    onChange={(e) => setVehPlate(e.target.value)}
                    placeholder="8ABC123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fuel / Charge Modal */}
      {showAddFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">Log Fuel or Charging Receipt</h2>
            <form onSubmit={handleCreateFuelLog} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Station or Charger Name</label>
                <input
                  type="text"
                  required
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  placeholder="e.g. Shell / Tesla Supercharger"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Gallons or kWh</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={fuelUnits}
                    onChange={(e) => setFuelUnits(e.target.value)}
                    placeholder="12.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Price per Unit ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fuelPricePerUnit}
                    onChange={(e) => setFuelPricePerUnit(e.target.value)}
                    placeholder="4.19"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Current Odometer at Pump</label>
                <input
                  type="number"
                  value={fuelOdometer}
                  onChange={(e) => setFuelOdometer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFuelModal(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
