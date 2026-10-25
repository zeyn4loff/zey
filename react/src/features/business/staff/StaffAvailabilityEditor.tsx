import { useRef, useState, type KeyboardEvent } from "react";
import type { StaffReview, StaffScheduleException } from "./staff";

const field = "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm";
const card = "space-y-3 rounded-xl border border-slate-200 p-3";

type ExceptionDraft = { date: string; available: boolean; start: string; end: string; note: string };
const emptyException: ExceptionDraft = { date: "", available: false, start: "09:00", end: "18:00", note: "" };

export function StaffAvailabilityEditor({ items, onChange }: { items: StaffScheduleException[]; onChange: (next: StaffScheduleException[]) => void }) {
  const [draft, setDraft] = useState<ExceptionDraft>(emptyException);
  const [error, setError] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const change = (patch: Partial<ExceptionDraft>) => { setDraft((current) => ({ ...current, ...patch })); setError(""); };

  function addException() {
    const next = { ...draft, date: dateRef.current?.value ?? draft.date, start: startRef.current?.value ?? draft.start, end: endRef.current?.value ?? draft.end };
    if (!next.date) { setError("Tarix seçin."); return; }
    if (next.available && next.start >= next.end) { setError("Bitiş vaxtı başlanğıcdan sonra olmalıdır."); return; }
    if (items.some((item) => item.date === next.date)) { setError("Bu tarix üçün istisna artıq var."); return; }
    onChange([...items, { id: crypto.randomUUID(), ...next, note: next.note.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
    setDraft(emptyException);
    if (dateRef.current) dateRef.current.value = "";
    setError("");
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      addException();
    }
  }

  return <div className="space-y-3">
    <h3 className="text-sm font-bold">Qrafik istisnaları</h3>
    <p className="text-xs text-slate-500">Məzuniyyət, bağlı gün və ya fərqli iş saatını ayrıca qeyd edin.</p>
    <div className={card} onKeyDown={onInputKeyDown}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold">Tarix<input ref={dateRef} type="date" required onChange={(event) => change({ date: event.target.value })} className={field} /></label>
        <label className="text-xs font-semibold">Gün<select value={draft.available ? "yes" : "no"} onChange={(event) => change({ available: event.target.value === "yes" })} className={field}><option value="no">İstirahət / bağlı</option><option value="yes">Fərqli iş saatı</option></select></label>
        {draft.available && <>
          <label className="text-xs font-semibold">Başlanğıc<input ref={startRef} type="time" defaultValue="09:00" onChange={(event) => change({ start: event.target.value })} className={field} /></label>
          <label className="text-xs font-semibold">Bitiş<input ref={endRef} type="time" defaultValue="18:00" onChange={(event) => change({ end: event.target.value })} className={field} /></label>
        </>}
      </div>
      <label className="block text-xs font-semibold">Qeyd<input maxLength={200} value={draft.note} onChange={(event) => change({ note: event.target.value })} className={field} /></label>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      <button type="button" onClick={addException} className="min-h-10 w-full cursor-pointer rounded-xl bg-slate-900 px-4 text-xs font-bold text-white sm:w-auto">İstisna əlavə et</button>
    </div>
    <div className="space-y-2">
      {items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-xs">
        <div><strong>{item.date} · {item.available ? `${item.start}–${item.end}` : "İşləmir"}</strong>{item.note && <p className="mt-1 text-slate-500">{item.note}</p>}</div>
        <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))} className="min-h-9 cursor-pointer rounded-lg bg-rose-50 px-3 font-bold text-rose-700">Sil</button>
      </div>)}
      {!items.length && <p className="text-xs text-slate-500">İstisna yoxdur.</p>}
    </div>
  </div>;
}

export function StaffReviewsEditor({ items, onChange }: { items: StaffReview[]; onChange: (next: StaffReview[]) => void }) {
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");

  function addReview() {
    if (!author.trim() || !comment.trim()) { setError("Müştəri və rəy daxil edin."); return; }
    onChange([{ id: crypto.randomUUID(), author: author.trim(), comment: comment.trim(), rating, date: new Date().toISOString(), reply: "" }, ...items]);
    setAuthor("");
    setComment("");
    setRating(5);
    setError("");
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      addReview();
    }
  }

  return <div className="space-y-3">
    <h3 className="text-sm font-bold">Usta rəyləri</h3>
    <div className="space-y-2 rounded-xl border border-slate-200 p-3" onKeyDown={onInputKeyDown}>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs font-semibold">Müştəri<input maxLength={100} value={author} onChange={(event) => { setAuthor(event.target.value); setError(""); }} className={field} /></label>
        <label className="text-xs font-semibold">Qiymət<select value={rating} onChange={(event) => setRating(Number(event.target.value))} className={field}>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}</select></label>
      </div>
      <label className="block text-xs font-semibold">Rəy<textarea maxLength={500} rows={3} value={comment} onChange={(event) => { setComment(event.target.value); setError(""); }} className={`${field} py-3`} /></label>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      <button type="button" onClick={addReview} className="min-h-10 w-full cursor-pointer rounded-xl bg-slate-900 px-4 text-xs font-bold text-white sm:w-auto">Rəyi əlavə et</button>
    </div>
    {items.map((item) => <article key={item.id} className="space-y-2 rounded-xl border border-slate-200 p-3">
      <div className="flex justify-between gap-2 text-xs"><strong>{item.author} · {item.rating} ★</strong><time className="text-slate-500">{new Date(item.date).toLocaleDateString("az-AZ")}</time></div>
      <p className="break-words text-sm">{item.comment}</p>
      <label className="block text-xs font-semibold">Cavab<textarea value={item.reply} onChange={(event) => onChange(items.map((entry) => entry.id === item.id ? { ...entry, reply: event.target.value } : entry))} rows={2} maxLength={500} className={`${field} py-3`} /></label>
      <button type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))} className="cursor-pointer text-xs font-bold text-rose-700">Rəyi sil</button>
    </article>)}
    {!items.length && <p className="text-xs text-slate-500">Rəy yoxdur.</p>}
  </div>;
}
