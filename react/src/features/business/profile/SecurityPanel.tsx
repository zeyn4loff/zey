import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { useBusinessSession } from "../auth/useBusinessSession";
import { changeBusinessPassword, deleteBusinessAccount } from "../auth/businessCredentials";
import BusinessDeleteDialog from "../components/BusinessDeleteDialog";

const passwordFields = [
  { name: "current", label: "Hazırkı şifrə", placeholder: "••••••••", autoComplete: "current-password" },
  { name: "next", label: "Yeni şifrə", placeholder: "Ən azı 6 simvol", autoComplete: "new-password" },
  { name: "confirm", label: "Yeni şifrə təkrarı", placeholder: "••••••••", autoComplete: "new-password" },
] as const;

export default function SecurityPanel({ session }: { session: BusinessSession }) {
  const { endSession } = useBusinessSession();
  const navigate = useNavigate();
  const [visible, setVisible] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const current = String(values.get("current") ?? "");
    const next = String(values.get("next") ?? "");
    const confirm = String(values.get("confirm") ?? "");
    if (next.length < 6) return setError("Yeni şifrə ən azı 6 simvol olmalıdır.");
    if (next !== confirm) return setError("Yeni şifrələr uyğun gəlmir.");
    if (!await changeBusinessPassword(session, current, next)) return setError("Hazırkı şifrə yanlışdır və ya dəyişiklik saxlanmadı.");
    form.reset();
    setError("");
    setSuccess("Şifrə yeniləndi.");
  }

  function removeProfile() {
    if (!deleteBusinessAccount(session)) { setError("Profili silmək mümkün olmadı."); setDeleting(false); return; }
    endSession();
    navigate("/business/auth", { replace: true });
  }

  return <div className="space-y-4">
    <form onSubmit={updatePassword} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-3">
        <h2 className="text-sm font-bold">Şifrənin Yenilənməsi</h2>
        <p className="mt-1 text-xs font-medium text-slate-400">Kabinetə giriş təhlükəsizliyini təmin etmək üçün mütəmadi şifrəni yeniləyin</p>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-3">
        {passwordFields.map((item) => <label key={item.name} className="block min-w-0 text-xs font-bold text-slate-500">
          {item.label}
          <span className="mt-1 flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-yellow-primary/40">
            <input name={item.name} type={visible.includes(item.name) ? "text" : "password"} autoComplete={item.autoComplete} placeholder={item.placeholder} required minLength={item.name === "current" ? undefined : 6} className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none placeholder:text-slate-400" />
            <button type="button" aria-label={`${item.label}: ${visible.includes(item.name) ? "gizlət" : "göstər"}`} onClick={() => setVisible((items) => items.includes(item.name) ? items.filter((name) => name !== item.name) : [...items, item.name])} className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200">
              {visible.includes(item.name) ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>)}
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
      <div className="flex justify-end pt-2">
        <button type="submit" className="min-h-11 w-full cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold hover:bg-yellow-300 sm:w-auto">Şifrəni yenilə</button>
      </div>
    </form>

    <section className="rounded-2xl border border-rose-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-bold text-rose-600">Profili sil</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">Profil və ona bağlı bütün biznes məlumatları silinəcək.</p>
        </div>
        <button type="button" onClick={() => setDeleting(true)} className="min-h-11 shrink-0 cursor-pointer rounded-xl border border-rose-200 bg-rose-50 px-5 text-xs font-bold text-rose-600 hover:bg-rose-100">Profili sil</button>
      </div>
    </section>
    {deleting && <BusinessDeleteDialog name={session.businessName} detail="Profil, xidmətlər, müştərilər və qəbullar silinəcək. Bu əməliyyatı geri qaytarmaq mümkün deyil." onClose={() => setDeleting(false)} onDelete={removeProfile} />}
  </div>;
}
