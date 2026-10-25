import { Heart, MapPin, Phone, Star } from "lucide-react";
import type { Salon } from "@/features/marketplace/data";

interface Props {
  salon: Salon;
  branchName?: string;
  location?: string;
  hours?: string;
  phone?: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBook: () => void;
}

function getOpenStatus(hours?: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Baku", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const time = `${parts.find((part) => part.type === "hour")?.value}:${parts.find((part) => part.type === "minute")?.value}`;
  const match = hours?.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  return weekday !== "Sun" && !!match && time >= match[1] && time < match[2];
}

function SocialIcon({ type }: { type: "instagram" | "facebook" | "whatsapp" }) {
  if (type === "instagram") return <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  if (type === "facebook") return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4.5c-.5-.1-1.8-.2-3.4-.2-3.3 0-5.6 2-5.6 5.8V13H4v4h4v7h5v-7h3.3l.7-4H13v-2.5C13 9.3 13.3 8 14 8Z" /></svg>;
  return <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163A11.87 11.87 0 0 1 .157 11.89C.16 5.335 5.495 0 12.05 0a11.8 11.8 0 0 1 8.413 3.488 11.81 11.81 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24Zm6.597-3.807a9.85 9.85 0 0 0 5.392 1.592c5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.85 9.85 0 0 0 1.746 5.634l-.999 3.648 3.742-.981Zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>;
}

export default function SalonHero({ salon, branchName, location, hours, phone, isFavorite, onToggleFavorite, onBook }: Props) {
  const open = getOpenStatus(hours || salon.workHours);
  const contactPhone = phone || salon.contact?.phone || "+994125002026";
  const digits = contactPhone.replace(/\D/g, "");
  const instagram = salon.contact?.instagram;
  return <section className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:flex-row md:items-center">
    <div className="flex min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
      <img src={salon.image} alt={salon.name} className="h-36 w-full shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm sm:size-20" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-3xl">{salon.name}</h1><span className={`rounded-lg border px-2 py-0.5 text-[10px] font-extrabold ${open ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{open ? "Açıqdır" : "Bağlıdır"}</span></div>
        <p className="mt-1 flex items-start gap-1 text-xs font-medium text-slate-500"><MapPin size={14} className="mt-px shrink-0 text-slate-400" />{branchName && branchName !== salon.name ? `${branchName} · ` : ""}{location || salon.location}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs"><a href={`tel:+${digits}`} className="inline-flex items-center gap-1 font-semibold text-slate-600"><Phone size={14} className="text-slate-400" />{contactPhone}</a><div className="flex items-center gap-1.5" aria-label="Sosial şəbəkələr">{(["instagram", "facebook", "whatsapp"] as const).map((type) => { const href = type === "instagram" ? instagram : type === "whatsapp" ? `https://wa.me/${digits}` : undefined; return href ? <a key={type} href={href} target="_blank" rel="noopener noreferrer" aria-label={type} className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><SocialIcon type={type} /></a> : <span key={type} title="Əlaqə əlavə edilməyib" aria-label={`${type}: əlaqə əlavə edilməyib`} className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><SocialIcon type={type} /></span>; })}</div></div>
        <div className="mt-2.5 flex items-center gap-1">{salon.reviewsCount ? <><strong className="text-sm">{salon.rating}</strong><span className="flex gap-0.5 text-amber-400">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={12} fill={index < Math.round(salon.rating) ? "currentColor" : "none"} />)}</span><span className="text-xs text-slate-400">({salon.reviewsCount})</span></> : <span className="text-xs text-slate-500">Hələ rəy yoxdur</span>}</div>
      </div>
    </div>
    <div className="hidden shrink-0 items-center gap-2 sm:flex"><button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? "Sevimlilərdən çıxar" : "Sevimlilərə əlavə et"} aria-pressed={isFavorite} className="flex size-10 items-center justify-center rounded-xl border border-slate-200"><Heart size={18} className={isFavorite ? "fill-rose-500 text-rose-500" : ""} /></button><button type="button" onClick={onBook} className="h-10 rounded-xl bg-yellow-primary px-6 text-xs font-black">Onlayn yazıl</button></div>
  </section>;
}
