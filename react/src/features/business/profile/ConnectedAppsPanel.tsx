import { useState } from "react";

export default function ConnectedAppsPanel() {
  const [showDetails, setShowDetails] = useState(false);

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="border-b border-slate-100 pb-3">
      <h2 className="text-sm font-bold">Qoşulmuş Tətbiqlər</h2>
      <p className="mt-1 text-xs font-medium text-slate-400">Xarici təqvim servisi və iş qrafiki ilə sinxronizasiya</p>
    </div>

    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <img src="/google-calendar.png" alt="" className="size-full object-contain" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold">Google Calendar</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              <span className="size-1.5 rounded-full bg-slate-400" />Qoşulmayıb
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Google hesabı qoşulmayıb</p>
        </div>
      </div>

      <div className="grid gap-2 min-[400px]:grid-cols-2 sm:flex sm:shrink-0">
        <button type="button" disabled title="Google hesabı qoşulmayıb" className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-400 shadow-sm disabled:cursor-not-allowed">
          Sinxron et
        </button>
        <button type="button" aria-expanded={showDetails} onClick={() => setShowDetails((value) => !value)} className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 text-xs font-bold hover:bg-yellow-300">
          Tənzimləmələr
        </button>
      </div>
    </div>

    {showDetails && <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
      Google Calendar hesabı qoşulandan sonra sinxronizasiya burada idarə olunacaq. Hesab hələ qoşulmayıb.
    </p>}
  </section>;
}
