import {
  LayoutDashboard,
  BarChart3,
  Users,
  Magnet,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  UsersRound,
  CreditCard,
  ShoppingCart,
  Package,
  Blocks,
  KeyRound,
  Bell,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  admin?: boolean;
  tKey?: keyof Dictionary["nav"];
}

export interface NavGroup {
  label: string;
  tKey?: keyof Dictionary["nav"];
  items: NavItem[];
}

export const MAIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    tKey: "overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tKey: "dashboard" },
      { title: "Analytics", href: "/analytics", icon: BarChart3, tKey: "analytics" },
    ],
  },
  {
    label: "Workspace",
    tKey: "workspace",
    items: [
      { title: "Customers", href: "/customers", icon: Users, tKey: "customers" },
      { title: "Leads", href: "/leads", icon: Magnet, tKey: "leads" },
      { title: "Projects", href: "/projects", icon: FolderKanban, tKey: "projects" },
      { title: "Tasks", href: "/tasks", icon: CheckSquare, tKey: "tasks" },
      { title: "Calendar", href: "/calendar", icon: CalendarDays, tKey: "calendar" },
      { title: "Team", href: "/team", icon: UsersRound, tKey: "team" },
    ],
  },
  {
    label: "Commerce",
    tKey: "commerce",
    items: [
      { title: "Billing", href: "/billing", icon: CreditCard, tKey: "billing" },
      { title: "Orders", href: "/orders", icon: ShoppingCart, tKey: "orders" },
      { title: "Products", href: "/products", icon: Package, tKey: "products" },
    ],
  },
  {
    label: "Developer",
    tKey: "developer",
    items: [
      { title: "Integrations", href: "/integrations", icon: Blocks, tKey: "integrations" },
      { title: "API Keys", href: "/api-keys", icon: KeyRound, tKey: "apiKeys" },
    ],
  },
  {
    label: "Account",
    tKey: "account",
    items: [
      { title: "Notifications", href: "/notifications", icon: Bell, tKey: "notifications" },
      { title: "Settings", href: "/settings", icon: Settings, tKey: "settings" },
      { title: "Help Center", href: "/help", icon: LifeBuoy, tKey: "helpCenter" },
    ],
  },
];

export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Admin",
    tKey: "admin",
    items: [
      { title: "Admin Overview", href: "/admin", icon: LayoutDashboard, admin: true, tKey: "adminOverview" },
      { title: "Users", href: "/admin/users", icon: Users, admin: true, tKey: "users" },
      { title: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, admin: true, tKey: "subscriptions" },
      { title: "Payments", href: "/admin/payments", icon: BarChart3, admin: true, tKey: "payments" },
      { title: "Coupons", href: "/admin/coupons", icon: KeyRound, admin: true, tKey: "coupons" },
      { title: "Pricing Plans", href: "/admin/plans", icon: Package, admin: true, tKey: "pricingPlans" },
      { title: "Products", href: "/admin/products", icon: ShoppingCart, admin: true, tKey: "products" },
      { title: "Blog", href: "/admin/blog", icon: FolderKanban, admin: true, tKey: "blog" },
      { title: "Testimonials", href: "/admin/testimonials", icon: UsersRound, admin: true, tKey: "testimonials" },
      { title: "FAQs", href: "/admin/faqs", icon: CheckSquare, admin: true, tKey: "faqs" },
      { title: "Email Templates", href: "/admin/email-templates", icon: LifeBuoy, admin: true, tKey: "emailTemplates" },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: Settings, admin: true, tKey: "auditLogs" },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3, admin: true, tKey: "analytics" },
      { title: "System Settings", href: "/admin/settings", icon: Blocks, admin: true, tKey: "systemSettings" },
    ],
  },
];
