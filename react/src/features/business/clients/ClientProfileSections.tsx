import type { ChangeEvent, FormEvent } from "react";
import type { Booking } from "../calendar/bookings";
import { BusinessTabButton, BusinessTabRail } from "../components/BusinessTabs";
import type { StaffMember } from "../staff/staff";
import { balance, latestVisit, totalVisits, type Client, type ClientLedgerEntry, type ClientVisit } from "./clients";
import { clientBox as box, clientField as field } from "./clientProfileStyles";

type HistoryProps = {
  savedVisits: ClientVisit[];
  matchedBookings: Booking[];
  staff: StaffMember[];
  visitOpen: boolean;
  setVisitOpen: (open: boolean) => void;
  addVisit: (event: FormEvent<HTMLFormElement>) => void;
};
export function ClientHistorySection({ savedVisits, matchedBookings, staff, visitOpen, setVisitOpen, addVisit }: HistoryProps) {
  return <div className="mt-4 space-y-3"><div className="flex items-center justify-between gap-2"><h3 className="font-bold">Ziyarət tarixçəsi</h3><button type="button" onClick={() => setVisitOpen(!visitOpen)} className="min-h-10 cursor-pointer rounded-xl bg-yellow-primary px-3 text-xs font-bold">+ Ziyarət əlavə et</button></div>{visitOpen && <form onSubmit={addVisit} className={`${box} space-y-2`}><div className="grid gap-2 sm:grid-cols-2"><label className="text-xs font-bold">Tarix<input name="date" type="date" required defaultValue={new Date().toLocaleDateString("en-CA")} className={field} /></label><label className="text-xs font-bold">Xidmət<input name="service" required maxLength={120} className={field} /></label><label className="text-xs font-bold">Usta<select name="staff" className={field}><option value="">Seçilməyib</option>{staff.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label><label className="text-xs font-bold">Məbləğ ₼<input name="amount" type="number" min="0" step="0.01" required className={field} /></label></div><label className="text-xs font-bold">Qeyd<input name="note" maxLength={200} className={field} /></label><button type="submit" className="min-h-10 w-full cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold">Əlavə et</button></form>}{[...savedVisits].sort((a,b) => b.date.localeCompare(a.date)).map((item) => <div key={item.id} className={box}><div className="flex flex-wrap justify-between gap-2"><div><strong className="text-sm">{item.service}</strong><p className="mt-1 text-xs text-slate-500">{item.date} · {item.staff || "Usta qeyd edilməyib"}</p>{item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}</div><strong className="text-sm">{item.amount} ₼</strong></div></div>)}{matchedBookings.length > 0 && <><h4 className="pt-2 text-sm font-bold">Təqvimdəki qəbullar</h4>{matchedBookings.map((item) => <div key={item.id} className={box}><strong className="text-sm">{item.service}</strong><p className="mt-1 text-xs text-slate-500">{item.date} {item.time} · {item.masterName} · {item.status}</p></div>)}</>}{!savedVisits.length && !matchedBookings.length && <p className="text-sm text-slate-500">Ziyarət yoxdur.</p>}</div>;
}

type StatsProps = { client: Client; spent: number };
export function ClientStatsSection({ client, spent }: StatsProps) {
  return <div className="mt-4 space-y-3"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ title: "Xərclənən", value: `${spent} ₼` }, { title: "Ziyarətlər", value: totalVisits(client) }, { title: "Orta çek", value: `${totalVisits(client) ? (spent/totalVisits(client)).toFixed(2) : 0} ₼` }, { title: "Son ziyarət", value: latestVisit(client) || "—" }].map((item) => <div key={item.title} className={box}><p className="text-xs text-slate-500">{item.title}</p><strong className="mt-2 block break-words text-lg">{item.value}</strong></div>)}</div><p className="text-xs text-slate-500">Statistika ümumi ziyarətlər və saxlanmış tarixçə əsasında hesablanır.</p></div>;
}

type LoyaltyProps = {
  client: Client;
  ledgerMode: ClientLedgerEntry["account"];
  setLedgerMode: (account: ClientLedgerEntry["account"]) => void;
  addLedger: (event: FormEvent<HTMLFormElement>) => void;
};
export function ClientLoyaltySection({ client, ledgerMode, setLedgerMode, addLedger }: LoyaltyProps) {
  const accountBalance = (account: ClientLedgerEntry["account"]) => balance(client, account);
  return <div className="mt-4 space-y-4"><div className="grid grid-cols-2 gap-2"><div className={box}><p className="text-xs text-slate-500">Depozit</p><strong className="mt-1 block text-xl">{accountBalance("deposit").toFixed(2)} ₼</strong></div><div className={box}><p className="text-xs text-slate-500">Keşbek</p><strong className="mt-1 block text-xl">{accountBalance("cashback").toFixed(2)} ₼</strong></div></div><p className="text-xs text-slate-500">Balans əməliyyatları bu brauzerdə saxlanılır; ödəniş aparılmır.</p><div className="overflow-x-auto" aria-label="Balans növü"><BusinessTabRail>{(["deposit", "cashback"] as const).map((account) => <BusinessTabButton key={account} active={ledgerMode === account} onClick={() => setLedgerMode(account)}>{account === "deposit" ? "Depozit" : "Keşbek"}</BusinessTabButton>)}</BusinessTabRail></div><form onSubmit={addLedger} className={`${box} space-y-2`}><div className="grid grid-cols-2 gap-2"><label className="text-xs font-bold">Əməliyyat<select name="direction" className={field}><option value="topup">Artır</option><option value="spend">Çıx</option></select></label><label className="text-xs font-bold">Məbləğ ₼<input name="amount" type="number" min="0.01" step="0.01" required className={field} /></label></div><label className="text-xs font-bold">Qeyd<input name="note" maxLength={200} className={field} /></label><button type="submit" className="min-h-10 w-full cursor-pointer rounded-xl bg-yellow-primary text-sm font-bold">Əməliyyatı saxla</button></form>{client.ledger.filter((item) => item.account === ledgerMode).map((item) => <div key={item.id} className={`${box} flex flex-wrap justify-between gap-2 text-sm`}><div><strong>{item.amount > 0 ? "Artım" : "Çıxılma"}</strong><p className="text-xs text-slate-500">{new Date(item.date).toLocaleString("az-AZ")} · {item.note || "Qeyd yoxdur"}</p></div><strong className={item.amount > 0 ? "text-emerald-700" : "text-rose-700"}>{item.amount > 0 ? "+" : ""}{item.amount.toFixed(2)} ₼</strong></div>)}</div>;
}

type NotesProps = { client: Client; addNote: (event: FormEvent<HTMLFormElement>) => void };
export function ClientNotesSection({ client, addNote }: NotesProps) {
  return <div className="mt-4 space-y-3"><form onSubmit={addNote} className={`${box} space-y-2`}><label className="text-sm font-bold">Yeni qeyd<textarea name="text" required rows={3} maxLength={800} className={`${field} py-3`} /></label><button type="submit" className="min-h-10 w-full cursor-pointer rounded-xl bg-yellow-primary text-sm font-bold">Qeydi əlavə et</button></form>{client.notes.map((item) => <div key={item.id} className={box}><p className="break-words text-sm">{item.text}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.date).toLocaleString("az-AZ")}</p></div>)}{!client.notes.length && <p className="text-sm text-slate-500">Əlavə qeyd yoxdur.</p>}</div>;
}

type FilesProps = {
  client: Client;
  upload: (event: ChangeEvent<HTMLInputElement>) => void;
  persist: (client: Client) => boolean;
};
export function ClientFilesSection({ client, upload, persist }: FilesProps) {
  return <div className="mt-4 space-y-3"><label className={`${box} block cursor-pointer text-sm font-bold`}>Fayl əlavə et<input type="file" accept="image/*,.pdf" onChange={upload} className="mt-2 block max-w-full text-xs" /><span className="mt-1 block text-xs font-normal text-slate-500">Şəkil və ya PDF, maksimum 400 KB. Yalnız bu brauzerdə saxlanılır.</span></label>{client.files.map((item) => <div key={item.id} className={`${box} flex flex-wrap items-center justify-between gap-2`}><a href={item.dataUrl} download={item.name} className="min-w-0 break-all text-sm font-bold underline">{item.name}</a><button type="button" onClick={() => persist({ ...client, files: client.files.filter((file) => file.id !== item.id) })} className="min-h-9 cursor-pointer rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700">Sil</button></div>)}{!client.files.length && <p className="text-sm text-slate-500">Fayl yoxdur.</p>}</div>;
}
