import { ConnectorTable } from "@/components/ConnectorTable";

export default function ConnectorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Connectors</h2>
        <p className="text-sm text-slate-400">Status of OSINT data feeds and last successful pulls.</p>
      </div>
      <ConnectorTable />
    </div>
  );
}
