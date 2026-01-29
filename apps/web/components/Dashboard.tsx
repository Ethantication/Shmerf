"use client";

import { useEffect, useMemo, useState } from "react";
import MapView, { RegionScoreFeature } from "./MapView";
import RiskPanel from "./RiskPanel";

const SIGNAL_TYPES = [
  "news_event",
  "humanitarian",
  "disaster",
  "quake",
  "weather",
  "aviation",
  "macro",
];

export default function Dashboard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<RegionScoreFeature[]>([]);
  const [selected, setSelected] = useState<RegionScoreFeature | null>(null);
  const [signalFilter, setSignalFilter] = useState<string[]>(SIGNAL_TYPES);
  const [highConfidence, setHighConfidence] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`/api/regions?date=${date}`)
      .then((res) => res.json())
      .then((payload) => setData(payload.items ?? []));
  }, [date]);

  const filtered = useMemo(() => {
    return data
      .map((item) => {
        const drivers = Object.fromEntries(
          Object.entries(item.drivers).filter(([key]) => signalFilter.includes(key))
        );
        const riskScore = Object.values(drivers).reduce((acc, value) => acc + value, 0);
        return {
          ...item,
          drivers,
          risk_score: signalFilter.length === SIGNAL_TYPES.length ? item.risk_score : riskScore,
        };
      })
      .filter((item) => (highConfidence ? item.confidence >= 0.6 : true))
      .filter((item) =>
        searchTerm
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.country_code.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      );
  }, [data, signalFilter, highConfidence, searchTerm]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Filters</h2>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <label className="flex items-center gap-2">
              <span>Date</span>
              <input
                type="date"
                className="rounded border border-slate-700 bg-slate-950 p-1 text-xs"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={highConfidence}
                onChange={(event) => setHighConfidence(event.target.checked)}
              />
              Show only high confidence
            </label>
            <label className="flex items-center gap-2">
              <span>Search</span>
              <input
                type="text"
                className="w-full rounded border border-slate-700 bg-slate-950 p-1 text-xs"
                placeholder="Country or region"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">Signal types</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
            {SIGNAL_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={signalFilter.includes(type)}
                  onChange={() =>
                    setSignalFilter((current) =>
                      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
                    )
                  }
                />
                <span className="capitalize">{type.replace("_", " ")}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <MapView data={filtered} onSelect={setSelected} />
        <RiskPanel selected={selected} />
      </section>
    </div>
  );
}
