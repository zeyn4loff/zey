import { useState } from "react";
import { Link } from "react-router";
import { MapPin, Search } from "lucide-react";
import Breadcrumbs from "@/features/marketplace/components/Breadcrumbs";
import { cities } from "@/features/location/cities";
import { useLocationCity } from "@/features/location/useLocationCity";

export default function CitiesPage() {
  const { city: selectedCity, setCity } = useLocationCity();
  const [query, setQuery] = useState("");
  const filtered = cities.filter((city) => city.name.toLocaleLowerCase("az").includes(query.trim().toLocaleLowerCase("az")));
  return <div className="container mx-auto space-y-6 px-4 py-8 pb-24"><Breadcrumbs items={[{ label: "Şəhər seçimi" }]} /><section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-3"><MapPin size={24} /><div><h1 className="text-2xl font-bold">Şəhər seçin</h1><p className="text-sm text-slate-500">Məkanları şəhər üzrə araşdırın</p></div></div><label className="relative mt-6 block"><span className="sr-only">Şəhər axtar</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Şəhər axtar..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-yellow-primary" /></label><div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">{filtered.map((item) => <button key={item.name} type="button" onClick={() => setCity(item.name)} aria-pressed={selectedCity === item.name} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm ${selectedCity === item.name ? "border-yellow-primary bg-yellow-primary/10" : "border-slate-200 hover:bg-slate-50"}`}><span className="font-semibold">{item.name}</span><span className="text-slate-400">{item.count}</span></button>)}{filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Şəhər tapılmadı.</p>}</div><p className="mt-4 text-xs text-slate-500">Bu demoda məkan məlumatları yalnız Bakı üçün mövcuddur.</p><Link to="/catalog" className="mt-5 inline-flex rounded-xl bg-yellow-primary px-5 py-2.5 text-sm font-semibold">Kataloqa bax</Link></section></div>;
}
