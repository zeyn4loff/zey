import { CalendarDays, ChartNoAxesCombined, MessageCircle } from "lucide-react";

const benefits = [
  { icon: CalendarDays, title: "24/7 onlayn qeydiyyat", description: "Müştərilər boş vaxtları görüb özlərinə uyğun saatı seçə bilərlər.", iconClass: "bg-yellow-primary text-primary" },
  { icon: MessageCircle, title: "Müştəri ilə əlaqə", description: "Yazılar və müştəri məlumatları bir yerdə idarə olunur.", iconClass: "bg-emerald-100 text-emerald-700" },
  { icon: ChartNoAxesCombined, title: "Biznesə ümumi baxış", description: "Komanda, xidmətlər və maliyyə göstəricilərini izləmək üçün vahid məkan.", iconClass: "bg-slate-900 text-white" },
];

export default function BusinessBenefits() {
  return <section aria-label="Biznes imkanları" className="grid gap-4 md:grid-cols-3">
    {benefits.map(({ icon: Icon, title, description, iconClass }) => <article key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <span className={`flex size-12 items-center justify-center rounded-2xl ${iconClass}`}><Icon size={23} aria-hidden="true" /></span>
      <h2 className="mt-4 text-base font-bold text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </article>)}
  </section>;
}
