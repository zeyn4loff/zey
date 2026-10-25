import { useState } from "react";
import { Clock3, Pencil, Search } from "lucide-react";
import type { Booking, BookingStatus } from "./bookings";
import { bookingColor, type CalendarAppearance } from "./calendarAppearance";
import { minutes, prettyDate, weekDates } from "./calendarDates";

export type CalendarView = "daily" | "weekly" | "pending";
export type EditingBooking = { booking?: Booking; date: string; time: string; masterName?: string };

const statusClass: Record<BookingStatus, string> = {
  "Gözlənilir": "bg-amber-100 text-amber-900",
  "Təsdiqləndi": "bg-blue-100 text-blue-800",
  "Tamamlandı": "bg-emerald-100 text-emerald-800",
  "Ləğv edildi": "bg-slate-100 text-slate-500",
};

type BookingActions = {
  onEdit: (booking: Booking) => void;
  onStatus: (id: string, status: BookingStatus) => void;
};

function BookingCard({ booking, appearance, onEdit, onStatus }: { booking: Booking; appearance: CalendarAppearance } & BookingActions) {
  return (
    <article className="rounded-xl border border-slate-200 border-l-4 bg-white p-3 shadow-sm" style={{ borderLeftColor: bookingColor(booking, appearance) }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="break-words text-sm">{booking.clientName}</strong>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass[booking.status]}`}>{booking.status}</span>
          </div>
          <p className="mt-1 break-words text-xs text-slate-600">{booking.service} · {booking.masterName}</p>
          <p className="mt-1 text-xs font-semibold text-slate-600">{booking.time} · {booking.durationMinutes} dəq · {booking.price} ₼</p>
        </div>
        <button type="button" onClick={() => onEdit(booking)} aria-label={`${booking.clientName} qəbulunu redaktə et`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"><Pencil size={16} /></button>
      </div>
      {booking.source === "online" && <p className="mt-2 text-[11px] font-semibold text-amber-700">Onlayn müraciət</p>}
      {booking.status === "Gözlənilir" && <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => onStatus(booking.id, "Təsdiqləndi")} className="min-h-9 cursor-pointer rounded-lg bg-yellow-primary px-3 text-xs font-bold">Təsdiq et</button>
        <button type="button" onClick={() => onStatus(booking.id, "Ləğv edildi")} className="min-h-9 cursor-pointer rounded-lg bg-slate-100 px-3 text-xs font-semibold">Ləğv et</button>
      </div>}
    </article>
  );
}

export function DailyView({ date, bookings, masters, appearance, onEdit, onStatus, onCreate }: { date: string; bookings: Booking[]; masters: string[]; appearance: CalendarAppearance; onCreate: (time: string, masterName: string) => void } & BookingActions) {
  const gridStyle = { minWidth: 72 + masters.length * 160, gridTemplateColumns: `72px repeat(${masters.length}, minmax(160px, 1fr))` };
  return <section className="space-y-3">
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <h2 className="text-sm font-bold">{prettyDate(date)} · Günlük qəbullar</h2>
      <div className="space-y-2 lg:hidden">{bookings.map((booking) => <BookingCard key={booking.id} booking={booking} appearance={appearance} onEdit={onEdit} onStatus={onStatus} />)}{!bookings.length && <p className="py-8 text-center text-sm text-slate-500">Bu tarixdə qəbul yoxdur.</p>}</div>
      <div className="hidden max-h-[690px] overflow-auto rounded-xl border border-slate-200 lg:block">
        <div className="sticky top-0 z-10 grid bg-slate-50 text-xs font-bold" style={gridStyle}><span className="border-r border-slate-200 p-3">Saat</span>{masters.map((name) => <span key={name} className="border-r border-slate-200 p-3">{name}</span>)}</div>
        <div className="grid" style={gridStyle}>
          <div>{Array.from({ length: 14 }, (_, index) => <div key={index} className="h-16 border-r border-t border-slate-100 p-2 text-xs text-slate-400">{String(index + 8).padStart(2, "0")}:00</div>)}</div>
          {masters.map((name) => <div key={name} className="relative border-r border-slate-200" style={{ height: 14 * 64 }}>
            <div className="absolute inset-0">{Array.from({ length: 14 }, (_, index) => {
              const time = `${String(index + 8).padStart(2, "0")}:00`;
              return <button key={index} type="button" onClick={() => onCreate(time, name)} aria-label={`${name} üçün ${time} qəbul əlavə et`} className="group block h-16 w-full cursor-pointer border-t border-slate-100 text-center text-[11px] font-semibold text-amber-800 hover:bg-amber-50 focus-visible:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-400"><span className="opacity-50 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">+ Qəbul</span></button>;
            })}</div>
            {bookings.filter((booking) => booking.masterName === name && minutes(booking.time) >= 480 && minutes(booking.time) < 1320).map((booking) => <button key={booking.id} type="button" onClick={() => onEdit(booking)} style={{ top: `${(minutes(booking.time) - 480) / 60 * 64}px`, height: `${Math.max(34, booking.durationMinutes / 60 * 64)}px`, borderColor: bookingColor(booking, appearance), backgroundColor: `${bookingColor(booking, appearance)}66` }} className={`absolute inset-x-1 z-[1] overflow-hidden rounded-lg border p-1.5 text-left text-[11px] ${booking.status === "Ləğv edildi" ? "opacity-45" : ""}`}><strong className="block truncate">{booking.time} {booking.clientName}</strong><span className="block truncate">{booking.service}</span></button>)}
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}

export function WeeklyView({ date, bookings, appearance, onSelectDay, onEdit }: { date: string; bookings: Booking[]; appearance: CalendarAppearance; onSelectDay: (date: string) => void; onEdit: (booking: Booking) => void }) {
  const week = weekDates(date);
  return <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
    <h2 className="mb-3 text-sm font-bold">{prettyDate(week[0])} – {prettyDate(week[6])}</h2>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">{week.map((day) => {
      const dayBookings = bookings.filter((booking) => booking.date === day).sort((a, b) => a.time.localeCompare(b.time));
      return <div key={day} className={`min-w-0 rounded-xl border p-2.5 ${day === date ? "border-yellow-primary bg-amber-50/40" : "border-slate-200"}`}>
        <button type="button" onClick={() => onSelectDay(day)} className="mb-2 w-full cursor-pointer text-left text-xs font-bold hover:underline">{prettyDate(day, true)} <span className="text-slate-400">({dayBookings.length})</span></button>
        <div className="space-y-1.5">{dayBookings.map((booking) => <button key={booking.id} type="button" onClick={() => onEdit(booking)} style={{ borderLeftColor: bookingColor(booking, appearance) }} className="w-full cursor-pointer rounded-lg border-l-4 bg-slate-100 p-2 text-left text-[11px] hover:bg-yellow-primary"><strong className="block">{booking.time} {booking.clientName}</strong><span className="block truncate text-slate-500">{booking.service}</span></button>)}{!dayBookings.length && <p className="py-3 text-center text-[11px] text-slate-400">Qəbul yoxdur</p>}</div>
      </div>;
    })}</div>
  </section>;
}

export function PendingView({ bookings, appearance, search, onSearch, onEdit, onStatus }: { bookings: Booking[]; appearance: CalendarAppearance; search: string; onSearch: (value: string) => void } & BookingActions) {
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("all");
  const [sort, setSort] = useState("soonest");
  const [page, setPage] = useState(1);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const tomorrowKey = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  const online = bookings.filter((booking) => booking.source === "online" && (status === "all" || booking.status === status) && (date === "all" || (date === "today" && booking.date === todayKey) || (date === "tomorrow" && booking.date === tomorrowKey) || (date === "future" && booking.date >= todayKey))).sort((a, b) => sort === "newest" ? `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`) : `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const totalPages = Math.max(1, Math.ceil(online.length / 10));
  const shown = online.slice((Math.min(page, totalPages) - 1) * 10, Math.min(page, totalPages) * 10);
  return <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-sm font-bold">Onlayn müraciətlər</h2><p className="mt-1 text-xs text-slate-500">Onlayn müraciətlər və onların statusu</p></div><label className="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 sm:w-auto"><Search size={15} className="shrink-0 text-slate-400" /><input aria-label="Müraciətlərdə axtar" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Müştəri və xidmət axtar" className="min-w-0 flex-1 text-xs outline-none sm:w-44" /></label></div>
    <div className="grid gap-2 sm:grid-cols-3"><select aria-label="Müraciət statusu" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-11 min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Bütün statuslar</option><option value="Gözlənilir">Gözlənilir</option><option value="Təsdiqləndi">Təsdiqləndi</option><option value="Ləğv edildi">Ləğv edildi</option></select><select aria-label="Müraciət tarixi" value={date} onChange={(event) => { setDate(event.target.value); setPage(1); }} className="min-h-11 min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="all">Bütün tarixlər</option><option value="today">Bu gün</option><option value="tomorrow">Sabah</option><option value="future">Gələcək</option></select><select aria-label="Müraciət sıralaması" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="min-h-11 min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="soonest">Ən yaxın vaxt</option><option value="newest">Ən uzaq vaxt</option></select></div>
    <div className="space-y-2">{shown.map((booking) => <div key={booking.id}><p className="mb-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} />{prettyDate(booking.date)} · {booking.time}</p><BookingCard booking={booking} appearance={appearance} onEdit={onEdit} onStatus={onStatus} /></div>)}{!online.length && <p className="py-8 text-center text-sm text-slate-500">Müraciət tapılmadı.</p>}</div>
    {totalPages > 1 && <div className="flex items-center justify-center gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="min-h-10 cursor-pointer rounded-xl bg-slate-100 px-3 text-xs font-bold disabled:opacity-40">Əvvəlki</button><span className="text-xs">{Math.min(page, totalPages)} / {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="min-h-10 cursor-pointer rounded-xl bg-slate-100 px-3 text-xs font-bold disabled:opacity-40">Növbəti</button></div>}
  </section>;
}
