import type { StaffStatus } from "./staff";

export type StaffFilters = { role: string; status: "all" | StaffStatus; branch: string; shift: "all" | "working"; online: "all" | "online" };
export const emptyStaffFilters: StaffFilters = { role: "all", status: "all", branch: "all", shift: "all", online: "all" };
