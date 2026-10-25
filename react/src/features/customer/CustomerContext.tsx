import { useEffect, useState, type ReactNode } from "react";
import { CustomerContext } from "./customer-context";
import type { Salon, SalonBranch, Specialist, Service } from "@/features/marketplace/data";
import { bookingKey, customerKey, favoriteKey, readBookings, readCustomer, readFavorites } from "./customerStorage";
import { removeStored, writeJson } from "@/lib/demoStorage";
import { updateLocalAccountProfile } from "@/lib/localCredentials";
import { cancelOnlineBooking, createOnlineBooking } from "@/features/business/calendar/bookings";
import { getPublicSalons } from "@/features/marketplace/publicCatalog";

type Modal = "auth" | "profile" | "favorites" | "bookings" | "booking" | null;
export interface Customer { name: string; email: string; phone: string; city: string; gender?: "female" | "male"; avatar?: string }
export interface Booking { id: string; salonId: number; salonName: string; branchName?: string; branchId?: string; masterName?: string; service: string; partnerServiceId?: string; date: string; time: string; customerName?: string; phone?: string; status?: "Gözlənilir" | "Təsdiqləndi" | "Tamamlandı" | "Ləğv edildi"; partnerOwnerId?: string; businessId?: string; createdAt: string }
export interface CustomerContextValue {
  user: Customer | null;
  modal: Modal;
  selectedSalon: Salon | null;
  selectedSpecialist: Specialist | null;
  selectedService: Service | null;
  selectedTime: string | null;
  selectedDate: string | null;
  selectedBranch: SalonBranch | null;
  favoriteSalonIds: number[];
  favoriteMasterIds: number[];
  bookings: Booking[];
  openModal: (modal: Exclude<Modal, null>) => void;
  openReviewAuth: () => void;
  closeModal: () => void;
  openBooking: (salon: Salon, specialist?: Specialist, service?: Service, time?: string, branch?: SalonBranch, date?: string) => void;
  selectBookingSpecialist: (specialist: Specialist | null) => void;
  login: (user: Customer) => void;
  logout: () => void;
  updateProfile: (user: Customer) => void;
  toggleSalonFavorite: (id: number) => void;
  toggleMasterFavorite: (id: number) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => string | null;
  cancelBooking: (id: string) => string | null;
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(readCustomer);
  const [modal, setModal] = useState<Modal>(null);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<SalonBranch | null>(null);
  const [favoriteSalonIds, setFavoriteSalonIds] = useState<number[]>(() => { const savedUser = readCustomer(); return savedUser ? readFavorites("salons", savedUser.email) : []; });
  const [favoriteMasterIds, setFavoriteMasterIds] = useState<number[]>(() => { const savedUser = readCustomer(); return savedUser ? readFavorites("masters", savedUser.email) : []; });
  const [pendingFavorite, setPendingFavorite] = useState<{ type: "salons" | "masters"; id: number } | null>(null);
  const [favoritesAfterLogin, setFavoritesAfterLogin] = useState(false);
  const [bookingsAfterLogin, setBookingsAfterLogin] = useState(false);
  const [reviewAfterLogin, setReviewAfterLogin] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(() => { const savedUser = readCustomer(); return savedUser ? readBookings(savedUser.email) : []; });
  useEffect(() => {
    if (!user) { removeStored(customerKey); return; }
    writeJson(customerKey, user);
    writeJson(favoriteKey("salons", user.email), favoriteSalonIds);
    writeJson(favoriteKey("masters", user.email), favoriteMasterIds);
    writeJson(bookingKey(user.email), bookings);
  }, [user, favoriteSalonIds, favoriteMasterIds, bookings]);
  useEffect(() => {
    if (!user) return;
    const refresh = () => setBookings(readBookings(user.email));
    const refreshStoredBookings = (event: StorageEvent) => {
      if (event.key === bookingKey(user.email)) refresh();
    };
    window.addEventListener("zeyvo-customer-bookings-change", refresh);
    window.addEventListener("storage", refreshStoredBookings);
    return () => { window.removeEventListener("zeyvo-customer-bookings-change", refresh); window.removeEventListener("storage", refreshStoredBookings); };
  }, [user]);
  function login(next: Customer) {
    const salonIds = readFavorites("salons", next.email);
    const masterIds = readFavorites("masters", next.email);
    if (pendingFavorite?.type === "salons" && !salonIds.includes(pendingFavorite.id)) salonIds.push(pendingFavorite.id);
    if (pendingFavorite?.type === "masters" && !masterIds.includes(pendingFavorite.id)) masterIds.push(pendingFavorite.id);
    setFavoriteSalonIds(salonIds);
    setFavoriteMasterIds(masterIds);
    setBookings(readBookings(next.email));
    setUser(next);
    setModal(selectedSalon ? "booking" : pendingFavorite || favoritesAfterLogin ? "favorites" : bookingsAfterLogin ? "bookings" : reviewAfterLogin ? null : "profile");
    setPendingFavorite(null);
    setFavoritesAfterLogin(false);
    setBookingsAfterLogin(false);
    setReviewAfterLogin(false);
  }
  function logout() { setUser(null); setFavoriteSalonIds([]); setFavoriteMasterIds([]); setBookings([]); removeStored(customerKey); setModal(null); }
  function toggleSalonFavorite(id: number) {
    if (!user) { setPendingFavorite({ type: "salons", id }); setModal("auth"); return; }
    setFavoriteSalonIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }
  function toggleMasterFavorite(id: number) {
    if (!user) { setPendingFavorite({ type: "masters", id }); setModal("auth"); return; }
    setFavoriteMasterIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }
  function addBooking(booking: Omit<Booking, "id" | "createdAt">): string | null {
    if (!user) return "Davam etmək üçün hesabınıza daxil olun.";
    const entry = { ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const nextBookings = [entry, ...bookings];
    if (!writeJson(bookingKey(user.email), nextBookings)) return "Qəbulu saxlamaq mümkün olmadı. Yenidən cəhd edin.";
    if (entry.partnerOwnerId && entry.businessId) {
      const salon = getPublicSalons().find((item) => item.id === entry.salonId);
      const service = salon?.services.find((item) => item.partnerServiceId === entry.partnerServiceId || item.name === entry.service);
      if (!createOnlineBooking(entry.partnerOwnerId, {
        id: entry.id, businessId: entry.businessId, branchId: entry.branchId, serviceId: entry.partnerServiceId,
        customerEmail: user.email, clientName: entry.customerName || user.name, phone: entry.phone || user.phone,
        service: entry.service, masterName: entry.masterName || "İstənilən usta", date: entry.date, time: entry.time,
        durationMinutes: Number(service?.duration.match(/\d+/)?.[0] || 60), price: service?.price ?? 0,
        status: "Gözlənilir", source: "online", note: "Onlayn müraciət",
      })) { writeJson(bookingKey(user.email), bookings); return "Qəbul biznes təqviminə düşmədi. Yenidən cəhd edin."; }
    }
    setBookings(nextBookings);
    setSelectedSalon(null); setSelectedSpecialist(null); setSelectedService(null); setSelectedTime(null); setSelectedDate(null); setSelectedBranch(null); setModal("bookings");
    return null;
  }
  function cancelBooking(id: string): string | null {
    if (!user) return "Davam etmək üçün hesabınıza daxil olun.";
    const entry = bookings.find((item) => item.id === id);
    if (!entry || entry.status === "Tamamlandı" || entry.status === "Ləğv edildi") return "Bu qəbulu ləğv etmək mümkün deyil.";
    const next = bookings.map((booking) => booking.id === id ? { ...booking, status: "Ləğv edildi" as const } : booking);
    if (!writeJson(bookingKey(user.email), next)) return "Qəbul statusunu saxlamaq mümkün olmadı.";
    if (entry.partnerOwnerId && !cancelOnlineBooking(entry.partnerOwnerId, id)) { writeJson(bookingKey(user.email), bookings); return "Biznes təqvimi yenilənmədi. Yenidən cəhd edin."; }
    setBookings(next);
    return null;
  }
  function updateProfile(next: Customer) {
    setUser(next);
    updateLocalAccountProfile("customer", next.email, next);
  }
  return <CustomerContext.Provider value={{ user, modal, selectedSalon, selectedSpecialist, selectedService, selectedTime, selectedDate, selectedBranch, favoriteSalonIds, favoriteMasterIds, bookings, openModal: (next) => { if (next === "favorites" && !user) { setFavoritesAfterLogin(true); setModal("auth"); return; } if (next === "bookings" && !user) { setBookingsAfterLogin(true); setModal("auth"); return; } if (next === "auth" && modal !== "booking") { setSelectedSalon(null); setSelectedSpecialist(null); } setModal(next); }, openReviewAuth: () => { setReviewAfterLogin(true); setModal("auth"); }, closeModal: () => { setModal(null); setSelectedSalon(null); setSelectedSpecialist(null); setSelectedService(null); setSelectedTime(null); setSelectedDate(null); setSelectedBranch(null); setPendingFavorite(null); setFavoritesAfterLogin(false); setBookingsAfterLogin(false); setReviewAfterLogin(false); }, openBooking: (salon, specialist, service, time, branch, date) => { setSelectedSalon(salon); setSelectedSpecialist(specialist || null); setSelectedService(service || null); setSelectedTime(time || null); setSelectedDate(date || null); setSelectedBranch(branch || salon.branches?.find((item) => item.id === specialist?.partnerBranchId) || salon.branches?.[0] || null); setModal("booking"); }, selectBookingSpecialist: setSelectedSpecialist, login, logout, updateProfile, toggleSalonFavorite, toggleMasterFavorite, addBooking, cancelBooking }}>{children}</CustomerContext.Provider>;
}
