import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { NavLink } from "react-router";
import { useBusinessSession } from "../auth/useBusinessSession";
import type { BusinessSession } from "../auth/businessSession";
import BusinessHeaderPortal from "../components/BusinessHeaderPortal";
import { BusinessTabNav } from "../components/BusinessTabs";
import { businessTabClass } from "../components/businessTabStyles";
import ConnectedAppsPanel from "./ConnectedAppsPanel";
import SecurityPanel from "./SecurityPanel";
import PersonalProfileForm from "./PersonalProfileForm";
import ProfileIdentityBanner from "./ProfileIdentityBanner";
import { formatPhone } from "@/lib/formatPhone";
import { formattedPhone, normalizeHandle, phoneDigits, readProfile, saveProfile, type BusinessProfile, type ProfileTab } from "./profile";

const tabs: { id: ProfileTab; title: string }[] = [
  { id: "personal", title: "Şəxsi məlumatlar" }, { id: "startpage", title: "Başlanğıc səhifə" },
  { id: "messengers", title: "Mesencerlər" }, { id: "social", title: "Sosial şəbəkələr" },
  { id: "apps", title: "Qoşulmuş tətbiqlər" }, { id: "security", title: "Təhlükəsizlik" },
];
const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6";
const field = "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40";
function Field({ title, children }: { title: string; children: ReactNode }) { return <label className="block min-w-0 text-xs font-bold text-slate-600">{title}{children}</label>; }
function SaveButton({ title = "Yadda saxla" }: { title?: string }) { return <button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold sm:w-auto">{title}</button>; }
function Notice({ error, success }: { error: string; success: string }) { return <>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}{success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{success}</p>}</>; }

export default function BusinessProfile({ session, tab }: { session: BusinessSession; tab: ProfileTab }) {
  const { updateSession } = useBusinessSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(() => readProfile(session));
  const [name, setName] = useState(session.ownerName);
  const [phone, setPhone] = useState(formatPhone(phoneDigits(session.phone ?? "")));
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function change<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) { setDraft((current) => ({ ...current, [key]: value })); setError(""); setSuccess(""); }
  function save(next: BusinessProfile, message = "Məlumatlar yadda saxlanıldı.") {
    if (!saveProfile(session.id, next)) { setError("Məlumatları saxlamaq mümkün olmadı."); return false; }
    setProfile(next); setDraft(next); setError(""); setSuccess(message); return true;
  }
  function savePersonal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phoneDigits(phone);
    if (name.trim().length < 2 || digits.length !== 9) { setError("Adı və 9 rəqəmli mobil nömrəni yoxlayın."); setSuccess(""); return; }
    const nextSession = { ...session, ownerName: name.trim(), phone: formattedPhone(digits) };
    const nextProfile = { ...draft, ownerName: nextSession.ownerName, phone: nextSession.phone };
    if (!saveProfile(session.id, nextProfile)) { setError("Məlumatları saxlamaq mümkün olmadı."); return; }
    if (!updateSession(nextSession)) { saveProfile(session.id, profile); setError("Sessiya məlumatları saxlanmadı."); return; }
    setProfile(nextProfile); setDraft(nextProfile); setSuccess("Şəxsi məlumatlar yadda saxlanıldı."); setError("");
  }
  function saveContacts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = phoneDigits(draft.whatsapp);
    if (draft.whatsapp.trim() && digits.length !== 9) { setError("WhatsApp nömrəsi 9 rəqəmdən ibarət olmalıdır."); return; }
    save({ ...draft, whatsapp: digits ? formattedPhone(digits) : "", telegram: normalizeHandle(draft.telegram, "telegram") });
  }
  function saveSocial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save({ ...draft, instagram: normalizeHandle(draft.instagram, "instagram"), facebook: normalizeHandle(draft.facebook, "facebook"), tiktok: normalizeHandle(draft.tiktok, "tiktok"), linkedin: normalizeHandle(draft.linkedin, "linkedin") });
  }
  function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { setError("PNG, JPG və ya WebP formatında, 1 MB-dan kiçik şəkil seçin."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") save({ ...profile, avatar: reader.result }, "Profil şəkli yadda saxlanıldı."); };
    reader.onerror = () => setError("Şəkli oxumaq mümkün olmadı.");
    reader.readAsDataURL(file);
  }
  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-5 sm:px-7 sm:py-7">
    <BusinessHeaderPortal slot="title">İstifadəçi Profili & Tənzimləmələr</BusinessHeaderPortal>
    <ProfileIdentityBanner session={session} profile={profile} fileInput={fileInput} onRemoveAvatar={() => save({ ...profile, avatar: "" }, "Profil şəkli silindi.")} onUploadAvatar={uploadAvatar} />
    <BusinessTabNav label="Profil bölmələri">{tabs.map((item) => <NavLink key={item.id} to={`/business/profile/${item.id}`} onClick={() => { setError(""); setSuccess(""); setDraft(profile); }} className={({ isActive }) => businessTabClass(isActive)}>{item.title}</NavLink>)}</BusinessTabNav>
    <Notice error={error} success={success} />
    {tab === "personal" && <PersonalProfileForm name={name} phone={phone} email={session.email} draft={draft} onNameChange={setName} onPhoneChange={setPhone} onChange={change} onSubmit={savePersonal} />}
    {tab === "startpage" && <form onSubmit={(event) => { event.preventDefault(); save(draft, "Başlanğıc səhifə yadda saxlanıldı."); }} className={`${card} space-y-4`}><div><h3 className="font-bold">Giriş zamanı başlanğıc modul</h3><p className="mt-1 text-xs text-slate-500">Girişdən sonra açılacaq bölməni seçin.</p></div><div className="grid gap-2 sm:grid-cols-2">{([{ id: "business", title: "Biznes modulu", detail: "Bizneslər və filiallar" }, { id: "profile", title: "Sadəcə profil", detail: "Şəxsi məlumatlar və tənzimləmələr" }] as const).map((item) => <label key={item.id} className={`flex min-h-20 cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 ${draft.startView === item.id ? "border-[#101114] bg-amber-50" : "border-slate-200 bg-slate-50"}`}><span><strong className="block text-sm">{item.title}</strong><span className="text-xs text-slate-500">{item.detail}</span></span><input type="radio" name="startView" checked={draft.startView === item.id} onChange={() => change("startView", item.id)} className="size-4 accent-[#101114]" /></label>)}</div><div className="flex justify-end"><SaveButton title="Parametrləri yadda saxla" /></div></form>}
    {tab === "messengers" && <form onSubmit={saveContacts} className={`${card} space-y-4`}><div><h3 className="font-bold">Mesencerlər</h3><p className="mt-1 text-xs text-slate-500">Müştərilərlə əlaqə üçün kontaktlar</p></div><div className="grid gap-4 sm:grid-cols-2"><Field title="WhatsApp nömrəsi"><input type="tel" inputMode="tel" value={draft.whatsapp} onChange={(event) => change("whatsapp", event.target.value)} className={field} placeholder="+994 50 000-00-00" /></Field><Field title="Telegram istifadəçi adı"><input value={draft.telegram} onChange={(event) => change("telegram", event.target.value)} className={field} placeholder="istifadəçi_adı" /></Field></div><div className="flex justify-end"><SaveButton /></div></form>}
    {tab === "social" && <form onSubmit={saveSocial} className={`${card} space-y-4`}><div><h3 className="font-bold">Sosial şəbəkələr</h3><p className="mt-1 text-xs text-slate-500">Profil adları və ya linkləri daxil edin.</p></div><div className="grid gap-4 sm:grid-cols-2">{([{ key: "instagram", title: "Instagram" }, { key: "facebook", title: "Facebook" }, { key: "tiktok", title: "TikTok" }, { key: "linkedin", title: "LinkedIn" }] as const).map((item) => <Field key={item.key} title={item.title}><input value={draft[item.key]} onChange={(event) => change(item.key, event.target.value)} className={field} placeholder="istifadəçi_adı" /></Field>)}</div><div className="flex justify-end"><SaveButton /></div></form>}
    {tab === "apps" && <ConnectedAppsPanel />}
    {tab === "security" && <SecurityPanel session={session} />}
  </main>;
}
