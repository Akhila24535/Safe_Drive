import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, Printer, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const TaxReports: React.FC = () => {
  const { trips, formatDistance, unitLabel } = useApp();
  const [taxYear, setTaxYear] = useState('2026');
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');
  const [ratePerMile, setRatePerMile] = useState<number>(0.67); // IRS 2026 standard rate

  // Filter trips by date and purpose
  const businessTrips = trips.filter(t => t.purpose === 'business');
  const personalTrips = trips.filter(t => t.purpose === 'personal');
  const commuteTrips = trips.filter(t => t.purpose === 'commute');

  const totalBusinessMiles = businessTrips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const totalPersonalMiles = personalTrips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const totalCommuteMiles = commuteTrips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const totalMilesAll = totalBusinessMiles + totalPersonalMiles + totalCommuteMiles;

  const totalDeduction = totalBusinessMiles * ratePerMile;
  const businessPercent = totalMilesAll > 0 ? Math.round((totalBusinessMiles / totalMilesAll) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadIRSReport = () => {
    const headers = [
      'Tax Year',
      'Date',
      'Vehicle',
      'Business Purpose & Client Notes',
      'Starting Point',
      'Destination Point',
      'Business Miles',
      'IRS Rate ($/mi)',
      'Total Deduction ($)',
    ];

    const rows = businessTrips.map(t => [
      taxYear,
      t.startTime.split('T')[0],
      `"${t.vehicleName}"`,
      `"${(t.title + ' - ' + t.notes).replace(/"/g, '""')}"`,
      `"${t.startLocation.replace(/"/g, '""')}"`,
      `"${t.endLocation.replace(/"/g, '""')}"`,
      t.distanceMiles.toFixed(1),
      ratePerMile.toFixed(2),
      (t.distanceMiles * ratePerMile).toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `IRS_Mileage_Log_${taxYear}_${selectedQuarter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* Title & Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">IRS Mileage & Tax Expense Report</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compliant business vehicle mileage logbook with automated deduction calculations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadIRSReport}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export IRS CSV</span>
          </button>
        </div>
      </div>

      {/* Tax Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 print:border-none print:p-0">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Tax Filing Year</label>
            <select
              value={taxYear}
              onChange={(e) => setTaxYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="2026">Tax Year 2026</option>
              <option value="2025">Tax Year 2025</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Period</label>
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['all', 'Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarter(q)}
                  className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                    selectedQuarter === q
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q === 'all' ? 'Full Year' : q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Standard Rate ($/mi)</label>
            <input
              type="number"
              step="0.01"
              value={ratePerMile}
              onChange={(e) => setRatePerMile(parseFloat(e.target.value) || 0.67)}
              className="w-24 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-emerald-500 text-right"
            />
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Calculated Tax Deduction</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ${totalDeduction.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Deductible Business Miles</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatDistance(totalBusinessMiles)}
          </span>
          <span className="text-xs text-slate-500 font-mono ml-1">{unitLabel}</span>
          <span className="text-[11px] text-slate-400 block mt-1">{businessTrips.length} business trips</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Personal Miles</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatDistance(totalPersonalMiles)}
          </span>
          <span className="text-xs text-slate-500 font-mono ml-1">{unitLabel}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Non-deductible personal</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Commute Miles</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatDistance(totalCommuteMiles)}
          </span>
          <span className="text-xs text-slate-500 font-mono ml-1">{unitLabel}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Regular commute</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block mb-1">Business Ratio</span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {businessPercent}%
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">Of total vehicle usage</span>
        </div>
      </div>

      {/* Official Audit-Ready Schedule Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden print:border-black print:text-black print:bg-white">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white print:text-black">
              IRS Schedule C / Form 2106 Mileage Audit Log
            </h3>
            <span className="text-xs text-slate-400 print:text-gray-600">
              Documented business drives, locations, odometer spans, and business purpose
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold print:text-black">
            IRS Standard Rate: ${ratePerMile.toFixed(2)}/mi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-medium print:text-black">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Trip Description & Purpose</th>
                <th className="py-3 px-4">Origin → Destination</th>
                <th className="py-3 px-4 text-right">Distance</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right">Deduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono print:text-black">
              {businessTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No business trips recorded for this tax period.
                  </td>
                </tr>
              ) : (
                businessTrips.map((trip) => {
                  const ded = (trip.distanceMiles * ratePerMile).toFixed(2);
                  return (
                    <tr key={trip.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 text-slate-300 print:text-black whitespace-nowrap">
                        {trip.startTime.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-300 print:text-black whitespace-nowrap">
                        {trip.vehicleName.split(' ')[0]} {trip.vehicleName.split(' ')[1]}
                      </td>
                      <td className="py-3 px-4 font-sans text-white print:text-black max-w-[200px] truncate">
                        <span className="font-medium block">{trip.title}</span>
                        <span className="text-[11px] text-slate-400 print:text-gray-600 truncate block">
                          {trip.notes || 'Business client meeting'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-400 print:text-black max-w-[180px] truncate">
                        {trip.startLocation} → {trip.endLocation}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-200 print:text-black tabular-nums whitespace-nowrap">
                        {formatDistance(trip.distanceMiles)} {unitLabel}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 print:text-black tabular-nums whitespace-nowrap">
                        ${ratePerMile.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold print:text-black tabular-nums whitespace-nowrap">
                        ${ded}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-700 bg-slate-950 font-mono font-bold text-xs text-white print:text-black">
                <td colSpan={4} className="py-3 px-4 text-right font-sans">
                  Total Business Deductions:
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-400 print:text-black">
                  {formatDistance(totalBusinessMiles)} {unitLabel}
                </td>
                <td className="py-3 px-4 text-right text-slate-400 print:text-black">-</td>
                <td className="py-3 px-4 text-right tabular-nums text-emerald-400 text-sm print:text-black">
                  ${totalDeduction.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
