import { useState } from "react";
import { Check, CreditCard, Info, Link2, MessageCircle, Search, Smartphone } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import IntegrationDialog from "./IntegrationDialog";
import { catalog, type IntegrationDefinition, type IntegrationId } from "./integrations";
import { useIntegrations } from "./useIntegrations";

const icons = { whatsapp: MessageCircle, sms: Smartphone, payments: CreditCard, booking_widget: Link2 };
function IntegrationCard({ item, onOpen }: { item: IntegrationDefinition; onOpen: (id: IntegrationId) => void }) {
  const Icon = icons[item.id];
  return <article className="flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-2"><span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${item.id === "whatsapp" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}><Icon size={23} /></span><span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{item.available ? "Ayarlar" : "Hazırlanır"}</span></div><h3 className="mt-4 break-words font-bold">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.category} · Zeyvo</p><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.description}</p><ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">{item.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs text-slate-600"><Check size={15} className="shrink-0 text-emerald-600" />{feature}</li>)}</ul><div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-500">{item.priceLabel}</span>{item.available ? <button type="button" onClick={() => onOpen(item.id)} className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold">Ayarlar</button> : <span className="text-xs text-slate-400">Hələ qoşulmur</span>}</div></article>;
}
export default function BusinessIntegrations({ session }: { session: BusinessSession }) {
  const { data, update } = useIntegrations(session);
  const [tab, setTab] = useState<"all" | "installed">("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<IntegrationId | null>(null);
  const [message, setMessage] = useState("");
  const filtered = catalog.filter((item) => tab === "all" && (category === "all" || item.category === category) && (!query.trim() || `${item.name} ${item.description}`.toLocaleLowerCase("az-AZ").includes(query.toLocaleLowerCase("az-AZ").trim())));
  function save(next: typeof data) { const ok = update(next); setMessage(ok ? "Ayarlar yadda saxlanıldı." : "Yadda saxlamaq mümkün olmadı."); return ok; }
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7"><BusinessHeaderPortal slot="subtitle">WhatsApp, botlar və avtomatlaşdırma marketplace-i</BusinessHeaderPortal><BusinessTabNav label="İnteqrasiya bölmələri"><BusinessTabButton active={tab === "all"} count={catalog.length} onClick={() => setTab("all")}>Bütün xidmətlər</BusinessTabButton><BusinessTabButton active={tab === "installed"} count={0} onClick={() => setTab("installed")}>Qoşulanlar</BusinessTabButton></BusinessTabNav>
    {message && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
    {tab === "all" && <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_190px] sm:p-4"><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="İnteqrasiya axtarışı" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Xidmət axtar" className="min-w-0 flex-1 text-sm outline-none" /></label><select aria-label="Kateqoriya filtri" value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-11 cursor-pointer rounded-xl border border-slate-200 px-3 text-sm"><option value="all">Bütün kateqoriyalar</option><option value="Mesencerlər">Mesencerlər</option><option value="Ödənişlər">Ödənişlər</option><option value="Veb alətlər">Veb alətlər</option></select></div>}
    {tab === "installed" ? <div className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center"><Info className="mx-auto text-slate-400" size={30} /><h3 className="mt-3 font-bold">Qoşulmuş inteqrasiya yoxdur</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Qoşulmuş xidmətlər burada görünəcək. WhatsApp ayarlarını indi tənzimləyə bilərsiniz.</p><button type="button" onClick={() => setTab("all")} className="mt-4 min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold">Bütün xidmətlər</button></div> : filtered.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((item) => <IntegrationCard key={item.id} item={item} onOpen={setSelected} />)}</div> : <div className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">Nəticə tapılmadı.</div>}
    {selected === "whatsapp" && <IntegrationDialog data={data} initialTab="connect" onClose={() => setSelected(null)} onSave={save} />}
  </main>;
}
