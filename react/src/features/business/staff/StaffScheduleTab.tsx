import { CalendarDays } from "lucide-react";
import { dayLabels, weekdays, type StaffMember, type Weekday } from "./staff";

type Props = {
  members: StaffMember[];
  today: Weekday;
  roleName: (id: string) => string;
  branchName: (id: string) => string;
  onEditSchedule: (member: StaffMember) => void;
  onToggleDay: (member: StaffMember, day: Weekday) => void;
};

const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

export default function StaffScheduleTab({ members, today, roleName, branchName, onEditSchedule, onToggleDay }: Props) {
  const workingToday = members.filter((member) => member.status === "active" && member.schedule[today].enabled).length;
  const summary = [
    { title: "Cəmi heyət", value: members.length },
    { title: "Bu gün növbədə", value: workingToday },
    { title: "Bu gün istirahət", value: members.length - workingToday },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {summary.map(({ title, value }) => <div key={title} className={panel}><p className="text-xs text-slate-500">{title}</p><strong className="mt-2 block text-2xl">{value}</strong></div>)}
      </div>
      <section className={panel}>
        <div className="mb-4 flex items-center gap-2"><CalendarDays size={18} /><h3 className="font-bold">Həftəlik növbə cədvəli</h3></div>
        <div className="space-y-3">
          {members.map((member) => <article key={member.id} className="min-w-0 rounded-xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><h4 className="break-words text-sm font-bold">{member.name}</h4><p className="break-words text-xs text-slate-500">{roleName(member.roleId)} · {branchName(member.branchId)}</p></div>
              <button type="button" onClick={() => onEditSchedule(member)} className="min-h-9 shrink-0 cursor-pointer rounded-lg bg-slate-100 px-3 text-xs font-bold">Saatları düzəlt</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {weekdays.map((day) => {
                const shift = member.schedule[day];
                return <button type="button" key={day} onClick={() => onToggleDay(member, day)} aria-pressed={shift.enabled} aria-label={`${member.name} · ${dayLabels[day]} · ${shift.enabled ? "işləyir" : "istirahət"}`} className={`min-h-14 cursor-pointer rounded-lg p-2 text-left text-xs ${shift.enabled ? "bg-amber-50 text-amber-900" : "bg-slate-100 text-slate-500"}`}><strong className="block">{dayLabels[day]}</strong><span>{shift.enabled ? `${shift.start}–${shift.end}` : "İstirahət"}</span></button>;
              })}
            </div>
          </article>)}
        </div>
        {!members.length && <p className="py-8 text-center text-sm text-slate-500">Heyət yoxdur.</p>}
      </section>
    </>
  );
}
