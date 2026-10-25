import type { Dispatch, SetStateAction } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatMoney, type FinanceCategory, type FinanceData } from "./finance";
import { panel, type DeleteSetter } from "./FinanceViewShared";

type CategoriesProps = {
  data: FinanceData;
  setCategoryType: Dispatch<SetStateAction<FinanceCategory["type"]>>;
  setCategoryDialog: Dispatch<SetStateAction<FinanceCategory | null | undefined>>;
  setDeleting: DeleteSetter;
};
export function FinanceCategoriesView({ data, setCategoryType, setCategoryDialog, setDeleting }: CategoriesProps) {
  return <div className="grid gap-4 sm:grid-cols-2">{(["expense", "income"] as const).map((type) => <section key={type} className={panel}><div className="flex items-center justify-between gap-2"><h3 className="text-lg font-bold">{type === "expense" ? "Xərc kateqoriyaları" : "Gəlir kateqoriyaları"}</h3><button type="button" onClick={() => { setCategoryType(type); setCategoryDialog(null); }} aria-label={`${type === "expense" ? "Xərc" : "Gəlir"} kateqoriyası əlavə et`} className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-yellow-primary"><Plus size={17} /></button></div><div className="mt-4 space-y-2">{data.categories.filter((x) => x.type === type).map((category) => { const used = data.transactions.filter((tx) => tx.categoryId === category.id); return <article key={category.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="min-w-0 flex-1"><h4 className="break-words text-sm font-bold">{category.name}</h4><p className="text-xs text-slate-500">{used.length} əməliyyat · {formatMoney(used.reduce((sum, x) => sum + x.amount, 0))}</p></div><button type="button" onClick={() => setCategoryDialog(category)} aria-label={`${category.name} redaktə et`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500"><Pencil size={16} /></button><button type="button" onClick={() => setDeleting({ kind: "category", id: category.id, name: category.name })} aria-label={`${category.name} sil`} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500"><Trash2 size={16} /></button></article>; })}</div></section>)}</div>;
}
