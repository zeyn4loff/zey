import { listBusinessSessions } from "@/features/business/auth/businessCredentials";
import { readBusinesses, type Business } from "@/features/business/directory/businesses";
import { readServiceData } from "@/features/business/services/services";
import { readStaffData } from "@/features/business/staff/staff";
import { categories, salons, specialists, type Salon, type Service, type Specialist } from "./data";
import { useSyncExternalStore } from "react";
import { reviewSummary } from "./reviews";

let marketplaceRevision = 0;
const listeners = new Set<() => void>();
function notifyMarketplace() { marketplaceRevision += 1; listeners.forEach((listener) => listener()); }
if (typeof window !== "undefined") {
  window.addEventListener("zeyvo-marketplace-change", notifyMarketplace);
  window.addEventListener("storage", notifyMarketplace);
}
export function useMarketplaceRevision(): number {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => marketplaceRevision, () => 0);
}

const seedTemplates: Record<string, number> = {
  biz_baku_beauty: 1,
  biz_grand_barber: 2,
  biz_dentestet: 7,
};
const seedIds: Record<string, number> = { biz_baku_beauty: 201, biz_grand_barber: 202, biz_dentestet: 203 };
const defaultSlots = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function stableId(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return 1_000_000 + (hash >>> 0);
}

function businessCategory(business: Business) {
  if (business.topCategory) return business.topCategory;
  return business.id === "biz_dentestet" ? "health" : "beauty";
}

export function getPublicSalons(): Salon[] {
  const managed = listBusinessSessions().flatMap((session) => {
    const businesses = readBusinesses(session);
    const serviceData = readServiceData(session);
    const staff = readStaffData(session).members;
    const firstBusinessId = businesses[0]?.id;
    return businesses.filter((business) => business.type === "individual" || business.branches.length > 0).map((business) => {
      const template = salons.find((item) => item.id === seedTemplates[business.id])
        ?? salons.find((item) => item.topCategory === businessCategory(business))
        ?? salons[0];
      const category = businessCategory(business);
      const branch = business.branches[0];
      const id = seedIds[business.id] ?? stableId(`${session.id}:${business.id}`);
      const services: Service[] = serviceData.services
        .filter((item) => (item.businessId ?? firstBusinessId) === business.id && item.onlineBooking)
        .map((item) => ({
          id: stableId(`${session.id}:${business.id}:${item.id}`),
          partnerServiceId: item.id,
          name: item.name,
          category: serviceData.categories.find((group) => group.id === item.categoryId)?.name,
          price: item.price,
          duration: `${item.duration} dəq`,
        }));
      const publicStaff: Specialist[] = staff
        .filter((item) => item.status === "active" && item.onlineBooking && (business.type === "individual" ? item.branchId === business.id : business.branches.some((entry) => entry.id === item.branchId)))
        .map((item) => ({
          id: stableId(`${session.id}:${business.id}:staff:${item.id}`),
          partnerStaffId: item.id,
          partnerBranchId: item.branchId,
          topCategory: category,
          name: item.name,
          title: item.specialization || "Usta",
          salonName: business.name,
          salonId: id,
          rating: item.rating ?? 0,
          photo: template.image,
          bio: item.bio,
          services: services.filter((service) => serviceData.services.find((entry) => entry.id === service.partnerServiceId)?.staffIds.includes(item.id)),
        }));
      return {
        id,
        partner: { ownerId: session.id, businessId: business.id },
        city: branch?.city || "Bakı",
        topCategory: category,
        category: business.category ?? (business.id === "biz_grand_barber" ? "barber" : business.id === "biz_dentestet" ? "dental" : template.category),
        name: business.name,
        tag: categories.find((item) => item.id === category)?.azName ?? template.tag,
        rating: seedIds[business.id] ? template.rating : 0,
        reviewsCount: seedIds[business.id] ? template.reviewsCount : 0,
        location: branch?.address || "Bakı",
        workHours: branch?.hours,
        description: business.description || template.description,
        image: business.image || template.image,
        services,
        slots: template.slots.length ? template.slots : defaultSlots,
        branches: business.branches.map((entry) => ({ id: entry.id, name: entry.name, address: entry.address, hours: entry.hours, phone: entry.phone })),
        contact: { phone: branch?.phone },
        specialists: publicStaff,
      } satisfies Salon;
    });
  }).filter((item) => item.services.length > 0);
  return [...salons, ...managed].map((salon) => { const summary = reviewSummary(`salon-${salon.id}`); return { ...salon, rating: summary.rating, reviewsCount: summary.count }; });
}

export function getCatalogSalons(): Salon[] {
  const managed = getPublicSalons();
  const managedTemplateIds = new Set(Object.entries(seedTemplates)
    .filter(([businessId]) => managed.some((salon) => salon.partner?.businessId === businessId))
    .map(([, id]) => id));
  return managed.filter((salon) => salon.partner || !managedTemplateIds.has(salon.id));
}

export function getPublicSpecialists(): Specialist[] {
  return [...specialists, ...getPublicSalons().flatMap((salon) => salon.specialists ?? [])].map((specialist) => ({ ...specialist, rating: reviewSummary(`master-${specialist.id}`).rating }));
}
