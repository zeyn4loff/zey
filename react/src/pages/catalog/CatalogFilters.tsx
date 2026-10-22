import { useState } from "react";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocationCity } from "@/features/location/useLocationCity";
import type { ResultType, SortOrder } from "./catalogTypes";

interface Props {
  query: string;
  sort: SortOrder;
  resultType: ResultType;
  onQueryChange: (value: string) => void;
  onSortChange: (value: SortOrder) => void;
  onResultTypeChange: (value: ResultType) => void;
}

function FilterFields({ query, sort, resultType, onQueryChange, onSortChange, onResultTypeChange, radioName }: Props & { radioName: string }) {
  return <div className="space-y-4">
    <label className="block space-y-1 text-xs font-semibold">Axtarış<div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Xidmət, məkan və ya usta..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-yellow-primary" /></div></label>
    <label className="block space-y-1 text-xs font-semibold">Sırala<select value={sort} onChange={(event) => onSortChange(event.target.value as SortOrder)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"><option value="popular">Populyarlığa görə</option><option value="rating">Reytinqə görə</option><option value="price">Qiymətə görə</option></select></label>
    <fieldset className="space-y-2 border-t border-slate-100 pt-4"><legend className="text-xs font-semibold">Nəticə növü</legend>{(["all", "salons", "masters"] as const).map((value) => <label key={value} className="flex items-center gap-2 text-sm"><input type="radio" name={radioName} checked={resultType === value} onChange={() => onResultTypeChange(value)} className="accent-yellow-primary" />{value === "all" ? "Hamısı" : value === "salons" ? "Məkanlar" : "Ustalar"}</label>)}</fieldset>
  </div>;
}

export default function CatalogFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const { city } = useLocationCity();
  return <>
    <div className="order-first lg:hidden"><button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><SlidersHorizontal size={17} /> Filtrlər</button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="customer-modal bottom-0 top-auto max-h-[85dvh] w-full max-w-lg translate-y-0 overflow-y-auto rounded-t-3xl rounded-b-none p-5 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 sm:rounded-3xl" overlayClassName="customer-overlay"><DialogHeader><DialogTitle>Filtrlər</DialogTitle></DialogHeader><FilterFields {...props} radioName="catalog-mobile-result-type" /><button type="button" onClick={() => setOpen(false)} className="w-full rounded-xl bg-yellow-primary px-4 py-3 text-sm font-semibold">Nəticələrə bax</button></DialogContent></Dialog>
    <aside className="hidden min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5 lg:block"><h2 className="mb-4 flex items-center gap-2 font-bold"><SlidersHorizontal size={17} /> Filtrlər</h2><FilterFields {...props} radioName="catalog-desktop-result-type" /><div className="mt-5 border-t border-slate-100 pt-5"><h3 className="text-xs font-semibold">Xəritə</h3><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer" className="mt-2 flex h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-center text-xs font-semibold"><span><MapPin size={20} className="mx-auto mb-1" />{city}<br /><span className="font-normal text-slate-500">Xəritədə bax →</span></span></a></div></aside>
  </>;
}
