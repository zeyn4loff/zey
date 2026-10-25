import { useState } from "react";
import { Link, Navigate } from "react-router";
import { ArrowLeft, Building2 } from "lucide-react";
import { BusinessLoginForm, BusinessRecoveryForm, BusinessRegisterForm } from "@/features/business/auth/BusinessAuthForms";
import { useBusinessSession } from "@/features/business/auth/useBusinessSession";
import { readProfile } from "@/features/business/profile/profile";

type AuthMode = "login" | "register" | "forgot";

export default function BusinessAuthPage() {
  const { session, startSession } = useBusinessSession();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");

  if (session) return <Navigate to={readProfile(session).startView === "profile" ? "/business/profile/personal" : "/business"} replace />;

  function changeMode(next: AuthMode) {
    setMode(next);
    setError("");
  }

  return <div className="min-h-screen bg-[#f4f5f8] text-primary">
    <header className="border-b border-yellow-300 bg-yellow-primary">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="text-xl font-black tracking-tight">zeyvo <span className="text-sm font-bold">Partner</span></Link>
        <Link to="/for-business" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold sm:text-sm"><ArrowLeft size={16} />Partnyor səhifəsi</Link>
      </div>
    </header>

    <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-yellow-primary shadow-sm"><Building2 size={28} /></div>
      <h1 className="text-center text-2xl font-black tracking-tight sm:text-3xl">Zeyvo Partner</h1>
      <p className="mt-2 max-w-md text-center text-sm leading-6 text-slate-500">Biznes hesabınızdan salonunuzu və gündəlik işlərinizi idarə edin.</p>

      <section className="mt-7 w-full max-w-[530px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-label="Partner hesabı">
        <>
          {mode !== "forgot" && <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Partner hesabı">
            <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => changeMode("login")} className={`min-h-11 cursor-pointer rounded-lg text-sm font-bold transition-colors ${mode === "login" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"}`}>Daxil ol</button>
            <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => changeMode("register")} className={`min-h-11 cursor-pointer rounded-lg text-sm font-bold transition-colors ${mode === "register" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"}`}>Qeydiyyat</button>
          </div>}
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {mode === "login" && <BusinessLoginForm onStart={startSession} onError={setError} onForgot={() => changeMode("forgot")} />}
          {mode === "register" && <BusinessRegisterForm onStart={startSession} onError={setError} />}
          {mode === "forgot" && <BusinessRecoveryForm onBack={() => changeMode("login")} />}
        </>
      </section>
      <div className="mt-5 flex gap-5 text-xs text-slate-500"><Link to="/terms" className="hover:underline">Şərtlər</Link><Link to="/privacy" className="hover:underline">Məxfilik</Link></div>
    </main>
  </div>;
}
