import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Breadcrumbs from "@/features/marketplace/components/Breadcrumbs";
import { MasterCard } from "@/features/marketplace/components/MasterCard";
import { useLocationCity } from "@/features/location/useLocationCity";
import { categories, specialists } from "@/features/marketplace/data";

export default function MastersPage() {
  const { city } = useLocationCity();
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => specialists.filter((item) => city === "Bakı" && (categoryId === "all" || item.topCategory === categoryId) && (!query || [item.name, item.title, item.salonName].some((value) => value.toLocaleLowerCase("az").includes(query.toLocaleLowerCase("az"))))).sort((a, b) => b.rating - a.rating), [city, categoryId, query]);
  return <div className="container mx-auto space-y-6 px-4 py-8 pb-24">
    <Breadcrumbs items={[{ label: "Ustalar" }]} />
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5"><div><h1 className="text-3xl font-bold text-primary">Mütəxəssislər və ustalar</h1><p className="mt-1 text-sm text-slate-500">Xidmət sahələri üzrə peşəkarlar</p></div><span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">{filtered.length} usta</span></header>
    <div className="flex flex-wrap gap-3"><label className="relative min-w-55 flex-1"><span className="sr-only">Usta axtar</span><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ad, ixtisas və ya məkan..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-yellow-primary" /></label><label><span className="sr-only">Kateqoriya</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Bütün sahələr</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.azName}</option>)}</select></label></div>
    {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((item) => <MasterCard key={item.id} detailed master={{ id: item.id, name: item.name, role: item.title, salon: item.salonName, rating: item.rating, avatar: item.photo }} />)}</div> : <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">{city === "Bakı" ? "Bu kriteriyada usta tapılmadı." : "Nümunə ustalar hazırda yalnız Bakı üçün mövcuddur."}</div>}
  </div>;
}
