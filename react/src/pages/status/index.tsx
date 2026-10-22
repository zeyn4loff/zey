import { Link } from "react-router";

export default function StatusPage() {
  return <div className="container mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold">Səhifə tapılmadı</h1><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Axtardığınız səhifə mövcud deyil.</p><Link to="/" className="mt-5 inline-flex rounded-xl bg-yellow-primary px-5 py-2.5 text-sm font-semibold">Əsas səhifəyə qayıt</Link></div>;
}
