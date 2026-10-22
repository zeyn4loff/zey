import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomer } from "./useCustomer";
import type { Customer } from "./CustomerContext";
import { fieldClass, primaryClass } from "./styles";
import PhoneField from "./PhoneField";
import LegalModal from "./LegalModal";

export default function AuthModal() {
  const { modal, closeModal, login } = useCustomer();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy" | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "").trim();
    const phoneDisplay = String(form.get("phone") || "");
    const phone = phoneDisplay.replace(/\D/g, "");
    if (password.length < 6) return setError("Şifrə ən azı 6 simvol olmalıdır.");
    if (mode === "register") {
      if (name.length < 2) return setError("Ad və soyadınızı daxil edin.");
      if (phone.length !== 9) return setError("9 rəqəmli mobil nömrə daxil edin.");
      if (password !== form.get("confirm")) return setError("Şifrələr uyğun gəlmir.");
      if (!form.get("terms")) return setError("Davam etmək üçün şərtləri qəbul edin.");
    }
    const next: Customer = { name: mode === "register" ? name : email.split("@")[0], email, phone: mode === "register" ? `+994 ${phoneDisplay}` : "", city: "Bakı" };
    setError("");
    login(next);
  }
  return <><Dialog open={modal === "auth"} onOpenChange={(open) => { if (!open) { closeModal(); setError(""); setForgot(false); setLegalTab(null); } }}>
    <DialogContent className="customer-modal max-h-[90vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-3xl border-0 p-6 shadow-2xl sm:max-w-md" overlayClassName="customer-overlay">
      <DialogHeader><DialogTitle className="text-lg font-bold">{forgot ? "Şifrəni bərpa et" : mode === "login" ? "Zeyvo-ya daxil ol" : "Yeni hesab yarat"}</DialogTitle>
        <p className="text-xs text-slate-500">{forgot ? "Bərpa üçün dəstək xidmətimizlə əlaqə saxlayın." : "Hazırda giriş lokal demo rejimində işləyir."}</p>
      </DialogHeader>
      {forgot ? <div className="space-y-4 text-sm"><p>Elektron poçt göndərilməsi hələ qoşulmayıb. Hesabınızı bərpa etmək üçün dəstək xidmətinə müraciət edin.</p><button type="button" onClick={() => setForgot(false)} className="font-semibold underline">Girişə qayıt</button></div> : <>
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold"><button type="button" onClick={() => { setMode("login"); setError(""); }} className={`flex-1 rounded-lg py-2 ${mode === "login" ? "bg-white shadow-sm" : ""}`}>Daxil ol</button><button type="button" onClick={() => { setMode("register"); setError(""); }} className={`flex-1 rounded-lg py-2 ${mode === "register" ? "bg-white shadow-sm" : ""}`}>Qeydiyyat</button></div>
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && <><label className="block space-y-1 text-xs font-semibold">Ad və soyad<input name="name" autoComplete="name" required className={fieldClass} placeholder="Əli Əliyev" /></label><PhoneField /></>}
          <label className="block space-y-1 text-xs font-semibold">E-poçt<input name="email" type="email" autoComplete="email" required className={fieldClass} placeholder="ad@domain.com" /></label>
          <label className="block space-y-1 text-xs font-semibold">Şifrə<div className="relative"><input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required className={`${fieldClass} pr-10`} placeholder="Minimum 6 simvol" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {mode === "register" ? <><label className="block space-y-1 text-xs font-semibold">Şifrənin təkrarı<input name="confirm" type="password" autoComplete="new-password" minLength={6} required className={fieldClass} /></label><div className="flex items-start gap-2 text-xs text-slate-600"><input id="auth-terms" name="terms" type="checkbox" className="mt-0.5 accent-yellow-primary" /><span><label htmlFor="auth-terms">Demo məlumatlarının brauzerdə saxlanmasına və </label><button type="button" onClick={() => setLegalTab("terms")} className="font-semibold text-primary underline">Şərtlər</button><span> və </span><button type="button" onClick={() => setLegalTab("privacy")} className="font-semibold text-primary underline">Məxfilik</button><span> məlumatlarına razıyam.</span></span></div></> : <button type="button" onClick={() => setForgot(true)} className="text-xs font-semibold underline">Şifrəni unutmusunuz?</button>}
          <button type="submit" className={primaryClass}>{mode === "login" ? "Daxil ol" : "Qeydiyyatı tamamla"}<ArrowRight size={16} /></button>
        </form>
        {mode === "login" && <button type="button" onClick={() => login({ name: "Demo istifadəçi", email: "demo@zeyvo.az", phone: "", city: "Bakı" })} className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold">Demo giriş</button>}
      </>}
    </DialogContent>
  </Dialog><LegalModal tab={legalTab} onTabChange={setLegalTab} /></>;
}

