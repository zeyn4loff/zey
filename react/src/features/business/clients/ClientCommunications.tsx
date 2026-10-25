import { useState } from "react";
import type { Booking } from "../calendar/bookings";
import { balance, phoneDigits, type Client, type ClientMessage, type ClientMessageTemplate } from "./clients";
import { clientBox as box, clientField as field } from "./clientProfileStyles";

const builtIns: ClientMessageTemplate[] = [
  { id: "welcome", name: "Salamlama", text: "Salam, {ad}! {biznes} sizi görməyə şad olacaq." },
  { id: "reminder", name: "Xatırlatma", text: "Salam, {ad}! Növbəti qəbulunuzu xatırladırıq. Hörmətlə, {biznes}." },
  { id: "thanks", name: "Təşəkkür", text: "{ad}, bizi seçdiyiniz üçün təşəkkür edirik! Yenidən görüşənədək, {biznes}." },
];

function preview(text: string, client: Client, businessName: string, staffName: string) {
  const values: Record<string, string> = {
    ad: client.name.trim().split(/\s+/)[0] || client.name,
    biznes: businessName,
    mutexessis: staffName || "mütəxəssisimiz",
    depozit: `${balance(client, "deposit").toFixed(2)} ₼`,
    endirim: `${client.discountPercent}%`,
  };
  return text.replace(/\{(ad|biznes|mutexessis|depozit|endirim)\}/g, (_, key: string) => values[key]);
}

export function ClientCommunications({ client, businessName, staffName, persist }: { client: Client; businessName: string; staffName: string; persist: (next: Client) => boolean }) {
  const [channel, setChannel] = useState<ClientMessage["channel"]>("whatsapp");
  const [draft, setDraft] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState("");
  const phone = phoneDigits(client.phone);
  const validPhone = /^\d{9}$/.test(phone);
  const custom = client.messageTemplates ?? [];
  const messages = client.messages ?? [];
  const rendered = preview(draft, client, businessName, staffName);

  function saveTemplate() {
    const name = templateName.trim();
    if (!name || !draft.trim()) { setError("Şablon adı və mesaj mətni tələb olunur."); return; }
    if (custom.some((item) => item.name.toLocaleLowerCase("az-AZ") === name.toLocaleLowerCase("az-AZ"))) { setError("Bu adda şablon artıq var."); return; }
    if (persist({ ...client, messageTemplates: [...custom, { id: crypto.randomUUID(), name, text: draft.trim() }] })) { setTemplateName(""); setError(""); }
  }

  function openMessage() {
    if (!validPhone || !rendered.trim()) { setError("Düzgün telefon nömrəsi və mesaj mətni daxil edin."); return; }
    const address = channel === "whatsapp"
      ? `https://wa.me/994${phone}?text=${encodeURIComponent(rendered)}`
      : `sms:+994${phone}?body=${encodeURIComponent(rendered)}`;
    const opened = window.open(address, "_blank");
    if (!opened) { setError("Mesaj tətbiqi açılmadı. Brauzerdə yeni pəncərələrə icazə verin."); return; }
    opened.opener = null;
    if (persist({ ...client, messages: [{ id: crypto.randomUUID(), date: new Date().toISOString(), channel, text: rendered, status: "opened" }, ...messages] })) setError("");
  }

  return <div className="mt-4 space-y-4">
    <div className={box}><strong className="block text-sm">{client.name}</strong><p className="mt-1 text-xs text-slate-500">{client.phone || "Telefon qeyd edilməyib"}</p><div className="mt-3 flex gap-2">{(["whatsapp", "sms"] as const).map((item) => <button key={item} type="button" onClick={() => setChannel(item)} aria-pressed={channel === item} className={`min-h-10 cursor-pointer rounded-xl px-4 text-xs font-bold ${channel === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{item === "sms" ? "SMS" : "WhatsApp"}</button>)}</div></div>
    <section className="space-y-3"><h3 className="text-sm font-bold">Hazır şablonlar</h3><div className="flex flex-wrap gap-2">{[...builtIns, ...custom].map((item) => <div key={item.id} className="flex items-center rounded-xl border border-slate-200"><button type="button" onClick={() => setDraft(item.text)} className="min-h-10 cursor-pointer px-3 text-xs font-semibold">{item.name}</button>{custom.some((entry) => entry.id === item.id) && <button type="button" onClick={() => persist({ ...client, messageTemplates: custom.filter((entry) => entry.id !== item.id) })} aria-label={`${item.name} şablonunu sil`} className="min-h-10 cursor-pointer border-l border-slate-200 px-3 text-xs text-rose-600">×</button>}</div>)}</div></section>
    <section className={`${box} space-y-3`}><label className="block text-sm font-bold">Mesaj mətni<textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1000} rows={5} className={`${field} py-3`} placeholder="Mesajınızı yazın və ya şablon seçin" /></label><p className="text-xs text-slate-500">{draft.length} simvol</p><div className="flex flex-wrap gap-1.5">{(["ad", "biznes", "mutexessis", "depozit", "endirim"] as const).map((variable) => <button key={variable} type="button" onClick={() => setDraft((current) => `${current}{${variable}}`)} className="min-h-8 cursor-pointer rounded-lg bg-slate-100 px-2 text-[11px] font-semibold">{variable}</button>)}</div><div className="rounded-xl bg-slate-50 p-3"><strong className="text-xs">Önizləmə</strong><p className="mt-1 whitespace-pre-wrap break-words text-sm">{rendered || "Mesaj mətni burada görünəcək."}</p></div><div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Yeni şablonun adı" value={templateName} onChange={(event) => setTemplateName(event.target.value)} maxLength={60} placeholder="Şablonun adı" className={`${field} sm:flex-1`} /><button type="button" onClick={saveTemplate} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4 text-xs font-bold">Şablonu saxla</button></div>{error && <p role="alert" className="text-xs text-rose-700">{error}</p>}<button type="button" onClick={openMessage} disabled={!validPhone || !rendered.trim()} className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">{channel === "whatsapp" ? "WhatsApp-da aç" : "SMS tətbiqində aç"}</button><p className="text-xs text-slate-500">Mesaj tətbiqdə açılır. Göndərilməni orada təsdiqləyin.</p></section>
    <section className="space-y-2"><h3 className="text-sm font-bold">Mesaj tarixçəsi ({messages.length})</h3>{[...messages].sort((a, b) => b.date.localeCompare(a.date)).map((item) => <article key={item.id} className={box}><div className="flex justify-between gap-2 text-xs text-slate-500"><span>{item.channel === "sms" ? "SMS" : "WhatsApp"} · Tətbiqdə açılıb</span><time>{new Date(item.date).toLocaleString("az-AZ")}</time></div><p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.text}</p><div className="mt-2 flex justify-end gap-3"><button type="button" onClick={() => { setChannel(item.channel); setDraft(item.text); }} className="cursor-pointer text-xs font-semibold">Yenidən hazırla</button><button type="button" onClick={() => persist({ ...client, messages: messages.filter((entry) => entry.id !== item.id) })} className="cursor-pointer text-xs font-semibold text-rose-600">Sil</button></div></article>)}{!messages.length && <p className="text-sm text-slate-500">Mesaj tarixçəsi boşdur.</p>}</section>
  </div>;
}

export function ClientTimeline({ client, bookings }: { client: Client; bookings: Booking[] }) {
  const events = [
    { id: "created", date: client.createdAt, title: "Müştəri profili yaradıldı", detail: "" },
    ...client.visits.map((item) => ({ id: `visit-${item.id}`, date: item.date, title: "Ziyarət", detail: `${item.service} · ${item.amount} ₼` })),
    ...bookings.map((item) => ({ id: `booking-${item.id}`, date: `${item.date}T${item.time}`, title: "Qəbul", detail: `${item.service} · ${item.status}` })),
    ...client.ledger.map((item) => ({ id: `balance-${item.id}`, date: item.date, title: item.account === "deposit" ? "Depozit" : "Keşbek", detail: `${item.amount > 0 ? "+" : ""}${item.amount.toFixed(2)} ₼` })),
    ...client.notes.map((item) => ({ id: `note-${item.id}`, date: item.date, title: "Qeyd", detail: item.text })),
    ...(client.messages ?? []).map((item) => ({ id: `message-${item.id}`, date: item.date, title: item.channel === "sms" ? "SMS tətbiqdə açılıb" : "WhatsApp tətbiqdə açılıb", detail: item.text })),
    ...client.files.map((item) => ({ id: `file-${item.id}`, date: item.date, title: "Fayl əlavə edildi", detail: item.name })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return <div className="mt-4 space-y-2">{events.map((item) => <article key={item.id} className={box}><div className="flex flex-wrap items-start justify-between gap-2"><strong className="text-sm">{item.title}</strong><time className="text-xs text-slate-500">{new Date(item.date).toLocaleString("az-AZ")}</time></div>{item.detail && <p className="mt-1 whitespace-pre-wrap break-words text-xs text-slate-600">{item.detail}</p>}</article>)}</div>;
}
