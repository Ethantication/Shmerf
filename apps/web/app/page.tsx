import Dashboard from "@/components/Dashboard";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Global risk overview</h2>
        <p className="text-sm text-slate-400">
          Aggregated OSINT signals across news, disasters, weather extremes, aviation anomalies, and macro stress
          indicators. Early-warning research only.
        </p>
      </div>
      <Dashboard />
    </div>
  );
}
