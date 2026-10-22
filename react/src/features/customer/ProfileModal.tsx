import { useState, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, Camera, LogOut, Star, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { findSalonForSpecialist, specialists } from "@/features/marketplace/data";
import { publicSalons } from "@/features/marketplace/publicCatalog";
import { cities } from "@/features/location/cities";
import { formatPhone } from "./formatPhone";
import { useCustomer } from "./useCustomer";

type Tab = "info" | "bookings" | "favorites" | "security";
const inputClass = "mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-yellow-primary/40";

export default function ProfileModal() {
  const { modal, closeModal, user, updateProfile, logout, bookings, favoriteSalonIds, favoriteMasterIds, cancelBooking, toggleSalonFavorite, toggleMasterFavorite, openBooking } = useCustomer();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("info");
  const [gender, setGender] = useState<"female" | "male" | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  if (!user) return null;

  const favoriteSalons = publicSalons.filter((item) => favoriteSalonIds.includes(item.id));
  const favoriteMasters = specialists.filter((item) => favoriteMasterIds.includes(item.id));
  const favoriteCount = favoriteSalons.length + favoriteMasters.length;
  const selectedGender = gender ?? user.gender ?? null;
  const phoneValue = phone ?? formatPhone(user.phone || "");
  function close() { setTab("info"); setGender(null); setPhone(null); setError(""); setNotice(""); closeModal(); }
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1_000_000) { setError("1 MB-dan kiçik şəkil seçin."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateProfile({ ...user!, avatar: reader.result });
      setNotice("Profil şəkli yeniləndi."); setError("");
    };
    reader.readAsDataURL(file);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const digits = phoneValue.replace(/\D/g, "").replace(/^994/, "");
    if (digits && digits.length !== 9) { setError("9 rəqəmli mobil nömrə daxil edin."); return; }
    updateProfile({ ...user!, name: String(data.get("name") || "").trim(), email: String(data.get("email") || "").trim(), phone: digits ? `+994 ${formatPhone(digits)}` : "", city: String(data.get("city") || "Bakı"), gender: selectedGender || undefined });
    setPhone(null); setGender(null); setError(""); setNotice("Profil məlumatları yeniləndi.");
  }
  const tabs: { id: Tab; label: string }[] = [
    { id: "info", label: "Məlumatlar" }, { id: "bookings", label: `Yazılarım (${bookings.length})` },
    { id: "favorites", label: `Seçilmişlər (${favoriteCount})` }, { id: "security", label: "Təhlükəsizlik" },
  ];

  return <Dialog open={modal === "profile"} onOpenChange={(open) => { if (!open) close(); }}>
    <DialogContent showCloseButton={false} overlayClassName="customer-overlay" className="customer-modal fixed bottom-0 left-1/2 top-auto grid max-h-[92dvh] w-full max-w-lg -translate-x-1/2 translate-y-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-b-none rounded-t-3xl p-5 sm:top-1/2 sm:bottom-auto sm:max-h-[90dvh] sm:max-w-lg sm:-translate-y-1/2 sm:rounded-3xl sm:p-7">
      <div><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" /><div className="flex items-center justify-between border-b border-slate-100 pb-3.5"><h2 className="text-lg font-black text-slate-900 sm:text-xl">Şəxsi kabinet</h2><button type="button" onClick={close} aria-label="Bağla" className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"><X size={17} /></button></div></div>
      <div className="min-h-0 space-y-4 overflow-y-auto py-3 [scrollbar-width:none]">
        <div className="flex items-center gap-3.5 rounded-2xl border border-black/10 bg-gradient-to-r from-[#1f2024] via-[#2a2b30] to-[#121316] p-4 text-white shadow-md">
          <div className="relative shrink-0"><label title="Foto yükləmək üçün klikləyin" className="flex size-14 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-yellow-primary/60 bg-white/10 text-yellow-primary">{user.avatar ? <img src={user.avatar} alt="Profil şəkli" className="size-full object-cover" /> : <UserRound size={35} strokeWidth={1.7} />}<input type="file" accept="image/*" onChange={upload} className="sr-only" aria-label="Profil şəklini yüklə" /></label><span className="pointer-events-none absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-[#1f2024] bg-yellow-primary text-slate-900"><Camera size={13} /></span>{user.avatar && <button type="button" onClick={() => { updateProfile({ ...user, avatar: undefined }); setNotice("Profil şəkli silindi."); }} title="Şəkli sil" aria-label="Profil şəklini sil" className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border-2 border-[#1f2024] bg-rose-500 text-white"><X size={11} /></button>}</div>
          <div className="min-w-0"><div className="flex items-center gap-1.5"><strong className="truncate text-base font-black">{user.name}</strong>{user.gender && <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${user.gender === "female" ? "bg-pink-500/80" : "bg-blue-500/80"}`}>{user.gender === "female" ? "Qadın" : "Kişi"}</span>}</div><p className="truncate text-xs font-medium text-slate-300">{user.email}</p><p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">{user.phone || "+994 (50) 000-00-00"}</p></div>
        </div>
        <div role="tablist" aria-label="Profil bölmələri" className="flex overflow-x-auto rounded-xl bg-slate-100 p-1 [scrollbar-width:none]">{tabs.map((item) => <button key={item.id} role="tab" aria-selected={tab === item.id} type="button" onClick={() => { setTab(item.id); setError(""); setNotice(""); }} className={`min-w-max flex-1 rounded-lg px-2 py-2 text-xs transition ${tab === item.id ? "bg-white font-black text-slate-900 shadow-sm" : "font-bold text-slate-500 hover:text-slate-900"}`}>{item.label}</button>)}</div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-2 text-xs font-semibold text-red-700">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-2 text-xs font-semibold text-emerald-700">{notice}</p>}
        {tab === "info" && <form id="profile-info-form" key={user.email} onSubmit={submit} className="space-y-3">
          <fieldset><legend className="mb-1.5 text-xs font-bold text-slate-500">Cins</legend><div className="grid grid-cols-2 gap-2">{(["female", "male"] as const).map((value) => <button key={value} type="button" aria-pressed={selectedGender === value} onClick={() => setGender(value)} className={`h-10 rounded-xl px-3 text-xs font-bold transition ${selectedGender === value ? value === "female" ? "border-2 border-pink-500 bg-pink-50 text-pink-700" : "border-2 border-blue-600 bg-blue-50 text-blue-700" : "border border-slate-200 bg-slate-50 text-slate-600"}`}>{value === "female" ? "Qadın" : "Kişi"}</button>)}</div></fieldset>
          <label className="block text-xs font-bold text-slate-500">Ad və Soyad<input name="name" defaultValue={user.name} required className={inputClass} /></label>
          <label className="block text-xs font-bold text-slate-500">E-poçt ünvanı<input name="email" type="email" defaultValue={user.email} required className={inputClass} /></label>
          <label className="block text-xs font-bold text-slate-500">Mobil nömrə<span className="mt-1 flex h-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-yellow-primary/40"><span className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-100 px-3 font-bold text-slate-900" aria-hidden="true"><svg viewBox="0 0 120 60" className="h-3.5 w-5 rounded-sm"><rect width="120" height="20" fill="#00B5E2" /><rect y="20" width="120" height="20" fill="#EF3340" /><rect y="40" width="120" height="20" fill="#509E2F" /><circle cx="56" cy="30" r="10" fill="white" /><circle cx="60" cy="30" r="8" fill="#EF3340" /></svg>+994</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" value={phoneValue} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(50) 000-00-00" className="min-w-0 flex-1 bg-transparent px-3 text-xs font-semibold outline-none" /></span></label>
          <label className="block text-xs font-bold text-slate-500">Şəhər<select name="city" defaultValue={user.city || "Bakı"} className={inputClass}>{cities.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}</select></label>
          <button type="submit" className="h-10 w-full rounded-xl bg-yellow-primary text-xs font-black text-slate-900 hover:bg-yellow-300">Dəyişiklikləri yadda saxla</button>
        </form>}
        {tab === "bookings" && <div className="space-y-2.5">{bookings.length ? bookings.map((booking) => <article key={booking.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5"><div className="min-w-0"><strong className="block truncate text-xs">{booking.salonName}</strong>{booking.masterName && <p className="truncate text-[11px] font-bold text-slate-600">{booking.masterName}</p>}<p className="truncate text-[11px] text-slate-500">{booking.service}</p><p className="mt-1 text-[11px] font-bold">{booking.date}, {booking.time}</p></div><button type="button" onClick={() => cancelBooking(booking.id)} className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600">Ləğv et</button></article>) : <div className="py-8 text-center"><CalendarDays className="mx-auto mb-2 size-12 rounded-2xl bg-slate-100 p-3 text-slate-400" /><p className="text-xs font-bold text-slate-600">Aktiv görüşünüz yoxdur</p><p className="mt-1 text-[11px] text-slate-400">Xidmət seçərək onlayn yazıla bilərsiniz</p><button type="button" onClick={() => { close(); navigate("/catalog"); }} className="mt-3 rounded-xl bg-yellow-primary px-4 py-2 text-xs font-black">Kataloqa bax</button></div>}</div>}
        {tab === "favorites" && <div className="space-y-3">
          {favoriteSalons.map((item) => <article key={`s-${item.id}`} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3"><button type="button" onClick={() => { close(); navigate(`/salon/${item.id}`); }} className="flex min-w-0 flex-1 items-center gap-3 text-left"><img src={item.image} alt="" className="size-12 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><strong className="block truncate text-xs">{item.name}</strong><span className="block truncate text-[10px] text-slate-400">{item.tag}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-500"><Star size={11} fill="currentColor" /> {item.rating} · Salon</span></span></button><button type="button" onClick={() => openBooking(item)} className="rounded-xl bg-yellow-primary px-2.5 py-1.5 text-[11px] font-black">Yazıl</button><button type="button" onClick={() => toggleSalonFavorite(item.id)} aria-label={`${item.name} sil`} className="flex size-7 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><X size={15} /></button></article>)}
          {favoriteMasters.map((item) => { const salon = findSalonForSpecialist(item); return <article key={`m-${item.id}`} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3"><button type="button" onClick={() => { close(); navigate(`/master/${item.id}`); }} className="flex min-w-0 flex-1 items-center gap-3 text-left"><img src={item.photo} alt="" className="size-12 shrink-0 rounded-xl object-cover" /><span className="min-w-0"><strong className="block truncate text-xs">{item.name}</strong><span className="block truncate text-[10px] text-slate-400">{item.title}</span><span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-500"><Star size={11} fill="currentColor" /> {item.rating} · Usta</span></span></button>{salon && <button type="button" onClick={() => openBooking(salon, item)} className="rounded-xl bg-yellow-primary px-2.5 py-1.5 text-[11px] font-black">Yazıl</button>}<button type="button" onClick={() => toggleMasterFavorite(item.id)} aria-label={`${item.name} sil`} className="flex size-7 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><X size={15} /></button></article>; })}
          {favoriteCount === 0 && <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center"><p className="text-xs font-bold">Seçilmiş salon və usta yoxdur</p><p className="mt-1 text-[11px] text-slate-400">Kataloqdan bəyəndiyiniz məkanları ürək işarəsi ilə seçin.</p></div>}
        </div>}
        {tab === "security" && <div className="space-y-3"><label className="block text-xs font-bold text-slate-500">Hazırkı şifrə<input type="password" disabled placeholder="••••••••" className={inputClass} /></label><label className="block text-xs font-bold text-slate-500">Yeni şifrə<input type="password" disabled placeholder="Minimum 6 simvol" className={inputClass} /></label><button type="button" disabled className="h-10 w-full rounded-xl bg-yellow-primary text-xs font-black opacity-50">Şifrəni yenilə</button><p className="text-[11px] text-slate-500">Şifrənin dəyişdirilməsi server qoşulduqda işləyəcək.</p></div>}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3"><button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600"><LogOut size={16} /> Hesabdan çıxış</button><button type="button" onClick={close} className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">Bağla</button></div>
    </DialogContent>
  </Dialog>;
}
