import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Settings2 } from "lucide-react";
import type { BusinessSession } from "../auth/businessSession";
import { BusinessTabButton, BusinessTabRail } from "../components/BusinessTabs";
import { readStaffData } from "../staff/staff";
import BookingDialog from "./BookingDialog";
import { addDays, localDate, type Booking, type BookingStatus } from "./bookings";
import { prettyDate } from "./calendarDates";
import { DailyView, PendingView, WeeklyView, type CalendarView, type EditingBooking } from "./CalendarViews";
import { useBookings } from "./useBookings";
import { useActiveBusinessContext } from "../directory/activeContext";
import CalendarAppearanceDialog from "./CalendarAppearanceDialog";
import { readCalendarAppearance, saveCalendarAppearance } from "./calendarAppearance";
import { readServiceData } from "../services/services";
import { readResourceData } from "../resources/resources";
import { readBusinesses } from "../directory/businesses";
import { bookingSlotIssue } from "./bookingRules";
import { readClients } from "../clients/clients";
import { syncBookingClient } from "./syncBookingClient";
import BookingCheckoutDialog from "./BookingCheckoutDialog";
import { checkoutBooking } from "./checkoutBooking";
import type { PaymentMethod } from "../pos/pos";

const statuses: BookingStatus[] = ["Gözlənilir", "Təsdiqləndi", "Tamamlandı", "Ləğv edildi"];

export default function BusinessCalendar({ session }: { session: BusinessSession }) {
  const { bookings, update } = useBookings(session);
  const activeBusiness = useActiveBusinessContext(session);
  const scopedBookings = bookings.filter((booking) =>
    (booking.businessId ?? (session.id === "baku-beauty-demo" ? "biz_baku_beauty" : activeBusiness?.businessId)) === activeBusiness?.businessId &&
    (!booking.branchId || booking.branchId === activeBusiness?.branchId),
  );
  const [date, setDate] = useState(localDate);
  const [view, setView] = useState<CalendarView>("daily");
  const [master, setMaster] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingBooking | null>(null);
  const [appearance, setAppearance] = useState(() => readCalendarAppearance(session.id));
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState<Booking | null>(null);

  // Current staff appears in new bookings; historical names remain visible.
  const activeMasters = readStaffData(session).members.filter((person) => person.status !== "dismissed" && person.branchId === activeBusiness?.branchId).map((person) => person.name);
  const masters = [...new Set([...activeMasters, ...scopedBookings.map((booking) => booking.masterName).filter(Boolean)])];
  const visibleMasters = master === "all" ? masters : [master];
  const pendingCount = scopedBookings.filter((booking) => booking.source === "online" && booking.status === "Gözlənilir").length;
  const filtered = scopedBookings.filter((booking) =>
    (master === "all" || booking.masterName === master) &&
    (status === "all" || booking.status === status) &&
    (!search || `${booking.clientName} ${booking.service} ${booking.phone}`.toLocaleLowerCase("az-AZ").includes(search.toLocaleLowerCase("az-AZ"))),
  );
  const daily = filtered.filter((booking) => booking.date === date).sort((a, b) => a.time.localeCompare(b.time));

  function editBooking(booking: Booking) {
    setEditing({ booking, date: booking.date, time: booking.time });
  }

  function saveBooking(next: Booking): string | null {
    if (!next.clientName || !next.service || !next.masterName || !next.date || !next.time) return "Məcburi sahələri doldurun.";
    if (!Number.isFinite(next.price) || next.price < 0 || !Number.isFinite(next.durationMinutes) || next.durationMinutes <= 0) return "Qiyməti və müddəti yoxlayın.";
    const previous = bookings.find((booking) => booking.id === next.id);
    const slotChanged = !previous || previous.date !== next.date || previous.time !== next.time || previous.masterName !== next.masterName || previous.durationMinutes !== next.durationMinutes || previous.serviceId !== next.serviceId || previous.service !== next.service;
    if (slotChanged && next.status !== "Ləğv edildi") {
      const services = readServiceData(session).services;
      const service = services.find((item) => item.id === next.serviceId || (item.name === next.service && (!item.businessId || item.businessId === next.businessId)));
      const business = readBusinesses(session).find((item) => item.id === next.businessId);
      const branchHours = business?.branches.find((item) => item.id === next.branchId)?.hours;
      const issue = bookingSlotIssue({ candidate: next, bookings: scopedBookings, service, services, staff: readStaffData(session).members, resources: readResourceData(session).resources, branchHours });
      if (issue) return issue;
    }
    if (previous?.paymentMethod && (next.price !== previous.price || next.status !== "Tamamlandı")) return "Ödənilmiş qəbulun məbləğini və statusunu dəyişmək üçün ayrıca kassa düzəlişi lazımdır.";
    if (next.status === "Tamamlandı" && !previous?.paymentMethod) { setPendingCheckout(next); setEditing(null); return null; }
    if (!syncBookingClient(session, next)) return "Tamamlanmış qəbulu müştəri kartında saxlamaq mümkün olmadı. Müştəri və əlaqə nömrəsini yoxlayın.";
    update(bookings.some((booking) => booking.id === next.id)
      ? bookings.map((booking) => booking.id === next.id ? next : booking)
      : [...bookings, next]);
    setEditing(null);
    setDate(next.date);
    return null;
  }

  function setBookingStatus(id: string, next: BookingStatus) {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return;
    if (next === "Tamamlandı" && !booking.paymentMethod) { setPendingCheckout(booking); return; }
    if (booking.paymentMethod && next !== "Tamamlandı") { setActionError("Ödənişi qeydə alınmış qəbulun statusunu dəyişmək üçün kassa düzəlişi lazımdır."); return; }
    if (!syncBookingClient(session, { ...booking, status: next })) { setActionError("Qəbulu tamamlamaq üçün müştəri kartı və ya telefon nömrəsi lazımdır."); return; }
    setActionError("");
    update(bookings.map((item) => item.id === id ? { ...item, status: next } : item));
  }

  function deleteBooking(id: string) {
    const booking = bookings.find((item) => item.id === id);
    if (booking?.paymentMethod) { setActionError("Ödənişi qeydə alınmış qəbulu silmək üçün əvvəlcə kassa düzəlişi lazımdır."); setEditing(null); return; }
    if (booking) syncBookingClient(session, { ...booking, status: "Ləğv edildi" });
    update(bookings.filter((booking) => booking.id !== id));
    setEditing(null);
  }

  function confirmCheckout(method: PaymentMethod, accountId: string): string | null {
    if (!pendingCheckout) return "Qəbul tapılmadı.";
    const error = checkoutBooking(session, pendingCheckout, method, accountId);
    if (error) return error;
    const next = { ...pendingCheckout, status: "Tamamlandı" as const, paymentMethod: method, paymentAccountId: accountId };
    update(bookings.some((booking) => booking.id === next.id) ? bookings.map((booking) => booking.id === next.id ? next : booking) : [...bookings, next]);
    setDate(next.date);
    setPendingCheckout(null);
    setActionError("");
    return null;
  }

  return <div className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-7 sm:py-7">
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-xl bg-slate-100 p-1">
          <button type="button" onClick={() => setDate(addDays(date, view === "weekly" ? -7 : -1))} aria-label="Əvvəlki tarix" className="flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-white"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => setDate(localDate())} className="min-h-9 cursor-pointer rounded-lg px-3 text-xs font-semibold hover:bg-white">Bu gün</button>
          <button type="button" onClick={() => setDate(addDays(date, view === "weekly" ? 7 : 1))} aria-label="Növbəti tarix" className="flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-white"><ChevronRight size={18} /></button>
        </div>
        <label className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold"><CalendarDays size={15} className="shrink-0" /><input aria-label="Tarix seçin" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-w-0 cursor-pointer bg-transparent outline-none" /></label>
        <span className="text-xs font-semibold text-slate-500">{prettyDate(date)}</span>
        <button type="button" onClick={() => setAppearanceOpen(true)} aria-label="Təqvim rənglərini tənzimlə" className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold sm:ml-auto"><Settings2 size={16} />Rənglər</button>
      </div>
      <div className="overflow-x-auto"><BusinessTabRail>{([
        { value: "daily", label: "Günlük (Ustalar)" },
        { value: "weekly", label: "Həftəlik" },
        { value: "pending", label: `Onlayn müraciətlər${pendingCount ? ` (${pendingCount})` : ""}` },
      ] as { value: CalendarView; label: string }[]).map((item) => <BusinessTabButton key={item.value} active={view === item.value} onClick={() => setView(item.value)}>{item.label}</BusinessTabButton>)}</BusinessTabRail></div>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Usta üzrə filtr" value={master} onChange={(event) => setMaster(event.target.value)} className="min-h-10 min-w-0 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold sm:flex-none"><option value="all">Bütün ustalar</option>{masters.map((name) => <option key={name}>{name}</option>)}</select>
        <select aria-label="Status üzrə filtr" value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-10 min-w-0 flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold sm:flex-none"><option value="all">Bütün statuslar</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <button type="button" onClick={() => setEditing({ date, time: "10:00", masterName: master === "all" ? undefined : master })} className="flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-xl bg-yellow-primary px-4 text-xs font-bold sm:ml-auto sm:w-auto"><Plus size={16} />Yeni qəbul</button>
      </div>
    </section>

    {actionError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
    {view === "daily" && <DailyView date={date} bookings={daily} masters={visibleMasters} appearance={appearance} onEdit={editBooking} onStatus={setBookingStatus} onCreate={(time, masterName) => setEditing({ date, time, masterName })} />}
    {view === "weekly" && <WeeklyView date={date} bookings={filtered} appearance={appearance} onSelectDay={(day) => { setDate(day); setView("daily"); }} onEdit={editBooking} />}
    {view === "pending" && <PendingView bookings={filtered} appearance={appearance} search={search} onSearch={setSearch} onEdit={editBooking} onStatus={setBookingStatus} />}
    {editing && <BookingDialog key={editing.booking?.id ?? `${editing.date}-${editing.time}`} initial={editing.booking} businessId={activeBusiness?.businessId} branchId={activeBusiness?.branchId} date={editing.date} time={editing.time} masterName={editing.masterName} masters={activeMasters} clients={readClients(session)} services={readServiceData(session).services.filter((item) => !item.businessId || item.businessId === activeBusiness?.businessId)} onClose={() => setEditing(null)} onSave={saveBooking} onDelete={deleteBooking} />}
    {pendingCheckout && <BookingCheckoutDialog session={session} booking={pendingCheckout} onClose={() => setPendingCheckout(null)} onConfirm={confirmCheckout} />}
    {appearanceOpen && <CalendarAppearanceDialog initial={appearance} services={[...new Set(readServiceData(session).services.map((item) => item.name))]} staff={masters} onClose={() => setAppearanceOpen(false)} onSave={(next) => { if (!saveCalendarAppearance(session.id, next)) return false; setAppearance(next); return true; }} />}
  </div>;
}
