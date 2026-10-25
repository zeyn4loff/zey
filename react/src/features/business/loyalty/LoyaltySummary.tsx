import { CreditCard, Gift, Percent, UserRoundPlus } from "lucide-react";
import type { GiftCard, LoyaltyData, LoyaltyRule, LoyaltyTab, Subscription } from "./loyalty";

type Entry = LoyaltyRule | GiftCard | Subscription;

export default function LoyaltySummary({ tab, data, items }: { tab: LoyaltyTab; data: LoyaltyData; items: Entry[] }) {
  const metrics = tab === "cards_cashback" ? [
    { label: "Aktiv kartlar və qaydalar", value: data.rules.filter((item) => item.status === "active").length, detail: `${data.rules.length} qayda`, icon: CreditCard },
    { label: "Endirim kartları", value: data.rules.filter((item) => item.type === "discount").length, detail: "Birbaşa servis endirimi", icon: Percent },
    { label: "Keşbek qaydaları", value: data.rules.filter((item) => item.type === "cashback").length, detail: "Qazanılan bonus balları", icon: Gift },
    { label: "Yeni müştəri qaydaları", value: data.rules.filter((item) => item.target === "new").length, detail: "İlk gəliş üçün imtiyaz", icon: UserRoundPlus },
  ] : [
    { label: "Cəmi", value: items.length, detail: "", icon: CreditCard },
    { label: "Aktiv", value: items.filter((item) => item.status === "active").length, detail: "", icon: Gift },
    { label: "Deaktiv", value: items.filter((item) => item.status === "inactive").length, detail: "", icon: Percent },
    { label: tab === "subscriptions" ? "Satılıb" : "Satışda", value: tab === "subscriptions" ? data.subscriptions.reduce((sum, item) => sum + item.soldCount, 0) : data.giftCards.filter((item) => item.availableForSale).length, detail: "", icon: UserRoundPlus },
  ];

  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{metrics.map(({ label, value, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><p className="text-xs text-slate-500">{label}</p><Icon size={16} className="hidden shrink-0 text-slate-500 sm:block" /></div><strong className="mt-3 block text-xl sm:text-2xl">{value}</strong>{detail && <p className="mt-1 hidden text-xs text-slate-400 sm:block">{detail}</p>}</article>)}</div>;
}
