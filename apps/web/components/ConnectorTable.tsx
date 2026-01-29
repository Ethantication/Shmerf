"use client";

import { useEffect, useState } from "react";

interface ConnectorStatus {
  provider: string;
  status: string;
  last_success_at: string | null;
  finished_at: string | null;
  items_ingested: number;
  error_message: string | null;
}

export function ConnectorTable() {
  const [items, setItems] = useState<ConnectorStatus[]>([]);

  useEffect(() => {
    fetch("/api/connectors")
      .then((res) => res.json())
      .then((payload) => setItems(payload.items ?? []));
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-900/70 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last success</th>
            <th className="px-4 py-3">Last run</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Error</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.provider} className="border-t border-slate-800">
              <td className="px-4 py-3 font-semibold">{item.provider}</td>
              <td className="px-4 py-3">
                <span className={item.status === "success" ? "text-emerald-400" : "text-rose-400"}>
                  {item.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {item.last_success_at ? new Date(item.last_success_at).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {item.finished_at ? new Date(item.finished_at).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{item.items_ingested}</td>
              <td className="px-4 py-3 text-xs text-rose-300">{item.error_message ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
