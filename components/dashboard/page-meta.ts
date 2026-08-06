"use client"

import { usePathname } from "next/navigation";

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Your business at a glance." },
  "/analytics": { title: "Analytics", description: "Deep-dive into performance." },
  "/customers": { title: "Customers", description: "Manage your customer base." },
  "/leads": { title: "Leads", description: "Track and convert leads." },
  "/projects": { title: "Projects", description: "Organize your work." },
  "/tasks": { title: "Tasks", description: "Stay on top of everything." },
  "/calendar": { title: "Calendar", description: "Plan your schedule." },
  "/team": { title: "Team", description: "Members, roles & permissions." },
  "/billing": { title: "Billing", description: "Plans, invoices & payments." },
  "/orders": { title: "Orders", description: "Recent transactions." },
  "/products": { title: "Products", description: "Catalog & inventory." },
  "/integrations": { title: "Integrations", description: "Connect your tools." },
  "/api-keys": { title: "API Keys", description: "Authenticate with our API." },
  "/notifications": { title: "Notifications", description: "Everything that needs your attention." },
  "/settings": { title: "Settings", description: "Profile, security & preferences." },
  "/help": { title: "Help Center", description: "We're here to help." },
  "/admin": { title: "Admin Overview", description: "Control center." },
  "/admin/users": { title: "Users", description: "Manage platform users." },
  "/admin/subscriptions": { title: "Subscriptions", description: "All subscriptions." },
  "/admin/payments": { title: "Payments", description: "Transaction ledger." },
  "/admin/coupons": { title: "Coupons", description: "Discount codes." },
  "/admin/plans": { title: "Pricing Plans", description: "Tiers & pricing." },
  "/admin/products": { title: "Products", description: "Catalog management." },
  "/admin/blog": { title: "Blog", description: "Publish articles." },
  "/admin/testimonials": { title: "Testimonials", description: "Social proof." },
  "/admin/faqs": { title: "FAQs", description: "Help center content." },
  "/admin/email-templates": { title: "Email Templates", description: "Transactional emails." },
  "/admin/audit-logs": { title: "Audit Logs", description: "Security & activity trail." },
  "/admin/analytics": { title: "Admin Analytics", description: "Platform metrics." },
  "/admin/settings": { title: "System Settings", description: "Global configuration." },
};

export function usePageMeta() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? PAGE_META["/dashboard"] ?? {
    title: "Zacode",
    description: "",
  };
  return meta;
}
