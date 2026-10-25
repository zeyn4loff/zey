import SalonCard from "@/features/marketplace/components/SalonCard";
import { MasterCard } from "@/features/marketplace/components/MasterCard";
import { useCustomer } from "@/features/customer/useCustomer";
import type { CatalogResult } from "./catalogTypes";
import CatalogVenueCard from "./CatalogVenueCard";

interface Props {
  results: CatalogResult[];
  visibleCount: number;
  city: string;
  onLoadMore: () => void;
  onClearFilters: () => void;
  compact?: boolean;
}

export default function CatalogResults({ results, visibleCount, city, onLoadMore, onClearFilters, compact = false }: Props) {
  const { favoriteSalonIds, toggleSalonFavorite, openBooking } = useCustomer();
  const visibleResults = results.slice(0, visibleCount);
  return (
    <section className="min-w-0 space-y-4" aria-label="Kataloq nəticələri">
      {visibleResults.length > 0 && <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleResults.map((result) => result.kind === "salon"
          ? compact ? <CatalogVenueCard key={`s${result.item.id}`} item={result.item} isFavorite={favoriteSalonIds.includes(result.item.id)} onToggleFavorite={() => toggleSalonFavorite(result.item.id)} onBook={() => openBooking(result.item)} /> : <SalonCard key={`s${result.item.id}`} item={result.item} isFavorite={favoriteSalonIds.includes(result.item.id)} onToggleFavorite={() => toggleSalonFavorite(result.item.id)} onBook={() => openBooking(result.item)} />
          : <MasterCard key={`m${result.item.id}`} master={{ id: result.item.id, name: result.item.name, role: result.item.title, salon: result.item.salonName, rating: result.item.rating, avatar: result.item.photo }} />)}
      </div>}
      {results.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><h2 className="font-bold">Nəticə tapılmadı</h2><p className="mt-1 text-sm text-slate-500">{city === "Bakı" ? "Axtarışı və ya filtrləri dəyişin." : "Bu şəhərdə hələ məkan tapılmadı."}</p><button type="button" onClick={onClearFilters} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Filtrləri sıfırla</button></div>}
      {visibleResults.length < results.length && <button type="button" onClick={onLoadMore} className="mx-auto block rounded-xl bg-yellow-primary px-6 py-2.5 text-sm font-semibold">Daha çox göstər</button>}
    </section>
  );
}
