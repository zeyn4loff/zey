import SectionHeader from "@/components/common/SectionHeader";
import type { Category } from "@/features/marketplace/data";

export default function BeautyCategories({ category, selectedId, onSelect }: { category: Category; selectedId: string | null; onSelect: (id: string) => void }) {
  return <section id="categories" className="my-8">
    <SectionHeader title="Kateqoriyalar" subtitle={category.azName} description="Xidmət üzrə mütəxəssislər və salonlar tapın" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {category.subcategories.map((item) => <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => onSelect(item.id)} className={`group relative h-28 overflow-hidden rounded-2xl bg-slate-200 shadow-sm sm:h-32 ${selectedId === item.id ? "ring-4 ring-yellow-primary" : ""}`}>
        <img src={item.image} alt="" loading="lazy" className="size-full object-cover transition-transform group-hover:scale-105" />
        <span className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-black/80 via-black/45 to-black/30 p-3 text-center text-sm font-bold text-white">{item.azName}</span>
      </button>)}
    </div>
  </section>;
}
