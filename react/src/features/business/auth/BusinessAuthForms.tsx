import { useState, type FormEvent } from "react";
import { ArrowRight, Building2, Mail, UserRound } from "lucide-react";
import { formatPhone } from "@/lib/formatPhone";
import type { BusinessSession } from "./businessSession";
import { businessEmailExists, createBusinessAccount, signInBusiness } from "./businessCredentials";
import { BusinessAuthField, BusinessPasswordField } from "./BusinessAuthFields";

interface LoginProps {
  onStart: (session: BusinessSession, remember: boolean) => void;
  onError: (message: string) => void;
  onForgot: () => void;
}

export function BusinessLoginForm({ onStart, onError, onForgot }: LoginProps) {
  const [remember, setRemember] = useState(true);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const session = await signInBusiness(email, password);
    if (!session) return onError("E-poçt və ya şifrə yanlışdır.");
    onStart(session, remember);
  }

  return <form onSubmit={submit} className="space-y-4">
    <BusinessAuthField label="İş e-poçt ünvanı" icon={Mail} name="email" type="email" autoComplete="username" required placeholder="salon@domain.com" />
    <BusinessPasswordField name="password" autoComplete="current-password" required minLength={6} placeholder="••••••••" />
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      <label className="flex cursor-pointer items-center gap-2 text-slate-600"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 accent-yellow-primary" />Məni yadda saxla</label>
      <button type="button" onClick={onForgot} className="cursor-pointer font-semibold text-primary hover:underline">Şifrəni unutmusunuz?</button>
    </div>
    <button type="submit" className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-primary px-4 text-sm font-bold text-primary hover:bg-yellow-300">Zeyvo Partner-ə daxil ol <ArrowRight size={17} /></button>
  </form>;
}

interface RegisterProps {
  onStart: (session: BusinessSession, remember: boolean) => void;
  onError: (message: string) => void;
}

export function BusinessRegisterForm({ onStart, onError }: RegisterProps) {
  const [phone, setPhone] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ownerName = String(data.get("ownerName") || "").trim();
    const businessName = String(data.get("businessName") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const digits = phone.replace(/\D/g, "");
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (ownerName.length < 2 || businessName.length < 2 || !email.includes("@") || digits.length !== 9) {
      onError("Adları, e-poçtu və 9 rəqəmli mobil nömrəni yoxlayın.");
      return;
    }
    if (password.length < 6) return onError("Şifrə ən azı 6 simvol olmalıdır.");
    if (password !== confirm) return onError("Şifrələr uyğun gəlmir.");
    if (businessEmailExists(email)) return onError("Bu e-poçt artıq qeydiyyatdan keçib.");
    const session: BusinessSession = { id: crypto.randomUUID(), ownerName, businessName, email, phone: `+994 ${formatPhone(digits)}`, kind: "demo" };
    if (!await createBusinessAccount(session, password)) return onError("Hesabı yaratmaq mümkün olmadı.");
    onStart(session, true);
  }

  return <form onSubmit={submit} className="space-y-4" noValidate>
    <BusinessAuthField label="Ad və soyad" icon={UserRound} name="ownerName" type="text" autoComplete="name" required minLength={2} placeholder="Məs: Əli Əliyev" />
    <BusinessAuthField label="Salon və ya obyektin adı" icon={Building2} name="businessName" type="text" autoComplete="organization" required minLength={2} placeholder="Məs: Baku Beauty Studio" />
    <label className="block space-y-1.5 text-sm font-semibold text-slate-700"><span>Mobil nömrə</span><span className="flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-primary focus-within:ring-2 focus-within:ring-yellow-primary/40"><span className="flex shrink-0 items-center border-r border-slate-200 bg-slate-100 px-3 font-bold" aria-hidden="true">🇦🇿 +994</span><input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(50) 000-00-00" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label>
    <BusinessAuthField label="İş e-poçt ünvanı" icon={Mail} name="email" type="email" autoComplete="email" required placeholder="salon@domain.com" />
    <BusinessPasswordField name="password" autoComplete="new-password" required minLength={6} placeholder="Ən azı 6 simvol" />
    <BusinessPasswordField label="Şifrənin təkrarı" name="confirm" autoComplete="new-password" required minLength={6} placeholder="Şifrəni təkrarlayın" />
    <button type="submit" className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-yellow-primary px-4 text-sm font-bold text-primary hover:bg-yellow-300">Profil yarat <ArrowRight size={17} /></button>
  </form>;
}

export function BusinessRecoveryForm({ onBack }: { onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  return <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }} className="space-y-4">
    <div><h2 className="text-lg font-bold text-primary">Şifrənin bərpası</h2><p className="mt-1 text-sm text-slate-500">İş e-poçt ünvanınızı daxil edin.</p></div>
    <BusinessAuthField label="İş e-poçtu" icon={Mail} name="email" type="email" autoComplete="email" required placeholder="salon@domain.com" />
    {submitted && <p role="status" className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">Şifrəni bərpa etmək üçün dəstək xidməti ilə əlaqə saxlayın.</p>}
    <button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-4 text-sm font-bold text-primary hover:bg-yellow-300">Davam et</button>
    <button type="button" onClick={onBack} className="w-full cursor-pointer py-2 text-sm font-semibold text-slate-500 hover:text-primary">Girişə qayıt</button>
  </form>;
}
