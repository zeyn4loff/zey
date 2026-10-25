import { useState, type FormEvent } from "react";
import { CalendarDays, Star, X } from "lucide-react";
import type { Salon, Specialist } from "@/features/marketplace/data";
import { findSalonForSpecialist } from "@/features/marketplace/data";
import { getPublicSalons } from "@/features/marketplace/publicCatalog";
import type { Booking, CustomerContextValue } from "./CustomerContext";
import { useCustomer } from "./useCustomer";
import { changeLocalPassword } from "@/lib/localCredentials";

export function ProfileBookings({ bookings, onCancel, onExplore }: { bookings: Booking[]; onCancel: (id: string) => void; onExplore: () => void }) {
  return <div className="space-y-2.5">
    {bookings.length ? bookings.map((booking) => <article key={booking.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="min-w-0"><strong className="block truncate text-xs">{booking.salonName}</strong>{booking.masterName && <p className="truncate text-[11px] font-bold text-slate-600">{booking.masterName}</p>}<p className="truncate text-[11px] text-slate-500">{booking.service}</p><p className="mt-1 text-[11px] font-bold">{booking.date}, {booking.time} · {booking.status ?? "Gözlənilir"}</p></div>
      {booking.status !== "Ləğv edildi" && booking.status !== "Tamamlandı" && <button type="button" onClick={() => onCancel(booking.id)} className="shrink-0 cursor-pointer rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600">Ləğv et</button>}
    </article>) : <div className="py-8 text-center"><CalendarDays className="mx-auto mb-2 size-12 rounded-2xl bg-slate-100 p-3 text-slate-400" /><p className="text-xs font-bold text-slate-600">Aktiv görüşünüz yoxdur</p><p className="mt-1 text-[11px] text-slate-400">Xidmət seçərək onlayn yazıla bilərsiniz</p><button type="button" onClick={onExplore} className="mt-3 cursor-pointer rounded-xl bg-yellow-primary px-4 py-2 text-xs font-black">Kataloqa bax</button></div>}
  </div>;
}

type FavoritesProps = {
  salons: Salon[];
  masters: Specialist[];
  onOpenSalon: (id: number) => void;
  onOpenMaster: (id: number) => void;
  onBook: CustomerContextValue["openBooking"];
  onRemoveSalon: (id: number) => void;
  onRemoveMaster: (id: number) => void;
};

export function ProfileFavorites({ salons, masters, onOpenSalon, onOpenMaster, onBook, onRemoveSalon, onRemoveMaster }: FavoritesProps) {
  return <div className="space-y-3">
    {salons.map((salon) => <article key={`s-${salon.id}`} className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <button type="button" onClick={() => onOpenSalon(salon.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"><img src={salon.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><strong className="block truncate text-xs">{salon.name}</strong><span className="block truncate text-[10px] text-slate-400">{salon.tag}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-500"><Star size={11} fill="currentColor" /> {salon.rating} · Salon</span></span></button>
      <button type="button" onClick={() => onBook(salon)} className="cursor-pointer rounded-xl bg-yellow-primary px-2.5 py-1.5 text-[11px] font-black">Yazıl</button>
      <button type="button" onClick={() => onRemoveSalon(salon.id)} aria-label={`${salon.name} sil`} className="flex size-7 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-500"><X size={15} /></button>
    </article>)}
    {masters.map((master) => {
      const salon = getPublicSalons().find((item) => item.id === master.salonId) ?? findSalonForSpecialist(master);
      return <article key={`m-${master.id}`} className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
        <button type="button" onClick={() => onOpenMaster(master.id)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"><img src={master.photo} alt="" className="size-12 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><strong className="block truncate text-xs">{master.name}</strong><span className="block truncate text-[10px] text-slate-400">{master.title}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-500"><Star size={11} fill="currentColor" /> {master.rating} · Usta</span></span></button>
        {salon && <button type="button" onClick={() => onBook(salon, master)} className="cursor-pointer rounded-xl bg-yellow-primary px-2.5 py-1.5 text-[11px] font-black">Yazıl</button>}
        <button type="button" onClick={() => onRemoveMaster(master.id)} aria-label={`${master.name} sil`} className="flex size-7 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-500"><X size={15} /></button>
      </article>;
    })}
    {salons.length + masters.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="text-xs font-bold">Seçilmiş salon və usta yoxdur</p><p className="mt-1 text-[11px] text-slate-400">Kataloqdan bəyəndiyiniz məkanları ürək işarəsi ilə seçin.</p></div>}
  </div>;
}

export function ProfileSecurity() {
  const { user } = useCustomer();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputClass = "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const next = String(data.get("next") ?? "");
    if (next !== data.get("confirm")) { setError("Yeni şifrələr uyğun gəlmir."); setMessage(""); return; }
    if (!await changeLocalPassword("customer", user.email, String(data.get("current") ?? ""), next)) { setError("Hazırkı şifrə yanlışdır və ya dəyişiklik saxlanmadı."); setMessage(""); return; }
    form.reset(); setError(""); setMessage("Şifrə yeniləndi.");
  }
  return <form onSubmit={submit} className="space-y-3"><label className="block text-xs font-bold text-slate-500">Hazırkı şifrə<input name="current" type="password" autoComplete="current-password" required placeholder="••••••••" className={inputClass} /></label><label className="block text-xs font-bold text-slate-500">Yeni şifrə<input name="next" type="password" autoComplete="new-password" required minLength={6} placeholder="Minimum 6 simvol" className={inputClass} /></label><label className="block text-xs font-bold text-slate-500">Yeni şifrə təkrarı<input name="confirm" type="password" autoComplete="new-password" required minLength={6} placeholder="••••••••" className={inputClass} /></label>{error && <p role="alert" className="text-xs text-rose-600">{error}</p>}{message && <p role="status" className="text-xs text-emerald-700">{message}</p>}<button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary text-xs font-black">Şifrəni yenilə</button></form>;
}
