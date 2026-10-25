import { Clock3, Pencil, Trash2 } from "lucide-react";
import type { StaffMember } from "../staff/staff";
import { formatLabels, formatPrice, genderLabels, type Service } from "./services";

export default function ServiceRow({ service, staff, onEdit, onDelete, onToggleOnline }: { service: Service; staff: StaffMember[]; onEdit: () => void; onDelete: () => void; onToggleOnline: () => void }) {
  const assignedStaff = staff.filter((member) => service.staffIds.includes(member.id));
  return <article className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs sm:flex-nowrap">
    <div className="min-w-0 flex-1 basis-full sm:basis-auto"><div className="flex flex-wrap items-center gap-1.5"><h4 className="break-words text-sm font-bold">{service.name}</h4>{service.gender !== "all" && <span className="rounded-md border border-purple-100 bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700">{genderLabels[service.gender]}</span>}{service.format !== "individual" && <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">{formatLabels[service.format]}</span>}<button type="button" onClick={onToggleOnline} aria-pressed={service.onlineBooking} className={`cursor-pointer rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${service.onlineBooking ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{service.onlineBooking ? "● Onlayn qəbul" : "Yalnız salonda"}</button></div><p className="mt-1 truncate text-[11px] text-slate-500">{assignedStaff.length ? `Ustalar: ${assignedStaff.map((member) => member.name).join(", ")}` : service.description || "Usta seçilməyib"}</p></div>
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-600"><Clock3 size={13} />{service.duration} dəq</span>
    <strong className="min-w-16 shrink-0 text-right text-sm">{formatPrice(service)}</strong>
    <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0"><button type="button" onClick={onEdit} aria-label={`${service.name} redaktə et`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-white"><Pencil size={15} /></button><button type="button" onClick={onDelete} aria-label={`${service.name} sil`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button></div>
  </article>;
}
