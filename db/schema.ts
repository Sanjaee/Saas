import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    passwordHash: text("password_hash"),
    image: text("image"),
    company: varchar("company", { length: 160 }),
    phone: varchar("phone", { length: 40 }),
    role: varchar("role", { length: 20 })
      .notNull()
      .default("member")
      .$type<"owner" | "admin" | "manager" | "member">(),
    language: varchar("language", { length: 8 }).notNull().default("en"),
    timezone: varchar("timezone", { length: 40 }).notNull().default("UTC"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("users_email_idx").on(t.email)],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 30 }).notNull(),
    provider: varchar("provider", { length: 40 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 40 }),
    scope: text("scope"),
    id_token: text("id_token"),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("accounts_user_id_idx").on(t.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 8 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const twoFactorSecrets = pgTable("two_factor_secrets", {
  userId: uuid("user_id").primaryKey().references(() => users.id, {
    onDelete: "cascade",
  }),
  secret: text("secret").notNull(),
  enabled: boolean("enabled").notNull().default(false),
  backupCodes: jsonb("backup_codes").$type<string[]>().notNull().default([]),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    company: varchar("company", { length: 160 }),
    plan: varchar("plan", { length: 40 }).notNull().default("free"),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    joinedDate: timestamp("joined_date").notNull().defaultNow(),
    revenue: real("revenue").notNull().default(0),
    avatar: text("avatar"),
    country: varchar("country", { length: 60 }),
  },
  (t) => [index("customers_email_idx").on(t.email)],
);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 160 }),
  status: varchar("status", { length: 30 }).notNull().default("new"),
  source: varchar("source", { length: 60 }),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 80 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull().default(0),
  annualPrice: integer("annual_price").notNull().default(0),
  originalMonthlyPrice: integer("original_monthly_price").notNull().default(0),
  originalAnnualPrice: integer("original_annual_price").notNull().default(0),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
  ctaText: varchar("cta_text", { length: 40 }).notNull().default("Get Started"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id),
    status: varchar("status", { length: 30 }).notNull().default("active"),
    provider: varchar("provider", { length: 30 }).notNull().default("demo"),
    interval: varchar("interval", { length: 20 }).notNull().default("monthly"),
    couponId: uuid("coupon_id"),
    currentPeriodStart: timestamp("current_period_start").notNull().defaultNow(),
    currentPeriodEnd: timestamp("current_period_end").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("subs_user_idx").on(t.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: uuid("plan_id").references(() => plans.id),
    customerName: varchar("customer_name", { length: 160 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }).notNull(),
    amount: real("amount").notNull().default(0),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    provider: varchar("provider", { length: 30 }).notNull().default("demo"),
    couponId: uuid("coupon_id"),
    interval: varchar("interval", { length: 20 }).notNull().default("monthly"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("orders_user_idx").on(t.userId)],
);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  price: real("price").notNull().default(0),
  sku: varchar("sku", { length: 60 }),
  category: varchar("category", { length: 80 }),
  stock: integer("stock").notNull().default(0),
  image: text("image"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id),
    number: varchar("number", { length: 40 }).notNull().unique(),
    subtotal: real("subtotal").notNull().default(0),
    taxAmount: real("tax_amount").notNull().default(0),
    total: real("total").notNull().default(0),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    issuedAt: timestamp("issued_at").notNull().defaultNow(),
    dueAt: timestamp("due_at").notNull().defaultNow(),
  },
  (t) => [index("invoices_user_idx").on(t.userId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id),
    provider: varchar("provider", { length: 30 }).notNull().default("demo"),
    amount: real("amount").notNull().default(0),
    currency: varchar("currency", { length: 8 }).notNull().default("USD"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    providerTransactionId: varchar("provider_transaction_id", { length: 160 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("payments_user_idx").on(t.userId)],
);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 60 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull().default("percent"),
  value: real("value").notNull().default(0),
  maxUses: integer("max_uses").notNull().default(0),
  uses: integer("uses").notNull().default(0),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  description: varchar("description", { length: 200 }),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message"),
    type: varchar("type", { length: 30 }).notNull().default("info"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifications_user_idx").on(t.userId)],
);

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  invitedEmail: varchar("invited_email", { length: 255 }).notNull(),
  name: varchar("name", { length: 160 }),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  permissions: jsonb("permissions").$type<string[]>().notNull().default([]),
  invitedBy: uuid("invited_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  keyPreview: varchar("key_preview", { length: 20 }).notNull(),
  keyHash: text("key_hash").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 200 }).notNull(),
    message: text("message").notNull(),
    status: varchar("status", { length: 30 }).notNull().default("open"),
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),
    category: varchar("category", { length: 60 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("tickets_user_idx").on(t.userId)],
);

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: text("cover_image"),
  authorName: varchar("author_name", { length: 120 }).notNull().default("Zacode Team"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  position: varchar("position", { length: 120 }),
  company: varchar("company", { length: 120 }),
  avatar: text("avatar"),
  rating: integer("rating").notNull().default(5),
  content: text("content").notNull(),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: varchar("question", { length: 300 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 60 }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  body: text("body").notNull(),
  trigger: varchar("trigger", { length: 60 }),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorEmail: varchar("actor_email", { length: 255 }),
    action: varchar("action", { length: 100 }).notNull(),
    entity: varchar("entity", { length: 60 }),
    entityId: varchar("entity_id", { length: 60 }),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ip: varchar("ip", { length: 60 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_logs_actor_idx").on(t.actorId)],
);

export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  provider: varchar("provider", { length: 60 }).notNull(),
  connected: boolean("connected").notNull().default(false),
  config: jsonb("config").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  category: varchar("category", { length: 60 }).notNull().default("general"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
