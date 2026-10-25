import { useState } from "react";
import { Building2, ChevronDown, MapPin, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { type Branch, type Business } from "./businesses";
import { useBusinesses } from "./useBusinesses";
import { BranchFormDialog, BusinessFormDialog } from "./BusinessDialogs";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import BusinessSetupChecklist from "./BusinessSetupChecklist";
import { resolveActiveContext } from "./activeContext";
import { readBookings } from "../calendar/bookings";
import { readServiceData } from "../services/services";
import { readStaffData } from "../staff/staff";
import { readResourceData } from "../resources/resources";
import { readProductData } from "../products/products";

type EditingBranch = { businessId: string; branch?: Branch };
type Deleting = { businessId: string; branchId?: string; name: string };

export default function BusinessDirectory({ session }: { session: BusinessSession }) {
  const { businesses, update } = useBusinesses(session);
  const [editingBusiness, setEditingBusiness] = useState<Business | null | undefined>(undefined);
  const [editingBranch, setEditingBranch] = useState<EditingBranch | null>(null);
  const [deleting, setDeleting] = useState<Deleting | null>(null);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const activeBusinessId = resolveActiveContext(session)?.businessId;
  const activeBusiness = businesses.find((item) => item.id === activeBusinessId);
  const deletionBlock = deleting ? (() => {
    const business = businesses.find((item) => item.id === deleting.businessId);
    if (!business) return "Profil tapılmadı.";
    const branchIds = deleting.branchId ? [deleting.branchId] : business.type === "individual" ? [business.id] : business.branches.map((branch) => branch.id);
    const bookings = readBookings(session).some((item) => (item.businessId === business.id || (!item.businessId && business.id === businesses[0]?.id)) && (!deleting.branchId || !item.branchId || item.branchId === deleting.branchId));
    const staff = readStaffData(session).members.some((item) => branchIds.includes(item.branchId));
    const resources = readResourceData(session).resources.some((item) => branchIds.includes(item.branchId));
    const productData = readProductData(session);
    const warehouseIds = productData.warehouses.filter((item) => branchIds.includes(item.branchId)).map((item) => item.id);
    const products = productData.products.some((item) => warehouseIds.includes(item.warehouseId));
    const services = !deleting.branchId && readServiceData(session).services.some((item) => (item.businessId ?? businesses[0]?.id) === business.id);
    const links = [bookings && "qəbullar", staff && "ustalar", resources && "resurslar", warehouseIds.length > 0 && "anbarlar", products && "məhsullar", services && "xidmətlər", !deleting.branchId && business.branches.length > 0 && "filiallar"].filter(Boolean);
    return links.length ? `Bu profilə bağlı ${links.join(", ")} var. Silməzdən əvvəl bağlı məlumatları başqa profilə köçürün və ya ayrıca silin.` : "";
  })() : "";

  function saveBusiness(item: Business) {
    update(businesses.some((business) => business.id === item.id) ? businesses.map((business) => business.id === item.id ? item : business) : [...businesses, item]);
    setEditingBusiness(undefined);
  }

  function saveBranch(item: Branch) {
    if (!editingBranch) return;
    update(businesses.map((business) => business.id === editingBranch.businessId ? { ...business, branches: business.branches.some((branch) => branch.id === item.id) ? business.branches.map((branch) => branch.id === item.id ? item : branch) : [...business.branches, item] } : business));
    setEditingBranch(null);
  }

  function deleteItem() {
    if (!deleting || deletionBlock) return;
    update(deleting.branchId ? businesses.map((business) => business.id === deleting.businessId ? { ...business, branches: business.branches.filter((branch) => branch.id !== deleting.branchId) } : business) : businesses.filter((business) => business.id !== deleting.businessId));
    setDeleting(null);
  }

  return <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal><BusinessHeaderButton onClick={() => setEditingBusiness(null)} className="w-full sm:w-auto"><Plus />Yeni biznes və ya fərdi usta</BusinessHeaderButton></BusinessHeaderPortal>
    {activeBusiness && <div className="mb-4"><BusinessSetupChecklist session={session} business={activeBusiness} /></div>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {businesses.length === 0 ? <div className="px-5 py-12 text-center"><Building2 className="mx-auto size-12 rounded-2xl bg-amber-50 p-3 text-amber-600" /><h3 className="mt-4 font-bold">Hələ heç bir profil tapılmadı</h3><p className="mt-1 text-sm text-slate-500">İlk biznesinizi və ya fərdi fəaliyyətinizi əlavə edin.</p><button type="button" onClick={() => setEditingBusiness(null)} className="mt-5 min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold">Yeni profil yarat</button></div> : <div className="divide-y divide-slate-100">{businesses.map((business) => {
        const isCollapsed = collapsed.includes(business.id);
        return <article key={business.id} className="p-4 sm:p-5">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">{business.type === "business" ? <Building2 size={20} /> : <UserRound size={20} />}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-sm font-bold sm:text-base">{business.name}</h3><span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${business.type === "business" ? "bg-amber-100 text-amber-900" : "bg-blue-100 text-blue-900"}`}>{business.type === "business" ? "Biznes" : "Fərdi usta"}</span></div>{business.description && <p className="mt-1 break-words text-xs text-slate-500">{business.description}</p>}{business.type === "business" && <button type="button" onClick={() => setCollapsed((current) => isCollapsed ? current.filter((id) => id !== business.id) : [...current, business.id])} aria-expanded={!isCollapsed} className="mt-1 flex min-h-8 cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-primary"><ChevronDown size={14} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />{business.branches.length} filial</button>}</div>
            <div className="flex shrink-0 gap-1"><button type="button" onClick={() => setEditingBusiness(business)} aria-label={`${business.name} redaktə et`} className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"><Pencil size={16} /></button><button type="button" onClick={() => setDeleting({ businessId: business.id, name: business.name })} aria-label={`${business.name} sil`} className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div>
          </div>
          {business.type === "business" && !isCollapsed && <div className="ml-5 mt-3 space-y-2 border-l-2 border-slate-200 pl-4 sm:ml-6 sm:pl-5">{business.branches.map((branch) => <div key={branch.id} className="flex flex-wrap items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-nowrap"><span className="mt-1 size-2 shrink-0 rounded-full bg-amber-400" /><div className="min-w-0 flex-1"><strong className="block break-words text-xs">{branch.name}</strong>{(branch.city || branch.address) && <p className="mt-1 flex items-start gap-1 break-words text-[11px] text-slate-500"><MapPin size={13} className="shrink-0" />{[branch.city, branch.address].filter(Boolean).join(" · ")}</p>}{branch.hours && <p className="mt-1 text-[11px] text-slate-500">{branch.hours}</p>}</div><div className="ml-auto flex shrink-0 gap-1"><button type="button" onClick={() => setEditingBranch({ businessId: business.id, branch })} aria-label={`${branch.name} redaktə et`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-white"><Pencil size={15} /></button><button type="button" onClick={() => setDeleting({ businessId: business.id, branchId: branch.id, name: branch.name })} aria-label={`${branch.name} sil`} className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div></div>)}<button type="button" onClick={() => setEditingBranch({ businessId: business.id })} className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold hover:bg-yellow-primary"><Plus size={15} />Filial əlavə et</button></div>}
        </article>;
      })}</div>}
    </div>
    {editingBusiness !== undefined && <BusinessFormDialog key={editingBusiness?.id ?? "new-business"} open initial={editingBusiness ?? undefined} onClose={() => setEditingBusiness(undefined)} onSave={saveBusiness} />}
    {editingBranch && <BranchFormDialog key={editingBranch.branch?.id ?? `${editingBranch.businessId}-new`} open initial={editingBranch.branch} onClose={() => setEditingBranch(null)} onSave={saveBranch} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail={deletionBlock} blocked={!!deletionBlock} onClose={() => setDeleting(null)} onDelete={deleteItem} />}
  </div>;
}
