import { useEffect, useState, type ReactNode } from "react";
import { CustomerContext } from "./customer-context";
import type { Salon, SalonBranch, Specialist, Service } from "@/features/marketplace/data";
import { bookingKey, customerKey, favoriteKey, readBookings, readCustomer, readFavorites } from "./customerStorage";
import { removeStored, writeJson } from "@/lib/demoStorage";

type Modal = "auth" | "profile" | "favorites" | "bookings" | "booking" | null;
export interface Customer { name: string; email: string; phone: string; city: string; gender?: "female" | "male"; avatar?: string }
export interface Booking { id: string; salonId: number; salonName: string; branchName?: string; masterName?: string; service: string; date: string; time: string; customerName?: string; phone?: string; createdAt: string }
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
  closeModal: () => void;
  openBooking: (salon: Salon, specialist?: Specialist, service?: Service, time?: string, branch?: SalonBranch, date?: string) => void;
  selectBookingSpecialist: (specialist: Specialist | null) => void;
  login: (user: Customer) => void;
  logout: () => void;
  updateProfile: (user: Customer) => void;
  toggleSalonFavorite: (id: number) => void;
  toggleMasterFavorite: (id: number) => void;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
  cancelBooking: (id: string) => void;
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
  const [bookings, setBookings] = useState<Booking[]>(() => { const savedUser = readCustomer(); return savedUser ? readBookings(savedUser.email) : []; });
  useEffect(() => {
    if (!user) { removeStored(customerKey); return; }
    writeJson(customerKey, user);
    writeJson(favoriteKey("salons", user.email), favoriteSalonIds);
    writeJson(favoriteKey("masters", user.email), favoriteMasterIds);
    writeJson(bookingKey(user.email), bookings);
  }, [user, favoriteSalonIds, favoriteMasterIds, bookings]);
  function login(next: Customer) {
    const salonIds = readFavorites("salons", next.email);
    const masterIds = readFavorites("masters", next.email);
    if (pendingFavorite?.type === "salons" && !salonIds.includes(pendingFavorite.id)) salonIds.push(pendingFavorite.id);
    if (pendingFavorite?.type === "masters" && !masterIds.includes(pendingFavorite.id)) masterIds.push(pendingFavorite.id);
    setFavoriteSalonIds(salonIds);
    setFavoriteMasterIds(masterIds);
    setBookings(readBookings(next.email));
    setUser(next);
    setModal(selectedSalon ? "booking" : pendingFavorite || favoritesAfterLogin ? "favorites" : bookingsAfterLogin ? "bookings" : "profile");
    setPendingFavorite(null);
    setFavoritesAfterLogin(false);
    setBookingsAfterLogin(false);
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
  function addBooking(booking: Omit<Booking, "id" | "createdAt">) { if (!user) return; const entry = { ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; setBookings((current) => [entry, ...current]); setSelectedSalon(null); setSelectedSpecialist(null); setSelectedService(null); setSelectedTime(null); setSelectedDate(null); setSelectedBranch(null); setModal("bookings"); }
  function cancelBooking(id: string) { if (!user) return; setBookings((current) => current.filter((booking) => booking.id !== id)); }
  function updateProfile(next: Customer) {
    setUser(next);
  }
  return <CustomerContext.Provider value={{ user, modal, selectedSalon, selectedSpecialist, selectedService, selectedTime, selectedDate, selectedBranch, favoriteSalonIds, favoriteMasterIds, bookings, openModal: (next) => { if (next === "favorites" && !user) { setFavoritesAfterLogin(true); setModal("auth"); return; } if (next === "bookings" && !user) { setBookingsAfterLogin(true); setModal("auth"); return; } if (next === "auth" && modal !== "booking") { setSelectedSalon(null); setSelectedSpecialist(null); } setModal(next); }, closeModal: () => { setModal(null); setSelectedSalon(null); setSelectedSpecialist(null); setSelectedService(null); setSelectedTime(null); setSelectedDate(null); setSelectedBranch(null); setPendingFavorite(null); setFavoritesAfterLogin(false); setBookingsAfterLogin(false); }, openBooking: (salon, specialist, service, time, branch, date) => { setSelectedSalon(salon); setSelectedSpecialist(specialist || null); setSelectedService(service || null); setSelectedTime(time || null); setSelectedDate(date || null); setSelectedBranch(branch || null); setModal("booking"); }, selectBookingSpecialist: setSelectedSpecialist, login, logout, updateProfile, toggleSalonFavorite, toggleMasterFavorite, addBooking, cancelBooking }}>{children}</CustomerContext.Provider>;
}
