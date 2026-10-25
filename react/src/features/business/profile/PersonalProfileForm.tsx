import type { FormEvent } from "react";
import { formatPhone } from "@/lib/formatPhone";
import type { BusinessProfile } from "./profile";

const cities = ["Bakı", "Sumqayıt", "Gəncə", "Xırdalan", "Mingəçevir", "Şəki", "Quba", "Lənkəran", "Naxçıvan"];
const field = "mt-1.5 h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-yellow-primary/40";
const label = "block min-w-0 text-xs font-bold text-slate-500";

interface Props {
  name: string;
  phone: string;
  email: string;
  draft: BusinessProfile;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onChange: <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function PersonalProfileForm({ name, phone, email, draft, onNameChange, onPhoneChange, onChange, onSubmit }: Props) {
  return <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="border-b border-slate-100 pb-4">
      <h3 className="text-sm font-bold text-slate-900">Şəxsi məlumatlar</h3>
      <p className="mt-1 text-xs font-medium text-slate-400">Kabinet rəhbərinin əlaqə və profil rekvizitləri</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className={label}>Cins</span>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:max-w-xs">
          {([{ id: "female", title: "Qadın" }, { id: "male", title: "Kişi" }] as const).map((item) => {
            const selected = draft.gender === item.id;
            const selectedStyle = item.id === "female" ? "border-2 border-pink-500 bg-pink-50 text-pink-700" : "border-2 border-blue-600 bg-blue-50 text-blue-700";
            return <button key={item.id} type="button" aria-pressed={selected} onClick={() => onChange("gender", item.id)} className={`min-h-11 cursor-pointer rounded-xl text-xs font-bold transition ${selected ? selectedStyle : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{item.title}</button>;
          })}
        </div>
      </div>
      <label className={label}>Ad və Soyad *<input value={name} onChange={(event) => onNameChange(event.target.value)} className={field} required minLength={2} autoComplete="name" /></label>
      <label className={label}>E-poçt ünvanı<input value={email} readOnly className={`${field} cursor-not-allowed bg-slate-100 text-slate-500`} /></label>
      <label className={label}>Mobil nömrə *
        <span className="mt-1.5 flex min-h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-primary/40">
          <span className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-900"><img src="/az-flag.svg" alt="" className="h-3.5 w-5 rounded-[2px] border border-slate-200 object-cover" />+994</span>
          <input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={(event) => onPhoneChange(formatPhone(event.target.value))} placeholder="(50) 000-00-00" className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" required />
        </span>
      </label>
      <label className={label}>İnterfeys dili<select value={draft.language} onChange={(event) => onChange("language", event.target.value as BusinessProfile["language"])} className={field}><option value="az">Azərbaycan dili (AZ)</option><option value="ru">Русский (RU)</option><option value="en">English (EN)</option></select></label>
      <label className={label}>Ölkə<span className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 text-sm font-semibold text-slate-600"><img src="/az-flag.svg" alt="" className="h-3.5 w-5 rounded-[2px] border border-slate-200 object-cover" />Azərbaycan</span></label>
      <label className={label}>Şəhər<select value={draft.city} onChange={(event) => onChange("city", event.target.value)} className={field}>{!cities.includes(draft.city) && <option value={draft.city}>{draft.city}</option>}{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
      <label className={`${label} sm:col-span-2`}>Haqqında<textarea rows={3} value={draft.bio} onChange={(event) => onChange("bio", event.target.value)} className={`${field} h-auto min-h-24 resize-y py-3`} placeholder="Özünüz və fəaliyyətiniz haqqında" /></label>
    </div>
    <div className="flex justify-end pt-1"><button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold sm:w-auto">Dəyişiklikləri yadda saxla</button></div>
  </form>;
}
