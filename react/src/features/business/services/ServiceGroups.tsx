import type { Dispatch, ReactNode, SetStateAction } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { type Service, type ServiceCategory, type ServiceFormat, type ServiceGender } from "./services";

const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
interface Props {
  categories: ServiceCategory[];
  filtered: Service[];
  categoryFilter: string;
  genderFilter: ServiceGender | "all-filter";
  formatFilter: ServiceFormat | "all";
  onlineFilter: string;
  search: string;
  collapsed: string[];
  setCollapsed: Dispatch<SetStateAction<string[]>>;
  onEditCategory: (category: ServiceCategory) => void;
  onDeleteCategory: (category: ServiceCategory) => void;
  onAddService: (categoryId: string) => void;
  renderService: (service: Service) => ReactNode;
}
export default function ServiceGroups({ categories, filtered, categoryFilter, genderFilter, formatFilter, onlineFilter, search, collapsed, setCollapsed, onEditCategory, onDeleteCategory, onAddService, renderService }: Props) {
  const uncategorized = filtered.filter((item) => !item.categoryId || !categories.some((cat) => cat.id === item.categoryId));
  return <div className="space-y-3">{categories.filter((item) => categoryFilter === "all" || categoryFilter === item.id).map((cat) => { const rows = filtered.filter((item) => item.categoryId === cat.id); if (!rows.length && (search || categoryFilter !== "all" || genderFilter !== "all-filter" || formatFilter !== "all" || onlineFilter !== "all")) return null; const isCollapsed = collapsed.includes(cat.id); return <section key={cat.id} className={panel}><div className="flex items-start gap-2"><button type="button" onClick={() => setCollapsed((current) => isCollapsed ? current.filter((id) => id !== cat.id) : [...current, cat.id])} aria-expanded={!isCollapsed} aria-label={`${cat.name} ${isCollapsed ? "aç" : "bağla"}`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-amber-50"><ChevronDown size={18} className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`} /></button><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-bold sm:text-base">{cat.name} <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs">{rows.length}</span></h3>{cat.description && <p className="mt-1 break-words text-xs text-slate-500">{cat.description}</p>}</div><button type="button" onClick={() => onEditCategory(cat)} aria-label={`${cat.name} redaktə et`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button type="button" onClick={() => onDeleteCategory(cat)} aria-label={`${cat.name} sil`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div>{!isCollapsed && <div className="ml-4 mt-3 space-y-2 border-l-2 border-slate-200 pl-3 sm:ml-5 sm:pl-5">{rows.map(renderService)}<button type="button" onClick={() => onAddService(cat.id)} className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-slate-100 text-xs font-bold hover:bg-yellow-primary"><Plus size={15} />Xidmət əlavə et</button></div>}</section>; })}{(categoryFilter === "all" || categoryFilter === "uncategorized") && uncategorized.length > 0 && <section className={panel}><h3 className="mb-3 font-bold">Kateqoriyasız <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs">{uncategorized.length}</span></h3><div className="space-y-2">{uncategorized.map(renderService)}</div></section>}{!filtered.length && <div className={`${panel} py-10 text-center text-sm text-slate-500`}>Xidmət tapılmadı.</div>}</div>;
}
