import { Link, useNavigate, useParams } from "react-router";
import Breadcrumbs from "@/features/marketplace/components/Breadcrumbs";
import ServiceList from "@/features/marketplace/components/ServiceList";
import { getSpecialistsForSalon } from "@/features/marketplace/data";
import { publicSalons } from "@/features/marketplace/publicCatalog";
import { useCustomer } from "@/features/customer/useCustomer";
import SalonHero from "./SalonHero";
import SalonSpecialists from "./SalonSpecialists";
import SalonDetails from "./SalonDetails";
import PhotoGallery from "@/features/marketplace/components/PhotoGallery";
import LocalReviews from "@/features/marketplace/components/LocalReviews";
import { getDemoGallery } from "@/features/marketplace/galleryData";
import { getPublicBranches } from "@/features/marketplace/publicDetails";
import { useState } from "react";

export default function SalonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const salon = publicSalons.find((item) => item.id === Number(id));
  const [branchId, setBranchId] = useState<string | null>(null);
  const { favoriteSalonIds, toggleSalonFavorite, openBooking } = useCustomer();

  if (!salon) return <div className="container mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold">Məkan tapılmadı</h1><Link to="/catalog" className="mt-4 inline-block underline">Kataloqa qayıt</Link></div>;

  const specialists = getSpecialistsForSalon(salon);
  const gallery = salon.gallery?.length ? salon.gallery : getDemoGallery(salon);
  const branches = getPublicBranches(salon);
  const selectedBranch = branches.find((branch) => branch.id === branchId) || branches[0];
  const book = (service?: (typeof salon.services)[number]) => openBooking(salon, undefined, service, undefined, selectedBranch);

  return (
    <div className="container mx-auto space-y-4 px-4 py-5 pb-28 sm:space-y-6 sm:py-7">
      <div className="flex items-center gap-2"><button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold sm:hidden">← Geri</button><Breadcrumbs items={[{ label: "Kataloq", to: "/catalog" }, { label: salon.name }]} /></div>
      <SalonHero salon={salon} branchName={selectedBranch.name} location={selectedBranch.address} hours={selectedBranch.hours} phone={selectedBranch.phone} isFavorite={favoriteSalonIds.includes(salon.id)} onToggleFavorite={() => toggleSalonFavorite(salon.id)} onBook={book} />
      <SalonDetails salon={salon} branches={branches} selectedBranch={selectedBranch} onSelectBranch={setBranchId} />
      <div><PhotoGallery images={gallery.length ? gallery : [{ src: salon.image, label: salon.name }]} title="Fotoqalereya" />{!salon.gallery?.length && <p className="mt-2 px-2 text-xs text-slate-500">Şəkillər prototipdən götürülmüş nümunələrdir.</p>}</div>
      <SalonSpecialists specialists={specialists} />
      <ServiceList services={salon.services} onBook={book} />
      <LocalReviews subject={`salon-${salon.id}`} title="Müştəri rəyləri" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden"><div><p className="text-[10px] font-bold text-slate-400">Başlanğıc qiymət:</p><strong className="text-base">{Math.min(...salon.services.map((service) => service.price))} ₼-dan</strong></div><button type="button" onClick={() => book()} className="h-11 rounded-xl bg-yellow-primary px-8 text-xs font-black">Onlayn yazıl</button></div>
    </div>
  );
}
