import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import CategoryTabMenu from "@/features/marketplace/components/CategoryTabMenu";
import BeautyCategories from "./components/BeautyCategories";
import BeautyLocation from "./components/BeautyLocation";
import PopularPartners from "./components/PopularPartners";
import SelectMasters from "./components/SelectMasters";
import { categories, salons, specialists } from "@/features/marketplace/data";
import { useCustomer } from "@/features/customer/useCustomer";
import { useLocationCity } from "@/features/location/useLocationCity";

type SortOrder = "default" | "rating" | "price";

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("beauty");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const { favoriteSalonIds, toggleSalonFavorite, openBooking } = useCustomer();
  const { city } = useLocationCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim().toLocaleLowerCase("az");
  const category = categories.find((item) => item.id === selectedCategoryId) || categories[0];

  const visibleSalons = useMemo(() => {
    const filtered = salons.filter((salon) =>
      city === "Bakı" && salon.topCategory === selectedCategoryId &&
      (!selectedSubcategoryId || salon.category === selectedSubcategoryId) &&
      (!query || [salon.name, salon.tag, salon.location, ...salon.services.map((service) => service.name)]
        .some((value) => value.toLocaleLowerCase("az").includes(query)))
    );
    return [...filtered].sort((a, b) => sortOrder === "rating"
      ? b.rating - a.rating
      : sortOrder === "price"
        ? (a.services[0]?.price || 0) - (b.services[0]?.price || 0)
        : b.reviewsCount - a.reviewsCount);
  }, [city, selectedCategoryId, selectedSubcategoryId, query, sortOrder]);

  const visibleSpecialists = city === "Bakı" ? specialists.filter((item) => item.topCategory === selectedCategoryId).slice(0, 4) : [];

  return (
    <div className="container mx-auto my-8 px-4 sm:my-12">
      <CategoryTabMenu activeId={selectedCategoryId} onSelect={(id) => {
        setSelectedCategoryId(id);
        setSelectedSubcategoryId(null);
      }} />
      <BeautyCategories category={category} selectedId={selectedSubcategoryId} onSelect={(id) => { setSelectedSubcategoryId(id === selectedSubcategoryId ? null : id); document.getElementById("salons")?.scrollIntoView({ behavior: "smooth" }); }} />
      <BeautyLocation category={category} items={visibleSalons} sortOrder={sortOrder} onSortChange={setSortOrder} favoriteIds={favoriteSalonIds} onToggleFavorite={toggleSalonFavorite} onBook={openBooking} query={query} onClearFilters={() => { setSelectedSubcategoryId(null); setSearchParams({}); }} />
      <SelectMasters category={category} items={visibleSpecialists} />
      <PopularPartners />
    </div>
  );
}
