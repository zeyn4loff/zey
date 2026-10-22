import { useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocationCity } from "@/features/location/useLocationCity";
import type { ResultType, SortOrder } from "./catalogTypes";

interface Props {
  query: string;
  sort: SortOrder;
  resultType: ResultType;
  categoryTitle?: string;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
  onResultTypeChange: (value: ResultType) => void;
}

function FilterFields({ query, sort, resultType, categoryTitle, onQueryChange, onSortChange, onResultTypeChange, radioName, onCategorySelect }: Props & { radioName: string; onCategorySelect?: () => void }) {
  const { city } = useLocationCity();
  return <div className="space-y-5">
    <label className="block space-y-2 text-sm font-semibold text-slate-500">Axtarış<div className="relative"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Xidmət, salon və ya usta..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm text-primary outline-none focus:border-yellow-primary" /></div></label>
    <label className="block space-y-2 text-sm font-semibold text-slate-500">Sırala<select value={sort} onChange={(event) => onSortChange(event.target.value as SortOrder)} className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-primary"><option value="popular">Populyarlığa görə</option><option value="rating">Reytinqə görə</option><option value="price">Qiymətə görə</option></select></label>
    <div className="space-y-2"><div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-500"><span>Şəhər</span><Link to="/cities" className="text-primary hover:underline">Dəyiş</Link></div><div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-primary"><MapPin size={18} className="text-rose-500" />{city}</div></div>
    <div className="space-y-2"><div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-500"><span>Kateqoriya</span><a href="#catalog-categories" onClick={onCategorySelect} className="text-primary hover:underline">Kateqoriya seçin</a></div><div className="rounded-xl border border-yellow-primary/60 bg-yellow-primary/20 px-3 py-3 text-sm font-semibold text-primary">{categoryTitle || "Hamısı"}</div></div>
    <fieldset className="space-y-3 border-t border-slate-100 pt-4"><legend className="text-sm font-semibold text-slate-500">Məkan növü</legend>{(["all", "salons", "masters"] as const).map((value) => <label key={value} className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-primary"><input type="radio" name={radioName} checked={resultType === value} onChange={() => onResultTypeChange(value)} className="size-4 accent-yellow-primary" />{value === "all" ? "Hamısı" : value === "salons" ? "Yalnız şirkətlər / salonlar" : "Yalnız fərdi ustalar"}</label>)}</fieldset>
  </div>;
}

export default function CatalogFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const { city } = useLocationCity();
  return <>
    <div className="order-first lg:hidden"><button type="button" onClick={() => setOpen(true)} className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm"><SlidersHorizontal size={18} /> Filtrlər</button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="customer-modal bottom-0 top-auto max-h-[85dvh] w-full max-w-none translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none p-5 sm:top-1/2 sm:bottom-auto sm:max-w-xl sm:-translate-y-1/2 sm:rounded-3xl" overlayClassName="customer-overlay"><DialogHeader><DialogTitle>Filtrlər</DialogTitle></DialogHeader><FilterFields {...props} radioName="catalog-mobile-result-type" onCategorySelect={() => setOpen(false)} /><button type="button" onClick={() => setOpen(false)} className="w-full rounded-xl bg-yellow-primary px-4 py-3 text-sm font-semibold">Nəticələrə bax</button></DialogContent></Dialog>
    <aside className="hidden min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-5 lg:block"><h2 className="mb-5 flex items-center gap-2 text-lg font-bold"><SlidersHorizontal size={20} /> Filtrlər</h2><FilterFields {...props} radioName="catalog-desktop-result-type" /><div className="mt-6 border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold text-slate-500">Xəritə</h3><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-center text-sm font-semibold"><span><MapPin size={20} className="mx-auto mb-1" />{city}<br /><span className="font-normal text-slate-500">Xəritədə bax →</span></span></a></div></aside>
  </>;
}
