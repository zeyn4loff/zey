import { useState } from "react";
import type { BusinessSession } from "../auth/businessSession";
import { readBusinesses, saveBusinesses, type Business } from "./businesses";

export function useBusinesses(session: BusinessSession) {
  const [businesses, setBusinesses] = useState<Business[]>(() => readBusinesses(session));

  function update(next: Business[]) {
    setBusinesses(next);
    saveBusinesses(session.id, next);
  }

  return { businesses, update };
}
