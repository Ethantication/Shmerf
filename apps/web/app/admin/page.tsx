import { AdminLog } from "@/components/AdminLog";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Admin / Observability</h2>
        <p className="text-sm text-slate-400">Connector runs, error counts, and ingestion health.</p>
      </div>
      <AdminLog />
    </div>
  );
}
