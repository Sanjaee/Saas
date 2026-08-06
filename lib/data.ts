import { eq, desc, and, ilike, asc, sql } from "drizzle-orm";
import { isMock } from "./env";
import { mock, ensureMockSeeded } from "./mock/store";
import * as schema from "../db/schema";
import { getDb } from "../db";

type AnyRow = Record<string, unknown> & { id: string };

// ---------------------------------------------------------------------------
// Generic mock helpers
// ---------------------------------------------------------------------------
function mockList<T extends AnyRow>(table: string, opts?: {
  search?: string;
  searchFields?: string[];
  status?: string;
  sortBy?: keyof T;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  let rows = mock.all<T>(table);
  if (opts?.search && opts.searchFields?.length) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((r) =>
      opts.searchFields!.some((f) => String(r[f] ?? "").toLowerCase().includes(q)),
    );
  }
  if (opts?.status) {
    rows = rows.filter((r) => String(r.status) === opts.status);
  }
  if (opts?.sortBy) {
    const dir = opts.sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const av = a[opts.sortBy!] ?? "";
      const bv = b[opts.sortBy!] ?? "";
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir;
    });
  }
  const total = rows.length;
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? (total || 10);
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total };
}

// ---------------------------------------------------------------------------
// Users / Auth
// ---------------------------------------------------------------------------
export async function getUserByEmail(email: string) {
  const normalized = email.toLowerCase();
  if (isMock) {
    ensureMockSeeded();
    const u = mock.findOne<typeof schema.users.$inferSelect>(tables.users, (r) => r.email === normalized);
    return u ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.users).where(eq(schema.users.email, normalized)).limit(1);
  return res[0] ?? null;
}

export async function getUserById(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findById<typeof schema.users.$inferSelect>(tables.users, id) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return res[0] ?? null;
}

export async function createUser(data: typeof schema.users.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.users, data as unknown as AnyRow) as typeof schema.users.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.users).values(data).returning();
  return res[0];
}

export async function updateUser(id: string, patch: Partial<typeof schema.users.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.users, id, patch);
    if (!updated) throw new Error("User not found");
    return updated as typeof schema.users.$inferSelect;
  }
  const db = getDb();
  const res = await db
    .update(schema.users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(schema.users.id, id))
    .returning();
  return res[0];
}

export async function listUsers(opts?: { search?: string; role?: string; page?: number; pageSize?: number }) {
  if (isMock) {
    ensureMockSeeded();
    return mockList<typeof schema.users.$inferSelect>(tables.users, {
      search: opts?.search,
      searchFields: ["name", "email", "company"],
      status: opts?.role,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
  }
  const db = getDb();
  const conditions = [];
  if (opts?.search) conditions.push(ilike(schema.users.email, `%${opts.search}%`));
  if (opts?.role) conditions.push(eq(schema.users.role, opts.role as never));
  const total = (await db.select().from(schema.users).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.users)
    .where(and(...conditions))
    .orderBy(desc(schema.users.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function deleteUser(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.users, id);
  }
  const db = getDb();
  await db.delete(schema.users).where(eq(schema.users.id, id));
  return true;
}

export async function get2FASecret(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findOne<typeof schema.twoFactorSecrets.$inferSelect>(tables.twoFactorSecrets, (r) => r.userId === userId) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.twoFactorSecrets).where(eq(schema.twoFactorSecrets.userId, userId)).limit(1);
  return res[0] ?? null;
}

export async function upsert2FASecret(
  userId: string,
  patch: Partial<typeof schema.twoFactorSecrets.$inferInsert>,
) {
  if (isMock) {
    ensureMockSeeded();
    const existing = await get2FASecret(userId);
    if (existing) {
      return mock.updateOne<typeof schema.twoFactorSecrets.$inferSelect>(
        tables.twoFactorSecrets,
        (r) => r.userId === userId,
        { ...patch, updatedAt: new Date() },
      )!;
    }
    return mock.insert(tables.twoFactorSecrets, {
      id: crypto.randomUUID(),
      userId,
      secret: patch.secret ?? "",
      enabled: patch.enabled ?? false,
      backupCodes: patch.backupCodes ?? [],
      updatedAt: new Date(),
    } as AnyRow);
  }
  const db = getDb();
  const res = await db
    .insert(schema.twoFactorSecrets)
    .values({ userId, secret: patch.secret ?? "", enabled: patch.enabled ?? false, backupCodes: patch.backupCodes ?? [] })
    .onConflictDoUpdate({ target: schema.twoFactorSecrets.userId, set: { ...patch, updatedAt: new Date() } })
    .returning();
  return res[0];
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export type CustomerListOpts = { search?: string; status?: string; page?: number; pageSize?: number };

export async function listCustomers(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    return mockList<typeof schema.customers.$inferSelect>(tables.customers, {
      search: opts?.search,
      searchFields: ["name", "email", "company"],
      status: opts?.status,
      sortBy: "joinedDate",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
  }
  const db = getDb();
  const conditions = [];
  if (opts?.search) {
    conditions.push(ilike(schema.customers.email, `%${opts.search}%`));
  }
  if (opts?.status) conditions.push(eq(schema.customers.status, opts.status));
  const total = (await db.select().from(schema.customers).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.customers)
    .where(and(...conditions))
    .orderBy(desc(schema.customers.joinedDate))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function getCustomer(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findById<typeof schema.customers.$inferSelect>(tables.customers, id) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
  return res[0] ?? null;
}

export async function createCustomer(data: typeof schema.customers.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    const row = { ...data, joinedDate: data.joinedDate ?? new Date() };
    return mock.insert(tables.customers, row as unknown as AnyRow) as typeof schema.customers.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.customers).values(data).returning();
  return res[0];
}

export async function updateCustomer(id: string, patch: Partial<typeof schema.customers.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.customers, id, patch);
    if (!updated) throw new Error("Customer not found");
    return updated as typeof schema.customers.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.customers).set(patch).where(eq(schema.customers.id, id)).returning();
  return res[0];
}

export async function deleteCustomer(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.customers, id);
  }
  const db = getDb();
  await db.delete(schema.customers).where(eq(schema.customers.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------
export async function listLeads(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    return mockList<typeof schema.leads.$inferSelect>(tables.leads, {
      search: opts?.search,
      searchFields: ["name", "email", "company"],
      status: opts?.status,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
  }
  const db = getDb();
  const conditions = [];
  if (opts?.search) conditions.push(ilike(schema.leads.email, `%${opts.search}%`));
  if (opts?.status) conditions.push(eq(schema.leads.status, opts.status));
  const total = (await db.select().from(schema.leads).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.leads)
    .where(and(...conditions))
    .orderBy(desc(schema.leads.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function createLead(data: typeof schema.leads.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.leads, data as unknown as AnyRow) as typeof schema.leads.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.leads).values(data).returning();
  return res[0];
}

export async function updateLead(id: string, patch: Partial<typeof schema.leads.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.leads, id, patch);
    if (!updated) throw new Error("Lead not found");
    return updated as typeof schema.leads.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.leads).set(patch).where(eq(schema.leads.id, id)).returning();
  return res[0];
}

export async function deleteLead(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.leads, id);
  }
  const db = getDb();
  await db.delete(schema.leads).where(eq(schema.leads.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------
export async function listPlans(activeOnly = false) {
  if (isMock) {
    ensureMockSeeded();
    let rows = mock.all<typeof schema.plans.$inferSelect>(tables.plans);
    if (activeOnly) rows = rows.filter((p) => p.active);
    return [...rows].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const db = getDb();
  const base = db.select().from(schema.plans);
  const rows = activeOnly ? await base.where(eq(schema.plans.active, true)) : await base;
  return rows.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPlanBySlug(slug: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findOne<typeof schema.plans.$inferSelect>(tables.plans, (p) => p.slug === slug) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.plans).where(eq(schema.plans.slug, slug)).limit(1);
  return res[0] ?? null;
}

export async function getPlanById(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findById<typeof schema.plans.$inferSelect>(tables.plans, id) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.plans).where(eq(schema.plans.id, id)).limit(1);
  return res[0] ?? null;
}

export async function createPlan(data: typeof schema.plans.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.plans, data as unknown as AnyRow) as typeof schema.plans.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.plans).values(data).returning();
  return res[0];
}

export async function updatePlan(id: string, patch: Partial<typeof schema.plans.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.plans, id, patch);
    if (!updated) throw new Error("Plan not found");
    return updated as typeof schema.plans.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.plans).set(patch).where(eq(schema.plans.id, id)).returning();
  return res[0];
}

export async function deletePlan(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.plans, id);
  }
  const db = getDb();
  await db.delete(schema.plans).where(eq(schema.plans.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------
export async function listSubscriptions(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    const res = mockList<typeof schema.subscriptions.$inferSelect>(tables.subscriptions, {
      status: opts?.status,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
    return res;
  }
  const db = getDb();
  const conditions = opts?.status ? [eq(schema.subscriptions.status, opts.status)] : [];
  const total = (await db.select().from(schema.subscriptions).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.subscriptions)
    .where(and(...conditions))
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function getSubscriptionByUser(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findOne<typeof schema.subscriptions.$inferSelect>(tables.subscriptions, (s) => s.userId === userId && s.status !== "canceled") ?? null;
  }
  const db = getDb();
  const res = await db
    .select()
    .from(schema.subscriptions)
    .where(and(eq(schema.subscriptions.userId, userId), eq(schema.subscriptions.status, "active")))
    .limit(1);
  return res[0] ?? null;
}

export async function createSubscription(data: typeof schema.subscriptions.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.subscriptions, data as unknown as AnyRow) as typeof schema.subscriptions.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.subscriptions).values(data).returning();
  return res[0];
}

export async function updateSubscription(id: string, patch: Partial<typeof schema.subscriptions.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.subscriptions, id, patch);
    if (!updated) throw new Error("Subscription not found");
    return updated as typeof schema.subscriptions.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.subscriptions).set(patch).where(eq(schema.subscriptions.id, id)).returning();
  return res[0];
}

// ---------------------------------------------------------------------------
// Orders / Invoices / Payments
// ---------------------------------------------------------------------------
export async function listOrders(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    const res = mockList<typeof schema.orders.$inferSelect>(tables.orders, {
      search: opts?.search,
      searchFields: ["customerName", "customerEmail"],
      status: opts?.status,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
    return res;
  }
  const db = getDb();
  const conditions = [];
  if (opts?.search) conditions.push(ilike(schema.orders.customerEmail, `%${opts.search}%`));
  if (opts?.status) conditions.push(eq(schema.orders.status, opts.status));
  const total = (await db.select().from(schema.orders).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.orders)
    .where(and(...conditions))
    .orderBy(desc(schema.orders.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function createOrder(data: typeof schema.orders.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.orders, data as unknown as AnyRow) as typeof schema.orders.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.orders).values(data).returning();
  return res[0];
}

export async function updateOrder(id: string, patch: Partial<typeof schema.orders.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.orders, id, patch);
    if (!updated) throw new Error("Order not found");
    return updated as typeof schema.orders.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.orders).set(patch).where(eq(schema.orders.id, id)).returning();
  return res[0];
}

export async function getOrderById(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findById<typeof schema.orders.$inferSelect>(tables.orders, id) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
  return res[0] ?? null;
}

export async function listInvoices(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    return mockList<typeof schema.invoices.$inferSelect>(tables.invoices, {
      status: opts?.status,
      sortBy: "issuedAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
  }
  const db = getDb();
  const conditions = opts?.status ? [eq(schema.invoices.status, opts.status)] : [];
  const total = (await db.select().from(schema.invoices).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.invoices)
    .where(and(...conditions))
    .orderBy(desc(schema.invoices.issuedAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function getInvoiceById(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findById<typeof schema.invoices.$inferSelect>(tables.invoices, id) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)).limit(1);
  return res[0] ?? null;
}

export async function createInvoice(data: typeof schema.invoices.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.invoices, data as unknown as AnyRow) as typeof schema.invoices.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.invoices).values(data).returning();
  return res[0];
}

export async function listPayments(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    const res = mockList<typeof schema.payments.$inferSelect>(tables.payments, {
      status: opts?.status,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
    return res;
  }
  const db = getDb();
  const conditions = opts?.status ? [eq(schema.payments.status, opts.status)] : [];
  const total = (await db.select().from(schema.payments).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.payments)
    .where(and(...conditions))
    .orderBy(desc(schema.payments.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function createPayment(data: typeof schema.payments.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.payments, data as unknown as AnyRow) as typeof schema.payments.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.payments).values(data).returning();
  return res[0];
}

export async function updatePayment(id: string, patch: Partial<typeof schema.payments.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.payments, id, patch);
    if (!updated) throw new Error("Payment not found");
    return updated as typeof schema.payments.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.payments).set(patch).where(eq(schema.payments.id, id)).returning();
  return res[0];
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------
export async function listCoupons() {
  if (isMock) {
    ensureMockSeeded();
    return mock.all<typeof schema.coupons.$inferSelect>(tables.coupons);
  }
  const db = getDb();
  return db.select().from(schema.coupons).orderBy(asc(schema.coupons.code));
}

export async function getCouponByCode(code: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findOne<typeof schema.coupons.$inferSelect>(tables.coupons, (c) => c.code.toLowerCase() === code.toLowerCase()) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.coupons).where(eq(schema.coupons.code, code)).limit(1);
  return res[0] ?? null;
}

export async function createCoupon(data: typeof schema.coupons.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.coupons, data as unknown as AnyRow) as typeof schema.coupons.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.coupons).values(data).returning();
  return res[0];
}

export async function updateCoupon(id: string, patch: Partial<typeof schema.coupons.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.coupons, id, patch);
    if (!updated) throw new Error("Coupon not found");
    return updated as typeof schema.coupons.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.coupons).set(patch).where(eq(schema.coupons.id, id)).returning();
  return res[0];
}

export async function deleteCoupon(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.coupons, id);
  }
  const db = getDb();
  await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
  return true;
}

export async function incrementCouponUse(id: string) {
  if (isMock) {
    ensureMockSeeded();
    const c = mock.findById<typeof schema.coupons.$inferSelect>(tables.coupons, id);
    if (c) mock.update(tables.coupons, id, { uses: (c.uses ?? 0) + 1 });
    return;
  }
  const db = getDb();
  await db
    .update(schema.coupons)
    .set({ uses: sql`${schema.coupons.uses} + 1` })
    .where(eq(schema.coupons.id, id));
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export async function listProducts() {
  if (isMock) {
    ensureMockSeeded();
    return mock.all<typeof schema.products.$inferSelect>(tables.products);
  }
  const db = getDb();
  return db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
}

export async function createProduct(data: typeof schema.products.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.products, data as unknown as AnyRow) as typeof schema.products.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.products).values(data).returning();
  return res[0];
}

export async function updateProduct(id: string, patch: Partial<typeof schema.products.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.products, id, patch);
    if (!updated) throw new Error("Product not found");
    return updated as typeof schema.products.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.products).set(patch).where(eq(schema.products.id, id)).returning();
  return res[0];
}

export async function deleteProduct(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.products, id);
  }
  const db = getDb();
  await db.delete(schema.products).where(eq(schema.products.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export async function listNotifications(userId: string, limit = 20) {
  if (isMock) {
    ensureMockSeeded();
    return mock
      .where<typeof schema.notifications.$inferSelect>(tables.notifications, (n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  const db = getDb();
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, userId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(limit);
}

export async function unreadNotificationsCount(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.where<typeof schema.notifications.$inferSelect>(tables.notifications, (n) => n.userId === userId && !n.read).length;
  }
  const db = getDb();
  const res = await db
    .select()
    .from(schema.notifications)
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false)));
  return res.length;
}

export async function createNotification(data: typeof schema.notifications.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.notifications, data as unknown as AnyRow) as typeof schema.notifications.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.notifications).values(data).returning();
  return res[0];
}

export async function markNotificationRead(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.update(tables.notifications, id, { read: true });
  }
  const db = getDb();
  await db.update(schema.notifications).set({ read: true }).where(eq(schema.notifications.id, id));
}

export async function markAllNotificationsRead(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    const rows = mock.where<typeof schema.notifications.$inferSelect>(tables.notifications, (n) => n.userId === userId && !n.read);
    rows.forEach((r) => mock.update(tables.notifications, r.id, { read: true }));
    return;
  }
  const db = getDb();
  await db
    .update(schema.notifications)
    .set({ read: true })
    .where(and(eq(schema.notifications.userId, userId), eq(schema.notifications.read, false)));
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export async function listTeamMembers() {
  if (isMock) {
    ensureMockSeeded();
    return mock.all<typeof schema.teamMembers.$inferSelect>(tables.teamMembers);
  }
  const db = getDb();
  return db.select().from(schema.teamMembers).orderBy(desc(schema.teamMembers.createdAt));
}

export async function createTeamMember(data: typeof schema.teamMembers.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.teamMembers, data as unknown as AnyRow) as typeof schema.teamMembers.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.teamMembers).values(data).returning();
  return res[0];
}

export async function updateTeamMember(id: string, patch: Partial<typeof schema.teamMembers.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.teamMembers, id, patch);
    if (!updated) throw new Error("Team member not found");
    return updated as typeof schema.teamMembers.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.teamMembers).set(patch).where(eq(schema.teamMembers.id, id)).returning();
  return res[0];
}

export async function removeTeamMember(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.teamMembers, id);
  }
  const db = getDb();
  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// API Keys
// ---------------------------------------------------------------------------
export async function listApiKeys(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.where<typeof schema.apiKeys.$inferSelect>(tables.apiKeys, (k) => k.userId === userId);
  }
  const db = getDb();
  return db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.userId, userId))
    .orderBy(desc(schema.apiKeys.createdAt));
}

export async function createApiKey(data: typeof schema.apiKeys.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.apiKeys, data as unknown as AnyRow) as typeof schema.apiKeys.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.apiKeys).values(data).returning();
  return res[0];
}

export async function revokeApiKey(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.update(tables.apiKeys, id, { revoked: true });
  }
  const db = getDb();
  await db.update(schema.apiKeys).set({ revoked: true }).where(eq(schema.apiKeys.id, id));
}

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------
export async function listTickets(opts?: CustomerListOpts) {
  if (isMock) {
    ensureMockSeeded();
    const res = mockList<typeof schema.tickets.$inferSelect>(tables.tickets, {
      status: opts?.status,
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
    return res;
  }
  const db = getDb();
  const conditions = opts?.status ? [eq(schema.tickets.status, opts.status)] : [];
  const total = (await db.select().from(schema.tickets).where(and(...conditions))).length;
  const rows = await db
    .select()
    .from(schema.tickets)
    .where(and(...conditions))
    .orderBy(desc(schema.tickets.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function createTicket(data: typeof schema.tickets.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.tickets, data as unknown as AnyRow) as typeof schema.tickets.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.tickets).values(data).returning();
  return res[0];
}

export async function updateTicket(id: string, patch: Partial<typeof schema.tickets.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.tickets, id, patch);
    if (!updated) throw new Error("Ticket not found");
    return updated as typeof schema.tickets.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.tickets).set(patch).where(eq(schema.tickets.id, id)).returning();
  return res[0];
}

// ---------------------------------------------------------------------------
// Blog / Testimonials / FAQs
// ---------------------------------------------------------------------------
export async function listPosts(publishedOnly = false) {
  if (isMock) {
    ensureMockSeeded();
    let rows = mock.all<typeof schema.blogPosts.$inferSelect>(tables.blogPosts);
    if (publishedOnly) rows = rows.filter((p) => p.published);
    return rows.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }
  const db = getDb();
  const base = db.select().from(schema.blogPosts);
  const rows = publishedOnly ? await base.where(eq(schema.blogPosts.published, true)) : await base;
  return rows.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getPostBySlug(slug: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.findOne<typeof schema.blogPosts.$inferSelect>(tables.blogPosts, (p) => p.slug === slug) ?? null;
  }
  const db = getDb();
  const res = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.slug, slug)).limit(1);
  return res[0] ?? null;
}

export async function createPost(data: typeof schema.blogPosts.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.blogPosts, data as unknown as AnyRow) as typeof schema.blogPosts.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.blogPosts).values(data).returning();
  return res[0];
}

export async function updatePost(id: string, patch: Partial<typeof schema.blogPosts.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.blogPosts, id, patch);
    if (!updated) throw new Error("Post not found");
    return updated as typeof schema.blogPosts.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.blogPosts).set(patch).where(eq(schema.blogPosts.id, id)).returning();
  return res[0];
}

export async function deletePost(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.blogPosts, id);
  }
  const db = getDb();
  await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
  return true;
}

export async function listTestimonials(publishedOnly = false) {
  if (isMock) {
    ensureMockSeeded();
    let rows = mock.all<typeof schema.testimonials.$inferSelect>(tables.testimonials);
    if (publishedOnly) rows = rows.filter((t) => t.published);
    return rows;
  }
  const db = getDb();
  const base = db.select().from(schema.testimonials);
  return publishedOnly ? await base.where(eq(schema.testimonials.published, true)) : await base;
}

export async function createTestimonial(data: typeof schema.testimonials.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.testimonials, data as unknown as AnyRow) as typeof schema.testimonials.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.testimonials).values(data).returning();
  return res[0];
}

export async function updateTestimonial(id: string, patch: Partial<typeof schema.testimonials.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.testimonials, id, patch);
    if (!updated) throw new Error("Testimonial not found");
    return updated as typeof schema.testimonials.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.testimonials).set(patch).where(eq(schema.testimonials.id, id)).returning();
  return res[0];
}

export async function deleteTestimonial(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.testimonials, id);
  }
  const db = getDb();
  await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
  return true;
}

export async function listFaqs() {
  if (isMock) {
    ensureMockSeeded();
    const rows = mock.where<typeof schema.faqs.$inferSelect>(tables.faqs, (f) => f.published);
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const db = getDb();
  return db.select().from(schema.faqs).where(eq(schema.faqs.published, true)).orderBy(asc(schema.faqs.sortOrder));
}

export async function listAllFaqs() {
  if (isMock) {
    ensureMockSeeded();
    return mock.all<typeof schema.faqs.$inferSelect>(tables.faqs);
  }
  const db = getDb();
  return db.select().from(schema.faqs);
}

export async function createFaq(data: typeof schema.faqs.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.faqs, data as unknown as AnyRow) as typeof schema.faqs.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.faqs).values(data).returning();
  return res[0];
}

export async function updateFaq(id: string, patch: Partial<typeof schema.faqs.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.faqs, id, patch);
    if (!updated) throw new Error("FAQ not found");
    return updated as typeof schema.faqs.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.faqs).set(patch).where(eq(schema.faqs.id, id)).returning();
  return res[0];
}

export async function deleteFaq(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.faqs, id);
  }
  const db = getDb();
  await db.delete(schema.faqs).where(eq(schema.faqs.id, id));
  return true;
}

// ---------------------------------------------------------------------------
// Email templates / Audit logs / Integrations / Settings
// ---------------------------------------------------------------------------
export async function listEmailTemplates() {
  if (isMock) {
    ensureMockSeeded();
    return mock.all<typeof schema.emailTemplates.$inferSelect>(tables.emailTemplates);
  }
  const db = getDb();
  return db.select().from(schema.emailTemplates);
}

export async function createEmailTemplate(data: typeof schema.emailTemplates.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.emailTemplates, data as unknown as AnyRow) as typeof schema.emailTemplates.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.emailTemplates).values(data).returning();
  return res[0];
}

export async function updateEmailTemplate(id: string, patch: Partial<typeof schema.emailTemplates.$inferInsert>) {
  if (isMock) {
    ensureMockSeeded();
    const updated = mock.update(tables.emailTemplates, id, patch);
    if (!updated) throw new Error("Template not found");
    return updated as typeof schema.emailTemplates.$inferSelect;
  }
  const db = getDb();
  const res = await db.update(schema.emailTemplates).set(patch).where(eq(schema.emailTemplates.id, id)).returning();
  return res[0];
}

export async function deleteEmailTemplate(id: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.remove(tables.emailTemplates, id);
  }
  const db = getDb();
  await db.delete(schema.emailTemplates).where(eq(schema.emailTemplates.id, id));
  return true;
}

export async function listAuditLogs(opts?: { page?: number; pageSize?: number }) {
  if (isMock) {
    ensureMockSeeded();
    return mockList<typeof schema.auditLogs.$inferSelect>(tables.auditLogs, {
      sortBy: "createdAt",
      sortDir: "desc",
      page: opts?.page,
      pageSize: opts?.pageSize,
    });
  }
  const db = getDb();
  const total = (await db.select().from(schema.auditLogs)).length;
  const rows = await db
    .select()
    .from(schema.auditLogs)
    .orderBy(desc(schema.auditLogs.createdAt))
    .limit(opts?.pageSize ?? 10)
    .offset(((opts?.page ?? 1) - 1) * (opts?.pageSize ?? 10));
  return { rows, total };
}

export async function createAuditLog(data: typeof schema.auditLogs.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    return mock.insert(tables.auditLogs, data as unknown as AnyRow) as typeof schema.auditLogs.$inferSelect;
  }
  const db = getDb();
  const res = await db.insert(schema.auditLogs).values(data).returning();
  return res[0];
}

export async function listIntegrations(userId: string) {
  if (isMock) {
    ensureMockSeeded();
    return mock.where<typeof schema.integrations.$inferSelect>(tables.integrations, (i) => i.userId === userId);
  }
  const db = getDb();
  return db.select().from(schema.integrations).where(eq(schema.integrations.userId, userId));
}

export async function upsertIntegration(data: typeof schema.integrations.$inferInsert) {
  if (isMock) {
    ensureMockSeeded();
    const existing = mock.findOne<typeof schema.integrations.$inferSelect>(
      tables.integrations,
      (i) => i.userId === data.userId && i.provider === data.provider,
    );
    if (existing) {
      return mock.update(tables.integrations, existing.id, {
        connected: data.connected,
        config: data.config,
        name: data.name,
      });
    }
    return mock.insert(tables.integrations, data as unknown as AnyRow);
  }
  const db = getDb();
  const res = await db
    .insert(schema.integrations)
    .values(data)
    .onConflictDoNothing()
    .returning();
  return res[0];
}

export async function getSiteSettings() {
  if (isMock) {
    ensureMockSeeded();
    const rows = mock.all<typeof schema.siteSettings.$inferSelect>(tables.siteSettings);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }
  const db = getDb();
  const rows = await db.select().from(schema.siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSiteSetting(key: string, value: string, category = "general") {
  if (isMock) {
    ensureMockSeeded();
    const existing = mock.findOne<typeof schema.siteSettings.$inferSelect>(tables.siteSettings, (s) => s.key === key);
    if (existing) {
      return mock.update(tables.siteSettings, existing.id, { value, category, updatedAt: new Date() });
    }
    return mock.insert(tables.siteSettings, {
      id: crypto.randomUUID(),
      key,
      value,
      category,
      updatedAt: new Date(),
    } as AnyRow);
  }
  const db = getDb();
  const res = await db
    .insert(schema.siteSettings)
    .values({ key, value, category })
    .onConflictDoUpdate({ target: schema.siteSettings.key, set: { value, updatedAt: new Date() } })
    .returning();
  return res[0];
}

// ---------------------------------------------------------------------------
// Misc helpers
// ---------------------------------------------------------------------------
export const tables = {
  users: "users",
  accounts: "accounts",
  sessions: "sessions",
  verificationTokens: "verificationTokens",
  emailVerificationTokens: "emailVerificationTokens",
  passwordResetTokens: "passwordResetTokens",
  twoFactorSecrets: "twoFactorSecrets",
  customers: "customers",
  leads: "leads",
  plans: "plans",
  subscriptions: "subscriptions",
  orders: "orders",
  products: "products",
  invoices: "invoices",
  payments: "payments",
  coupons: "coupons",
  notifications: "notifications",
  teamMembers: "teamMembers",
  apiKeys: "apiKeys",
  tickets: "tickets",
  blogPosts: "blogPosts",
  testimonials: "testimonials",
  faqs: "faqs",
  emailTemplates: "emailTemplates",
  auditLogs: "auditLogs",
  integrations: "integrations",
  siteSettings: "siteSettings",
};


