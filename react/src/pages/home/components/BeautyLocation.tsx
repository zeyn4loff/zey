import SectionHeader from "@/components/common/SectionHeader";
import BeautyLocationCard from "@/features/marketplace/components/SalonCard";
import type { Category, Salon } from "@/features/marketplace/data";

type SortOrder = "default" | "rating" | "price";
interface Props {
  category: Category;
  items: Salon[];
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  favoriteIds: number[];
  onToggleFavorite: (id: number) => void;
  onBook: (salon: Salon) => void;
  query: string;
  onClearFilters: () => void;
}

export default function BeautyLocation({ category, items, sortOrder, onSortChange, favoriteIds, onToggleFavorite, onBook, query, onClearFilters }: Props) {
  return <section id="salons" className="my-8 scroll-mt-5">
    <SectionHeader title={`${category.azName} məkanları`} subtitle={`${items.length} məkan`} description="Onlayn müraciət edin, məkan təsdiqlədikdən sonra qəbula gedin">
      <label className="sr-only" htmlFor="sort-salons">Sıralama</label>
      <select id="sort-salons" value={sortOrder} onChange={(event) => onSortChange(event.target.value as SortOrder)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold">
        <option value="default">Populyarlığa görə</option>
        <option value="rating">Reytinqə görə</option>
        <option value="price">Qiymətə görə</option>
      </select>
    </SectionHeader>
    {query && <p className="mb-4 text-sm text-slate-600">Axtarış: “{query}”</p>}
    {items.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => <BeautyLocationCard key={item.id} item={item} isFavorite={favoriteIds.includes(item.id)} onToggleFavorite={() => onToggleFavorite(item.id)} onBook={() => onBook(item)} />)}
    </div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h3 className="font-bold">Bu kriteriyada nəticə tapılmadı</h3>
      <p className="mt-1 text-sm text-slate-500">Başqa kateqoriya seçin və ya filtrləri sıfırlayın.</p>
      <button type="button" onClick={onClearFilters} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Filtrləri sıfırla</button>
    </div>}
  </section>;
}
