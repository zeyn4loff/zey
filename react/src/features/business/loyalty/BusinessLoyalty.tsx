import { useState } from "react";
import { Filter, Pencil, Plus, Search, Settings2, Trash2 } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessFormDialog from "../components/BusinessFormDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import LoyaltyDialog from "./LoyaltyDialog";
import LoyaltyTable from "./LoyaltyTable";
import LoyaltyBalancesPanel from "./LoyaltyBalancesPanel";
import IssuedGiftCardsPanel from "./IssuedGiftCardsPanel";
import LoyaltyProgramDialog from "./LoyaltyProgramDialog";
import LoyaltySummary from "./LoyaltySummary";
import { type GiftCard, type LoyaltyRule, type LoyaltyTab, type Subscription } from "./loyalty";
import { useLoyalty } from "./useLoyalty";

type Entry = LoyaltyRule | GiftCard | Subscription;
const tabs: { id: LoyaltyTab; label: string; action: string }[] = [{ id: "cards_cashback", label: "Loyallıq kartları və cashback", action: "Yeni qayda" }, { id: "gift_cards", label: "Hədiyyə kartları", action: "Yeni kart" }, { id: "subscriptions", label: "Abunəliklər", action: "Yeni abunəlik" }, { id: "deposits", label: "Depozitlər", action: "" }];
function details(tab: LoyaltyTab, item: Entry) { if (tab === "cards_cashback" && "percent" in item) return `${item.type === "discount" ? "Endirim" : "Keşbek"} · ${item.percent}% · ${item.target === "new" ? "Yeni müştərilər" : "Bütün müştərilər"}`; if (tab === "gift_cards" && "nominal" in item) return `${item.type === "service" ? `Xidmət: ${item.serviceName}` : "Ümumi"} · ${item.nominal} ₼ nominal · ${item.salePrice} ₼ satış`; if (tab === "subscriptions" && "visitsCount" in item) return `${item.visitsCount} ziyarət · ${item.validityDays} gün · ${item.price} ₼${item.serviceNames ? ` · ${item.serviceNames}` : ""}`; return ""; }
export default function BusinessLoyalty({ session }: { session: BusinessSession }) {
  const { data, update } = useLoyalty(session);
  const [tab, setTab] = useState<LoyaltyTab>("cards_cashback");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Entry | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Entry | null>(null);
  const [message, setMessage] = useState("");
  const [programOpen, setProgramOpen] = useState(false);
  const items: Entry[] = tab === "cards_cashback" ? data.rules : tab === "gift_cards" ? data.giftCards : tab === "subscriptions" ? data.subscriptions : [];
  const counts = { cards_cashback: data.rules.length, gift_cards: data.giftCards.filter((x) => x.status === "active").length, subscriptions: data.subscriptions.filter((x) => x.status === "active").length, deposits: 0 };
  const filtered = items.filter((item) => (status === "all" || item.status === status) && (type === "all" || ("type" in item && item.type === type)) && (!query.trim() || `${item.name} ${details(tab, item)}`.toLocaleLowerCase("az-AZ").includes(query.trim().toLocaleLowerCase("az-AZ"))));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const shown = filtered.slice((Math.min(page, totalPages) - 1) * 10, Math.min(page, totalPages) * 10);
  function save(item: Entry) { const list = items.some((x) => x.id === item.id) ? items.map((x) => x.id === item.id ? item : x) : [item, ...items]; const next = { ...data, [tab === "cards_cashback" ? "rules" : tab === "gift_cards" ? "giftCards" : "subscriptions"]: list }; const ok = update(next); setMessage(ok ? "Yadda saxlanıldı." : "Brauzer yaddaşına yazmaq mümkün olmadı."); return ok; }
  function remove() { if (!deleting) return; const list = items.filter((x) => x.id !== deleting.id); const next = { ...data, [tab === "cards_cashback" ? "rules" : tab === "gift_cards" ? "giftCards" : "subscriptions"]: list }; if (update(next)) setMessage("Silindi."); else setMessage("Silmək mümkün olmadı."); setDeleting(null); }
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="title">Loyallıq Proqramı</BusinessHeaderPortal>
    <BusinessHeaderPortal slot="subtitle">Loyallıq kartları, hədiyyə kartları və abunəliklər</BusinessHeaderPortal>
    {tab !== "deposits" && <BusinessHeaderPortal slot="actions"><BusinessHeaderButton onClick={() => setEditing(null)}><Plus />{tabs.find((x) => x.id === tab)?.action}</BusinessHeaderButton></BusinessHeaderPortal>}
    <BusinessTabNav label="Loyallıq bölmələri">{tabs.map((item) => <BusinessTabButton key={item.id} active={tab === item.id} count={counts[item.id]} onClick={() => { setTab(item.id); setQuery(""); setStatus("all"); setType("all"); setPage(1); setMessage(""); }}>{item.label}</BusinessTabButton>)}</BusinessTabNav>
    {tab === "cards_cashback" && <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Qaydalar saxlanılır. Endirim və keşbek avtomatik hesablanmır; müştəriyə tətbiq olunan məbləği satışda ayrıca yoxlayın.</p>}
    {tab === "deposits" && <LoyaltyBalancesPanel session={session} />}
    {tab !== "deposits" && <>
    <LoyaltySummary tab={tab} data={data} items={items} />
    {tab === "cards_cashback" && <button type="button" onClick={() => setProgramOpen(true)} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold shadow-sm"><Settings2 size={17} />Proqram qaydaları</button>}
    <div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Loyallıq axtarışı" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Ad üzrə axtar" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrlər" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><Filter size={17} /><span className="hidden sm:inline">Filtrlər</span></button></div>
    {filterOpen && <BusinessFormDialog title="Loyallıq filtrləri" size="medium" onClose={() => setFilterOpen(false)}><div className="space-y-3"><label className="block text-sm font-semibold">Status<select aria-label="Status filtri" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="mt-1 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 px-3"><option value="all">Bütün statuslar</option><option value="active">Aktiv</option><option value="inactive">Deaktiv</option></select></label>{tab !== "subscriptions" && <label className="block text-sm font-semibold">Növ<select aria-label="Növ filtri" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="mt-1 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 px-3"><option value="all">Bütün növlər</option>{tab === "cards_cashback" ? <><option value="discount">Endirim</option><option value="cashback">Keşbek</option></> : <><option value="general">Ümumi</option><option value="service">Xidmət üçün</option></>}</select></label>}<button type="button" onClick={() => setFilterOpen(false)} className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary font-bold">Nəticələri göstər</button></div></BusinessFormDialog>}
    {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    <div className="hidden lg:block"><LoyaltyTable tab={tab} entries={shown} onEdit={setEditing} onDelete={setDeleting} /></div>
    <div className="space-y-2 lg:hidden">{shown.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h4 className="break-words font-bold">{item.name}</h4><p className="mt-1 break-words text-sm text-slate-500">{details(tab, item)}</p><span className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-bold ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.status === "active" ? "Aktiv" : "Deaktiv"}</span></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => setEditing(item)} aria-label={`${item.name} redaktə et`} className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><Pencil size={17} /></button><button type="button" onClick={() => setDeleting(item)} aria-label={`${item.name} sil`} className="flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button></div></div></article>)}{!filtered.length && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Nəticə tapılmadı.</div>}</div>
    {totalPages > 1 && <div className="flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-11 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Əvvəlki</button><span className="text-sm">{Math.min(page, totalPages)} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="min-h-11 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Növbəti</button></div>}
    {tab === "gift_cards" && <IssuedGiftCardsPanel session={session} templates={data.giftCards} cards={data.issuedGiftCards ?? []} onChange={(issuedGiftCards) => update({ ...data, issuedGiftCards })} />}
    {editing !== undefined && <LoyaltyDialog key={`${tab}-${editing?.id ?? "new"}`} tab={tab} entry={editing} onClose={() => setEditing(undefined)} onSave={save} />}{deleting && <BusinessDeleteDialog name={deleting.name} onClose={() => setDeleting(null)} onDelete={remove} />}
    </>}
    {programOpen && <LoyaltyProgramDialog value={data.program} onClose={() => setProgramOpen(false)} onSave={(program) => { const ok = update({ ...data, program }); setMessage(ok ? "Proqram qaydaları yadda saxlanıldı." : "Yadda saxlamaq mümkün olmadı."); return ok; }} />}
  </main>;
}
