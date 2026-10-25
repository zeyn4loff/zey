import { type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Branch, Business } from "../directory/businesses";
import { type Resource, type ResourceCategory, statusLabels, typeLabels, type ResourceStatus, type ResourceType } from "./resources";

const fieldClass = "mt-1.5 h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40";

export function ResourceFormDialog({ initial, categories, businesses, defaultCategoryId = "", defaultBranchId = "", onClose, onSave }: { initial?: Resource; categories: ResourceCategory[]; businesses: Business[]; defaultCategoryId?: string; defaultBranchId?: string; onClose: () => void; onSave: (resource: Resource) => void }) {
  const branches = businesses.flatMap((business) => business.branches.map((branch: Branch) => ({ id: branch.id, label: `${branch.name} · ${business.name}` })));
  if (initial?.branchId && !branches.some((branch) => branch.id === initial.branchId)) branches.push({ id: initial.branchId, label: "Əvvəlki filial" });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    onSave({ id: initial?.id ?? crypto.randomUUID(), name, type: String(data.get("type")) as ResourceType, status: String(data.get("status")) as ResourceStatus, branchId: String(data.get("branchId") || ""), categoryId: String(data.get("categoryId") || ""), notes: String(data.get("notes") || "").trim() });
  }
  return <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}><DialogContent showCloseButton={false} className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-xl overflow-y-auto rounded-3xl p-5 sm:p-7">
    <div className="flex items-start justify-between gap-3"><div><DialogTitle className="text-xl font-bold">{initial ? "Resursu redaktə et" : "Yeni resurs"}</DialogTitle><p className="mt-1 text-sm text-slate-500">İş yeri, otaq və ya cihaz məlumatları</p></div><button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600">×</button></div>
    <form onSubmit={submit} className="space-y-4 text-sm">
      <label className="block font-semibold">Resursun adı *<input name="name" required maxLength={100} autoFocus defaultValue={initial?.name} placeholder="Məs: Kreslo #1" className={fieldClass} /></label>
      <div className="grid grid-cols-2 gap-3"><label className="block font-semibold">Növ<select name="type" defaultValue={initial?.type ?? "chair"} className={fieldClass}>{(Object.keys(typeLabels) as ResourceType[]).map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}</select></label><label className="block font-semibold">Status<select name="status" defaultValue={initial?.status ?? "active"} className={fieldClass}>{(Object.keys(statusLabels) as ResourceStatus[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label></div>
      <label className="block font-semibold">Filial<select name="branchId" defaultValue={initial?.branchId ?? (defaultBranchId || branches[0]?.id || "")} className={fieldClass}><option value="">Filiala bağlı deyil</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.label}</option>)}</select></label>
      <label className="block font-semibold">Kateqoriya<select name="categoryId" defaultValue={initial?.categoryId ?? defaultCategoryId} className={fieldClass}><option value="">Kateqoriyasız</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label className="block font-semibold">Qeydlər<textarea name="notes" defaultValue={initial?.notes} maxLength={500} rows={3} placeholder="İstəyə bağlı" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40" /></label>
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">Resurs məlumatlarını tamamlayın.</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 font-semibold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 font-bold">Yadda saxla</button></div>
    </form>
  </DialogContent></Dialog>;
}

export function CategoryFormDialog({ initial, onClose, onSave }: { initial?: ResourceCategory; onClose: () => void; onSave: (category: ResourceCategory) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    if (!name) return;
    onSave({ id: initial?.id ?? crypto.randomUUID(), name, description: String(data.get("description") || "").trim() });
  }
  return <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}><DialogContent showCloseButton={false} className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-lg overflow-y-auto rounded-3xl p-5 sm:p-7">
    <div className="flex items-start justify-between gap-3"><DialogTitle className="text-xl font-bold">{initial ? "Kateqoriyanı redaktə et" : "Yeni kateqoriya"}</DialogTitle><button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600">×</button></div>
    <form onSubmit={submit} className="space-y-4 text-sm"><label className="block font-semibold">Kateqoriyanın adı *<input name="name" required maxLength={100} autoFocus defaultValue={initial?.name} className={fieldClass} /></label><label className="block font-semibold">Təsvir<textarea name="description" defaultValue={initial?.description} maxLength={300} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40" /></label><div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 font-semibold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 font-bold">Yadda saxla</button></div></form>
  </DialogContent></Dialog>;
}
