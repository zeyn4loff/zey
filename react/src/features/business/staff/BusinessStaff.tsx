import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import BusinessHeaderButton from "../components/BusinessHeaderButton";
import { BusinessTabButton, BusinessTabNav } from "../components/BusinessTabs";
import { readBusinesses } from "../directory/businesses";
import { useActiveBusinessContext } from "../directory/activeContext";
import { useServices } from "../services/useServices";
import { RoleFormDialog, StaffFormDialog } from "./StaffDialogs";
import StaffEmploymentDialog from "./StaffEmploymentDialog";
import StaffFilterDialog from "./StaffFilterDialog";
import { emptyStaffFilters, type StaffFilters } from "./staffFilters";
import StaffScheduleTab from "./StaffScheduleTab";
import StaffRolesTab from "./StaffRolesTab";
import StaffTeamView from "./StaffTeamView";
import { weekdays, type StaffMember, type StaffRole, type Weekday } from "./staff";
import { useStaff } from "./useStaff";

type Tab = "team" | "schedule" | "roles";
export default function BusinessStaff({ session }: { session: BusinessSession }) {
  const { data, update } = useStaff(session);
  const { data: serviceData, update: updateServices } = useServices(session);
  const activeContext = useActiveBusinessContext(session);
  const branches = readBusinesses(session).flatMap((business) => business.branches);
  const [tab, setTab] = useState<Tab>("team");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<StaffFilters>(emptyStaffFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<{ item?: StaffMember; tab: "info" | "services" | "schedule" | "pay" } | null>(null);
  const [editingRole, setEditingRole] = useState<StaffRole | null | undefined>(undefined);
  const [employment, setEmployment] = useState<{ id: string; mode: "dismiss" | "rehire" | "history" } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: "staff" | "role"; id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const todayKey = weekdays[(new Date().getDay() + 6) % 7];
  const roleName = (id: string) => data.roles.find((role) => role.id === id)?.name ?? "Vəzifəsiz";
  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name ?? (id ? "Əvvəlki filial" : "Filiala bağlı deyil");
  const branchMembers = data.members.filter((item) => filters.branch === "all" || item.branchId === filters.branch);
  const filtered = data.members.filter((item) => (filters.role === "all" || item.roleId === filters.role) && (filters.status === "all" || item.status === filters.status) && (filters.branch === "all" || item.branchId === filters.branch) && (filters.shift === "all" || (item.status === "active" && item.schedule[todayKey].enabled)) && (filters.online === "all" || (item.status === "active" && item.onlineBooking)) && `${item.name} ${item.specialization} ${item.phone} ${item.email} ${roleName(item.roleId)}`.toLocaleLowerCase("az-AZ").includes(search.toLocaleLowerCase("az-AZ")));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const shown = filtered.slice((Math.min(page, totalPages) - 1) * 10, Math.min(page, totalPages) * 10);
  const employmentMember = data.members.find((member) => member.id === employment?.id);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => key !== "branch" && value !== "all").length + (filters.branch !== "all" ? 1 : 0);
  const avgRating = data.members.filter((item) => item.rating != null);
  function saveStaff(item: StaffMember, selectedServiceIds: string[]) { update({ ...data, members: data.members.some((old) => old.id === item.id) ? data.members.map((old) => old.id === item.id ? item : old) : [...data.members, item] }); updateServices({ ...serviceData, services: serviceData.services.map((service) => ({ ...service, staffIds: selectedServiceIds.includes(service.id) ? [...new Set([...service.staffIds, item.id])] : service.staffIds.filter((id) => id !== item.id) })) }); setEditingStaff(null); setError(""); }
  function saveRole(item: StaffRole) { if (data.roles.some((role) => role.id !== item.id && role.name.toLocaleLowerCase("az-AZ") === item.name.toLocaleLowerCase("az-AZ"))) { setError("Bu vəzifə artıq mövcuddur."); return; } update({ ...data, roles: data.roles.some((old) => old.id === item.id) ? data.roles.map((old) => old.id === item.id ? item : old) : [...data.roles, item] }); setEditingRole(undefined); setError(""); }
  function remove() { if (!deleting) return; if (deleting.kind === "staff") { update({ ...data, members: data.members.filter((item) => item.id !== deleting.id) }); updateServices({ ...serviceData, services: serviceData.services.map((service) => ({ ...service, staffIds: service.staffIds.filter((id) => id !== deleting.id) })) }); } else update({ ...data, roles: data.roles.filter((item) => item.id !== deleting.id), members: data.members.map((item) => item.roleId === deleting.id ? { ...item, roleId: "" } : item) }); setDeleting(null); }
  function saveEmployment(item: StaffMember) { update({ ...data, members: data.members.map((member) => member.id === item.id ? item : member) }); setEmployment(null); }
  function toggleOnline(item: StaffMember) { if (item.status !== "active") return; update({ ...data, members: data.members.map((member) => member.id === item.id ? { ...member, onlineBooking: !member.onlineBooking } : member) }); }
  function toggleDay(item: StaffMember, day: Weekday) { const shift = item.schedule[day]; update({ ...data, members: data.members.map((member) => member.id === item.id ? { ...member, schedule: { ...member.schedule, [day]: { ...shift, enabled: !shift.enabled } } } : member) }); }
  function openStaff(item?: StaffMember, selected: "info" | "services" | "schedule" | "pay" = "info") { setEditingStaff({ item, tab: selected }); }
  const tabs: { id: Tab; label: string; count?: number }[] = [{ id: "team", label: "Ustalar", count: branchMembers.length }, { id: "schedule", label: "İş qrafiki & Smenlər" }, { id: "roles", label: "Vəzifələr və rollar", count: data.roles.length }];
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="subtitle">Mütəxəssislər, iş cədvəli və komissiyalar</BusinessHeaderPortal>
    <BusinessHeaderPortal>
      {tab === "team" && <BusinessHeaderButton variant="secondary" onClick={() => setTab("schedule")} className="flex-1 sm:flex-none"><CalendarDays />İş qrafiki</BusinessHeaderButton>}
      {tab === "roles" ? <BusinessHeaderButton onClick={() => setEditingRole(null)} className="flex-1 sm:flex-none"><Plus />Yeni vəzifə</BusinessHeaderButton> : <BusinessHeaderButton onClick={() => openStaff()} className="flex-1 sm:flex-none"><Plus />Yeni usta</BusinessHeaderButton>}
    </BusinessHeaderPortal>
    <BusinessTabNav label="Heyət bölmələri" centered>{tabs.map((item) => <BusinessTabButton key={item.id} active={tab === item.id} count={item.count} onClick={() => { setTab(item.id); setError(""); }}>{item.label}</BusinessTabButton>)}</BusinessTabNav>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
    {tab === "team" && <StaffTeamView data={data} services={serviceData.services} filters={filters} setFilters={setFilters} search={search} setSearch={setSearch} setFilterOpen={setFilterOpen} page={page} setPage={setPage} todayKey={todayKey} roleName={roleName} branchName={branchName} filtered={filtered} shown={shown} totalPages={totalPages} activeFilterCount={activeFilterCount} avgRating={avgRating} openStaff={openStaff} setDeleting={setDeleting} setEmployment={setEmployment} toggleOnline={toggleOnline} />}
    {tab === "schedule" && <StaffScheduleTab members={branchMembers} today={todayKey} roleName={roleName} branchName={branchName} onEditSchedule={(item) => openStaff(item, "schedule")} onToggleDay={toggleDay} />}
    {tab === "roles" && <StaffRolesTab roles={data.roles} members={data.members} onEdit={setEditingRole} onDelete={(role) => setDeleting({ kind: "role", id: role.id, name: role.name })} />}
    {filterOpen && <StaffFilterDialog filters={filters} roles={data.roles} branches={branches} onChange={(next) => { setFilters(next); setPage(1); }} onClose={() => setFilterOpen(false)} />}
    {editingStaff && <StaffFormDialog key={editingStaff.item?.id ?? "new"} initial={editingStaff.item} initialTab={editingStaff.tab} roles={data.roles} branches={branches} serviceData={serviceData} onClose={() => setEditingStaff(null)} defaultBranchId={activeContext?.branchId} onSave={saveStaff} />}
    {editingRole !== undefined && <RoleFormDialog key={editingRole?.id ?? "new"} initial={editingRole ?? undefined} error={error} onClose={() => { setEditingRole(undefined); setError(""); }} onSave={saveRole} />}
    {employment && employmentMember && <StaffEmploymentDialog key={`${employment.id}-${employment.mode}`} member={employmentMember} roles={data.roles} mode={employment.mode} onClose={() => setEmployment(null)} onSave={saveEmployment} onModeChange={(mode) => setEmployment({ id: employment.id, mode })} />}
    {deleting && <BusinessDeleteDialog name={deleting.name} detail={deleting.kind === "role" ? "Bu vəzifədəki ustalar vəzifəsiz qalacaq." : undefined} onClose={() => setDeleting(null)} onDelete={remove} />}
  </div>;
}
