import { Pencil, Trash2 } from "lucide-react";
import { campaignScheduleLabels, marketingStatusLabel, type Campaign, type Promo } from "./marketing";

type Entry = Campaign | Promo;
type Props = { entries: Entry[]; onEdit: (entry: Entry) => void; onDelete: (entry: Entry) => void };

export default function MarketingTable({ entries, onEdit, onDelete }: Props) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[780px] border-collapse text-left text-xs">
    <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-4">Kampaniya / promokod</th><th className="px-4 py-4">Kanal / kod</th><th className="px-4 py-4">Növ</th><th className="px-4 py-4">Hədəf / şərt</th><th className="px-4 py-4">Status</th><th className="px-4 py-4" /></tr></thead>
    <tbody>{entries.map((entry) => <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50/70">
      <td className="max-w-80 px-4 py-4"><strong className="block">{entry.name}</strong>{"message" in entry && <span className="block truncate text-slate-400">{entry.message}</span>}</td>
      <td className="whitespace-nowrap px-4 py-4">{"message" in entry ? entry.channel.toUpperCase() : entry.code}</td>
      <td className="px-4 py-4">{"message" in entry ? <>{entry.type === "automated" ? "Avtomatik zəncir" : "Kütləvi göndəriş"}<span className="mt-1 block text-slate-500">{campaignScheduleLabels[entry.schedule ?? "auto"]}</span></> : `${entry.discountValue}${entry.discountType === "percent" ? "%" : " ₼"} endirim`}</td>
      <td className="px-4 py-4">{"message" in entry ? ({ all: "Bütün müştərilər", vip: "VIP", new: "Yeni müştərilər", risk: "Passiv müştərilər", birthdays: "Ad günü olanlar" }[entry.target]) : `Min. ${entry.minOrder} ₼ · ${entry.usedCount}/${entry.usageLimit} istifadə`}</td>
      <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 font-semibold ${entry.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{marketingStatusLabel(entry)}</span></td>
      <td className="whitespace-nowrap px-4 py-4"><button type="button" onClick={() => onEdit(entry)} aria-label={`${entry.name} redaktə et`} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button type="button" onClick={() => onDelete(entry)} aria-label={`${entry.name} sil`} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></td>
    </tr>)}</tbody>
  </table></div>;
}
