import { ArrowDown, CalendarDays } from "lucide-react";
import { Link } from "react-router";

export default function BusinessHero() {
  return <section className="relative overflow-hidden rounded-[28px] bg-[#1f2024] px-5 py-10 text-white shadow-lg sm:px-9 sm:py-12 lg:px-14 lg:py-16">
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-28 size-80 rounded-full border-[54px] border-white/5 sm:size-[440px]" />
    <div className="relative max-w-2xl">
      <span className="inline-flex items-center gap-2 rounded-lg bg-yellow-primary px-3 py-1.5 text-xs font-bold text-primary"><CalendarDays size={15} /> Zeyvo Partner platforması</span>
      <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">Salonunuzu rəqəmsallaşdırın və gəlirinizi artırın</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">Gözəllik salonları, bərbərxanalar, SPA və fərdi ustalar üçün onlayn qeydiyyat, işçi cədvəli və müştəri idarəetməsi.</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="#business-inquiry" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-yellow-primary px-6 text-sm font-bold text-primary transition-colors hover:bg-yellow-300">Biznesinizi qoşun <ArrowDown size={17} /></a>
        <Link to="/business/auth" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10">Partner hesabına keç</Link>
      </div>
    </div>
  </section>;
}
