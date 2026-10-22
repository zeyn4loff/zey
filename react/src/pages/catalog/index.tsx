import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import CategoryTabMenu from "@/features/marketplace/components/CategoryTabMenu";
import Breadcrumbs from "@/features/marketplace/components/Breadcrumbs";
import { categories } from "@/features/marketplace/data";
import { useLocationCity } from "@/features/location/useLocationCity";
import CatalogFilters from "./CatalogFilters";
import CatalogIntro from "./CatalogIntro";
import CatalogResults from "./CatalogResults";
import { getCatalogResults } from "./buildCatalogResults";
import type { ResultType, SortOrder } from "./catalogTypes";

export default function CatalogPage() {
  const { category: categoryId, subcategory: subcategoryId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [resultType, setResultType] = useState<ResultType>("all");
  const [sort, setSort] = useState<SortOrder>("popular");
  const [visibleCount, setVisibleCount] = useState(12);
  const { city } = useLocationCity();
  // The catalog opens in the beauty category when no category is specified.
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const subcategory = category?.subcategories.find((item) => item.id === subcategoryId);
  const query = params.get("q") || "";
  const results = useMemo(() => getCatalogResults({ city, category, subcategoryId: subcategory?.id, query, resultType, sort }), [city, category, subcategory?.id, query, resultType, sort]);
  const title = subcategory?.azName || category?.azName || "Kataloq";

  function updateQuery(value: string) {
    setVisibleCount(12);
    setParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-7 pb-24">
      <div id="catalog-categories"><CategoryTabMenu activeId={category?.id || ""} onSelect={(id) => { setVisibleCount(12); navigate(`/catalog/${id}`); }} /></div>
      <Breadcrumbs items={[{ label: "Kataloq", to: category ? "/catalog" : undefined }, ...(category ? [{ label: category.azName, to: subcategory ? `/catalog/${category.id}` : undefined }] : []), ...(subcategory ? [{ label: subcategory.azName }] : [])]} />
      <CatalogIntro category={category} subcategoryId={subcategory?.id} title={title} resultCount={results.length} city={city} salonCount={results.filter((result) => result.kind === "salon").length} branchCount={results.reduce((count, result) => count + (result.kind === "salon" ? result.item.branches?.length || 1 : 0), 0)} masterCount={results.filter((result) => result.kind === "master").length} onSubcategoryChange={() => setVisibleCount(12)} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:gap-6">
        <CatalogResults results={results} visibleCount={visibleCount} city={city} compact={Boolean(category)} onLoadMore={() => setVisibleCount((count) => count + 12)} onClearFilters={() => { updateQuery(""); setResultType("all"); }} />
        <CatalogFilters query={query} sort={sort} resultType={resultType} categoryTitle={category?.azName} onQueryChange={updateQuery} onSortChange={setSort} onResultTypeChange={(value) => { setResultType(value); setVisibleCount(12); }} />
      </div>
    </div>
  );
}
