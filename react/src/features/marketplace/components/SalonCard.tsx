import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router";
import type { Salon } from "@/features/marketplace/data";

interface Props {
  item: Salon;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBook: () => void;
}

export default function SalonCard({ item, isFavorite, onToggleFavorite, onBook }: Props) {
  const startingPrice = item.services.length
    ? Math.min(...item.services.map((service) => service.price))
    : null;

  return <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
      <Link to={`/salon/${item.id}`} className="block size-full" aria-label={`${item.name} — ətraflı`}>
        <img src={item.image} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </Link>
      <button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"} aria-pressed={isFavorite} className="absolute right-3 top-3 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:text-rose-500">
        <Heart size={20} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} />
      </button>
    </div>

    <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 min-h-[2.5em] text-lg font-bold leading-tight text-primary">
            <Link to={`/salon/${item.id}`} className="hover:underline">{item.name}</Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">{item.tag}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary" aria-label={`${item.rating} reytinq`}>
          <Star size={15} className="fill-amber-400 text-amber-400" />{item.rating}
        </span>
      </div>

      <p className="mt-3 flex min-w-0 items-center gap-1.5 text-sm text-slate-500">
        <MapPin size={15} className="shrink-0" />
        <span className="truncate">{item.location}</span>
      </p>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <span className="text-xs text-slate-500">{item.reviewsCount} rəy</span>
        {startingPrice !== null && <span className="shrink-0 text-sm font-bold text-primary">{startingPrice} ₼-dan</span>}
      </div>
    </div>

    <div className="flex gap-2 border-t border-slate-100 p-4 pt-3 sm:px-5">
      <button type="button" onClick={onBook} className="min-h-11 flex-1 cursor-pointer rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-700">Yazıl</button>
      <Link to={`/salon/${item.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-primary transition-colors hover:bg-slate-50">Ətraflı</Link>
    </div>
  </article>;
}
