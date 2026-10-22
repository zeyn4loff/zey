import { CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomer } from "./useCustomer";

export default function BookingsModal() {
  const { modal, closeModal, bookings, cancelBooking } = useCustomer();
  return <Dialog open={modal === "bookings"} onOpenChange={(open) => { if (!open) closeModal(); }}><DialogContent className="customer-drawer" overlayClassName="customer-overlay"><DialogHeader><DialogTitle className="text-xl font-bold">Rezervasiyalarım</DialogTitle><p className="text-xs text-slate-500">Bu brauzerdə etdiyiniz demo yazılar</p></DialogHeader><div className="min-h-0 flex-1 space-y-3 overflow-y-auto">{bookings.length ? bookings.map((booking) => <article key={booking.id} className="rounded-xl border p-4"><h3 className="font-semibold">{booking.salonName}</h3>{booking.branchName && <p className="mt-1 text-xs text-slate-500">Filial: {booking.branchName}</p>}{booking.masterName && <p className="mt-1 text-xs text-slate-500">Usta: {booking.masterName}</p>}<p className="mt-1 text-sm text-slate-600">{booking.service} · {booking.date || "Tarix seçilməyib"} · {booking.time}</p><button type="button" onClick={() => cancelBooking(booking.id)} className="mt-3 text-xs font-semibold text-red-600">Yazını ləğv et</button></article>) : <div className="py-10 text-center text-slate-500"><CalendarDays className="mx-auto mb-3" /><p className="text-sm">Hələ heç bir rezervasiyanız yoxdur.</p></div>}</div></DialogContent></Dialog>;
}

