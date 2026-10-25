import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BusinessTabButton, BusinessTabRail } from "../components/BusinessTabs";
import type { IntegrationReview, IntegrationsData, WhatsAppSettings } from "./integrations";
import WhatsAppConnectionPanel from "./WhatsAppConnectionPanel";

type Tab = "connect" | "security" | "reviews";
const field = "min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500";
const settingLabels: { key: keyof Pick<WhatsAppSettings, "notifyOnBookingCreated" | "notifyReminder" | "notifyOnBookingCancelled" | "notifyMasterOnNewBooking" | "notifyReviewRequest">; text: string }[] = [
  { key: "notifyOnBookingCreated", text: "Yeni qəbul təsdiqi" },
  { key: "notifyReminder", text: "Qəbuldan əvvəl xatırlatma" },
  { key: "notifyOnBookingCancelled", text: "Qəbul ləğv ediləndə bildiriş" },
  { key: "notifyMasterOnNewBooking", text: "Yeni qəbul barədə ustaya bildiriş" },
  { key: "notifyReviewRequest", text: "Xidmətdən sonra rəy sorğusu" },
];
export default function IntegrationDialog({ data, initialTab, onClose, onSave }: { data: IntegrationsData; initialTab: Tab; onClose: () => void; onSave: (next: IntegrationsData) => boolean }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [settings, setSettings] = useState<WhatsAppSettings>(data.whatsapp);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  function change(patch: Partial<WhatsAppSettings>) { setSettings((current) => ({ ...current, ...patch })); }
  function saveSettings(event: FormEvent) {
    event.preventDefault();
    const digits = settings.phone.replace(/\D/g, "");
    if (digits && !/^(994)?(10|50|51|55|70|77|99)\d{7}$/.test(digits)) { setError("Azərbaycan mobil nömrəsini düzgün daxil edin."); return; }
    if (settings.reminderHours < 1 || settings.reminderHours > 72) { setError("Xatırlatma 1–72 saat arası olmalıdır."); return; }
    if (!settings.template.trim()) { setError("Mesaj şablonunu daxil edin."); return; }
    const next = { ...data, whatsapp: { ...settings, phone: digits ? `+994 ${digits.slice(-9)}` : "", template: settings.template.trim() } };
    if (onSave(next)) { setMessage("Ayarlar yadda saxlanıldı. WhatsApp hesabı hələ qoşulmayıb."); setError(""); setSettings(next.whatsapp); } else setError("Yadda saxlamaq mümkün olmadı.");
  }
  function addReview(event: FormEvent) {
    event.preventDefault();
    if (!review.comment.trim()) { setError("Rəy mətni daxil edin."); return; }
    const item: IntegrationReview = { id: crypto.randomUUID(), userName: "İstifadəçi", rating: review.rating, comment: review.comment.trim(), date: new Date().toISOString().slice(0, 10) };
    if (onSave({ ...data, reviews: [item, ...data.reviews] })) { setReview({ rating: 5, comment: "" }); setError(""); setMessage("Rəy əlavə edildi."); } else setError("Rəyi saxlamaq mümkün olmadı.");
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="flex max-h-[min(92dvh,900px)] w-[calc(100%-1.5rem)] max-w-2xl flex-col gap-0 rounded-3xl p-0" showCloseButton><div className="border-b border-slate-200 px-5 py-5 pr-14 sm:px-7"><DialogTitle className="text-xl font-bold">WhatsApp Business & Bildirişlər</DialogTitle><p className="mt-1 text-sm text-slate-500">Bildiriş ayarları</p></div>
    <div className="shrink-0 overflow-x-auto border-b border-slate-100 px-5 py-3 sm:px-7" aria-label="WhatsApp bölmələri"><BusinessTabRail>{([{ id: "connect", label: "Qoşulma" }, { id: "security", label: "Təhlükəsizlik və tövsiyələr" }, { id: "reviews", label: `Rəylər və qiymət (${data.reviews.length})` }] as const).map((item) => <BusinessTabButton key={item.id} active={tab === item.id} onClick={() => { setTab(item.id); setError(""); setMessage(""); }}>{item.label}</BusinessTabButton>)}</BusinessTabRail></div>
    <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}{error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {tab === "connect" && <div className="space-y-5"><WhatsAppConnectionPanel /><form onSubmit={saveSettings} className="space-y-4"><label className="block space-y-1 text-sm font-semibold">Bağlantı üçün mobil nömrə<div className="flex min-w-0 overflow-hidden rounded-xl border border-slate-200"><span className="flex shrink-0 items-center bg-slate-100 px-3">🇦🇿 +994</span><input type="tel" inputMode="tel" className="min-h-11 min-w-0 flex-1 px-3 outline-none" value={settings.phone.replace(/^\+994\s*/, "")} onChange={(e) => change({ phone: e.target.value })} placeholder="(50) 000-00-00" /></div></label><div className="space-y-1"><h3 className="text-sm font-bold">Bildiriş qaydaları</h3>{settingLabels.map((item) => <label key={item.key} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={settings[item.key]} onChange={(e) => change({ [item.key]: e.target.checked })} className="size-4 shrink-0" />{item.text}</label>)}</div><label className="block space-y-1 text-sm font-semibold">Qəbuldan neçə saat əvvəl?<input type="number" min="1" max="72" value={settings.reminderHours} onChange={(e) => change({ reminderHours: Number(e.target.value) })} className={field} /></label><label className="block space-y-1 text-sm font-semibold">Mesaj şablonu<textarea value={settings.template} onChange={(e) => change({ template: e.target.value })} maxLength={1000} rows={5} className={`${field} py-3`} /></label><p className="text-xs text-slate-500">Dəyişənlər: {'{client_name}'}, {'{business_name}'}, {'{service_name}'}, {'{date}'}, {'{time}'}</p><button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold sm:w-auto">Ayarları saxla</button></form></div>}
      {tab === "security" && <div className="space-y-3"><h3 className="text-base font-bold">Təhlükəsizlik və mesaj tövsiyələri</h3>{[{ title: "Rəsmi bağlantı", body: "Mesaj göndərmə yalnız təsdiqlənmiş bağlantıda aktiv olmalıdır. Bağlantı təsdiqlənmədən mesaj göndərilmir." }, { title: "Müştəri razılığı", body: "Bildirişləri yalnız razılıq vermiş müştərilərə göndərin və abunəlikdən çıxma istəyinə əməl edin." }, { title: "Məlumatların qorunması", body: "Şablonda yalnız qəbul üçün lazım olan məlumatları istifadə edin. Məxfi məlumatları mesajlarda paylaşmayın." }, { title: "Göndərmə vaxtı", body: "Xatırlatmaları iş saatlarında planlaşdırın və tezliyi müştərinin gözləntilərinə uyğun saxlayın." }].map((item) => <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h4 className="font-bold">{item.title}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p></article>)}</div>}
      {tab === "reviews" && <div className="space-y-5"><div className="rounded-2xl bg-slate-50 p-4"><strong className="text-lg">{data.reviews.length ? (data.reviews.reduce((sum, item) => sum + item.rating, 0) / data.reviews.length).toFixed(1) : "—"} ★</strong><p className="text-sm text-slate-500">{data.reviews.length} rəy</p></div><form onSubmit={addReview} className="space-y-3 rounded-2xl border border-slate-200 p-4"><h3 className="font-bold">Rəy yaz</h3><label className="block space-y-1 text-sm font-semibold">Qiymət<select value={review.rating} onChange={(e) => setReview((current) => ({ ...current, rating: Number(e.target.value) }))} className={field}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label><label className="block space-y-1 text-sm font-semibold">Rəy<textarea required rows={3} maxLength={500} value={review.comment} onChange={(e) => setReview((current) => ({ ...current, comment: e.target.value }))} className={`${field} py-3`} /></label><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold">Rəyi əlavə et</button></form><div className="space-y-2">{data.reviews.length ? data.reviews.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-2"><strong>{item.userName}</strong><span className="text-sm text-amber-600">{"★".repeat(item.rating)}</span></div><p className="mt-1 text-sm text-slate-600">{item.comment}</p><p className="mt-2 text-xs text-slate-400">{item.date}</p></article>) : <p className="text-sm text-slate-500">Hələ rəy yoxdur.</p>}</div></div>}
    </div></DialogContent></Dialog>;
}
