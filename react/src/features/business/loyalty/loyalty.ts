import type { BusinessSession } from "../auth/businessSession";

export type LoyaltyTab = "cards_cashback" | "gift_cards" | "subscriptions" | "deposits";
export type LoyaltyStatus = "active" | "inactive";
export interface LoyaltyRule { id: string; name: string; type: "discount" | "cashback"; percent: number; target: "all" | "new"; status: LoyaltyStatus }
export interface GiftCard { id: string; name: string; type: "general" | "service"; nominal: number; salePrice: number; serviceName: string; availableForSale: boolean; status: LoyaltyStatus }
export interface IssuedGiftCard { id: string; templateId: string; code: string; clientId: string; issuedAt: string; initialBalance: number; balance: number; history: { id: string; date: string; amount: number; note: string; balanceAfter: number }[] }
export interface Subscription { id: string; name: string; visitsCount: number; price: number; validityDays: number; serviceNames: string; availableForSale: boolean; availableOnline: boolean; soldCount: number; status: LoyaltyStatus }
export interface LoyaltyProgram { enabled: boolean; cashbackPercent: number; pointValueAzn: number; maxPayPercent: number; expiryDays: number; welcomeBonus: number; birthdayBonus: number; reviewBonus: number }
export const defaultLoyaltyProgram: LoyaltyProgram = { enabled: true, cashbackPercent: 5, pointValueAzn: 1, maxPayPercent: 50, expiryDays: 180, welcomeBonus: 10, birthdayBonus: 15, reviewBonus: 0 };
export interface LoyaltyData { rules: LoyaltyRule[]; giftCards: GiftCard[]; subscriptions: Subscription[]; issuedGiftCards?: IssuedGiftCard[]; program?: LoyaltyProgram }
const key = (id: string) => `zeyvo_business_loyalty_demo_v1_${id}`;
const demo: LoyaltyData = {
  rules: [
    { id: "rule-1", name: "Yeni Müştəri Xoş Gəldin Endirimi", type: "discount", percent: 10, target: "new", status: "active" },
    { id: "rule-2", name: "Standart Keşbek Kartı", type: "cashback", percent: 5, target: "all", status: "active" },
    { id: "rule-3", name: "Gümüş Loyallıq Kartı", type: "cashback", percent: 7, target: "all", status: "active" },
    { id: "rule-4", name: "VIP Premium Endirim Kartı", type: "discount", percent: 15, target: "all", status: "active" },
  ],
  giftCards: [
    { id: "gift-1", name: "Standart Hədiyyə Kartı 50 ₼", type: "general", nominal: 50, salePrice: 50, serviceName: "", availableForSale: true, status: "active" },
    { id: "gift-2", name: "Premium Hədiyyə Kartı 100 ₼", type: "general", nominal: 100, salePrice: 90, serviceName: "", availableForSale: true, status: "active" },
    { id: "gift-3", name: "Spa və Saç Baxımı Hədiyyə Kartı", type: "service", nominal: 70, salePrice: 65, serviceName: "Spa saç baxımı", availableForSale: true, status: "active" },
    { id: "gift-4", name: "VIP Kompleks Baxım Kartı", type: "general", nominal: 200, salePrice: 180, serviceName: "", availableForSale: true, status: "active" },
    { id: "gift-5", name: "Ekspres Manikür Hədiyyə Kartı", type: "service", nominal: 30, salePrice: 30, serviceName: "Klassik manikür", availableForSale: false, status: "inactive" },
  ],
  subscriptions: [
    { id: "sub-1", name: "Kişi Saç & Saqqal Paketi (5 ziyarət)", visitsCount: 5, price: 90, validityDays: 90, serviceNames: "Klassik saç kəsimi, Saqqal korreksiyası", availableForSale: true, availableOnline: true, soldCount: 14, status: "active" },
    { id: "sub-2", name: "Aylıq Manikür & Gel-lak Paketi", visitsCount: 4, price: 75, validityDays: 30, serviceNames: "Klassik manikür, Gel örtük", availableForSale: true, availableOnline: true, soldCount: 22, status: "active" },
    { id: "sub-3", name: "Premium Spa & Relax Masaj Kursu", visitsCount: 10, price: 320, validityDays: 180, serviceNames: "Aroma masaj, Relax bədən baxımı", availableForSale: true, availableOnline: false, soldCount: 8, status: "active" },
    { id: "sub-4", name: "Keratin & Saç Bərpası Kompleksi", visitsCount: 3, price: 150, validityDays: 90, serviceNames: "Bütün bərbər və baxım xidmətləri", availableForSale: false, availableOnline: true, soldCount: 5, status: "inactive" },
  ],
};
function validData(value: unknown): value is LoyaltyData { if (!value || typeof value !== "object") return false; const item = value as Partial<LoyaltyData>; return Array.isArray(item.rules) && Array.isArray(item.giftCards) && Array.isArray(item.subscriptions); }
export function readLoyalty(session: BusinessSession): LoyaltyData { try { const raw = localStorage.getItem(key(session.id)); if (raw) { const parsed: unknown = JSON.parse(raw); if (validData(parsed)) return parsed; } } catch { /* Browser storage may be unavailable. */ } return session.id === "baku-beauty-demo" ? structuredClone(demo) : { rules: [], giftCards: [], subscriptions: [] }; }
export function saveLoyalty(id: string, data: LoyaltyData): boolean { try { localStorage.setItem(key(id), JSON.stringify(data)); return true; } catch { return false; } }
