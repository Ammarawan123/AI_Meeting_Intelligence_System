import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">Meeting Intel</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
              Turn every meeting into action.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Upload recordings, extract summaries, and surface action items, decisions, and deadlines from one AI workspace.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/login">
                <Button>Open dashboard</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Create account</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-6">
            <div className="space-y-4">
              {[
                { label: "Meetings processed", value: "128" },
                { label: "Action items tracked", value: "1,284" },
                { label: "Avg. time saved", value: "7.4h/week" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
