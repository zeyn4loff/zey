import { useRef, useState, type ChangeEvent } from "react";
import { Download, Filter, Plus, Search, Upload } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { readBookings } from "../calendar/bookings";
import { useActiveBusinessContext } from "../directory/activeContext";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import { readStaffData } from "../staff/staff";
import ClientProfileDialog from "./ClientProfileDialog";
import ClientTable from "./ClientTable";
import ClientMobileList from "./ClientMobileList";
import ClientFilterDialog from "./ClientFilterDialog";
import { latestVisit, phoneDigits, totalSpent, totalVisits, upcomingBirthday, type Client, type ClientCategory, type ClientGender } from "./clients";
import { clientsToCsv, parseClientsCsv } from "./csv";
import { useClients } from "./useClients";
const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
type Tab = "all" | ClientCategory | "birthdays";
export default function BusinessClients({ session }: { session: BusinessSession }) {
  const { clients, update } = useClients(session);
  const bookings = readBookings(session);
  const activeBusiness = useActiveBusinessContext(session);
  const staff = readStaffData(session).members;
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<ClientGender | "all">("all");
  const [sort, setSort] = useState("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const selected = editingId === null || editingId === undefined ? null : clients.find((item) => item.id === editingId) ?? null;
  const totalSpentAll = clients.reduce((sum, item) => sum + totalSpent(item), 0);
  const totalVisitCount = clients.reduce((sum, item) => sum + totalVisits(item), 0);
  const tabs: { id: Tab; name: string; count: number }[] = [
    { id: "all", name: "Bütün müştərilər", count: clients.length }, { id: "regular", name: "Daimi", count: clients.filter((item) => item.category === "regular").length },
    { id: "vip", name: "VIP müştərilər", count: clients.filter((item) => item.category === "vip").length }, { id: "new", name: "Yeni", count: clients.filter((item) => item.category === "new").length },
    { id: "birthdays", name: "Ad günləri", count: clients.filter((item) => upcomingBirthday(item)).length }, { id: "risk", name: "Risk qrupu", count: clients.filter((item) => item.category === "risk").length },
  ];
  const query = search.toLocaleLowerCase("az-AZ").trim(); const digits = phoneDigits(search);
  const filtered = clients.filter((item) => (tab === "all" || (tab === "birthdays" ? upcomingBirthday(item) : item.category === tab)) && (gender === "all" || item.gender === gender) && (!query || `${item.name} ${item.email} ${item.id}`.toLocaleLowerCase("az-AZ").includes(query) || (digits.length >= 2 && phoneDigits(item.phone).includes(digits)))).sort((a, b) => sort === "spent_desc" ? totalSpent(b) - totalSpent(a) : sort === "visits_desc" ? totalVisits(b) - totalVisits(a) : sort === "name_asc" ? a.name.localeCompare(b.name, "az") : sort === "name_desc" ? b.name.localeCompare(a.name, "az") : latestVisit(b).localeCompare(latestVisit(a)));
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const shown = filtered.slice((Math.min(page, pages) - 1) * 10, Math.min(page, pages) * 10);
  function saveClient(item: Client) { if (clients.some((old) => old.id !== item.id && phoneDigits(old.phone) === phoneDigits(item.phone))) { setMessage("Bu telefon nömrəsi artıq başqa müştəridə var."); return false; } const next = clients.some((old) => old.id === item.id) ? clients.map((old) => old.id === item.id ? item : old) : [...clients, item]; setMessage(""); return update(next); }
  function remove() { if (!deleting) return; update(clients.filter((item) => item.id !== deleting.id)); setDeleting(null); if (editingId === deleting.id) setEditingId(undefined); }
  function downloadCsv() { const blob = new Blob([clientsToCsv(clients)], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "zeyvo-clients.csv"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  async function importCsv(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (file.size > 1_000_000) { setMessage("CSV faylı 1 MB-dan kiçik olmalıdır."); return; } try { const result = parseClientsCsv(await file.text(), clients); update(result.clients); setMessage(`${result.added} müştəri əlavə edildi, ${result.skipped} sətir ötürüldü.`); } catch (error) { setMessage(error instanceof Error ? error.message : "CSV oxunmadı."); } }
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="subtitle">Bütün filiallar üzrə ortaq müştəri bazası, ziyarət tarixçəsi və fərdi balanslar</BusinessHeaderPortal>
    <BusinessHeaderPortal slot="actions"><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={importCsv} className="hidden" aria-label="CSV faylını seç" /><BusinessHeaderButton variant="secondary" onClick={() => fileRef.current?.click()}><Upload />İdxal</BusinessHeaderButton><BusinessHeaderButton variant="secondary" onClick={downloadCsv}><Download />İxrac</BusinessHeaderButton><BusinessHeaderButton onClick={() => { setEditingId(null); setMessage(""); }}><Plus />Yeni müştəri</BusinessHeaderButton></BusinessHeaderPortal>
    {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    <BusinessTabNav label="Müştəri qrupları">{tabs.map((item) => <BusinessTabButton key={item.id} active={tab === item.id} count={item.count} onClick={() => { setTab(item.id); setPage(1); }}>{item.name}</BusinessTabButton>)}</BusinessTabNav>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ title: "Cəmi müştəri", value: clients.length }, { title: "Daimi və VIP", value: clients.filter((item) => item.category === "regular" || item.category === "vip").length }, { title: "Ziyarət dəyəri", value: `${totalSpentAll.toLocaleString("az-AZ")} ₼` }, { title: "Orta çek", value: `${totalVisitCount ? (totalSpentAll / totalVisitCount).toFixed(2) : 0} ₼` }].map((item) => <div key={item.title} className={card}><p className="text-xs text-slate-500">{item.title}</p><strong className="mt-2 block break-words text-xl sm:text-2xl">{item.value}</strong></div>)}</div>
    <div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Müştəri axtar" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Ad, telefon, e-poçt və ya ID" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrlər" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><Filter size={17} /><span className="hidden sm:inline">Filtrlər</span></button></div>
    {filterOpen && <ClientFilterDialog gender={gender} setGender={setGender} sort={sort} setSort={setSort} setPage={setPage} onClose={() => setFilterOpen(false)} />}
    <div className="hidden lg:block"><ClientTable clients={shown} onOpen={setEditingId} onDelete={setDeleting} /></div>
    <ClientMobileList clients={shown} onOpen={setEditingId} onDelete={setDeleting} />{!filtered.length && <div className={`${card} py-10 text-center text-sm text-slate-500`}>Müştəri tapılmadı.</div>}{pages > 1 && <div className="flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Əvvəlki</button><span className="text-sm">{Math.min(page, pages)} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="min-h-10 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Növbəti</button></div>}
    {editingId !== undefined && <ClientProfileDialog key={editingId ?? "new"} client={selected} clients={clients} bookings={bookings} staff={staff} businessName={activeBusiness?.businessName ?? "Zeyvo"} onClose={() => setEditingId(undefined)} onSave={saveClient} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail="Ziyarətlər, balans hərəkətləri, qeydlər və fayllar da silinəcək." onClose={() => setDeleting(null)} onDelete={remove} />}
  </div>;
}
