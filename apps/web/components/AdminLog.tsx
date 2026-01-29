"use client";

import { useEffect, useState } from "react";

interface RunLog {
  id: string;
  provider: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
  items_ingested: number;
}

export function AdminLog() {
  const [items, setItems] = useState<RunLog[]>([]);

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((payload) => setItems(payload.items ?? []));
  }, []);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">{item.provider}</h3>
              <p className="text-xs text-slate-400">Run started {new Date(item.started_at).toLocaleString()}</p>
            </div>
            <div className="text-xs text-slate-300">Status: {item.status}</div>
          </div>
          <div className="mt-2 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
            <div>Items: {item.items_ingested}</div>
            <div>Finished: {item.finished_at ? new Date(item.finished_at).toLocaleString() : "—"}</div>
            <div className="text-rose-400">{item.error_message ?? ""}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
