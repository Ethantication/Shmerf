export default function MethodologyPage() {
  return (
    <div className="space-y-6 text-sm text-slate-300">
      <div>
        <h2 className="text-2xl font-semibold text-white">Methodology & limitations</h2>
        <p className="mt-2">
          ConflictPulse blends multiple open-data signals into an indicative conflict risk index. Scores are
          normalized to 0–1 and weighted by signal reliability and coverage. This is research-oriented early
          warning only, not a tactical tool.
        </p>
      </div>
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-lg font-semibold text-white">Scoring model</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>Signals are ingested daily/weekly depending on provider update frequency.</li>
          <li>Each signal contributes severity × confidence to a regional rollup.</li>
          <li>Weights emphasize news intensity, humanitarian alerts, disasters, and macro stress proxies.</li>
          <li>Missing data reduces confidence and widens uncertainty bands.</li>
        </ul>
      </section>
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-lg font-semibold text-white">Ethical constraints</h3>
        <ul className="list-disc space-y-2 pl-6">
          <li>No individual tracking or targeting data is stored.</li>
          <li>Signals are aggregated to regions or coarse grid cells.</li>
          <li>Outputs are indicative and may be wrong; correlation is not causation.</li>
        </ul>
      </section>
      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-lg font-semibold text-white">Disclaimer</h3>
        <p>
          Indicative risk scoring, may be wrong, do not use for operational harm.
        </p>
      </section>
    </div>
  );
}
