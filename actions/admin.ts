"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  planSchema,
  couponSchema,
  productSchema,
  faqSchema,
  testimonialSchema,
  postSchema,
  emailTemplateSchema,
  adminSettingsSchema,
} from "@/lib/validations";
import {
  createPlan,
  updatePlan,
  deletePlan,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  createProduct,
  updateProduct,
  deleteProduct,
  createFaq,
  updateFaq,
  deleteFaq,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  createPost,
  updatePost,
  deletePost,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  createAuditLog,
  updateUser,
  setSiteSetting,
  updateSubscription,
  deleteUser,
} from "@/lib/data";
import { slugify } from "@/lib/format";

async function guard() {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Admin access required");
  return admin;
}

function log(admin: { id: string; email?: string | null }, action: string, entity: string, entityId?: string) {
  createAuditLog({ actorId: admin.id, actorEmail: admin.email ?? "admin", action, entity, entityId }).catch(() => {});
}

export async function createPlanAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    monthlyPrice: formData.get("monthlyPrice"),
    annualPrice: formData.get("annualPrice"),
    originalMonthlyPrice: formData.get("originalMonthlyPrice"),
    originalAnnualPrice: formData.get("originalAnnualPrice"),
    features: String(formData.get("features") ?? "").split("\n").map((f) => f.trim()).filter(Boolean),
    popular: formData.get("popular") === "on",
    active: formData.get("active") === "on",
    ctaText: formData.get("ctaText"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createPlan({ ...parsed.data, slug: slugify(parsed.data.slug) });
  log(admin, "plan.create", "plan");
  revalidatePath("/admin/plans");
  return { success: "Plan created." };
}

export async function updatePlanAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = planSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    monthlyPrice: formData.get("monthlyPrice"),
    annualPrice: formData.get("annualPrice"),
    originalMonthlyPrice: formData.get("originalMonthlyPrice"),
    originalAnnualPrice: formData.get("originalAnnualPrice"),
    features: String(formData.get("features") ?? "").split("\n").map((f) => f.trim()).filter(Boolean),
    popular: formData.get("popular") === "on",
    active: formData.get("active") === "on",
    ctaText: formData.get("ctaText"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updatePlan(id, { ...parsed.data, slug: slugify(parsed.data.slug) });
  log(admin, "plan.update", "plan", id);
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: "Plan updated." };
}

export async function deletePlanAction(id: string) {
  const admin = await guard();
  await deletePlan(id);
  log(admin, "plan.delete", "plan", id);
  revalidatePath("/admin/plans");
  revalidatePath("/");
  return { success: "Plan deleted." };
}

export async function createCouponAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    maxUses: formData.get("maxUses"),
    expiresAt: formData.get("expiresAt") || undefined,
    active: formData.get("active") === "on",
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createCoupon({
    ...parsed.data,
    code: String(parsed.data.code).toUpperCase(),
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  });
  log(admin, "coupon.create", "coupon");
  revalidatePath("/admin/coupons");
  return { success: "Coupon created." };
}

export async function updateCouponAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    maxUses: formData.get("maxUses"),
    expiresAt: formData.get("expiresAt") || undefined,
    active: formData.get("active") === "on",
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateCoupon(id, {
    ...parsed.data,
    code: String(parsed.data.code).toUpperCase(),
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  });
  log(admin, "coupon.update", "coupon", id);
  revalidatePath("/admin/coupons");
  return { success: "Coupon updated." };
}

export async function deleteCouponAction(id: string) {
  const admin = await guard();
  await deleteCoupon(id);
  log(admin, "coupon.delete", "coupon", id);
  revalidatePath("/admin/coupons");
  return { success: "Coupon deleted." };
}

export async function createProductAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createProduct(parsed.data);
  log(admin, "product.create", "product");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "Product created." };
}

export async function updateProductAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stock: formData.get("stock"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateProduct(id, parsed.data);
  log(admin, "product.update", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "Product updated." };
}

export async function deleteProductAction(id: string) {
  const admin = await guard();
  await deleteProduct(id);
  log(admin, "product.delete", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "Product deleted." };
}

export async function createFaqAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createFaq(parsed.data);
  log(admin, "faq.create", "faq");
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  return { success: "FAQ created." };
}

export async function updateFaqAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateFaq(id, parsed.data);
  log(admin, "faq.update", "faq", id);
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  return { success: "FAQ updated." };
}

export async function deleteFaqAction(id: string) {
  const admin = await guard();
  await deleteFaq(id);
  log(admin, "faq.delete", "faq", id);
  revalidatePath("/admin/faqs");
  revalidatePath("/");
  return { success: "FAQ deleted." };
}

export async function createTestimonialAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = testimonialSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
    company: formData.get("company"),
    rating: formData.get("rating"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createTestimonial(parsed.data);
  log(admin, "testimonial.create", "testimonial");
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial created." };
}

export async function updateTestimonialAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = testimonialSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
    company: formData.get("company"),
    rating: formData.get("rating"),
    content: formData.get("content"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateTestimonial(id, parsed.data);
  log(admin, "testimonial.update", "testimonial", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial updated." };
}

export async function deleteTestimonialAction(id: string) {
  const admin = await guard();
  await deleteTestimonial(id);
  log(admin, "testimonial.delete", "testimonial", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  return { success: "Testimonial deleted." };
}

export async function createPostAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    authorName: formData.get("authorName"),
    tags: String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createPost({
    ...parsed.data,
    slug: slugify(parsed.data.slug),
    authorName: parsed.data.authorName ?? "Zacode Team",
  });
  log(admin, "post.create", "blogPost");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Post created." };
}

export async function updatePostAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    authorName: formData.get("authorName"),
    tags: String(formData.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updatePost(id, {
    ...parsed.data,
    slug: slugify(parsed.data.slug),
    authorName: parsed.data.authorName ?? "Zacode Team",
  });
  log(admin, "post.update", "blogPost", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Post updated." };
}

export async function deletePostAction(id: string) {
  const admin = await guard();
  await deletePost(id);
  log(admin, "post.delete", "blogPost", id);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "Post deleted." };
}

export async function createEmailTemplateAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = emailTemplateSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    trigger: formData.get("trigger"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await createEmailTemplate(parsed.data);
  log(admin, "emailTemplate.create", "emailTemplate");
  revalidatePath("/admin/email-templates");
  return { success: "Template created." };
}

export async function updateEmailTemplateAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const id = String(formData.get("id") ?? "");
  const parsed = emailTemplateSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    body: formData.get("body"),
    trigger: formData.get("trigger"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await updateEmailTemplate(id, parsed.data);
  log(admin, "emailTemplate.update", "emailTemplate", id);
  revalidatePath("/admin/email-templates");
  return { success: "Template updated." };
}

export async function deleteEmailTemplateAction(id: string) {
  const admin = await guard();
  await deleteEmailTemplate(id);
  log(admin, "emailTemplate.delete", "emailTemplate", id);
  revalidatePath("/admin/email-templates");
  return { success: "Template deleted." };
}

export async function adminUpdateUserRoleAction(userId: string, role: string) {
  const admin = await guard();
  if (userId === admin.id) return { error: "You cannot change your own role." };
  await updateUser(userId, { role: role as never });
  log(admin, "user.role.update", "user", userId);
  revalidatePath("/admin/users");
  return { success: "Role updated." };
}

export async function adminUpdateSubscriptionAction(id: string, status: string, planId?: string) {
  const admin = await guard();
  await updateSubscription(id, { status, ...(planId ? { planId } : {}) });
  log(admin, "subscription.update", "subscription", id);
  revalidatePath("/admin/subscriptions");
  return { success: "Subscription updated." };
}

export async function adminDeleteUserAction(userId: string) {
  const admin = await guard();
  if (userId === admin.id) return { error: "You cannot delete your own account." };
  await deleteUser(userId);
  log(admin, "user.delete", "user", userId);
  revalidatePath("/admin/users");
  return { success: "User deleted." };
}

export async function saveSystemSettingsAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await guard();
  const parsed = adminSettingsSchema.safeParse({
    app_name: formData.get("app_name"),
    support_email: formData.get("support_email"),
    maintenance_mode: formData.get("maintenance_mode") === "on",
    allow_registration: formData.get("allow_registration") === "on",
    require_email_verification: formData.get("require_email_verification") === "on",
    default_currency: formData.get("default_currency"),
    tax_rate: formData.get("tax_rate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await setSiteSetting("app_name", parsed.data.app_name ?? "Zacode");
  await setSiteSetting("support_email", parsed.data.support_email ?? "");
  await setSiteSetting("maintenance_mode", String(parsed.data.maintenance_mode), "general");
  await setSiteSetting("allow_registration", String(parsed.data.allow_registration), "auth");
  await setSiteSetting("require_email_verification", String(parsed.data.require_email_verification), "auth");
  await setSiteSetting("default_currency", parsed.data.default_currency ?? "USD", "billing");
  await setSiteSetting("tax_rate", String(parsed.data.tax_rate ?? 10), "billing");
  log(admin, "settings.update", "settings");
  revalidatePath("/admin/settings");
  return { success: "Settings saved." };
}
