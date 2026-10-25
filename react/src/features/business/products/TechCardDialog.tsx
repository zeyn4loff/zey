import { useState, type FormEvent } from "react";
import BusinessFormDialog from "../components/BusinessFormDialog";
import type { Product, TechCard } from "./products";
import type { Service } from "../services/services";
import { field } from "./ProductDialogs";

type Ingredient = { productId: string; quantity: number };

export default function TechCardDialog({ initial, products, services, onClose, onSave }: {
  initial?: TechCard;
  products: Product[];
  services: Service[];
  onClose: () => void;
  onSave: (card: TechCard) => void;
}) {
  const [items, setItems] = useState<Ingredient[]>(initial?.items?.length ? initial.items : [{ productId: initial?.productId ?? "", quantity: initial?.quantity ?? 1 }]);
  const [error, setError] = useState("");
  function patch(index: number, change: Partial<Ingredient>) {
    setItems((current) => current.map((item, position) => position === index ? { ...item, ...change } : item));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (items.some((item) => !item.productId || !Number.isFinite(item.quantity) || item.quantity <= 0) || new Set(items.map((item) => item.productId)).size !== items.length) {
      setError("Məhsulları və miqdarları yoxlayın.");
      return;
    }
    onSave({ id: initial?.id ?? crypto.randomUUID(), name: String(form.get("name")).trim(), serviceId: String(form.get("serviceId")), productId: items[0].productId, quantity: items[0].quantity, items, note: String(form.get("note") ?? "").trim() });
  }
  return <BusinessFormDialog size="medium" title={initial ? "Texnoloji kartı redaktə et" : "Yeni texnoloji kart"} onClose={onClose}>
    <form onSubmit={submit} className="space-y-4 text-sm">
      <label className="block font-semibold">Kartın adı *<input name="name" required maxLength={120} defaultValue={initial?.name} className={field} /></label>
      <label className="block font-semibold">Xidmət<select name="serviceId" defaultValue={initial?.serviceId ?? ""} className={field}><option value="">Xidmətə bağlanmayıb</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
      <div className="space-y-2"><p className="font-semibold">İstifadə olunan məhsullar</p>{items.map((item, index) => <div key={index} className="grid min-w-0 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_110px_auto]">
        <label className="min-w-0 font-semibold">Məhsul<select required value={item.productId} onChange={(event) => patch(index, { productId: event.target.value })} className={field}><option value="" disabled>Seçin</option>{products.filter((product) => product.id === item.productId || !items.some((selected) => selected.productId === product.id)).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
        <label className="font-semibold">Miqdar<input required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => patch(index, { quantity: Number(event.target.value) })} className={field} /></label>
        <button type="button" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, position) => position !== index))} className="min-h-11 cursor-pointer self-end rounded-xl bg-rose-50 px-3 font-bold text-rose-700 disabled:opacity-40">Sil</button>
      </div>)}</div>
      <button type="button" disabled={items.length >= products.length} onClick={() => setItems((current) => [...current, { productId: "", quantity: 1 }])} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4 font-bold disabled:opacity-40">+ Məhsul əlavə et</button>
      <label className="block font-semibold">Qeyd<input name="note" maxLength={300} defaultValue={initial?.note} className={field} /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 font-semibold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 font-bold">Yadda saxla</button></div>
    </form>
  </BusinessFormDialog>;
}
