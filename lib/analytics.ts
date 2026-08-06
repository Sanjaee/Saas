export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function daysLabels(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86400000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
}

function monthsLabels(n: number) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (n - 1 - i));
    return d.toLocaleDateString("en-US", { month: "short" });
  });
}

export interface AnalyticsSeries {
  revenue: { label: string; value: number }[];
  sales: { label: string; value: number }[];
  users: { label: string; value: number }[];
  traffic: { label: string; sessions: number; visitors: number }[];
  devices: { name: string; value: number }[];
  countries: { name: string; value: number }[];
  topPages: { path: string; views: number; trend: number }[];
  targets: { label: string; value: number; target: number }[];
}

export function generateAnalytics(): AnalyticsSeries {
  const rnd = mulberry32(2026);
  const revenue = monthsLabels(12).map((label) => ({
    label,
    value: Math.round((38000 + rnd() * 42000) * 100) / 100,
  }));
  const sales = monthsLabels(12).map((label) => ({
    label,
    value: Math.round(120 + rnd() * 340),
  }));
  const users = monthsLabels(12).map((label, i) => ({
    label,
    value: Math.round(9000 + i * 1650 + rnd() * 2500),
  }));
  const traffic = daysLabels(30).map((label) => ({
    label,
    sessions: Math.round(2200 + rnd() * 3800),
    visitors: Math.round(1700 + rnd() * 3000),
  }));

  const devices = [
    { name: "Desktop", value: 54 },
    { name: "Mobile", value: 34 },
    { name: "Tablet", value: 8 },
    { name: "Other", value: 4 },
  ];

  const countries = [
    { name: "United States", value: 38 },
    { name: "Indonesia", value: 14 },
    { name: "Germany", value: 11 },
    { name: "United Kingdom", value: 9 },
    { name: "Singapore", value: 7 },
    { name: "Japan", value: 6 },
    { name: "Others", value: 15 },
  ];

  const topPages = [
    { path: "/dashboard", views: 48210, trend: 12.4 },
    { path: "/pricing", views: 24108, trend: 8.1 },
    { path: "/features", views: 19302, trend: -2.3 },
    { path: "/blog/ai-growth", views: 12874, trend: 21.7 },
    { path: "/docs/api", views: 11032, trend: 5.9 },
    { path: "/integrations", views: 9640, trend: 3.2 },
  ];

  const targets = [
    { label: "Monthly Revenue", value: 92450, target: 120000 },
    { label: "Active Users", value: 18400, target: 25000 },
    { label: "New Signups", value: 2310, target: 3000 },
    { label: "Enterprise Deals", value: 14, target: 20 },
  ];

  return { revenue, sales, users, traffic, devices, countries, topPages, targets };
}

export interface DashboardStats {
  totalRevenue: number;
  activeUsers: number;
  newUsers: number;
  conversionRate: number;
  activeSubscriptions: number;
  mrr: number;
  arr: number;
  churnRate: number;
  deltas: Record<string, number>;
}

export function generateDashboardStats(): DashboardStats {
  const rnd = mulberry32(99);
  const totalRevenue = Math.round(1284500);
  const mrr = Math.round(92450 + rnd() * 4000);
  const activeSubscriptions = 18320;
  return {
    totalRevenue,
    activeUsers: 18400,
    newUsers: 2310,
    conversionRate: 3.42,
    activeSubscriptions,
    mrr,
    arr: mrr * 12,
    churnRate: 1.8,
    deltas: {
      totalRevenue: 12.5,
      activeUsers: 8.2,
      newUsers: 18.9,
      conversionRate: -0.4,
      activeSubscriptions: 6.1,
      mrr: 11.7,
      arr: 12.2,
      churnRate: -0.3,
    },
  };
}
