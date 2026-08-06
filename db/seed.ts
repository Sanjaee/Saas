 
import "dotenv/config";
import bcrypt from "bcryptjs";
import { getDb } from "./index";
import * as schema from "./schema";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

const DEMO_EMAILS = [
  "sarah.lee@acme.io", "james.wilson@globex.com", "maya.patel@stark.co", "liam.harris@wayne.co",
  "emma.brown@umbrella.dev", "noah.davis@initech.net", "olivia.martin@vandelay.io", "lucas.anderson@hooli.com",
  "ava.thompson@wonka.co", "ethan.white@piedpiper.net", "isabella.clark@acme.io", "mason.lewis@globex.com",
];
const COMPANIES = ["Acme Inc", "Globex", "Stark Industries", "Wayne Enterprises", "Umbrella Corp", "Initech", "Vandelay Industries", "Hooli", "Wonka Co", "Pied Piper"];
const COUNTRIES = ["United States", "Indonesia", "Singapore", "Germany", "Japan", "United Kingdom"];
const STATUSES = ["active", "trialing", "past_due", "canceled"];
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  const db = getDb();
  console.log("🌱 Seeding database…");

  const passwordHash = bcrypt.hashSync("zacode", 10);

  const [admin] = await db
    .insert(schema.users)
    .values({
      name: "Alex Morgan",
      email: "admin@zacode.dev",
      passwordHash,
      emailVerified: true,
      company: "Zacode Labs",
      role: "owner",
    })
    .onConflictDoNothing()
    .returning();

  const [demoUser] = await db
    .insert(schema.users)
    .values({
      name: "Jordan Blake",
      email: "demo@zacode.dev",
      passwordHash,
      emailVerified: true,
      company: "Blake Digital",
      role: "member",
    })
    .onConflictDoNothing()
    .returning();

  const planRows = await db
    .insert(schema.plans)
    .values([
      {
        name: "Starter", slug: "starter",
        description: "For individuals and small teams getting started.",
        monthlyPrice: 19, annualPrice: 182,
        originalMonthlyPrice: 29, originalAnnualPrice: 278,
        features: ["3 projects", "10,000 API calls/mo", "Basic analytics", "Community support", "2 team members"],
        popular: false, sortOrder: 1, ctaText: "Start Free Trial",
      },
      {
        name: "Pro", slug: "pro",
        description: "For growing teams that need power and flexibility.",
        monthlyPrice: 49, annualPrice: 470,
        originalMonthlyPrice: 79, originalAnnualPrice: 758,
        features: ["Unlimited projects", "1M API calls/mo", "Advanced analytics & AI insights", "Priority support", "Unlimited team members", "Custom integrations", "API access"],
        popular: true, sortOrder: 2, ctaText: "Start Free Trial",
      },
      {
        name: "Enterprise", slug: "enterprise",
        description: "Security, compliance and scale for large organizations.",
        monthlyPrice: 0, annualPrice: 0, originalMonthlyPrice: 0, originalAnnualPrice: 0,
        features: ["Everything in Pro", "SSO / SAML", "Dedicated success manager", "99.99% SLA", "Custom contracts", "On-premise option"],
        popular: false, sortOrder: 3, ctaText: "Contact Sales",
      },
    ])
    .onConflictDoNothing()
    .returning();

  await db
    .insert(schema.coupons)
    .values([
      { code: "LAUNCH35", type: "percent", value: 35, maxUses: 500, uses: 87, active: true, description: "Launch discount" },
      { code: "SAVE20", type: "percent", value: 20, maxUses: 1000, uses: 310, active: true, description: "Annual billing" },
      { code: "WELCOME10", type: "percent", value: 10, maxUses: 0, uses: 421, active: true, description: "New users" },
      { code: "FLAT50", type: "fixed", value: 50, maxUses: 100, uses: 23, active: true, description: "Flat $50 off" },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.customers)
    .values(
      DEMO_EMAILS.map((email, i) => ({
        name: email.split("@")[0].split(".").map((p) => p[0].toUpperCase() + p.slice(1)).join(" "),
        email,
        company: pick(COMPANIES),
        plan: pick(["Starter", "Pro", "Enterprise", "Free"]),
        status: i % 12 === 0 ? "trialing" : pick(STATUSES),
        joinedDate: daysAgo(Math.floor(Math.random() * 300)),
        revenue: Math.round(Math.random() * 12000 * 100) / 100,
        country: pick(COUNTRIES),
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(schema.leads)
    .values(
      Array.from({ length: 18 }, (_, i) => ({
        name: `Lead ${i + 1}`,
        email: `lead${i + 1}@prospect.com`,
        company: pick(COMPANIES),
        status: pick(["new", "contacted", "qualified", "proposal", "won", "lost"]),
        source: pick(["Organic Search", "Referral", "LinkedIn", "Webinar", "Paid Ads"]),
        score: Math.floor(Math.random() * 100),
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(schema.products)
    .values([
      { name: "Pro Annual License", description: "1-year Pro plan for a team of 5", price: 470, sku: "PRO-ANN-5", category: "Licenses", stock: 999, active: true },
      { name: "Onboarding Package", description: "1:1 onboarding & migration", price: 499, sku: "ONB-001", category: "Services", stock: 50, active: true },
      { name: "API Credit Pack (100k)", description: "Extra API calls", price: 29, sku: "API-100K", category: "Add-ons", stock: 999, active: true },
    ])
    .onConflictDoNothing();

  if (demoUser) {
    const pro = planRows.find((p) => p.slug === "pro");
    if (pro) {
      await db.insert(schema.subscriptions).values({
        userId: demoUser.id,
        planId: pro.id,
        status: "active",
        provider: "demo",
        interval: "annual",
        currentPeriodStart: daysAgo(30),
        currentPeriodEnd: daysAgo(-334),
      });
    }
  }

  // Demo billing history: orders, invoices and payments for the demo user.
  if (demoUser) {
    const pro = planRows.find((p) => p.slug === "pro");
    const plan = pro ?? planRows[0];
    const now = new Date();
    const demoOrders: (typeof schema.orders.$inferInsert)[] = [];
    for (let i = 0; i < 6; i++) {
      const created = daysAgo(15 + i * 60);
      demoOrders.push({
        userId: demoUser.id,
        planId: plan?.id,
        customerName: "Jordan Blake",
        customerEmail: demoUser.email,
        amount: i % 2 === 0 ? 470 : 49,
        currency: "USD",
        status: "paid",
        provider: ["stripe", "midtrans", "xendit", "paypal", "demo"][i % 5],
        interval: i % 2 === 0 ? "annual" : "monthly",
        createdAt: created,
      });
    }
    const inserted = await db.insert(schema.orders).values(demoOrders).onConflictDoNothing().returning();
    const year = now.getFullYear();
    for (let i = 0; i < inserted.length; i++) {
      const order = inserted[i];
      const subtotal = Math.round(order.amount * 100) / 100;
      const tax = Math.round(order.amount * 0.1 * 100) / 100;
      const [inv] = await db
        .insert(schema.invoices)
        .values({
          userId: demoUser.id,
          orderId: order.id,
          number: `INV-${year}${String(1000 + i + 1)}`,
          subtotal,
          taxAmount: tax,
          total: Math.round((subtotal + tax) * 100) / 100,
          currency: "USD",
          status: "paid",
          issuedAt: order.createdAt,
          dueAt: order.createdAt,
        })
        .onConflictDoNothing()
        .returning();
      if (inv) {
        await db.insert(schema.payments).values({
          userId: demoUser.id,
          orderId: order.id,
          provider: order.provider,
          amount: order.amount,
          currency: "USD",
          status: "succeeded",
          providerTransactionId: `txn_${Math.random().toString(36).slice(2, 14)}`,
          createdAt: order.createdAt,
        });
      }
    }
    console.log("   Demo billing history seeded (orders + invoices + payments).");
  }

  await db
    .insert(schema.testimonials)
    .values([
      { name: "Sarah Lee", position: "CEO", company: "Acme Inc", rating: 5, content: "Zacode cut our onboarding time in half. The AI insights feel like having an extra analyst on the team." },
      { name: "Marcus Chen", position: "Head of Growth", company: "Pied Piper", rating: 5, content: "We moved from a patchwork of tools to Zacode. MRR is up 38% since we started using the revenue analytics." },
      { name: "Amelia Rodriguez", position: "Product Manager", company: "Hooli", rating: 5, content: "The cleanest dashboard we've used. Setup took minutes, and the API is a joy to work with." },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.faqs)
    .values([
      { question: "Is there a free trial?", answer: "Yes! Every paid plan includes a 14-day free trial with full access to every feature. No credit card required.", category: "General", sortOrder: 1 },
      { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription from the Billing page at any time — no cancellation fees.", category: "Billing", sortOrder: 2 },
      { question: "Which payment methods do you support?", answer: "We accept all major credit cards via Stripe, and offer local methods through Midtrans, Xendit and PayPal.", category: "Billing", sortOrder: 3 },
      { question: "Do you have an API?", answer: "Yes. We ship a REST API with generous rate limits, webhooks, and SDKs for JavaScript, Python, Go and more.", category: "Product", sortOrder: 4 },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.blogPosts)
    .values([
      { title: "The 2026 Guide to AI-Powered Growth", slug: "ai-powered-growth-2026", excerpt: "How modern SaaS teams use AI to compound growth.", content: "…", authorName: "Alex Morgan", tags: ["AI", "Growth"] },
      { title: "10 Automation Workflows That Save 20 Hours a Week", slug: "automation-workflows", excerpt: "Battle-tested automation recipes for busy operators.", content: "…", authorName: "Priya Sharma", tags: ["Automation", "Productivity"] },
      { title: "From Free Trial to Paying Customer", slug: "trial-to-paying", excerpt: "A playbook for turning trial users into revenue.", content: "…", authorName: "Tom Becker", tags: ["Growth", "Pricing"] },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.emailTemplates)
    .values([
      { name: "Welcome Email", subject: "Welcome to Zacode 🎉", body: "Hi {{name}}, welcome aboard…", trigger: "welcome" },
      { name: "Verify Your Email", subject: "Verify your email address", body: "Your verification code is {{code}}.", trigger: "verification" },
      { name: "Password Reset", subject: "Reset your password", body: "Click {{link}} to reset your password.", trigger: "password_reset" },
      { name: "Invoice Paid", subject: "Your invoice {{number}} is paid", body: "Thanks for your payment of {{amount}}.", trigger: "invoice_paid" },
    ])
    .onConflictDoNothing();

  await db
    .insert(schema.siteSettings)
    .values([
      { key: "app_name", value: "Zacode", category: "general" },
      { key: "support_email", value: "support@zacode.dev", category: "general" },
      { key: "allow_registration", value: "true", category: "auth" },
      { key: "require_email_verification", value: "true", category: "auth" },
      { key: "default_currency", value: "USD", category: "billing" },
      { key: "tax_rate", value: "10", category: "billing" },
    ])
    .onConflictDoNothing();

  if (admin) {
    await db.insert(schema.teamMembers).values({
      invitedEmail: admin.email,
      name: admin.name,
      role: "owner",
      status: "accepted",
      permissions: ["*"],
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Login:  admin@zacode.dev / zacode (owner)");
  console.log("   Login:  demo@zacode.dev / zacode (member)");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
