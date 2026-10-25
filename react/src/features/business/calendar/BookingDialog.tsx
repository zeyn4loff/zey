import { useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { type Booking, type BookingStatus } from "./bookings";
import type { Client } from "../clients/clients";
import type { Service } from "../services/services";

const inputClass = "mt-1.5 h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40";

export default function BookingDialog({ initial, businessId, branchId, date, time, masterName, masters, clients, services, onClose, onSave, onDelete }: { initial?: Booking; businessId?: string; branchId?: string; date: string; time: string; masterName?: string; masters: string[]; clients: Client[]; services: Service[]; onClose: () => void; onSave: (booking: Booking) => string | null; onDelete: (id: string) => void }) {
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [clientId, setClientId] = useState(initial?.clientId ?? clients.find((client) => client.phone && client.phone.replace(/\D/g, "") === initial?.phone?.replace(/\D/g, ""))?.id ?? "");
  const [clientName, setClientName] = useState(initial?.clientName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [serviceId, setServiceId] = useState(initial?.serviceId ?? services.find((service) => service.name === initial?.service)?.id ?? "");
  const [serviceName, setServiceName] = useState(initial?.service ?? "");
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 60);
  const [price, setPrice] = useState(initial?.price ?? 0);
  function chooseClient(id: string) { const client = clients.find((item) => item.id === id); setClientId(id); if (client) { setClientName(client.name); setPhone(client.phone); } }
  function chooseService(id: string) { const service = services.find((item) => item.id === id); setServiceId(id); if (service) { setServiceName(service.name); setDuration(service.duration); setPrice(service.price); } }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmDelete) return;
    const data = new FormData(event.currentTarget);
    const booking: Booking = {
      businessId: initial?.businessId ?? businessId,
      branchId: initial?.branchId ?? branchId,
      customerEmail: initial?.customerEmail,
      id: initial?.id ?? crypto.randomUUID(),
      clientId: clientId || undefined,
      serviceId: serviceId || undefined,
      clientName: String(data.get("clientName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      service: String(data.get("service") || "").trim(),
      masterName: String(data.get("masterName") || "").trim(),
      date: String(data.get("date") || ""),
      time: String(data.get("time") || ""),
      durationMinutes: Number(data.get("durationMinutes")),
      price: Number(data.get("price")),
      status: String(data.get("status")) as BookingStatus,
      source: initial?.source ?? "manual",
      note: String(data.get("note") || "").trim(),
    };
    const validationError = onSave(booking);
    if (validationError) setError(validationError);
  }

  return <Dialog open onOpenChange={(next) => { if (!next) onClose(); }}><DialogContent showCloseButton={false} className="grid-cols-[minmax(0,1fr)] max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-2xl overflow-x-hidden overflow-y-auto rounded-3xl p-4 sm:p-7">
    <div className="flex items-start justify-between gap-3"><div><DialogTitle className="text-xl font-bold">{initial ? "Qəbul məlumatları və idarəetmə" : "Yeni qəbul əlavə et"}</DialogTitle><p className="mt-1 text-sm text-slate-500">Müştəri, xidmət və vaxt detallarını daxil edin</p></div><button type="button" onClick={onClose} aria-label="Bağla" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-xl text-slate-600">×</button></div>
    <form onSubmit={submit} className="space-y-4 text-sm">
      <label className="block font-semibold">Müştəri bazasından seçin<select value={clientId} onChange={(event) => chooseClient(event.target.value)} className={inputClass}><option value="">Yeni və ya siyahıda olmayan müştəri</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.phone}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block font-semibold">Müştərinin adı və soyadı *<input name="clientName" required maxLength={100} autoFocus value={clientName} onChange={(event) => { setClientName(event.target.value); setClientId(""); }} placeholder="Məs: Aysel Məmmədova" className={inputClass} /></label><label className="block font-semibold">Əlaqə nömrəsi<input name="phone" type="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setClientId(""); }} placeholder="+994 (50) 000-00-00" className={inputClass} /></label></div>
      <label className="block font-semibold">Xidmət kataloqundan seçin<select value={serviceId} onChange={(event) => chooseService(event.target.value)} className={inputClass}><option value="">Digər xidmət</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.price} ₼</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block min-w-0 font-semibold">Xidmət *<input name="service" required maxLength={120} value={serviceName} onChange={(event) => { setServiceName(event.target.value); setServiceId(""); }} placeholder="Xidmətin adı" className={inputClass} /></label><label className="block min-w-0 font-semibold">Usta *<input name="masterName" required list="business-masters" maxLength={100} defaultValue={initial?.masterName ?? masterName} placeholder="Ustanın adı" className={inputClass} /><datalist id="business-masters">{masters.map((name) => <option value={name} key={name} />)}</datalist></label></div>
      <div className="grid gap-3 sm:grid-cols-3"><label className="block min-w-0 font-semibold">Tarix *<input name="date" type="date" required defaultValue={initial?.date ?? date} className={inputClass} /></label><label className="block min-w-0 font-semibold">Saat *<input name="time" type="time" required defaultValue={initial?.time ?? time} className={inputClass} /></label><label className="block min-w-0 font-semibold">Müddət *<select name="durationMinutes" value={duration} onChange={(event) => setDuration(Number(event.target.value))} className={inputClass}>{[15, 30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes} dəq</option>)}</select></label></div>
      <div className="grid gap-3 sm:grid-cols-2"><label className="block font-semibold">Qiymət (₼)<input name="price" type="number" min="0" max="100000" step="0.01" value={price} onChange={(event) => setPrice(Number(event.target.value))} className={inputClass} /></label><label className="block font-semibold">Status<select name="status" defaultValue={initial?.status ?? "Təsdiqləndi"} className={inputClass}>{(["Gözlənilir", "Təsdiqləndi", "Tamamlandı", "Ləğv edildi"] as BookingStatus[]).map((status) => <option key={status}>{status}</option>)}</select></label></div>
      <label className="block font-semibold">Qeyd<textarea name="note" defaultValue={initial?.note} rows={2} maxLength={500} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-yellow-primary/40" placeholder="İstəyə bağlı" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900">Müştəriyə avtomatik bildiriş göndərilmir.</p>
      {confirmDelete && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Bu qəbulu silmək istəyirsiniz?</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">{initial && (confirmDelete ? <button type="button" onClick={() => onDelete(initial.id)} className="min-h-11 cursor-pointer rounded-xl bg-red-600 px-5 font-bold text-white">Silməyi təsdiqlə</button> : <button type="button" onClick={() => setConfirmDelete(true)} className="min-h-11 cursor-pointer rounded-xl bg-red-50 px-5 font-semibold text-red-700 sm:mr-auto">Qəbulu sil</button>)}<button type="button" onClick={confirmDelete ? () => setConfirmDelete(false) : onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-5 font-semibold">İmtina</button>{!confirmDelete && <button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-5 font-bold">{initial ? "Yadda saxla" : "Qəbul əlavə et"}</button>}</div>
    </form>
  </DialogContent></Dialog>;
}
