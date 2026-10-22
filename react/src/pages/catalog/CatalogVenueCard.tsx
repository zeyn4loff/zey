import { Link } from "react-router";
import { Heart, Star } from "lucide-react";
import type { Salon } from "@/features/marketplace/data";

interface Props { item: Salon; isFavorite: boolean; onToggleFavorite: () => void; onBook: () => void }

export default function CatalogVenueCard({ item, isFavorite, onToggleFavorite, onBook }: Props) {
  const branches = item.branches?.length || 1;
  return <article className="flex min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
    <Link to={`/salon/${item.id}`} className="shrink-0"><img src={item.image} alt="" className="size-20 rounded-xl object-cover sm:size-22" /></Link>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2"><Link to={`/salon/${item.id}`} className="min-w-0 text-sm font-bold hover:underline">{item.name}</Link><button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"} aria-pressed={isFavorite} className="shrink-0 p-1 text-slate-500"><Heart size={17} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} /></button></div>
      <p className="mt-0.5 truncate text-xs text-slate-500">{branches > 1 ? `${branches} filial · ${item.branches?.[0]?.name}` : item.location}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Star size={12} className="fill-amber-400 text-amber-400" /><strong className="text-amber-500">{item.rating}</strong> ({item.reviewsCount}) · {branches > 1 ? "Biznes şəbəkəsi" : "Məkan"}</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2"><span className="text-xs font-bold">dan {branches > 1 ? item.services[0]?.price : Math.min(...item.services.map((service) => service.price))} ₼</span>{branches > 1 ? <Link to={`/salon/${item.id}`} className="rounded-xl bg-yellow-primary px-3 py-2 text-xs font-bold">Filial seç</Link> : <button type="button" onClick={onBook} className="rounded-xl bg-yellow-primary px-3 py-2 text-xs font-bold">Qəbula yazıl</button>}</div>
    </div>
  </article>;
}
