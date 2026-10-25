import type { Dispatch, SetStateAction } from "react";
import type { FinanceData, FinanceKind, FinanceTransaction } from "./finance";

export const panel = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";
export const txLabels: Record<FinanceKind, string> = { income: "Gəlir", expense: "Xərc", transfer: "Köçürmə" };
export type FinanceDeleteTarget = { kind: "account" | "category" | "transaction" | "payroll"; id: string; name: string };
export function downloadCsv(items: FinanceTransaction[], data: FinanceData) {
  const rows = [["Tarix", "Növ", "Təyinat", "Kassa", "Hədəf kassa", "Kateqoriya", "Məbləğ", "Qarşı tərəf", "Qeyd"], ...items.map((x) => [x.date, txLabels[x.type], x.title, data.accounts.find((a) => a.id === x.accountId)?.name ?? "", data.accounts.find((a) => a.id === x.toAccountId)?.name ?? "", data.categories.find((c) => c.id === x.categoryId)?.name ?? "", String(x.amount), x.counterparty, x.note])];
  const csv = "\ufeff" + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "zeyvo-finance.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type DeleteSetter = Dispatch<SetStateAction<FinanceDeleteTarget | null>>;
