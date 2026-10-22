import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSpecialistsForSalon, groupServices } from "@/features/marketplace/data";
import { useCustomer } from "./useCustomer";
import { formatPhone } from "./formatPhone";

export default function BookingModal() {
  const { modal, closeModal, selectedSalon, selectedSpecialist, selectedService, selectedTime, selectedDate, selectedBranch, selectBookingSpecialist, bookings, user, addBooking, openModal } = useCustomer();
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  if (!selectedSalon) return null;
  function close() { setService(""); setDate(""); setTime(null); setCustomerName(""); setPhone(""); setError(""); closeModal(); }

  const availableSpecialists = getSpecialistsForSalon(selectedSalon);
  const availableServices = selectedSpecialist?.services?.length ? selectedSpecialist.services : selectedSalon.services;
  const dates = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(12, 0, 0, 0);
    day.setDate(day.getDate() + index);
    const value = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    return { value, label: `${String(day.getDate()).padStart(2, "0")}.${String(day.getMonth() + 1).padStart(2, "0")}` };
  });
  const chosenDate = date || selectedDate || dates[0].value;
  const taken = new Set(bookings.filter((booking) => booking.salonId === selectedSalon.id && booking.branchName === selectedBranch?.name && booking.date === chosenDate && (booking.masterName || "") === (selectedSpecialist?.name || "")).map((booking) => booking.time));
  const chosenTime = time ?? selectedTime ?? selectedSalon.slots[0] ?? "";
  const chosenService = (service && availableServices.some((item) => item.name === service) ? service : "") || (selectedService && availableServices.some((item) => item.name === selectedService.name) ? selectedService.name : "") || availableServices[0]?.name || "";
  const name = customerName || user?.name || "";
  const phoneValue = phone || formatPhone(user?.phone || "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chosenService || !chosenTime || taken.has(chosenTime)) { setError("Xidmət və boş saat seçin."); return; }
    if (name.trim().length < 2 || phoneValue.replace(/\D/g, "").length !== 9) { setError("Adınızı və 9 rəqəmli mobil nömrənizi daxil edin."); return; }
    if (!user) { openModal("auth"); return; }
    if (!selectedSalon) return;
    addBooking({ salonId: selectedSalon.id, salonName: selectedSalon.name, branchName: selectedBranch?.name, masterName: selectedSpecialist?.name, service: chosenService, date: chosenDate, time: chosenTime, customerName: name.trim(), phone: `+994 ${phoneValue}` });
    setService("");
    setDate("");
    setTime(null);
  }

  return <Dialog open={modal === "booking"} onOpenChange={(open) => { if (!open) close(); }}>
    <DialogContent className="customer-modal max-h-[92dvh] w-[calc(100vw-1rem)] min-w-0 max-w-lg overflow-x-hidden overflow-y-auto rounded-3xl p-4 sm:p-6" overlayClassName="customer-overlay">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{selectedSalon.name}</DialogTitle>
        <p className="text-xs text-slate-500">{selectedBranch?.address || selectedSalon.location}</p>
      </DialogHeader>
      <form onSubmit={submit} className="min-w-0 space-y-4">
        <fieldset className="min-w-0"><legend className="mb-2 text-sm font-bold">1. Xidməti seçin</legend><div className="space-y-2">{groupServices(availableServices).map((group) => <div key={group.name || "all"}>{group.name && <h3 className="mb-2 mt-3 text-xs font-semibold text-slate-500">{group.name}</h3>}{group.services.map((item) => <label key={item.id} className={`mb-2 flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${chosenService === item.name ? "border-slate-900 bg-amber-50/60" : "border-slate-200 hover:border-slate-400"}`}><input type="radio" name="booking-service" checked={chosenService === item.name} onChange={() => setService(item.name)} className="size-4 shrink-0 accent-slate-900" /><span className="min-w-0 flex-1"><strong className="block break-words text-sm">{item.name}</strong><span className="text-xs text-slate-400">{item.duration}</span></span><strong className="shrink-0 text-sm">{item.price} ₼</strong></label>)}</div>)}</div></fieldset>
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-bold">2. Ustanı seçin</legend>
          <div className="space-y-2">
            {[null, ...availableSpecialists].map((specialist) => {
              const selected = selectedSpecialist?.id === specialist?.id;
              return <label key={specialist?.id ?? "any"} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-xs transition-colors ${selected ? "border-slate-900 bg-amber-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name="booking-specialist" checked={selected} onChange={() => { selectBookingSpecialist(specialist); setService(""); }} className="accent-slate-900" />
                <span><strong className="block">{specialist?.name ?? "İstənilən usta"}</strong><span className="text-slate-500">{specialist?.title ?? (availableSpecialists.length ? "İlk uyğun usta" : "Məkan üzrə usta siyahısı hələ əlavə edilməyib")}</span></span>
              </label>;
            })}
          </div>
        </fieldset>
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-bold">3. Boş vaxt seçin</legend>
          <div className="flex gap-2 overflow-x-auto pb-2">{dates.map((day, index) => <button key={day.value} type="button" aria-pressed={chosenDate === day.value} onClick={() => { setDate(day.value); setTime(selectedSalon.slots[0] || ""); }} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold ${chosenDate === day.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"}`}>{index === 0 ? "Bu gün" : index === 1 ? "Sabah" : day.label}</button>)}</div>
          <div className="flex flex-wrap gap-2">{selectedSalon.slots.map((slot) => <button key={slot} type="button" disabled={taken.has(slot)} aria-pressed={chosenTime === slot} onClick={() => setTime(slot)} className={`rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-40 ${chosenTime === slot ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"}`}>{slot}</button>)}</div>
        </fieldset>
        <fieldset className="space-y-3 border-t border-slate-200 pt-4"><legend className="text-sm font-bold">4. Əlaqə məlumatları</legend><input aria-label="Adınız və Soyadınız" autoComplete="name" value={name} onChange={(event) => setCustomerName(event.target.value)} placeholder="Adınız və Soyadınız" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-yellow-primary" /><label className="flex h-11 overflow-hidden rounded-xl border border-slate-200 focus-within:border-yellow-primary"><span className="flex shrink-0 items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 text-sm font-bold">🇦🇿 +994</span><input aria-label="Mobil nömrə" type="tel" inputMode="numeric" autoComplete="tel-national" value={phoneValue} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(50) 000-00-00" className="min-w-0 flex-1 px-3 text-sm outline-none" /></label></fieldset>
        {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={close} className="rounded-xl bg-slate-100 py-3 text-sm font-semibold">İmtina</button><button type="submit" className="rounded-xl bg-yellow-primary py-3 text-sm font-bold">{user ? "Təsdiq et" : "Daxil ol və davam et"}</button></div>
        <p className="text-xs text-slate-500">Saatlar nümunədir. Yazı yalnız bu brauzerdə saxlanılır və məkan tərəfindən təsdiqlənmir.</p>
      </form>
    </DialogContent>
  </Dialog>;
}
