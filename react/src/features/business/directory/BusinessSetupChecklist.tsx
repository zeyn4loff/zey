import { Link } from "react-router";
import { CheckCircle2, Circle } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { readServiceData } from "../services/services";
import { readStaffData } from "../staff/staff";
import type { Business } from "./businesses";

export default function BusinessSetupChecklist({ session, business }: { session: BusinessSession; business: Business }) {
  const services = readServiceData(session).services.filter((item) => item.businessId === business.id || (!item.businessId && business.id === "biz_baku_beauty"));
  const branchIds = business.type === "individual" ? [business.id] : business.branches.map((branch) => branch.id);
  const staff = readStaffData(session).members.filter((item) => branchIds.includes(item.branchId) && item.status === "active");
  const steps = [
    { label: "Profil və filial", done: business.type === "individual" ? !!business.name.trim() : business.branches.some((branch) => branch.address.trim()), path: "/business" },
    { label: "Xidmətlər və qiymətlər", done: services.length > 0, path: "/business/services" },
    { label: "Ustalar və iş qrafiki", done: staff.length > 0, path: "/business/staff" },
    { label: "Onlayn qeydiyyat", done: services.some((service) => service.onlineBooking && staff.some((member) => member.onlineBooking && (!service.staffIds.length || service.staffIds.includes(member.id)))), path: "/business/services" },
  ];
  const ready = steps.filter((step) => step.done).length;
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Profilin hazır olma mərhələləri">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-bold">{business.name}: qeydiyyata hazırlıq</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{ready}/{steps.length}</span></div>
    <p className="mt-1 text-xs text-slate-500">Bütün addımları tamamlayın ki, müştəri uyğun xidmət və boş vaxt seçə bilsin.</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2">{steps.map((step) => <Link key={step.label} to={step.path} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm hover:bg-slate-50">{step.done ? <CheckCircle2 size={17} className="shrink-0 text-emerald-600" /> : <Circle size={17} className="shrink-0 text-slate-400" />}<span>{step.label}</span></Link>)}</div>
  </section>;
}
