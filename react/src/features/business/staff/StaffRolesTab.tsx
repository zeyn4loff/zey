import { Pencil, Trash2 } from "lucide-react";
import type { StaffMember, StaffRole } from "./staff";

type Props = {
  roles: StaffRole[];
  members: StaffMember[];
  onEdit: (role: StaffRole) => void;
  onDelete: (role: StaffRole) => void;
};

const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

export default function StaffRolesTab({ roles, members, onEdit, onDelete }: Props) {
  const summary = [
    { title: "Ümumi vəzifələr", value: roles.length },
    { title: "Təyin olunmuş", value: roles.filter((role) => members.some((member) => member.roleId === role.id)).length },
    { title: "Standart", value: roles.filter((role) => role.isDefault).length },
    { title: "Fərdi", value: roles.filter((role) => !role.isDefault).length },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.map(({ title, value }) => <div key={title} className={panel}><p className="text-xs text-slate-500">{title}</p><strong className="mt-2 block text-2xl">{value}</strong></div>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => <article key={role.id} className={panel}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-bold">{role.name}</h3><span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold">{role.isDefault ? "Standart" : "Fərdi"}</span></div>
              <p className="mt-1 break-words text-xs text-slate-500">{role.description || "Təsvir yoxdur"}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => onEdit(role)} aria-label={`${role.name} redaktə et`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button>
              <button type="button" onClick={() => onDelete(role)} aria-label={`${role.name} sil`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3 text-xs"><span>{members.filter((member) => member.roleId === role.id).length} usta</span><strong>{role.commission}% standart komissiya</strong></div>
        </article>)}
      </div>
      {!roles.length && <div className={`${panel} py-10 text-center text-sm text-slate-500`}>Vəzifə yoxdur.</div>}
    </>
  );
}
