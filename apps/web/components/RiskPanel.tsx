"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RegionScoreFeature } from "./MapView";

interface SignalItem {
  id: string;
  provider: string;
  type: string;
  timestamp: string;
  severity: number;
  confidence: number;
  title: string;
  summary?: string | null;
  source_url?: string | null;
}

interface HistoryPoint {
  date: string;
  risk_score: number;
  confidence: number;
}

export default function RiskPanel({ selected }: { selected: RegionScoreFeature | null }) {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    if (!selected) {
      return;
    }
    fetch(`/api/signals?regionId=${selected.region_id}`)
      .then((res) => res.json())
      .then((payload) => setSignals(payload.items ?? []));

    fetch(`/api/regions/history?regionId=${selected.region_id}`)
      .then((res) => res.json())
      .then((payload) => setHistory(payload.items ?? []));
  }, [selected]);

  if (!selected) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
        Select a region on the map to view the explainable risk breakdown, key drivers, and OSINT items.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{selected.name} ({selected.country_code})</h2>
        <p className="text-sm text-slate-400">Risk score {(selected.risk_score * 100).toFixed(1)}%</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-950/60 p-3">
          <h3 className="text-sm font-semibold text-slate-200">Why this score</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            {Object.entries(selected.drivers)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([key, value]) => (
                <li key={key} className="flex items-center justify-between">
                  <span className="capitalize">{key.replace("_", " ")}</span>
                  <span>{(value * 100).toFixed(1)}%</span>
                </li>
              ))}
          </ul>
        </div>
        <div className="rounded-lg bg-slate-950/60 p-3">
          <h3 className="text-sm font-semibold text-slate-200">Risk history (7 days)</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                <Line type="monotone" dataKey="risk_score" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Recent signals</h3>
        <ul className="mt-2 space-y-2 text-xs text-slate-300">
          {signals.slice(0, 6).map((signal) => (
            <li key={signal.id} className="rounded-lg bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{signal.title}</span>
                <span className="text-slate-500">{new Date(signal.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-slate-400">{signal.summary}</p>
              {signal.source_url && (
                <a className="text-sky-400" href={signal.source_url} target="_blank" rel="noreferrer">
                  Source
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
