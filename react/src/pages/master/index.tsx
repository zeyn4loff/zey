import { Link, useParams } from "react-router";
import Breadcrumbs from "@/features/marketplace/components/Breadcrumbs";
import BookingSlots from "@/features/marketplace/components/BookingSlots";
import ServiceList from "@/features/marketplace/components/ServiceList";
import { findSalonForSpecialist, type Service } from "@/features/marketplace/data";
import { useCustomer } from "@/features/customer/useCustomer";
import { getPublicSalons, getPublicSpecialists } from "@/features/marketplace/publicCatalog";
import MasterHero from "./MasterHero";
import PhotoGallery from "@/features/marketplace/components/PhotoGallery";
import LocalReviews from "@/features/marketplace/components/LocalReviews";

export default function MasterPage() {
  const { id } = useParams();
  const master = getPublicSpecialists().find((item) => item.id === Number(id));
  const { favoriteMasterIds, toggleMasterFavorite, openBooking } = useCustomer();

  if (!master) return <div className="container mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold">Usta tapılmadı</h1><Link to="/masters" className="mt-4 inline-block underline">Ustalara qayıt</Link></div>;

  const salon = getPublicSalons().find((item) => item.id === master.salonId) ?? findSalonForSpecialist(master);
  const book = (service?: Service) => { if (salon) openBooking(salon, master, service); };
  const portfolio = master.portfolio?.length ? master.portfolio : salon ? [
    { src: master.photo, label: `${master.name}`, type: "works" as const },
    { src: salon.image, label: `${salon.name} — məkan`, type: "works" as const },
    { src: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80", label: "İş nümunəsi", type: "works" as const },
    { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80", label: "Dizayn", type: "works" as const },
  ] : [];

  return (
    <div className="container mx-auto space-y-6 px-4 py-7 pb-24">
      <Breadcrumbs items={[{ label: "Ustalar", to: "/masters" }, { label: master.name }]} />
      <MasterHero master={master} salon={salon} isFavorite={favoriteMasterIds.includes(master.id)} onToggleFavorite={() => toggleMasterFavorite(master.id)} onBook={book} />
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold">Usta haqqında</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{master.bio || `${master.name} — ${master.experience ? `${master.experience}yə malik` : "təcrübəli"} peşəkar mütəxəssisdir. Hər bir müştəriyə fərdi yanaşır, ən son trendləri və gigiyena standartlarını tətbiq edir.`}</p>
          </section>
          {salon && <>
            <section className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold">İşlədiyi məkan</h2><Link to={`/salon/${salon.id}`} className="text-xs font-semibold underline">Məkana bax →</Link></div>
              <Link to={`/salon/${salon.id}`} className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl bg-slate-50 p-3"><img src={salon.image} alt="" className="size-14 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><strong className="block break-words text-sm">{salon.name}</strong><span className="text-xs text-slate-500">{salon.location}</span></span></Link>
            </section>
            <ServiceList services={master.services || salon.services} onBook={book} />
          </>}
          {portfolio.length ? <div><PhotoGallery images={portfolio} title="Portfolio" /></div> : <section className="rounded-3xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-bold">Portfolio</h2><p className="mt-2 text-sm text-slate-500">İş nümunələri hələ əlavə edilməyib.</p></section>}
          <LocalReviews subject={`master-${master.id}`} title="Rəylər" />
        </div>
        {salon && <BookingSlots slots={salon.slots} title="Ustanın qəbuluna yazıl" description="Zəng etmədən boş vaxtı seçin" buttonLabel="Qəbula yazıl →" onBook={book} onSlotClick={(time, date) => openBooking(salon, master, undefined, time, undefined, date)} />}
      </div>
    </div>
  );
}
