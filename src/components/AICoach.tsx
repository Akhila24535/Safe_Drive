import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Send, ShieldCheck, Fuel, AlertTriangle, RefreshCw, CheckCircle, Lightbulb } from 'lucide-react';

export const AICoach: React.FC = () => {
  const { trips } = useApp();
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const totalHarshBrakes = trips.reduce((sum, t) => sum + t.events.filter(e => e.type === 'harsh_brake').length, 0);
  const totalRapidAccels = trips.reduce((sum, t) => sum + t.events.filter(e => e.type === 'rapid_accel').length, 0);
  const totalMiles = trips.reduce((sum, t) => sum + t.distanceMiles, 0);
  const businessMiles = trips.filter(t => t.purpose === 'business').reduce((sum, t) => sum + t.distanceMiles, 0);
  const avgSafetyScore = trips.length > 0
    ? Math.round(trips.reduce((sum, t) => sum + t.safetyScore, 0) / trips.length)
    : 95;

  const handleRunAnalysis = async (queryOverride?: string) => {
    setIsLoading(true);
    setErrorNotice(null);

    const queryToSend = queryOverride !== undefined ? queryOverride : userQuery;

    try {
      const response = await fetch('/api/analyze-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trips: trips.slice(0, 6).map(t => ({
            id: t.id,
            title: t.title,
            distanceMiles: t.distanceMiles,
            durationMinutes: Math.round(t.durationSeconds / 60),
            safetyScore: t.safetyScore,
            purpose: t.purpose,
            eventsCount: t.events.length,
            events: t.events.map(e => ({ type: e.type, speedMph: e.speedMph, description: e.description })),
          })),
          driverSummary: {
            totalTrips: trips.length,
            totalMiles: totalMiles.toFixed(1),
            totalBusinessMiles: businessMiles.toFixed(1),
            avgSafetyScore,
            totalHarshBrakes,
            totalRapidAccels,
          },
          query: queryToSend || undefined,
        }),
      });

      const data = await response.json();
      setAnalysisText(data.analysis);
      if (data.errorNotice) {
        setErrorNotice(data.errorNotice);
      }
    } catch (err: any) {
      console.error(err);
      setErrorNotice('Network issue communicating with analysis service.');
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Analyze my harsh braking clusters and how to avoid them in traffic',
    'How much fuel can I save with smoother acceleration curves?',
    'Provide a defensive driving summary for commercial insurance discounts',
    'Evaluate my night driving versus daytime commute patterns',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Driving Coach & Route Telematics Co-Pilot</h1>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs font-mono text-emerald-400">Gemini Powered</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deep algorithmic telematics diagnostics, defensive driving rules, and eco-driving recommendations
          </p>
        </div>

        <button
          onClick={() => handleRunAnalysis()}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 transition-colors flex items-center gap-2 shadow-sm"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{isLoading ? 'Analyzing Telemetry...' : 'Run Safety Audit'}</span>
        </button>
      </div>

      {/* Driver Telemetry Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">Fleet Safety Index</span>
          <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">{avgSafetyScore}/100</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">Recorded Trips</span>
          <span className="text-lg font-bold font-mono text-white tabular-nums">{trips.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">Harsh Brakes</span>
          <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{totalHarshBrakes}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 block mb-0.5">Rapid Accels</span>
          <span className="text-lg font-bold font-mono text-slate-200 tabular-nums">{totalRapidAccels}</span>
        </div>
      </div>

      {/* Custom Query Input */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRunAnalysis();
            }}
            placeholder="Ask AI Coach a question (e.g., 'How can I eliminate harsh braking on highway off-ramps?')"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleRunAnalysis()}
            disabled={isLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Suggested:</span>
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setUserQuery(p);
                handleRunAnalysis(p);
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error or Notice */}
      {errorNotice && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg text-xs text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Analysis Output Box */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">
            Synthesizing telemetry logs, braking decel waveforms, and driving habits...
          </p>
        </div>
      ) : analysisText ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">SafeDrive Telematics Coach Report</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Generated {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="prose prose-invert prose-xs max-w-none text-slate-300 leading-relaxed space-y-3 text-xs">
            {analysisText.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ') || paragraph.startsWith('#### ')) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-white mt-4 mb-2">
                    {paragraph.replace(/^#+\s*/, '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-4 space-y-1 my-2">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx} className="text-slate-300">
                        {line.replace(/^- /, '')}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\.\s/.test(paragraph)) {
                return (
                  <ol key={idx} className="list-decimal pl-4 space-y-1 my-2">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx} className="text-slate-300">
                        {line.replace(/^\d+\.\s*/, '')}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={idx} className="text-slate-300">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-emerald-400/50 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Telemetry Analysis Run Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click 'Run Safety Audit' above to have our AI telematics engine analyze your braking patterns, throttle smoothness, and IRS deductions.
          </p>
          <button
            onClick={() => handleRunAnalysis()}
            className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <span>Run Initial Safety Audit</span>
          </button>
        </div>
      )}
    </div>
  );
};
