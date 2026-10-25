import type { BusinessSession } from "../auth/businessSession";
export type MarketingTab = "campaigns" | "promocodes" | "segments" | "referral" | "reviews";
export type Status = "active" | "inactive";
export interface Campaign { id: string; name: string; channel: "whatsapp" | "sms" | "email"; type: "automated" | "broadcast"; target: "all" | "vip" | "new" | "risk" | "birthdays"; message: string; schedule?: "auto" | "immediate" | "draft"; status: Status }
export const campaignScheduleLabels = { auto: "Avtomatik qrafik", immediate: "Təsdiqdən sonra", draft: "Qaralama" } as const;
export interface Promo { id: string; name: string; code: string; discountType: "percent" | "fixed"; discountValue: number; minOrder: number; usageLimit: number; usedCount: number; startDate: string; endDate: string; status: Status }
export interface ReferralSettings { enabled: boolean; referrerReward: number; refereeDiscount: number; minOrder: number }
export interface Review { id: string; clientName: string; serviceName: string; rating: number; comment: string; reply: string; date: string; status: "published" | "hidden" }
export interface MarketingData { campaigns: Campaign[]; promos: Promo[]; referral: ReferralSettings; reviews: Review[] }
export function marketingStatusLabel(item: Campaign | Promo) { return item.status === "inactive" ? "Deaktiv" : "message" in item ? "Hazır" : "Aktiv"; }
const key = (id: string) => `zeyvo_business_marketing_demo_v1_${id}`;
const empty: MarketingData = { campaigns: [], promos: [], referral: { enabled: false, referrerReward: 10, refereeDiscount: 15, minOrder: 25 }, reviews: [] };
const demo: MarketingData = {
  campaigns: [
    { id: "campaign-1", name: "Ad günü təbriki və 15% hədiyyə endirimi", channel: "whatsapp", type: "automated", target: "birthdays", message: "Salam, {ad}! Ad gününüz mübarək! Sizə 15% endirim hədiyyə edirik.", status: "active" },
    { id: "campaign-2", name: "45 gün gəlməyən müştərilərə xatırlatma", channel: "whatsapp", type: "automated", target: "risk", message: "Salam, {ad}! Sizi yenidən salonumuzda görmək istərdik.", status: "active" },
    { id: "campaign-3", name: "Payız gözəllik kampaniyası", channel: "sms", type: "broadcast", target: "all", message: "Zeyvo salonunda payız baxımı üçün xüsusi təkliflər.", status: "active" },
    { id: "campaign-4", name: "Yeni qeydiyyatdan keçənlərə xoş gəldin bonusu", channel: "whatsapp", type: "automated", target: "new", message: "Salam, {ad}! Zeyvo ailəsinə xoş gəlmisiniz.", status: "active" },
    { id: "campaign-5", name: "VIP müştərilər üçün xüsusi təklif", channel: "email", type: "broadcast", target: "vip", message: "VIP müştərilərimiz üçün yeni xidmətlər və xüsusi təkliflər.", status: "active" },
    { id: "campaign-6", name: "Qəbuldan sonra rəy xatırlatması", channel: "whatsapp", type: "automated", target: "all", message: "Ziyarətiniz üçün təşəkkür edirik! Rəyinizi bölüşün.", status: "active" },
  ],
  promos: [
    { id: "promo-1", name: "Yeni müştəri endirimi", code: "YENI15", discountType: "percent", discountValue: 15, minOrder: 30, usageLimit: 100, usedCount: 18, startDate: "2026-01-01", endDate: "2027-12-31", status: "active" },
    { id: "promo-2", name: "Payız gözəllik təklifi", code: "PAYIZ20", discountType: "percent", discountValue: 20, minOrder: 50, usageLimit: 200, usedCount: 42, startDate: "2026-09-01", endDate: "2026-11-30", status: "active" },
    { id: "promo-3", name: "VIP bonus", code: "VIP10", discountType: "fixed", discountValue: 10, minOrder: 60, usageLimit: 50, usedCount: 12, startDate: "2026-01-01", endDate: "2027-12-31", status: "active" },
    { id: "promo-4", name: "Dostunu gətir", code: "DOST5", discountType: "fixed", discountValue: 5, minOrder: 25, usageLimit: 100, usedCount: 8, startDate: "2026-01-01", endDate: "2027-12-31", status: "active" },
  ],
  referral: { enabled: true, referrerReward: 10, refereeDiscount: 15, minOrder: 25 },
  reviews: [],
};
function isData(value: unknown): value is MarketingData { if (!value || typeof value !== "object") return false; const data = value as Partial<MarketingData>; return Array.isArray(data.campaigns) && Array.isArray(data.promos) && Array.isArray(data.reviews) && !!data.referral; }
export function readMarketing(session: BusinessSession): MarketingData { try { const raw = localStorage.getItem(key(session.id)); if (raw) { const parsed: unknown = JSON.parse(raw); if (isData(parsed)) return parsed; } } catch { /* Storage may be unavailable. */ } return structuredClone(session.id === "baku-beauty-demo" ? demo : empty); }
export function saveMarketing(id: string, data: MarketingData): boolean { try { localStorage.setItem(key(id), JSON.stringify(data)); return true; } catch { return false; } }
