import { AuthGuard } from "@/features/auth/auth-guard";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { UploadPanel } from "@/features/upload/upload-panel";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-500">Workspace</p>
            <h1 className="mt-2 text-4xl font-semibold text-slate-900">AI Meeting Intelligence</h1>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
            Demo workspace
          </div>
        </div>

        <DashboardShell />
        <div className="mt-8">
          <UploadPanel />
        </div>
      </main>
    </AuthGuard>
  );
}
