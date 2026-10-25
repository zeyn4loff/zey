import { useState, type FormEvent } from "react";
import BusinessFormDialog from "../components/BusinessFormDialog";
import { formatMoney, type FinanceData, type FinanceTransaction } from "./finance";

function downloadReport(items: FinanceTransaction[], data: FinanceData) {
  const rows = [["Tarix", "Növ", "Təyinat", "Kassa", "Kateqoriya", "Məbləğ", "Qarşı tərəf", "Qeyd"], ...items.map((item) => [item.date, item.type, item.title, data.accounts.find((account) => account.id === item.accountId)?.name ?? "", data.categories.find((category) => category.id === item.categoryId)?.name ?? "", String(item.amount), item.counterparty, item.note])];
  const csv = "\ufeff" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "zeyvo-maliyye-hesabati.csv"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function FinanceReportDialog({ data, onClose }: { data: FinanceData; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const transactions = data.transactions.filter((item) => (!from || item.date >= from) && (!to || item.date <= to));
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from && to && from > to) { setError("Tarix aralığını yoxlayın."); return; }
    downloadReport(transactions, data);
    const subject = "Zeyvo maliyyə hesabatı";
    const body = `Maliyyə hesabatı (${from || "başlanğıcdan"} – ${to || "bu günə"})\nƏməliyyatlar: ${transactions.length}\nGəlir: ${formatMoney(income)}\nXərc: ${formatMoney(expense)}\nFərq: ${formatMoney(income - expense)}\n\nYüklənmiş CSV faylını məktuba əlavə edin.`;
    const mail = document.createElement("a");
    mail.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    mail.click();
    setError("");
  }
  return <BusinessFormDialog size="medium" title="Maliyyə hesabatı" onClose={onClose}><form onSubmit={prepareEmail} className="space-y-3 text-sm"><p className="text-slate-600">Hesabatı CSV kimi yükləyin və e-poçt məktubuna əlavə edin.</p><div className="grid gap-3 sm:grid-cols-2"><label className="font-bold">Başlanğıc tarix<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label><label className="font-bold">Son tarix<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label></div><label className="block font-bold">Alıcının e-poçtu<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3" /></label><div className="rounded-xl bg-slate-50 p-3 text-slate-600"><p>{transactions.length} əməliyyat</p><p>Gəlir: {formatMoney(income)} · Xərc: {formatMoney(expense)}</p></div>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4 font-bold">İmtina</button><button type="submit" className="min-h-11 cursor-pointer rounded-xl bg-yellow-primary px-4 font-bold">CSV yüklə və məktub aç</button></div></form></BusinessFormDialog>;
}
