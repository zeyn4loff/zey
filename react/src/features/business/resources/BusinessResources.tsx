import { useState } from "react";
import { Filter, Plus, Search } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import BusinessFormDialog from "../components/BusinessFormDialog";
import { readBusinesses } from "../directory/businesses";
import { useActiveBusinessContext } from "../directory/activeContext";
import { CategoryFormDialog, ResourceFormDialog } from "./ResourceDialogs";
import { type Resource, type ResourceCategory, type ResourceStatus, type ResourceType } from "./resources";
import ResourceGroups from "./ResourceGroups";
import { useResources } from "./useResources";

type Deleting = { kind: "category" | "resource"; id: string; name: string };

export default function BusinessResources({ session }: { session: BusinessSession }) {
  const { data, update } = useResources(session);
  const activeContext = useActiveBusinessContext(session);
  const businesses = readBusinesses(session);
  const branches = businesses.flatMap((business) => business.branches.map((branch) => ({ id: branch.id, label: `${branch.name} · ${business.name}` })));
  const [type, setType] = useState<ResourceType | "all">("all");
  const [branchChoice, setBranchChoice] = useState<{ contextId: string; branchId: string } | null>(null);
  const contextId = `${activeContext?.businessId ?? ""}/${activeContext?.branchId ?? ""}`;
  const branch = branchChoice?.contextId === contextId ? branchChoice.branchId : activeContext?.branchId ?? "all";
  const setBranch = (branchId: string) => setBranchChoice({ contextId, branchId });
  const [category, setCategory] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingResource, setEditingResource] = useState<Resource | null | undefined>(undefined);
  const [defaultCategoryId, setDefaultCategoryId] = useState("");
  const [editingCategory, setEditingCategory] = useState<ResourceCategory | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const branchLabel = new Map(branches.map((item) => [item.id, item.label]));
  const filtered = data.resources.filter((item) => (type === "all" || item.type === type) && (branch === "all" || item.branchId === branch) && (category === "all" || (category === "uncategorized" ? !item.categoryId || !data.categories.some((cat) => cat.id === item.categoryId) : item.categoryId === category)) && (!search || `${item.name} ${item.notes}`.toLocaleLowerCase("az-AZ").includes(search.toLocaleLowerCase("az-AZ"))));

  function saveResource(resource: Resource) {
    update({ ...data, resources: data.resources.some((item) => item.id === resource.id) ? data.resources.map((item) => item.id === resource.id ? resource : item) : [...data.resources, resource] });
    setEditingResource(undefined);
  }
  function saveCategory(next: ResourceCategory) {
    update({ ...data, categories: data.categories.some((item) => item.id === next.id) ? data.categories.map((item) => item.id === next.id ? next : item) : [...data.categories, next] });
    setEditingCategory(undefined);
  }
  function remove() {
    if (!deleting) return;
    if (deleting.kind === "resource") update({ ...data, resources: data.resources.filter((item) => item.id !== deleting.id) });
    else {
      update({ categories: data.categories.filter((item) => item.id !== deleting.id), resources: data.resources.map((item) => item.categoryId === deleting.id ? { ...item, categoryId: "" } : item) });
      if (category === deleting.id) setCategory("all");
    }
    setDeleting(null);
  }
  function changeStatus(id: string, status: ResourceStatus) { update({ ...data, resources: data.resources.map((item) => item.id === id ? { ...item, status } : item) }); }
  function openResource(initial?: Resource, categoryId = "") { setDefaultCategoryId(categoryId); setEditingResource(initial ?? null); }
  function resetFilters() { setType("all"); setBranch(activeContext?.branchId ?? "all"); setCategory("all"); setSearch(""); }

  const groups = data.categories.filter((item) => category === "all" || category === item.id).map((item) => ({ ...item, resources: filtered.filter((resource) => resource.categoryId === item.id) }));
  const uncategorized = filtered.filter((item) => !item.categoryId || !data.categories.some((cat) => cat.id === item.categoryId));
  const hasFilter = type !== "all" || (branchChoice?.contextId === contextId && branchChoice.branchId !== (activeContext?.branchId ?? "all")) || category !== "all" || search !== "";
  return <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal><BusinessHeaderButton variant="secondary" onClick={() => setEditingCategory(null)} className="flex-1 sm:flex-none"><Plus />Yeni kateqoriya</BusinessHeaderButton><BusinessHeaderButton onClick={() => openResource()} className="flex-1 sm:flex-none"><Plus />Yeni resurs</BusinessHeaderButton></BusinessHeaderPortal>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">{([{ value: "all", label: "Ümumi", count: data.resources.filter((item) => branch === "all" || item.branchId === branch).length }, { value: "chair", label: "Kreslolar", count: data.resources.filter((item) => item.type === "chair" && (branch === "all" || item.branchId === branch)).length }, { value: "room", label: "Otaqlar", count: data.resources.filter((item) => item.type === "room" && (branch === "all" || item.branchId === branch)).length }, { value: "device", label: "Aparatlar", count: data.resources.filter((item) => item.type === "device" && (branch === "all" || item.branchId === branch)).length }] as { value: ResourceType | "all"; label: string; count: number }[]).map((item) => <button type="button" key={item.value} onClick={() => setType(item.value)} aria-pressed={type === item.value} className={`min-h-24 cursor-pointer rounded-2xl border bg-white p-3 text-left shadow-sm sm:p-4 ${type === item.value ? "border-slate-900 ring-2 ring-yellow-primary/50" : "border-slate-200"}`}><span className="text-xs font-semibold text-slate-500">{item.label}</span><strong className="mt-2 block text-2xl">{item.count}</strong></button>)}</div>
    <div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3"><Search size={16} className="shrink-0 text-slate-400" /><input aria-label="Resurs axtar" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Resurs adı və ya qeydlər üzrə axtarış" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><button type="button" aria-label="Filtrlər" onClick={() => setFilterOpen(true)} className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold"><Filter size={16} /><span className="hidden sm:inline">Filtrlər</span></button></div>
    {hasFilter && <button type="button" onClick={resetFilters} className="cursor-pointer text-xs font-semibold text-red-600 hover:underline">Filtrləri sıfırla</button>}
    {filterOpen && <BusinessFormDialog title="Resursları filtrlə" onClose={() => setFilterOpen(false)} size="medium"><div className="grid gap-4"><label className="text-sm font-semibold">Filial<select aria-label="Filial üzrə filtr" value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-1 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 px-3 text-sm"><option value="all">Bütün filiallar</option>{branches.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label><label className="text-sm font-semibold">Kateqoriya<select aria-label="Kateqoriya üzrə filtr" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 min-h-11 w-full cursor-pointer rounded-xl border border-slate-200 px-3 text-sm"><option value="all">Bütün kateqoriyalar</option>{data.categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}<option value="uncategorized">Kateqoriyasız</option></select></label></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={resetFilters} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4 text-sm font-bold">Filtrləri sıfırla</button><button type="button" onClick={() => setFilterOpen(false)} className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold">Nəticələri göstər</button></div></BusinessFormDialog>}
    <ResourceGroups groups={groups} uncategorized={uncategorized} collapsed={collapsed} category={category} hasFilter={hasFilter} search={search} filteredLength={filtered.length} categoriesLength={data.categories.length} branchLabel={branchLabel} onToggleGroup={(id) => setCollapsed((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} onEditCategory={setEditingCategory} onDeleteCategory={(item) => setDeleting({ kind: "category", id: item.id, name: item.name })} onAddResource={(categoryId) => openResource(undefined, categoryId)} onChangeStatus={changeStatus} onEditResource={(item) => openResource(item)} onDeleteResource={(item) => setDeleting({ kind: "resource", id: item.id, name: item.name })} />
    {editingResource !== undefined && <ResourceFormDialog key={editingResource?.id ?? "new-resource"} initial={editingResource ?? undefined} categories={data.categories} businesses={businesses} defaultCategoryId={defaultCategoryId} defaultBranchId={activeContext?.branchId} onClose={() => setEditingResource(undefined)} onSave={saveResource} />}
    {editingCategory !== undefined && <CategoryFormDialog key={editingCategory?.id ?? "new-category"} initial={editingCategory ?? undefined} onClose={() => setEditingCategory(undefined)} onSave={saveCategory} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail={deleting.kind === "category" ? "Bu kateqoriyadakı resurslar kateqoriyasız siyahıya keçiriləcək." : undefined} onClose={() => setDeleting(null)} onDelete={remove} />}
  </div>;
}
