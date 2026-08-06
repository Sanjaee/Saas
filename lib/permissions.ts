export type Role = "owner" | "admin" | "manager" | "member";

export const ROLE_ORDER: Role[] = ["member", "manager", "admin", "owner"];

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  member: "Member",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access, billing, and ownership of the workspace.",
  admin: "Everything except deleting the workspace and owner-only settings.",
  manager: "Manage customers, projects, and team members.",
  member: "View data and use the product.",
};

export const ALL_PERMISSIONS = [
  "dashboard:read",
  "analytics:read",
  "customers:read",
  "customers:write",
  "leads:read",
  "leads:write",
  "billing:read",
  "billing:write",
  "team:read",
  "team:write",
  "settings:read",
  "settings:write",
  "api:manage",
  "admin:all",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [...ALL_PERMISSIONS],
  admin: [
    "dashboard:read",
    "analytics:read",
    "customers:read",
    "customers:write",
    "leads:read",
    "leads:write",
    "billing:read",
    "billing:write",
    "team:read",
    "team:write",
    "settings:read",
    "settings:write",
    "api:manage",
  ],
  manager: [
    "dashboard:read",
    "analytics:read",
    "customers:read",
    "customers:write",
    "leads:read",
    "leads:write",
    "billing:read",
    "team:read",
    "settings:read",
  ],
  member: ["dashboard:read", "analytics:read", "customers:read", "billing:read"],
};

export function hasPermission(role: Role, permission: Permission, extra?: string[]) {
  if (extra?.includes("admin:all") || extra?.includes("*")) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) || extra?.includes(permission) || false;
}

export function roleAtLeast(role: Role, min: Role) {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min);
}
