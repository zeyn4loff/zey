import type { Dispatch, SetStateAction } from "react";
import { Filter, Search, Star } from "lucide-react";
import type { Service } from "../services/services";
import StaffMemberCard from "./StaffMemberCard";
import StaffTable from "./StaffTable";
import { emptyStaffFilters, type StaffFilters } from "./staffFilters";
import { type StaffData, type StaffMember, type Weekday } from "./staff";

const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
type StaffDelete = { kind: "staff" | "role"; id: string; name: string } | null;
type Employment = { id: string; mode: "dismiss" | "rehire" | "history" } | null;
type StaffEditorTab = "info" | "services" | "schedule" | "pay";
interface Props {
  data: StaffData;
  services: Service[];
  filters: StaffFilters;
  setFilters: Dispatch<SetStateAction<StaffFilters>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  todayKey: Weekday;
  roleName: (id: string) => string;
  branchName: (id: string) => string;
  filtered: StaffMember[];
  shown: StaffMember[];
  totalPages: number;
  activeFilterCount: number;
  avgRating: StaffMember[];
  openStaff: (item?: StaffMember, selected?: StaffEditorTab) => void;
  setDeleting: Dispatch<SetStateAction<StaffDelete>>;
  setEmployment: Dispatch<SetStateAction<Employment>>;
  toggleOnline: (item: StaffMember) => void;
}
export default function StaffTeamView({ data, services, filters, setFilters, search, setSearch, setFilterOpen, page, setPage, todayKey, roleName, branchName, filtered, shown, totalPages, activeFilterCount, avgRating, openStaff, setDeleting, setEmployment, toggleOnline }: Props) {
  return <>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
      <button type="button" onClick={() => { setFilters(emptyStaffFilters); setSearch(""); setPage(1); }} className={`${card} border-[#101114] text-left ring-2 ring-yellow-primary/40`}><p className="text-xs font-semibold text-slate-500">Cəmi heyət</p><strong className="mt-2 block text-2xl">{data.members.length} <span className="text-xs text-slate-400">usta</span></strong><p className="mt-1 text-[11px] text-slate-400">Bütün filiallar üzrə mütəxəssislər</p></button>
      <button type="button" onClick={() => { setFilters({ ...filters, shift: filters.shift === "working" ? "all" : "working" }); setPage(1); }} className={`${card} text-left ${filters.shift === "working" ? "border-[#101114] ring-2 ring-yellow-primary/40" : ""}`}><p className="text-xs font-semibold text-slate-500">Bu gün növbədə</p><strong className="mt-2 block text-2xl text-emerald-600">{data.members.filter((item) => item.status === "active" && item.schedule[todayKey].enabled).length} <span className="text-xs text-slate-400">usta</span></strong><p className="mt-1 text-[11px] text-slate-400">Cədvəl üzrə bu gün işləyənlər</p></button>
      <button type="button" onClick={() => { setFilters({ ...filters, online: filters.online === "online" ? "all" : "online" }); setPage(1); }} className={`${card} text-left ${filters.online === "online" ? "border-[#101114] ring-2 ring-yellow-primary/40" : ""}`}><p className="text-xs font-semibold text-slate-500">Onlayn qəbulda</p><strong className="mt-2 block text-2xl">{data.members.filter((item) => item.onlineBooking && item.status === "active").length} <span className="text-xs text-slate-400">aktiv</span></strong><p className="mt-1 text-[11px] text-slate-400">Müştərilər saytdan seçə bilir</p></button>
      <div className={card}><p className="text-xs font-semibold text-slate-500">Orta reytinq</p><strong className="mt-2 flex items-center gap-1 text-2xl"><Star className="text-amber-400" size={20} fill="currentColor" />{avgRating.length ? (avgRating.reduce((sum, item) => sum + (item.rating ?? 0), 0) / avgRating.length).toFixed(2) : "—"}</strong><p className="mt-1 text-[11px] text-slate-400">Müştəri rəylərinin yekun balı</p></div>
    </div>
    <div className="flex min-w-0 gap-2"><label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3"><Search size={17} className="shrink-0 text-slate-400" /><input aria-label="Usta axtar" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Usta adı, vəzifə, telefon və ya email üzrə axtarış" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></label><button type="button" aria-label="Filtrlər" onClick={() => setFilterOpen(true)} className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold hover:border-slate-400"><Filter size={16} /><span className="hidden sm:inline">Filtrlər</span>{activeFilterCount > 0 && <span className="rounded-full bg-[#101114] px-1.5 py-0.5 text-[10px] text-white">{activeFilterCount}</span>}</button></div>
    {(activeFilterCount > 0 || search) && <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600"><span>{filtered.length} nəticə</span><button type="button" onClick={() => { setFilters(emptyStaffFilters); setSearch(""); setPage(1); }} className="cursor-pointer font-bold text-rose-600 underline">Filtrləri sıfırla</button></div>}
    {shown.length > 0 ? <><div className="space-y-2 lg:hidden">{shown.map((item) => <StaffMemberCard key={item.id} member={item} roleName={roleName(item.roleId)} branchName={branchName(item.branchId)} serviceCount={services.filter((service) => service.staffIds.includes(item.id)).length} onEdit={() => openStaff(item)} onDelete={() => setDeleting({ kind: "staff", id: item.id, name: item.name })} onToggleOnline={() => toggleOnline(item)} onServices={() => openStaff(item, "services")} onSchedule={() => openStaff(item, "schedule")} onPay={() => openStaff(item, "pay")} onEmployment={() => setEmployment({ id: item.id, mode: item.status === "dismissed" ? "rehire" : "dismiss" })} onHistory={() => setEmployment({ id: item.id, mode: "history" })} />)}</div><div className="hidden lg:block"><StaffTable members={shown} today={todayKey} roleName={roleName} serviceCount={(id) => services.filter((service) => service.staffIds.includes(id)).length} onEdit={(item) => openStaff(item)} onDelete={(item) => setDeleting({ kind: "staff", id: item.id, name: item.name })} onToggleOnline={toggleOnline} onServices={(item) => openStaff(item, "services")} onSchedule={(item) => openStaff(item, "schedule")} onEmployment={(item) => setEmployment({ id: item.id, mode: item.status === "dismissed" ? "rehire" : "dismiss" })} /></div></> : <div className={`${card} py-10 text-center text-sm text-slate-500`}>Usta tapılmadı.</div>}
    {totalPages > 1 && <div className="flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 cursor-pointer rounded-xl bg-slate-100 px-3 disabled:opacity-40">Əvvəlki</button><span className="text-sm">{page} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="min-h-10 cursor-pointer rounded-xl bg-slate-100 px-3 disabled:opacity-40">Növbəti</button></div>}
  </>;
}
