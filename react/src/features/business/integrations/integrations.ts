import type { BusinessSession } from "../auth/businessSession";

export type IntegrationId = "whatsapp" | "sms" | "payments" | "booking_widget";
export interface WhatsAppSettings {
  phone: string;
  notifyOnBookingCreated: boolean;
  notifyReminder: boolean;
  notifyOnBookingCancelled: boolean;
  notifyMasterOnNewBooking: boolean;
  notifyReviewRequest: boolean;
  reminderHours: number;
  template: string;
}
export interface IntegrationReview { id: string; userName: string; rating: number; comment: string; date: string }
export interface IntegrationsData { whatsapp: WhatsAppSettings; reviews: IntegrationReview[] }
export interface IntegrationDefinition { id: IntegrationId; name: string; category: string; description: string; features: string[]; available: boolean; priceLabel: string }
export const catalog: IntegrationDefinition[] = [
  { id: "whatsapp", name: "WhatsApp Business & Bildirişlər", category: "Mesencerlər", description: "Qəbul təsdiqi, xatırlatma və rəy sorğusu üçün WhatsApp şablonlarını hazırlayın.", features: ["Qəbul təsdiqi", "Xatırlatma", "Fərdi mesaj şablonu"], available: true, priceLabel: "Ayarlar" },
  { id: "sms", name: "SMS Bildiriş Şlüzü", category: "Mesencerlər", description: "Müştərilərə SMS bildirişləri göndərmək üçün gələcək inteqrasiya.", features: ["Brend adı ilə SMS", "Bildiriş şablonları", "Çatdırılma hesabatı"], available: false, priceLabel: "Hazırlanır" },
  { id: "payments", name: "Onlayn Kart Ödənişi", category: "Ödənişlər", description: "Bron zamanı depozit və kart ödənişi qəbul etmək üçün gələcək inteqrasiya.", features: ["Onlayn depozit", "Kart ödənişi", "Ödəniş hesabatı"], available: false, priceLabel: "Hazırlanır" },
  { id: "booking_widget", name: "İnstagram & Sayt Bron Vidceti", category: "Veb alətlər", description: "İnstagram bio və sayt üçün onlayn yazılış keçidi.", features: ["Paylaşılan keçid", "Sayt vidceti", "Mobil görünüş"], available: false, priceLabel: "Hazırlanır" },
];
const key = (id: string) => `zeyvo_business_integrations_demo_v1_${id}`;
const initial: IntegrationsData = { whatsapp: { phone: "", notifyOnBookingCreated: true, notifyReminder: true, notifyOnBookingCancelled: true, notifyMasterOnNewBooking: false, notifyReviewRequest: false, reminderHours: 2, template: "Salam, {client_name}! {business_name} məkanında {service_name} üçün qəbulunuz {date} saat {time} tarixindədir." }, reviews: [] };
function valid(value: unknown): value is IntegrationsData { if (!value || typeof value !== "object") return false; const item = value as Partial<IntegrationsData>; return !!item.whatsapp && typeof item.whatsapp.phone === "string" && typeof item.whatsapp.template === "string" && Array.isArray(item.reviews); }
export function readIntegrations(session: BusinessSession): IntegrationsData { try { const raw = localStorage.getItem(key(session.id)); if (raw) { const parsed: unknown = JSON.parse(raw); if (valid(parsed)) return parsed; } } catch { /* Browser storage may be unavailable. */ } return structuredClone(initial); }
export function saveIntegrations(id: string, data: IntegrationsData): boolean { try { localStorage.setItem(key(id), JSON.stringify(data)); return true; } catch { return false; } }
