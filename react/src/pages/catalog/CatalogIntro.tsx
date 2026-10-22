import { Link } from "react-router";
import type { Category } from "@/features/marketplace/data";

interface Props {
  category?: Category;
  subcategoryId?: string;
  title: string;
  resultCount: number;
  city: string;
  salonCount: number;
  branchCount: number;
  masterCount: number;
  onSubcategoryChange: () => void;
}

export default function CatalogIntro({ category, subcategoryId, title, resultCount, city, salonCount, branchCount, masterCount, onSubcategoryChange }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-primary sm:text-3xl">{category ? `${title} — ${city}` : title}</h1><p className="mt-1 text-sm text-slate-500">{category ? `${salonCount} biznes · ${branchCount} filial · ${masterCount} usta` : `Məkanlar və mütəxəssislər · ${resultCount} nəticə`}</p></div>
        <Link to="/masters" className="text-sm font-semibold underline">Bütün ustalar</Link>
      </div>
      {category && <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-3 text-xs font-semibold text-slate-400">Alt-kateqoriyalar ({category.subcategories.length})</p><div className="flex gap-2 overflow-x-auto pb-2">
        <Link to={`/catalog/${category.id}`} onClick={onSubcategoryChange} className={`flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border p-2 text-center text-[11px] font-semibold ${!subcategoryId ? "border-yellow-primary bg-yellow-primary/15" : "border-slate-200"}`}><span className="flex size-12 items-center justify-center rounded-xl bg-slate-900 text-white">Hamısı</span>Bütün xidmətlər</Link>
        {category.subcategories.map((item) => <Link key={item.id} to={`/catalog/${category.id}/${item.id}`} onClick={onSubcategoryChange} className={`flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border p-2 text-center text-[11px] font-semibold ${subcategoryId === item.id ? "border-yellow-primary bg-yellow-primary/15" : "border-slate-200"}`}><img src={item.image} alt="" className="size-12 rounded-xl object-cover" />{item.azName}</Link>)}
      </div></div>}
    </section>
  );
}
