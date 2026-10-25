import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Branch, Business } from "./businesses";
import { categories } from "@/features/marketplace/data";

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-yellow-primary/40";

export function BusinessFormDialog({ open, initial, onClose, onSave }: { open: boolean; initial?: Business; onClose: () => void; onSave: (value: Business) => void }) {
  const [type, setType] = useState<Business["type"]>(initial?.type ?? "business");
  const [topCategory, setTopCategory] = useState(initial?.topCategory ?? (initial?.id === "biz_dentestet" ? "health" : "beauty"));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    onSave({ id: initial?.id ?? crypto.randomUUID(), type, name, description: String(data.get("description") || "").trim(), topCategory, category: String(data.get("category") || ""), image: String(data.get("image") || "").trim(), branches: initial?.branches ?? [] });
  }
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-7" showCloseButton={false}>
      <div className="flex items-start justify-between gap-3"><div><DialogTitle className="text-xl font-bold">{initial ? "Məlumatları redaktə et" : "Yeni biznes və ya fərdi usta"}</DialogTitle><p className="mt-1 text-sm text-slate-500">Biznes məlumatlarını daxil edin.</p></div><button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600">×</button></div>
      <form onSubmit={submit} className="space-y-4">
        <fieldset><legend className="mb-2 text-sm font-semibold">Profil növü</legend><div className="grid grid-cols-2 gap-2">{(["business", "individual"] as const).map((value) => <label key={value} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-semibold ${type === value ? "border-yellow-primary bg-yellow-primary" : "border-slate-200 bg-slate-50"}`}><input type="radio" name="type" value={value} checked={type === value} onChange={() => setType(value)} className="sr-only" />{value === "business" ? "Biznes" : "Fərdi usta"}</label>)}</div></fieldset>
        <label className="block text-sm font-semibold">{type === "business" ? "Biznesin adı" : "Ustanın adı"}<input name="name" defaultValue={initial?.name} required maxLength={100} autoFocus className={inputClass} placeholder={type === "business" ? "Məs: Baku Beauty Studio" : "Ad və soyad"} /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Sahə<select value={topCategory} onChange={(event) => setTopCategory(event.target.value)} className={inputClass}>{categories.map((item) => <option key={item.id} value={item.id}>{item.azName}</option>)}</select></label><label className="block text-sm font-semibold">İxtisas<select name="category" key={topCategory} defaultValue={initial?.topCategory === topCategory ? initial?.category : initial?.id === "biz_dentestet" ? "dental" : initial?.id === "biz_grand_barber" ? "barber" : ""} className={inputClass}><option value="">Ümumi</option>{categories.find((item) => item.id === topCategory)?.subcategories.map((item) => <option key={item.id} value={item.id}>{item.azName}</option>)}</select></label></div>
        <label className="block text-sm font-semibold">Şəkil linki<input name="image" type="url" defaultValue={initial?.image} className={inputClass} placeholder="https://..." /></label>
        <label className="block text-sm font-semibold">Qısa təsvir<textarea name="description" defaultValue={initial?.description} maxLength={500} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40" placeholder="İstəyə bağlı" /></label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 text-sm font-semibold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold">{initial ? "Yadda saxla" : "Profil yarat"}</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function BranchFormDialog({ open, initial, onClose, onSave }: { open: boolean; initial?: Branch; onClose: () => void; onSave: (value: Branch) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    onSave({ id: initial?.id ?? crypto.randomUUID(), name, city: String(data.get("city") || "").trim(), address: String(data.get("address") || "").trim(), phone: String(data.get("phone") || "").trim(), hours: String(data.get("hours") || "").trim() });
  }
  return <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
    <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-7" showCloseButton={false}>
      <div className="flex items-start justify-between gap-3"><div><DialogTitle className="text-xl font-bold">{initial ? "Filialı redaktə et" : "Filial əlavə et"}</DialogTitle><p className="mt-1 text-sm text-slate-500">Filialın əsas əlaqə məlumatları</p></div><button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600">×</button></div>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-semibold">Filialın adı<input name="name" defaultValue={initial?.name} required maxLength={100} autoFocus className={inputClass} placeholder="Məs: Mərkəz Filialı" /></label>
        <label className="block text-sm font-semibold">Şəhər<input name="city" defaultValue={initial?.city ?? "Bakı"} className={inputClass} placeholder="Bakı" /></label>
        <label className="block text-sm font-semibold">Ünvan<input name="address" defaultValue={initial?.address} className={inputClass} placeholder="Küçə və bina" /></label>
        <label className="block text-sm font-semibold">Telefon<input name="phone" type="tel" defaultValue={initial?.phone} className={inputClass} placeholder="+994 (50) 000-00-00" /></label>
        <label className="block text-sm font-semibold">İş saatları<input name="hours" defaultValue={initial?.hours} className={inputClass} placeholder="09:00 – 21:00" /></label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 text-sm font-semibold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 text-sm font-bold">Yadda saxla</button></div>
      </form>
    </DialogContent>
  </Dialog>;
}
