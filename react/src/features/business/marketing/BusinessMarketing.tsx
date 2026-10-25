import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { readClients, totalSpent, upcomingBirthday } from "../clients/clients";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import MarketingDialog from "./MarketingDialog";
import MarketingTable from "./MarketingTable";
import MarketingMobileList from "./MarketingMobileList";
import MarketingFilterDialog from "./MarketingFilterDialog";
import { ReferralPanel } from "./MarketingPanels";
import { type Campaign, type MarketingTab, type Promo, type ReferralSettings } from "./marketing";
import PartnerReviewsPanel from "./PartnerReviewsPanel";
import { getPublicSalons, getPublicSpecialists, useMarketplaceRevision } from "@/features/marketplace/publicCatalog";
import { reviewSummary } from "@/features/marketplace/reviews";
import { useMarketing } from "./useMarketing";
const tabs: { id: MarketingTab; label: string }[] = [{ id: "campaigns", label: "Kampaniyalar və bildirişlər" }, { id: "promocodes", label: "Promokodlar" }, { id: "segments", label: "Müştəri seqmentləri" }, { id: "referral", label: "Referal proqramı" }, { id: "reviews", label: "Rəylər və reputasiya" }];
const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
export default function BusinessMarketing({ session }: { session: BusinessSession }) {
  useMarketplaceRevision();
  const { data, update } = useMarketing(session);
  const clients = readClients(session);
  const [tab, setTab] = useState<MarketingTab>("campaigns");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Campaign | Promo | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Campaign | Promo | null>(null);
  const [message, setMessage] = useState("");
  const list: (Campaign | Promo)[] = tab === "campaigns" ? data.campaigns : tab === "promocodes" ? data.promos : [];
  const filtered = list.filter((item) => (status === "all" || item.status === status) && (type === "all" || ("channel" in item ? item.channel === type || item.type === type : item.discountType === type)) && (!query.trim() || `${item.name} ${"code" in item ? item.code : ""}`.toLocaleLowerCase("az-AZ").includes(query.toLocaleLowerCase("az-AZ").trim())));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const shown = filtered.slice((Math.min(page, totalPages) - 1) * 10, Math.min(page, totalPages) * 10);
  const ownedSalons = getPublicSalons().filter((salon) => salon.partner?.ownerId === session.id);
  const ownedSalonIds = new Set(ownedSalons.map((salon) => salon.id));
  const counts: Record<MarketingTab, number> = { campaigns: data.campaigns.filter((x) => x.status === "active").length, promocodes: data.promos.filter((x) => x.status === "active").length, segments: clients.length ? 5 : 0, referral: 0, reviews: ownedSalons.reduce((sum, salon) => sum + salon.reviewsCount, 0) + getPublicSpecialists().filter((master) => master.salonId !== undefined && ownedSalonIds.has(master.salonId)).reduce((sum, master) => sum + reviewSummary(`master-${master.id}`).count, 0) };
  function save(item: Campaign | Promo) { if ("message" in item) { const campaigns = data.campaigns.some((x) => x.id === item.id) ? data.campaigns.map((x) => x.id === item.id ? item : x) : [item, ...data.campaigns]; const ok = update({ ...data, campaigns }); setMessage(ok ? "Yadda saxlanıldı. Bildiriş göndərilmədi." : "Yadda saxlamaq mümkün olmadı."); return ok; } const promos = data.promos.some((x) => x.id === item.id) ? data.promos.map((x) => x.id === item.id ? item : x) : [item, ...data.promos]; const ok = update({ ...data, promos }); setMessage(ok ? "Yadda saxlanıldı." : "Yadda saxlamaq mümkün olmadı."); return ok; }
  function remove() { if (!deleting) return; const next = "message" in deleting ? { ...data, campaigns: data.campaigns.filter((x) => x.id !== deleting.id) } : { ...data, promos: data.promos.filter((x) => x.id !== deleting.id) }; setMessage(update(next) ? "Silindi." : "Silmək mümkün olmadı."); setDeleting(null); }
  function saveReferral(next: ReferralSettings) { setMessage(update({ ...data, referral: next }) ? "Referal qaydaları saxlanıldı." : "Yadda saxlamaq mümkün olmadı."); }
  const segments = [{ label: "VIP daimi müştərilər", detail: "VIP və ya 300 ₼-dən çox xərc", items: clients.filter((x) => x.category === "vip" || totalSpent(x) >= 300) }, { label: "Yeni müştərilər", detail: "Yeni qrupundakı müştərilər", items: clients.filter((x) => x.category === "new") }, { label: "Passiv müştərilər", detail: "Risk qrupundakı müştərilər", items: clients.filter((x) => x.category === "risk") }, { label: "Ad günü yaxınlaşanlar", detail: "Növbəti 30 gündə ad günü", items: clients.filter((x) => upcomingBirthday(x)) }, { label: "Daimi müştərilər", detail: "Daimi qrupundakı müştərilər", items: clients.filter((x) => x.category === "regular") }];
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="subtitle">Kampaniyalar, bildirişlər, promokodlar, seqmentlər, referal və rəylər</BusinessHeaderPortal>
    {(tab === "campaigns" || tab === "promocodes") && <BusinessHeaderPortal slot="actions"><BusinessHeaderButton onClick={() => setEditing(null)}><Plus />{tab === "campaigns" ? "Yeni kampaniya" : "Yeni promokod"}</BusinessHeaderButton></BusinessHeaderPortal>}
    <BusinessTabNav label="Marketinq bölmələri">{tabs.map((x) => <BusinessTabButton key={x.id} active={tab === x.id} count={counts[x.id]} onClick={() => { setTab(x.id); setQuery(""); setStatus("all"); setType("all"); setPage(1); setMessage(""); }}>{x.label}</BusinessTabButton>)}</BusinessTabNav>
    {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    {tab === "campaigns" && <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Kampaniyalar saxlanılıb. Mesajların göndərilməsi hələ qoşulmayıb.</p>}
    {(tab === "campaigns" || tab === "promocodes") && <><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ title: "Cəmi", value: list.length }, { title: tab === "campaigns" ? "Hazır" : "Aktiv", value: list.filter((x) => x.status === "active").length }, { title: "Deaktiv", value: list.filter((x) => x.status === "inactive").length }, { title: tab === "campaigns" ? "Kanallar" : "İstifadə", value: tab === "campaigns" ? new Set(data.campaigns.map((item) => item.channel)).size : data.promos.reduce((sum, x) => sum + x.usedCount, 0) }].map((x) => <div key={x.title} className={panel}><p className="text-xs text-slate-500">{x.title}</p><strong className="mt-2 block text-xl sm:text-2xl">{x.value}</strong></div>)}</div><div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Marketinq axtarışı" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Kampaniya adı və ya kod" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><button type="button" onClick={() => setFilterOpen(true)} aria-label="Filtrlər" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold"><Filter size={17} /><span className="hidden sm:inline">Filtrlər</span></button></div><div className="hidden lg:block"><MarketingTable entries={shown} onEdit={setEditing} onDelete={setDeleting} /></div><MarketingMobileList entries={shown} onEdit={setEditing} onDelete={setDeleting} />{totalPages > 1 && <div className="flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-11 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Əvvəlki</button><span className="text-sm">{Math.min(page, totalPages)} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="min-h-11 cursor-pointer rounded-xl bg-white px-3 disabled:opacity-40">Növbəti</button></div>}</>}
    {tab === "segments" && <><p className="text-sm text-slate-500">Qruplar cari müştəri məlumatlarından hesablanır. Bir müştəri bir neçə qrupa daxil ola bilər.</p><div className="grid gap-3 sm:grid-cols-2">{segments.map((x) => <article key={x.label} className={panel}><div className="flex items-start justify-between gap-2"><h3 className="font-bold">{x.label}</h3><strong className="rounded-lg bg-amber-50 px-2 py-1 text-amber-900">{x.items.length}</strong></div><p className="mt-1 text-sm text-slate-500">{x.detail}</p><p className="mt-3 text-sm">Cəmi ziyarət dəyəri: <strong>{x.items.reduce((sum, client) => sum + totalSpent(client), 0).toLocaleString("az-AZ")} ₼</strong></p></article>)}</div></>}
    {tab === "referral" && <ReferralPanel settings={data.referral} onSave={saveReferral} />}
    {tab === "reviews" && <PartnerReviewsPanel session={session} />}
    {filterOpen && <MarketingFilterDialog tab={tab} status={status} setStatus={setStatus} type={type} setType={setType} setPage={setPage} onClose={() => setFilterOpen(false)} />}
    {editing !== undefined && <MarketingDialog key={`${tab}-${editing?.id ?? "new"}`} kind={tab === "campaigns" ? "campaign" : "promo"} item={editing} usedCodes={data.promos.map((x) => x.code)} onClose={() => setEditing(undefined)} onSave={save} />}{deleting && <BusinessDeleteDialog name={deleting.name} onClose={() => setDeleting(null)} onDelete={remove} />}

  </main>;
}
