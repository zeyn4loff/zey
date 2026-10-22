import SectionHeader from "@/components/common/SectionHeader";
import { Link } from "react-router";
import { MasterCard } from "@/features/marketplace/components/MasterCard";
import type { Category, Specialist } from "@/features/marketplace/data";

export default function SelectMasters({ category, items }: { category: Category; items: Specialist[] }) {
  return <section className="my-8">
    <div className="flex flex-col items-start justify-between gap-0 sm:flex-row sm:gap-4">
      <SectionHeader title={`Seçilmiş mütəxəssislər (${category.title})`} description="Müştərilərin ən çox tövsiyə etdiyi peşəkarlar" />
      <Link to="/masters" className="mb-4 shrink-0 text-sm font-semibold hover:underline sm:mb-0 sm:pt-2">Bütün ustalar →</Link>
    </div>
    {items.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{items.map((item) => <MasterCard key={item.id} master={{ id: item.id, name: item.name, role: item.title, salon: item.salonName, rating: item.rating, avatar: item.photo }} />)}</div>
      : <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Bu kateqoriya üzrə mütəxəssis hələ əlavə edilməyib.</p>}
  </section>;
}
