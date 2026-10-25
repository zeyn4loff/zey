import type { Dispatch, SetStateAction } from "react";
import { ArrowLeftRight, Banknote, Building2, CreditCard, LockKeyhole, Pencil, Plus, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { accountBalance, accountTypes, formatMoney, type CashShift, type FinanceAccount, type FinanceData, type FinanceKind, type FinanceTransaction } from "./finance";
import { panel, type DeleteSetter } from "./FinanceViewShared";

type AccountsProps = {
  data: FinanceData;
  totalBalance: number;
  todayTxs: FinanceTransaction[];
  openShift: CashShift | undefined;
  cashAccount: FinanceAccount | undefined;
  setShiftDialog: Dispatch<SetStateAction<"open" | "close" | null>>;
  setAccountDialog: Dispatch<SetStateAction<FinanceAccount | null | undefined>>;
  setDeleting: DeleteSetter;
  setTransactionType: Dispatch<SetStateAction<FinanceKind>>;
  setTransactionDialog: Dispatch<SetStateAction<FinanceTransaction | null | undefined>>;
};

const accountIcons = { cash: Banknote, pos: CreditCard, bank: Building2, safe: LockKeyhole };

export function FinanceAccountsView({ data, totalBalance, todayTxs, openShift, cashAccount, setShiftDialog, setAccountDialog, setDeleting, setTransactionType, setTransactionDialog }: AccountsProps) {
  const income = todayTxs.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = todayTxs.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  const cashBalance = cashAccount ? accountBalance(data, cashAccount.id) : 0;
  const summary = [
    { title: "Ümumi qalıq", value: formatMoney(totalBalance), description: "Bütün kassa və bank hesabları", icon: Wallet, color: "text-slate-900", iconColor: "bg-amber-50 text-amber-700" },
    { title: "Bugünkü mədaxil (Gəlir)", value: `+ ${formatMoney(income)}`, description: "Xidmətlər və satışlardan", icon: TrendingUp, color: "text-emerald-700", iconColor: "bg-emerald-50 text-emerald-700" },
    { title: "Bugünkü məxaric (Xərc)", value: `− ${formatMoney(expense)}`, description: "Ödənişlər və xərclər", icon: TrendingDown, color: "text-rose-700", iconColor: "bg-rose-50 text-rose-700" },
    { title: "Aktiv növbə kassası", value: openShift ? formatMoney(cashBalance) : "Bağlı", description: openShift ? "Növbə açıqdır" : "Hazırda açıq növbə yoxdur", icon: Banknote, color: "text-slate-900", iconColor: "bg-indigo-50 text-indigo-700" },
  ];

  return <>
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{summary.map((item) => <article key={item.title} className={panel}>
      <div className="flex items-start justify-between gap-2"><p className="text-xs text-slate-500">{item.title}</p><span className={`hidden rounded-full p-2 sm:inline-flex ${item.iconColor}`}><item.icon size={16} /></span></div>
      <strong className={`mt-3 block break-words text-lg sm:text-xl ${item.color}`}>{item.value}</strong>
      <p className="mt-1 hidden text-xs text-slate-400 sm:block">{item.description}</p>
    </article>)}</div>

    <section className={`${panel} overflow-hidden p-0`}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold">Kassa növbəsi</h3><span className={`rounded-full px-2 py-1 text-xs font-semibold ${openShift ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{openShift ? "Növbə açıqdır" : "Bağlı"}</span></div><p className="mt-1 text-xs text-slate-500">{openShift ? `Açılış vaxtı: ${new Date(openShift.openedAt).toLocaleString("az-AZ")}` : "Hazırda açıq növbə yoxdur"}</p></div>
        <button type="button" onClick={() => setShiftDialog(openShift ? "close" : "open")} disabled={!cashAccount} className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${openShift ? "bg-rose-50 text-rose-700" : "bg-yellow-primary"}`}>{openShift ? "Növbəni bağla" : "Növbəni aç"}</button>
      </div>
      {openShift && <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-4">{[
        ["İlkin nağd qalıq", formatMoney(openShift.openingCash)],
        ["Cari nağd qalıq", formatMoney(cashBalance)],
        ["Bugünkü gəlir", formatMoney(income)],
        ["Bugünkü xərc", formatMoney(expense)],
      ].map(([label, value]) => <div key={label} className="border-b border-r border-slate-100 p-3 sm:border-b-0 sm:p-4"><p className="text-xs text-slate-500">{label}</p><strong className="mt-1 block break-words text-sm sm:text-base">{value}</strong></div>)}</div>}
    </section>

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-bold">Hesablar və kassalar</h3><p className="text-xs text-slate-500">Nağd kassalar, POS terminallar və bank hesabları</p></div><button type="button" onClick={() => setAccountDialog(null)} className="min-h-11 cursor-pointer rounded-xl bg-slate-100 px-4 text-sm font-bold"><Plus size={16} className="mr-1 inline" />Hesab əlavə et</button></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{data.accounts.map((account) => { const Icon = accountIcons[account.type]; return <article key={account.id} className={panel}><div className="flex items-start justify-between gap-2"><span className="rounded-xl bg-slate-50 p-2.5 text-slate-600"><Icon size={20} /></span><div className="flex gap-1"><button type="button" onClick={() => setAccountDialog(account)} aria-label={`${account.name} redaktə et`} className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button type="button" onClick={() => setDeleting({ kind: "account", id: account.id, name: account.name })} aria-label={`${account.name} sil`} className="flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button></div></div><h4 className="mt-3 break-words font-bold">{account.name}</h4><p className="text-xs text-slate-500">{accountTypes[account.type]}</p><strong className="mt-4 block break-words text-xl">{formatMoney(accountBalance(data, account.id))}</strong>{account.details && <p className="mt-1 break-words text-xs text-slate-500">{account.details}</p>}</article>; })}</div>
    <button type="button" onClick={() => { setTransactionType("transfer"); setTransactionDialog(null); }} disabled={data.accounts.length < 2} className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"><ArrowLeftRight size={17} />Kassalararası köçürmə</button>
  </>;
}
