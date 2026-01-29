import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "ConflictPulse",
  description: "OSINT-derived conflict risk index",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-800 bg-slate-900/70">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div>
                <h1 className="text-xl font-semibold text-white">ConflictPulse</h1>
                <p className="text-xs text-slate-400">
                  Indicative risk scoring, may be wrong, do not use for operational harm.
                </p>
              </div>
              <nav className="flex gap-4 text-sm text-slate-300">
                <Link href="/">Dashboard</Link>
                <Link href="/connectors">Connectors</Link>
                <Link href="/admin">Admin</Link>
                <Link href="/methodology">Methodology</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
