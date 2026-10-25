import { useState } from "react";
import { Search } from "lucide-react";
import { formatPrice, type ServiceData } from "../services/services";

export default function StaffServicesPane({ data, selected, onChange }: { data: ServiceData; selected: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase("az-AZ");
  const visible = data.services.filter((service) => !search || `${service.name} ${data.categories.find((category) => category.id === service.categoryId)?.name ?? ""}`.toLocaleLowerCase("az-AZ").includes(search));
  const categories = [...data.categories, { id: "", name: "Kateqoriyasız", description: "" }];

  function toggle(id: string) { onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]); }

  return <div className="space-y-3"><div><h3 className="text-sm font-bold">Təyin olunmuş xidmətlər</h3><p className="mt-1 text-xs text-slate-500">{selected.length} xidmət seçilib · Seçim xidmət kataloqu ilə birlikdə saxlanır.</p></div><label className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3"><Search size={16} className="shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Xidmət axtar" placeholder="Xidmət və ya kateqoriya axtar" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><div className="max-h-72 space-y-4 overflow-y-auto pr-1">{categories.map((category) => { const items = visible.filter((service) => service.categoryId === category.id || (category.id === "" && !data.categories.some((item) => item.id === service.categoryId))); if (!items.length) return null; return <section key={category.id || "uncategorized"}><h4 className="mb-2 text-xs font-bold text-slate-500">{category.name}</h4><div className="space-y-1.5">{items.map((service) => <label key={service.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 ${selected.includes(service.id) ? "border-yellow-primary bg-amber-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}><input type="checkbox" checked={selected.includes(service.id)} onChange={() => toggle(service.id)} className="size-4 shrink-0 accent-slate-900" /><span className="min-w-0 flex-1"><strong className="block break-words text-sm">{service.name}</strong><span className="mt-0.5 block text-xs text-slate-500">{service.duration} dəq · {formatPrice(service)}</span></span></label>)}</div></section>; })}{!visible.length && <p className="py-8 text-center text-sm text-slate-500">Xidmət tapılmadı.</p>}</div></div>;
}
