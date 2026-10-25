import { useState } from "react";
import BusinessFormDialog from "../components/BusinessFormDialog";
import type { ReferralSettings } from "./marketing";

export function ReviewReplyDialog({ reply, onChange, onClose, onSave }: {
  reply: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return <BusinessFormDialog title="Rəyə cavab" onClose={onClose} size="medium">
    <label className="block text-sm font-semibold">Cavab
      <textarea autoFocus value={reply} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-28 w-full min-w-0 rounded-xl border border-slate-200 p-3 text-sm" maxLength={1000} />
    </label>
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4">İmtina</button>
      <button type="button" onClick={onSave} className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 font-bold">Saxla</button>
    </div>
  </BusinessFormDialog>;
}

export function ReferralPanel({ settings, onSave }: { settings: ReferralSettings; onSave: (settings: ReferralSettings) => void }) {
  const [draft, setDraft] = useState(settings);
  const [error, setError] = useState("");
  const fields = [
    { key: "referrerReward", title: "Dəvət edənə bonus, ₼" },
    { key: "refereeDiscount", title: "Yeni müştəriyə endirim, %" },
    { key: "minOrder", title: "Minimum çek, ₼" },
  ] as const;

  function save() {
    if (draft.referrerReward < 0 || draft.refereeDiscount < 0 || draft.refereeDiscount > 100 || draft.minOrder < 0) {
      setError("Dəyərləri düzgün daxil edin.");
      return;
    }
    setError("");
    onSave(draft);
  }

  return <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div><h3 className="text-lg font-bold">Referal qaydaları</h3><p className="text-sm text-slate-500">Dəvət və bonus qaydalarını təyin edin.</p><p className="mt-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-600">Qaydalar saxlanılır. Dəvət kodu və bonusun avtomatik tətbiqi hələ qoşulmayıb.</p></div>
    <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />Proqramı aktiv göstər</label>
    <div className="grid gap-3 sm:grid-cols-2">{fields.map((field) => <label key={field.key} className="min-w-0 space-y-1 text-sm font-semibold text-slate-700">{field.title}<input type="number" min="0" max={field.key === "refereeDiscount" ? 100 : undefined} value={draft[field.key]} onChange={(event) => setDraft({ ...draft, [field.key]: Number(event.target.value) })} className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-3 text-sm" /></label>)}</div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" onClick={save} className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold sm:w-auto">Yadda saxla</button>
  </div>;
}
