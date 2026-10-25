import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { readProductData } from "../products/products";
import { readResourceData } from "../resources/resources";
import { readStaffData } from "../staff/staff";
import { ServiceCategoryDialog, ServiceDialog } from "./ServiceDialogs";
import { type Service, type ServiceCategory, type ServiceFormat, type ServiceGender } from "./services";
import { useServices } from "./useServices";
import ServiceRow from "./ServiceRow";
import ServiceFilterDialog from "./ServiceFilterDialog";
import ServiceGroups from "./ServiceGroups";
import { useActiveBusinessContext } from "../directory/activeContext";
const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
export default function BusinessServices({ session }: { session: BusinessSession }) {
  const { data, update } = useServices(session);
  const activeBusiness = useActiveBusinessContext(session);
  const businessId = activeBusiness?.businessId ?? "";
  const scopedServices = data.services.filter((item) => (item.businessId ?? (session.id === "baku-beauty-demo" ? "biz_baku_beauty" : businessId)) === businessId);
  const staff = readStaffData(session).members;
  const resources = readResourceData(session).resources;
  const products = readProductData(session).products;
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState<ServiceGender | "all-filter">("all-filter");
  const [formatFilter, setFormatFilter] = useState<ServiceFormat | "all">("all");
  const [onlineFilter, setOnlineFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [editingService, setEditingService] = useState<Service | null | undefined>(undefined);
  const [defaultCategoryId, setDefaultCategoryId] = useState("");
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<{ kind: "service" | "category"; id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const filtered = scopedServices.filter((item) => (categoryFilter === "all" || (categoryFilter === "uncategorized" ? !item.categoryId || !data.categories.some((cat) => cat.id === item.categoryId) : item.categoryId === categoryFilter)) && (genderFilter === "all-filter" || item.gender === genderFilter) && (formatFilter === "all" || item.format === formatFilter) && (onlineFilter === "all" || String(item.onlineBooking) === onlineFilter) && `${item.name} ${item.description}`.toLocaleLowerCase("az-AZ").includes(search.toLocaleLowerCase("az-AZ")));
  function openService(item?: Service, categoryId = "") { if (!businessId) { setError("Əvvəlcə biznes və ya fərdi usta profili yaradın."); return; } setDefaultCategoryId(categoryId); setEditingService(item ?? null); setError(""); }
  function saveService(item: Service) { update({ ...data, services: data.services.some((old) => old.id === item.id) ? data.services.map((old) => old.id === item.id ? item : old) : [...data.services, item] }); setEditingService(undefined); }
  function saveCategory(item: ServiceCategory) { if (data.categories.some((old) => old.id !== item.id && old.name.toLocaleLowerCase("az-AZ") === item.name.toLocaleLowerCase("az-AZ"))) { setError("Bu kateqoriya artıq mövcuddur."); return; } update({ ...data, categories: data.categories.some((old) => old.id === item.id) ? data.categories.map((old) => old.id === item.id ? item : old) : [...data.categories, item] }); setEditingCategory(undefined); setError(""); }
  function remove() { if (!deleting) return; if (deleting.kind === "service") { const parent = data.services.find((item) => item.comboIds.includes(deleting.id)); if (parent) { setError(`Bu xidmət “${parent.name}” kompleksinə daxildir. Əvvəlcə kompleksin tərkibini dəyişin.`); setDeleting(null); return; } update({ ...data, services: data.services.filter((item) => item.id !== deleting.id) }); } else update({ categories: data.categories.filter((item) => item.id !== deleting.id), services: data.services.map((item) => item.categoryId === deleting.id ? { ...item, categoryId: "" } : item) }); if (categoryFilter === deleting.id) setCategoryFilter("all"); setDeleting(null); }
  function toggleOnline(item: Service) { update({ ...data, services: data.services.map((old) => old.id === item.id ? { ...old, onlineBooking: !old.onlineBooking } : old) }); }
  function reset() { setSearch(""); setCategoryFilter("all"); setGenderFilter("all-filter"); setFormatFilter("all"); setOnlineFilter("all"); }
  function serviceRow(item: Service) { return <ServiceRow key={item.id} service={item} staff={staff} onEdit={() => openService(item)} onDelete={() => setDeleting({ kind: "service", id: item.id, name: item.name })} onToggleOnline={() => toggleOnline(item)} />; }
  const averagePrice = scopedServices.length ? (scopedServices.reduce((sum, item) => sum + item.price, 0) / scopedServices.length).toFixed(2) : "0.00";
  const averageDuration = scopedServices.length ? Math.round(scopedServices.reduce((sum, item) => sum + item.duration, 0) / scopedServices.length) : 0;
  return <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="subtitle">Xidmətlər, qiymət kataloqu və icra müddəti</BusinessHeaderPortal>
    <BusinessHeaderPortal><BusinessHeaderButton variant="secondary" onClick={() => setEditingCategory(null)} className="flex-1 sm:flex-none"><Plus />Yeni kateqoriya</BusinessHeaderButton><BusinessHeaderButton disabled={!businessId} onClick={() => openService()} className="flex-1 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"><Plus />Yeni xidmət</BusinessHeaderButton></BusinessHeaderPortal>
    {!businessId && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Xidmət əlavə etmək üçün əvvəlcə biznes və ya fərdi usta profili yaradın.</p>}
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ title: "Ümumi xidmətlər", value: scopedServices.length }, { title: "Onlayn qəbul", value: scopedServices.filter((item) => item.onlineBooking).length }, { title: "Orta qiymət", value: `${averagePrice} ₼` }, { title: "Orta müddət", value: `${averageDuration} dəq` }].map((item) => <div key={item.title} className={panel}><p className="text-xs text-slate-500">{item.title}</p><strong className="mt-2 block text-2xl">{item.value}</strong></div>)}</div>
    <div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Xidmət axtar" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Xidmət adı və ya təsvir üzrə axtarış" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><button type="button" aria-label="Filtrlər" onClick={() => setFilterOpen(true)} className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold"><Filter size={16} /><span className="hidden sm:inline">Filtrlər</span></button></div>
    {(search || categoryFilter !== "all" || formatFilter !== "all" || genderFilter !== "all-filter" || onlineFilter !== "all") && <button type="button" onClick={reset} className="cursor-pointer text-xs font-bold text-red-600">Filtrləri sıfırla</button>}
    {filterOpen && <ServiceFilterDialog categories={data.categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} formatFilter={formatFilter} setFormatFilter={setFormatFilter} genderFilter={genderFilter} setGenderFilter={setGenderFilter} onlineFilter={onlineFilter} setOnlineFilter={setOnlineFilter} onClose={() => setFilterOpen(false)} onReset={reset} />}
    <ServiceGroups categories={data.categories} filtered={filtered} categoryFilter={categoryFilter} genderFilter={genderFilter} formatFilter={formatFilter} onlineFilter={onlineFilter} search={search} collapsed={collapsed} setCollapsed={setCollapsed} onEditCategory={setEditingCategory} onDeleteCategory={(cat) => setDeleting({ kind: "category", id: cat.id, name: cat.name })} onAddService={(categoryId) => openService(undefined, categoryId)} renderService={serviceRow} />
    {editingService !== undefined && <ServiceDialog key={editingService?.id ?? "new"} initial={editingService ?? undefined} businessId={businessId} defaultCategoryId={defaultCategoryId} data={{ ...data, services: scopedServices }} staff={staff} resources={resources} products={products} onClose={() => setEditingService(undefined)} onSave={saveService} />}
    {editingCategory !== undefined && <ServiceCategoryDialog key={editingCategory?.id ?? "new"} initial={editingCategory ?? undefined} error={error} onClose={() => { setEditingCategory(undefined); setError(""); }} onSave={saveCategory} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail={deleting.kind === "category" ? "Bağlı xidmətlər kateqoriyasız qalacaq." : "Kompleksə daxil olan xidmət əvvəlcə kompleksdən çıxarılmalıdır."} onClose={() => setDeleting(null)} onDelete={remove} />}
  </div>;
}
