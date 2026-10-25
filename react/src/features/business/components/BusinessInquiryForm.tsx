import { useState, type FormEvent } from "react";
import { formatPhone } from "@/lib/formatPhone";
import { saveBusinessInquiry } from "../inquiry";

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-primary outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-yellow-primary/40";

export default function BusinessInquiryForm() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const businessName = String(data.get("businessName") || "").trim();
    const contactName = String(data.get("contactName") || "").trim();
    const digits = phone.replace(/\D/g, "");

    if (businessName.length < 2 || contactName.length < 2 || digits.length !== 9) {
      setMessage({ text: "Adları və 9 rəqəmli mobil nömrəni yoxlayın.", error: true });
      return;
    }

    if (!saveBusinessInquiry({ businessName, contactName, phone: `+994 ${formatPhone(digits)}` })) {
      setMessage({ text: "Məlumatları bu brauzerdə saxlamaq mümkün olmadı.", error: true });
      return;
    }

    form.reset();
    setPhone("");
    setMessage({ text: "Müraciət qaralama kimi yadda saxlanıldı.", error: false });
  }

  return <section id="business-inquiry" className="mx-auto w-full max-w-2xl scroll-mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
    <h2 className="text-2xl font-black tracking-tight text-primary sm:text-3xl">Biznesinizi qoşun</h2>
    <p className="mt-2 text-sm leading-6 text-slate-500">Məkanınız haqqında əsas məlumatları qeyd edin.</p>
    <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Müraciət burada qaralama kimi saxlanılır.</p>

    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      <label className="block text-sm font-semibold text-primary">Salon və ya obyektin adı
        <input name="businessName" type="text" autoComplete="organization" required minLength={2} placeholder="Məs: Diamond Beauty Studio" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-primary">Əlaqədar şəxsin adı
        <input name="contactName" type="text" autoComplete="name" required minLength={2} placeholder="Adınız və soyadınız" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-primary">Telefon nömrəniz
        <span className="mt-1.5 flex h-11 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-yellow-primary/40">
          <span aria-hidden="true" className="flex shrink-0 items-center border-r border-slate-200 bg-slate-100 px-3 text-sm font-bold">🇦🇿 +994</span>
          <input name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="(50) 000-00-00" className="min-w-0 flex-1 bg-transparent px-3 text-sm text-primary outline-none" />
        </span>
      </label>
      {message && <p role={message.error ? "alert" : "status"} className={`rounded-xl px-3 py-2 text-sm font-medium ${message.error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{message.text}</p>}
      <button type="submit" className="min-h-12 w-full cursor-pointer rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-slate-700">Müraciəti saxla</button>
    </form>
  </section>;
}
