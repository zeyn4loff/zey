import { balance, categoryLabels, latestVisit, totalSpent, totalVisits, type Client } from "./clients";

type Props = { clients: Client[]; onOpen: (id: string) => void; onDelete: (client: Client) => void };

/** Compact desktop overview; the mobile view stays in BusinessClients. */
export default function ClientTable({ clients, onOpen, onDelete }: Props) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full min-w-[860px] border-collapse text-left text-xs">
      <thead className="bg-slate-50 text-slate-500"><tr>{["Müştəri", "Əlaqə məlumatları", "Kateqoriya", "Balanslar", "Qəbullar və məbləğ", "Sonuncu ziyarət", ""].map((label, index) => <th key={index} className="px-3 py-4 font-semibold">{label}</th>)}</tr></thead>
      <tbody>{clients.map((client) => <tr key={client.id} className="border-t border-slate-100 hover:bg-slate-50/70">
        <td className="px-3 py-3"><button type="button" onClick={() => onOpen(client.id)} className="flex cursor-pointer items-center gap-2 text-left"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">{client.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toLocaleUpperCase("az-AZ")}</span><span><strong className="block text-slate-900">{client.name}</strong><span className="text-slate-400">{client.id}</span></span></button></td>
        <td className="px-3 py-3"><span className="block whitespace-nowrap font-medium">{client.phone}</span><span className="block max-w-36 truncate text-slate-400">{client.email || "—"}</span></td>
        <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">{categoryLabels[client.category]}</span></td>
        <td className="px-3 py-3"><span className="block whitespace-nowrap">Dep: {balance(client, "deposit").toFixed(2)} ₼</span><span className="block whitespace-nowrap text-slate-500">Keş: {balance(client, "cashback").toFixed(2)} ₼</span></td>
        <td className="px-3 py-3"><strong className="block whitespace-nowrap">{totalSpent(client).toLocaleString("az-AZ")} ₼</strong><span className="text-slate-400">{totalVisits(client)} qəbul</span></td>
        <td className="whitespace-nowrap px-3 py-3">{latestVisit(client) || "—"}</td>
        <td className="px-3 py-3"><button type="button" onClick={() => onDelete(client)} aria-label={`${client.name} sil`} className="cursor-pointer text-red-600 hover:underline">Sil</button></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
