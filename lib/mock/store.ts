import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

type Row = Record<string, unknown> & { id: string };

const tables = new Map<string, Row[]>();

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

export const mock = {
  all<T extends Row>(table: string): T[] {
    return (tables.get(table) ?? []) as T[];
  },
  findById<T extends Row>(table: string, id: string): T | undefined {
    return tables.get(table)?.find((r) => r.id === id) as T | undefined;
  },
  findOne<T>(table: string, pred: (row: T) => boolean): T | undefined {
    return tables.get(table)?.find((r) => pred(r as unknown as T)) as T | undefined;
  },
  where<T>(table: string, pred: (row: T) => boolean): T[] {
    return (tables.get(table) ?? []).filter((r) => pred(r as unknown as T)) as T[];
  },
  updateOne<T>(table: string, pred: (row: T) => boolean, patch: Partial<T>): T | undefined {
    const rows = tables.get(table) ?? [];
    const idx = rows.findIndex((r) => pred(r as unknown as T));
    if (idx === -1) return undefined;
    const updated = { ...(rows[idx] as object), ...patch } as Row;
    rows[idx] = updated;
    tables.set(table, rows);
    return updated as unknown as T;
  },
  insert<T extends Row>(table: string, row: T): T {
    const id = row.id ?? randomUUID();
    const full = { ...row, id } as Row;
    tables.set(table, [full, ...(tables.get(table) ?? [])]);
    return full as T;
  },
  update<T extends Row>(table: string, id: string, patch: Partial<T>): T | undefined {
    const rows = tables.get(table) ?? [];
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    const updated = { ...rows[idx], ...patch, id } as Row;
    rows[idx] = updated;
    tables.set(table, rows);
    return updated as T;
  },
  remove(table: string, id: string): boolean {
    const rows = tables.get(table) ?? [];
    const next = rows.filter((r) => r.id !== id);
    tables.set(table, next);
    return next.length !== rows.length;
  },
  clear() {
    tables.clear();
  },
  count(table: string): number {
    return (tables.get(table) ?? []).length;
  },
};

const hash = bcrypt.hashSync("zacode", 10);

const DEMO_EMAILS = [
  "sarah.lee@acme.io", "james.wilson@globex.com", "maya.patel@stark.co", "liam.harris@wayne.co",
  "emma.brown@umbrella.dev", "noah.davis@initech.net", "olivia.martin@vandelay.io", "lucas.anderson@hooli.com",
  "ava.thompson@wonka.co", "ethan.white@piedpiper.net", "isabella.clark@acme.io", "mason.lewis@globex.com",
  "mia.walker@stark.co", "logan.hall@umbrella.dev", "sophia.allen@initech.net", "benjamin.young@vandelay.io",
  "charlotte.king@hooli.com", "henry.wright@wonka.co", "amelia.scott@piedpiper.net", "sebastian.green@acme.io",
  "harper.adams@globex.com", "jack.nelson@stark.co", "ella.carter@umbrella.dev", "owen.mitchell@initech.net",
  "luna.roberts@vandelay.io", "david.turner@hooli.com", "grace.phillips@wonka.co", "samuel.parker@piedpiper.net",
  "chloe.evans@acme.io", "daniel.edwards@globex.com",
];

const COMPANIES = ["Acme Inc", "Globex", "Stark Industries", "Wayne Enterprises", "Umbrella Corp", "Initech", "Vandelay Industries", "Hooli", "Wonka Co", "Pied Piper", "Cyberdyne", "Massive Dynamic"];

const PLANS = ["Starter", "Pro", "Enterprise", "Free"];
const STATUSES = ["active", "trialing", "past_due", "canceled"];
const COUNTRIES = ["United States", "Indonesia", "Singapore", "Germany", "Japan", "United Kingdom", "Australia", "Canada", "India", "Brazil"];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function firstName(full: string) {
  return full.split(" ")[0];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function seed() {
  mock.clear();

  const admin: Row = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Alex Morgan",
    email: "admin@zacode.dev",
    emailVerified: true,
    passwordHash: hash,
    image: "",
    company: "Zacode Labs",
    phone: "+1 (555) 010-9988",
    role: "admin",
    language: "en",
    timezone: "Asia/Jakarta",
    createdAt: daysAgo(320),
    updatedAt: daysAgo(2),
  };
  mock.insert("users", admin);

  const demoUser: Row = {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Jordan Blake",
    email: "demo@zacode.dev",
    emailVerified: true,
    passwordHash: hash,
    image: "",
    company: "Blake Digital",
    phone: "+62 812 3456 7890",
    role: "member",
    language: "en",
    timezone: "Asia/Jakarta",
    createdAt: daysAgo(200),
    updatedAt: daysAgo(1),
  };
  mock.insert("users", demoUser);

  const plans = [
    {
      name: "Starter", slug: "starter",
      description: "For individuals and small teams getting started.",
      monthlyPrice: 19, annualPrice: 182,
      originalMonthlyPrice: 29, originalAnnualPrice: 278,
      features: ["3 projects", "10,000 API calls/mo", "Basic analytics", "Community support", "2 team members"],
      popular: false, active: true, ctaText: "Start Free Trial", sortOrder: 1,
    },
    {
      name: "Pro", slug: "pro",
      description: "For growing teams that need power and flexibility.",
      monthlyPrice: 49, annualPrice: 470,
      originalMonthlyPrice: 79, originalAnnualPrice: 758,
      features: ["Unlimited projects", "1M API calls/mo", "Advanced analytics & AI insights", "Priority support", "Unlimited team members", "Custom integrations", "API access"],
      popular: true, active: true, ctaText: "Start Free Trial", sortOrder: 2,
    },
    {
      name: "Enterprise", slug: "enterprise",
      description: "Security, compliance and scale for large organizations.",
      monthlyPrice: 0, annualPrice: 0,
      originalMonthlyPrice: 0, originalAnnualPrice: 0,
      features: ["Everything in Pro", "SSO / SAML", "Dedicated success manager", "99.99% SLA", "Custom contracts", "On-premise option"],
      popular: false, active: true, ctaText: "Contact Sales", sortOrder: 3,
    },
  ];
  plans.forEach((p, i) =>
    mock.insert("plans", {
      ...p,
      id: `plan-${i + 1}-0000-0000-00000000000${i + 1}`.slice(0, 36),
      monthlyPrice: p.monthlyPrice,
    } satisfies Row),
  );

  const customers = DEMO_EMAILS.map((email, i) => ({
    name: email.split("@")[0].split(".").map((p) => p[0].toUpperCase() + p.slice(1)).join(" "),
    email,
    company: randomPick(COMPANIES),
    plan: randomPick(PLANS),
    status: i % 12 === 0 ? "trialing" : i % 9 === 0 ? "canceled" : randomPick(STATUSES.slice(0, 2)),
    joinedDate: daysAgo(Math.floor(Math.random() * 320)),
    revenue: randomAmount(0, 12000),
    avatar: "",
    country: randomPick(COUNTRIES),
  }));
  customers.forEach((c, i) =>
    mock.insert("customers", { ...c, id: `cust-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const leadSources = ["Organic Search", "Referral", "LinkedIn", "Twitter/X", "Webinar", "Cold Email", "Paid Ads", "Product Hunt"];
  const leadStatuses = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  const leads = Array.from({ length: 24 }, (_, i) => ({
    name: `${firstName(randomPick(DEMO_EMAILS))} ${randomPick(["Smith", "Jones", "Garcia", "Kim", "Nguyen", "Brown"])}`,
    email: `lead${i + 1}@prospect.com`,
    company: randomPick(COMPANIES),
    status: randomPick(leadStatuses),
    source: randomPick(leadSources),
    score: Math.floor(Math.random() * 100),
  }));
  leads.forEach((l, i) =>
    mock.insert("leads", { ...l, id: `lead-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const products = [
    { name: "Pro Annual License", description: "1-year Pro plan for a team of 5", price: 470, sku: "PRO-ANN-5", category: "Licenses", stock: 999, image: "", active: true },
    { name: "Starter Monthly", description: "Monthly Starter plan", price: 19, sku: "STR-MON", category: "Licenses", stock: 999, image: "", active: true },
    { name: "Onboarding Package", description: "1:1 onboarding & migration", price: 499, sku: "ONB-001", category: "Services", stock: 50, image: "", active: true },
    { name: "Priority Support Add-on", description: "24/7 priority support", price: 99, sku: "SUP-PRI", category: "Add-ons", stock: 999, image: "", active: true },
    { name: "API Credit Pack (100k)", description: "Extra API calls", price: 29, sku: "API-100K", category: "Add-ons", stock: 999, image: "", active: true },
  ];
  products.forEach((p, i) =>
    mock.insert("products", { ...p, id: `prod-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const coupons = [
    { code: "LAUNCH35", type: "percent", value: 35, maxUses: 500, uses: 87, expiresAt: daysAgo(-12), active: true, description: "Launch discount" },
    { code: "SAVE20", type: "percent", value: 20, maxUses: 1000, uses: 310, expiresAt: daysAgo(-30), active: true, description: "Annual billing" },
    { code: "WELCOME10", type: "percent", value: 10, maxUses: 0, uses: 421, expiresAt: null, active: true, description: "New users" },
    { code: "FLAT50", type: "fixed", value: 50, maxUses: 100, uses: 23, expiresAt: daysAgo(-7), active: true, description: "Flat $50 off" },
  ];
  coupons.forEach((c, i) =>
    mock.insert("coupons", { ...c, id: `coup-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const subscriptionStatuses = ["active", "trialing", "canceled", "expired", "past_due"];
  const subscriptions = Array.from({ length: 28 }, (_, i) => ({
    userId: i === 0 ? demoUser.id : "33333333-3333-3333-3333-333333333333",
    planId: randomPick(plans.map((p, idx) => `plan-${idx + 1}-0000-0000-00000000000${idx + 1}`.slice(0, 36))),
    status: randomPick(subscriptionStatuses),
    provider: randomPick(["stripe", "midtrans", "xendit", "paypal", "demo"]),
    interval: randomPick(["monthly", "annual"]),
    currentPeriodStart: daysAgo(randomAmount(5, 30)),
    currentPeriodEnd: daysAgo(randomAmount(-5, 30)),
    createdAt: daysAgo(randomAmount(10, 300)),
  }));
  subscriptions.forEach((s, i) =>
    mock.insert("subscriptions", { ...s, id: `sub-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const orderStatuses = ["paid", "pending", "failed", "refunded"];
  const orders = Array.from({ length: 40 }, (_, i) => {
    const amt = randomAmount(19, 758);
    return {
      id: `ord-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000`,
      userId: i % 3 === 0 ? demoUser.id : "33333333-3333-3333-3333-333333333333",
      planId: null,
      customerName: customers[i % customers.length].name,
      customerEmail: customers[i % customers.length].email,
      amount: amt,
      currency: "USD",
      status: randomPick(orderStatuses),
      provider: randomPick(["stripe", "midtrans", "xendit", "paypal", "demo"]),
      interval: randomPick(["monthly", "annual"]),
      createdAt: daysAgo(randomAmount(1, 200)),
    };
  });
  orders.forEach((o) => mock.insert("orders", o as unknown as Row));

  const invoices = orders.slice(0, 30).map((o, i) => ({
    userId: o.userId,
    orderId: o.id,
    number: `INV-${2026}${String(i + 1).padStart(4, "0")}`,
    subtotal: Math.round(o.amount * 100) / 100,
    taxAmount: Math.round(o.amount * 0.1 * 100) / 100,
    total: Math.round(o.amount * 1.1 * 100) / 100,
    currency: "USD",
    status: o.status === "paid" ? "paid" : o.status === "refunded" ? "refunded" : "pending",
    issuedAt: o.createdAt,
    dueAt: daysAgo(randomAmount(-5, 25)),
  }));
  invoices.forEach((inv, i) =>
    mock.insert("invoices", { ...inv, id: `inv-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const payments = orders.map((o, i) => ({
    userId: o.userId,
    orderId: o.id,
    provider: o.provider,
    amount: o.amount,
    currency: "USD",
    status: o.status === "paid" ? "succeeded" : o.status === "refunded" ? "refunded" : "failed",
    providerTransactionId: `txn_${randomUUID().slice(0, 12)}`,
    createdAt: o.createdAt,
  }));
  payments.forEach((p, i) =>
    mock.insert("payments", { ...p, id: `pay-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const notifTitles = [
    ["New subscription", "Jordan subscribed to the Pro plan.", "success"],
    ["Payment received", "Invoice INV-20260012 was paid via Stripe.", "success"],
    ["Trial ending soon", "Acme Inc's 14-day trial ends in 2 days.", "warning"],
    ["New lead captured", "A new lead from LinkedIn scored 82.", "info"],
    ["Churn alert", "Wayne Enterprises canceled their subscription.", "error"],
    ["Team invitation", "You invited sophia.walker@acme.io to the team.", "info"],
    ["API key created", "A new API key 'production-write' was created.", "warning"],
    ["Support ticket", "Ticket #T-1042 was resolved.", "success"],
  ];
  const notifications = notifTitles.map(([title, message, type], i) => ({
    userId: demoUser.id,
    title: title as string,
    message: message as string,
    type: type as string,
    read: i >= 3,
    createdAt: hoursAgo(i * 6),
  }));
  notifications.forEach((n, i) =>
    mock.insert("notifications", { ...n, id: `notif-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const teamMembers = [
    { userId: admin.id, invitedEmail: admin.email, name: admin.name, role: "owner", status: "accepted", permissions: ["*"], createdAt: daysAgo(300) },
    { userId: demoUser.id, invitedEmail: demoUser.email, name: demoUser.name, role: "admin", status: "accepted", permissions: ["*"], createdAt: daysAgo(190) },
    { invitedEmail: "sophia.walker@acme.io", name: "Sophia Walker", role: "manager", status: "pending", permissions: ["customers:read", "billing:read"], createdAt: daysAgo(3) },
    { invitedEmail: "liam.chen@globex.com", name: "Liam Chen", role: "member", status: "accepted", permissions: ["customers:read", "analytics:read"], createdAt: daysAgo(60) },
    { invitedEmail: "nora.ahmed@stark.co", name: "Nora Ahmed", role: "member", status: "pending", permissions: ["customers:read"], createdAt: daysAgo(1) },
  ];
  teamMembers.forEach((t, i) =>
    mock.insert("teamMembers", { ...t, id: `team-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  mock.insert("apiKeys", {
    id: "key-001-0000-0000-000000000000", userId: demoUser.id, name: "production-write",
    keyPreview: "nb_live_…a1b2", keyHash: "hash-a1b2c3", lastUsedAt: hoursAgo(2), revoked: false, createdAt: daysAgo(120),
  } satisfies Row);
  mock.insert("apiKeys", {
    id: "key-002-0000-0000-000000000000", userId: demoUser.id, name: "analytics-read",
    keyPreview: "nb_live_…c9d0", keyHash: "hash-c9d0e1", lastUsedAt: daysAgo(4), revoked: false, createdAt: daysAgo(80),
  } satisfies Row);
  mock.insert("apiKeys", {
    id: "key-003-0000-0000-000000000000", userId: demoUser.id, name: "staging",
    keyPreview: "nb_test_…f2g3", keyHash: "hash-f2g3h4", lastUsedAt: null, revoked: true, createdAt: daysAgo(200),
  } satisfies Row);

  const tickets = [
    { userId: demoUser.id, subject: "How do I export my customer data?", message: "I need to export customers to CSV for my accountant.", status: "open", priority: "normal", category: "Billing", createdAt: hoursAgo(5) },
    { userId: demoUser.id, subject: "API rate limits", message: "Can I increase my monthly API call limit?", status: "pending", priority: "low", category: "API", createdAt: daysAgo(2) },
    { userId: demoUser.id, subject: "Invoice not received", message: "I haven't received the invoice for last month.", status: "resolved", priority: "high", category: "Billing", createdAt: daysAgo(6) },
    { userId: demoUser.id, subject: "2FA not working", message: "The authenticator code is not accepted.", status: "closed", priority: "normal", category: "Security", createdAt: daysAgo(9) },
  ];
  tickets.forEach((t, i) =>
    mock.insert("tickets", { ...t, id: `t-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const blogPosts = [
    { title: "The 2026 Guide to AI-Powered Growth", slug: "ai-powered-growth-2026", excerpt: "How modern SaaS teams use AI to compound growth.", content: "…", coverImage: "", authorName: "Alex Morgan", tags: ["AI", "Growth"], published: true, publishedAt: daysAgo(3) },
    { title: "10 Automation Workflows That Save 20 Hours a Week", slug: "automation-workflows", excerpt: "Battle-tested automation recipes for busy operators.", content: "…", coverImage: "", authorName: "Priya Sharma", tags: ["Automation", "Productivity"], published: true, publishedAt: daysAgo(9) },
    { title: "From Free Trial to Paying Customer", slug: "trial-to-paying", excerpt: "A playbook for turning trial users into revenue.", content: "…", coverImage: "", authorName: "Tom Becker", tags: ["Growth", "Pricing"], published: true, publishedAt: daysAgo(16) },
    { title: "Zero to Enterprise: Scaling Secure SaaS", slug: "zero-to-enterprise", excerpt: "What it takes to pass enterprise security reviews.", content: "…", coverImage: "", authorName: "Alex Morgan", tags: ["Security", "Enterprise"], published: true, publishedAt: daysAgo(24) },
    { title: "Designing Delightful Dashboards", slug: "delightful-dashboards", excerpt: "Principles for data-rich interfaces your users love.", content: "…", coverImage: "", authorName: "Yuki Tanaka", tags: ["Design", "UX"], published: true, publishedAt: daysAgo(31) },
  ];
  blogPosts.forEach((p, i) =>
    mock.insert("blogPosts", { ...p, id: `post-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const testimonials = [
    { name: "Sarah Lee", position: "CEO", company: "Acme Inc", avatar: "", rating: 5, content: "Zacode cut our onboarding time in half. The AI insights feel like having an extra analyst on the team." },
    { name: "Marcus Chen", position: "Head of Growth", company: "Pied Piper", avatar: "", rating: 5, content: "We moved from a patchwork of tools to Zacode. MRR is up 38% since we started using the revenue analytics." },
    { name: "Amelia Rodriguez", position: "Product Manager", company: "Hooli", avatar: "", rating: 5, content: "The cleanest dashboard we've used. Setup took minutes, and the API is a joy to work with." },
    { name: "David Kim", position: "CTO", company: "Vandelay Industries", avatar: "", rating: 4, content: "Security review was a breeze — SSO, audit logs and RBAC are all there. Enterprise-ready from day one." },
    { name: "Emma Johnson", position: "Founder", company: "Umbrella Corp", avatar: "", rating: 5, content: "Support replies in minutes, not days. The team genuinely cares about your success." },
    { name: "Liam O'Brien", position: "Operations Lead", company: "Initech", avatar: "", rating: 5, content: "The workflow builder is a superpower. We automated 90% of our manual reporting." },
  ];
  testimonials.forEach((t, i) =>
    mock.insert("testimonials", { ...t, id: `test-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const faqs = [
    { question: "Is there a free trial?", answer: "Yes! Every paid plan includes a 14-day free trial with full access to every feature. No credit card required.", category: "General", sortOrder: 1, published: true },
    { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription from the Billing page at any time — no cancellation fees, no phone calls required.", category: "Billing", sortOrder: 2, published: true },
    { question: "Which payment methods do you support?", answer: "We accept all major credit cards via Stripe, and offer local payment methods through Midtrans and Xendit, plus PayPal.", category: "Billing", sortOrder: 3, published: true },
    { question: "Do you have an API?", answer: "Yes. We ship a REST API with generous rate limits, webhooks, and first-class SDKs for JavaScript, Python, Go and more.", category: "Product", sortOrder: 4, published: true },
    { question: "Do you support teams?", answer: "Every plan includes team collaboration. Invite unlimited members with granular roles: Owner, Admin, Manager and Member.", category: "Product", sortOrder: 5, published: true },
    { question: "What is your refund policy?", answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not happy, email us and we'll refund you in full.", category: "Billing", sortOrder: 6, published: true },
  ];
  faqs.forEach((f, i) =>
    mock.insert("faqs", { ...f, id: `faq-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const emailTemplates = [
    { name: "Welcome Email", subject: "Welcome to Zacode 🎉", body: "Hi {{name}}, welcome aboard…", trigger: "welcome", active: true },
    { name: "Verify Your Email", subject: "Verify your email address", body: "Your verification code is {{code}}.", trigger: "verification", active: true },
    { name: "Password Reset", subject: "Reset your password", body: "Click {{link}} to reset your password.", trigger: "password_reset", active: true },
    { name: "Invoice Paid", subject: "Your invoice {{number}} is paid", body: "Thanks for your payment of {{amount}}.", trigger: "invoice_paid", active: true },
    { name: "Trial Ending", subject: "Your trial ends soon", body: "Upgrade before {{date}} to keep your data.", trigger: "trial_ending", active: true },
  ];
  emailTemplates.forEach((t, i) =>
    mock.insert("emailTemplates", { ...t, id: `et-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const auditActions = ["user.login", "customer.create", "customer.update", "customer.delete", "subscription.create", "payment.succeeded", "settings.update", "team.invite"];
  const auditLogs = Array.from({ length: 40 }, (_, i) => ({
    actorId: demoUser.id,
    actorEmail: demoUser.email,
    action: randomPick(auditActions),
    entity: randomPick(["user", "customer", "subscription", "payment", "settings", "team"]),
    entityId: randomUUID().slice(0, 8),
    details: { note: "via dashboard" },
    ip: `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
    createdAt: daysAgo(randomAmount(0, 60)),
  }));
  auditLogs.forEach((a, i) =>
    mock.insert("auditLogs", { ...a, id: `audit-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const integrations = [
    { userId: demoUser.id, name: "Slack", provider: "slack", connected: true, config: { channel: "#notifications" } },
    { userId: demoUser.id, name: "GitHub", provider: "github", connected: true, config: { repo: "zacode/web" } },
    { userId: demoUser.id, name: "Stripe", provider: "stripe", connected: true, config: { mode: "live" } },
    { userId: demoUser.id, name: "Notion", provider: "notion", connected: false, config: {} },
    { userId: demoUser.id, name: "Figma", provider: "figma", connected: false, config: {} },
    { userId: demoUser.id, name: "Zapier", provider: "zapier", connected: true, config: { triggers: 4 } },
    { userId: demoUser.id, name: "Discord", provider: "discord", connected: false, config: {} },
    { userId: demoUser.id, name: "Google Workspace", provider: "google", connected: true, config: {} },
  ];
  integrations.forEach((intg, i) =>
    mock.insert("integrations", { ...intg, id: `intg-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  const settings = [
    { key: "app_name", value: "Zacode", category: "general" },
    { key: "support_email", value: "support@zacode.dev", category: "general" },
    { key: "maintenance_mode", value: "false", category: "general" },
    { key: "allow_registration", value: "true", category: "auth" },
    { key: "require_email_verification", value: "true", category: "auth" },
    { key: "default_currency", value: "USD", category: "billing" },
    { key: "tax_rate", value: "10", category: "billing" },
  ];
  settings.forEach((s, i) =>
    mock.insert("siteSettings", { ...s, id: `set-${String(i + 1).padStart(3, "0")}-0000-0000-000000000000` } satisfies Row),
  );

  mock.insert("twoFactorSecrets", {
    id: "22222222-2222-2222-2222-222222222222",
    userId: demoUser.id,
    secret: "JBSWY3DPEHPK3PXP",
    enabled: false,
    backupCodes: [],
    updatedAt: daysAgo(0),
  } satisfies Row);
}

let seeded = false;
export function ensureMockSeeded() {
  if (!seeded) {
    seed();
    seeded = true;
  }
}

export function resetMock() {
  seeded = false;
  ensureMockSeeded();
}

export { firstName, initials };
