import { Pencil, Trash2 } from "lucide-react";
import type { GiftCard, LoyaltyRule, LoyaltyTab, Subscription } from "./loyalty";

type Entry = LoyaltyRule | GiftCard | Subscription;
type Props = { tab: LoyaltyTab; entries: Entry[]; onEdit: (entry: Entry) => void; onDelete: (entry: Entry) => void };

export default function LoyaltyTable({ tab, entries, onEdit, onDelete }: Props) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[760px] border-collapse text-left text-xs">
    <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-4">Ad</th><th className="px-4 py-4">Növ</th><th className="px-4 py-4">{tab === "cards_cashback" ? "Faiz dərəcəsi" : tab === "gift_cards" ? "Nominal / Satış" : "Qiymət / Ziyarət"}</th><th className="px-4 py-4">{tab === "cards_cashback" ? "Kimlərə tətbiq olunur" : "Müddət və əlçatanlıq"}</th><th className="px-4 py-4">Status</th><th className="px-4 py-4" /></tr></thead>
    <tbody>{entries.map((entry) => <tr key={entry.id} className="border-t border-slate-100 hover:bg-slate-50/70">
      <td className="max-w-64 px-4 py-4 font-bold">{entry.name}</td>
      <td className="px-4 py-4">{"percent" in entry ? entry.type === "discount" ? "Endirim" : "Keşbek" : "nominal" in entry ? entry.type === "general" ? "Ümumi kart" : "Xidmət kartı" : "Abunəlik"}</td>
      <td className="whitespace-nowrap px-4 py-4 font-semibold">{"percent" in entry ? `${entry.percent}%` : "nominal" in entry ? `${entry.nominal} ₼ / ${entry.salePrice} ₼` : `${entry.price} ₼ / ${entry.visitsCount} ziyarət`}</td>
      <td className="px-4 py-4">{"percent" in entry ? entry.target === "new" ? "Yalnız yeni müştərilər" : "Bütün müştərilər" : "nominal" in entry ? entry.serviceName || (entry.availableForSale ? "Satışda" : "Satışda deyil") : `${entry.validityDays} gün · ${entry.availableOnline ? "Onlayn" : "Salonda"}`}</td>
      <td className="px-4 py-4"><span className={`rounded-full px-2 py-1 font-semibold ${entry.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{entry.status === "active" ? "Aktiv" : "Deaktiv"}</span></td>
      <td className="whitespace-nowrap px-4 py-4"><button type="button" onClick={() => onEdit(entry)} aria-label={`${entry.name} redaktə et`} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button type="button" onClick={() => onDelete(entry)} aria-label={`${entry.name} sil`} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></td>
    </tr>)}</tbody>
  </table></div>;
}
