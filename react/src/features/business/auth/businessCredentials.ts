import { changeLocalPassword, createLocalAccount, hasLocalAccount, listLocalAccountProfiles, readLocalAccount, removeLocalAccount } from "@/lib/localCredentials";
import { demoBusinessSession, type BusinessSession } from "./businessSession";

export const starterPassword = "zeyvobiz2026";
const removedKey = "zeyvo_business_starter_removed_v1";

export function listBusinessSessions(): BusinessSession[] {
  const saved = listLocalAccountProfiles<BusinessSession>("business");
  let removed = false;
  try { removed = localStorage.getItem(removedKey) === "1"; } catch { /* Use the available local profiles. */ }
  return removed || saved.some((item) => item.id === demoBusinessSession.id)
    ? saved : [demoBusinessSession, ...saved];
}

export function businessEmailExists(email: string): boolean {
  return hasLocalAccount("business", email) ||
    (email.trim().toLowerCase() === demoBusinessSession.email && localStorage.getItem(removedKey) !== "1");
}

export function createBusinessAccount(session: BusinessSession, password: string) {
  return createLocalAccount("business", session.email, password, session);
}

export async function signInBusiness(email: string, password: string): Promise<BusinessSession | null> {
  const account = await readLocalAccount<BusinessSession>("business", email, password);
  if (account) return account;
  const starter = email.trim().toLowerCase() === demoBusinessSession.email;
  const removed = localStorage.getItem(removedKey) === "1";
  return starter && !removed && !hasLocalAccount("business", email) && password === starterPassword ? demoBusinessSession : null;
}

export function changeBusinessPassword(session: BusinessSession, current: string, next: string) {
  return changeLocalPassword("business", session.email, current, next, session.id === demoBusinessSession.id ? { password: starterPassword, profile: session } : undefined);
}

export function deleteBusinessAccount(session: BusinessSession): boolean {
  try {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("zeyvo_business_") && key.endsWith(`_${session.id}`));
    keys.forEach((key) => localStorage.removeItem(key));
    if (!removeLocalAccount("business", session.email)) return false;
    if (session.id === demoBusinessSession.id) localStorage.setItem(removedKey, "1");
    return true;
  } catch { return false; }
}
