import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  code: z.string().nullish(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Enter your full name").max(120),
    company: z.string().max(160).nullish(),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Must contain a letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Must contain a letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
});

export const twoFactorSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits"),
  password: z.string().min(6),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required").max(160),
  email: z.string().email("Valid email is required"),
  company: z.string().max(160).nullish(),
  plan: z.string().default("free"),
  status: z.enum(["active", "trialing", "past_due", "canceled"]).default("active"),
  country: z.string().nullish(),
  revenue: z.coerce.number().min(0).optional(),
});

export const leadSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email(),
  company: z.string().max(160).nullish(),
  status: z.enum(["new", "contacted", "qualified", "proposal", "won", "lost"]).default("new"),
  source: z.string().max(60).nullish(),
  score: z.coerce.number().min(0).max(100).default(0),
});

export const productSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().nullish(),
  price: z.coerce.number().min(0),
  sku: z.string().max(60).nullish(),
  category: z.string().max(80).nullish(),
  stock: z.coerce.number().int().min(0),
  active: z.boolean().default(true),
});

export const planSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  description: z.string().nullish(),
  monthlyPrice: z.coerce.number().min(0),
  annualPrice: z.coerce.number().min(0),
  originalMonthlyPrice: z.coerce.number().min(0),
  originalAnnualPrice: z.coerce.number().min(0),
  features: z.array(z.string()).default([]),
  popular: z.boolean().default(false),
  active: z.boolean().default(true),
  ctaText: z.string().default("Get Started"),
  sortOrder: z.coerce.number().default(0),
});

export const couponSchema = z.object({
  code: z.string().min(2).max(60),
  type: z.enum(["percent", "fixed"]).default("percent"),
  value: z.coerce.number().min(0),
  maxUses: z.coerce.number().int().min(0),
  expiresAt: z.string().nullish(),
  active: z.boolean().default(true),
  description: z.string().max(200).nullish(),
});

export const faqSchema = z.object({
  question: z.string().min(4).max(300),
  answer: z.string().min(4),
  category: z.string().max(60).nullish(),
  sortOrder: z.coerce.number().default(0),
  published: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().min(2).max(120),
  position: z.string().max(120).nullish(),
  company: z.string().max(120).nullish(),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().min(4),
  published: z.boolean().default(true),
});

export const postSchema = z.object({
  title: z.string().min(4).max(200),
  slug: z.string().min(2).max(220),
  excerpt: z.string().max(400).nullish(),
  content: z.string().nullish(),
  authorName: z.string().max(120).nullish(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
});

export const emailTemplateSchema = z.object({
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(200),
  body: z.string().min(4),
  trigger: z.string().max(60).nullish(),
  active: z.boolean().default(true),
});

export const ticketSchema = z.object({
  subject: z.string().min(4).max(200),
  message: z.string().min(4),
  category: z.string().max(60).nullish(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).nullish(),
  phone: z.string().max(40).nullish(),
});

export const securitySchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export const preferencesSchema = z.object({
  language: z.enum(["en", "id"]).default("en"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  timezone: z.string().min(1),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "manager", "member"]).default("member"),
  permissions: z.array(z.string()).default([]),
});

export const apiKeySchema = z.object({
  name: z.string().min(2).max(120),
});

export const adminSettingsSchema = z.object({
  app_name: z.string().max(120).nullish(),
  support_email: z.string().email().nullish(),
  maintenance_mode: z.boolean().default(false),
  allow_registration: z.boolean().default(true),
  require_email_verification: z.boolean().default(true),
  default_currency: z.string().max(8).nullish(),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type CustomerValues = z.infer<typeof customerSchema>;
export type LeadValues = z.infer<typeof leadSchema>;
export type PlanValues = z.infer<typeof planSchema>;
export type CouponValues = z.infer<typeof couponSchema>;
export type FaqValues = z.infer<typeof faqSchema>;
export type TestimonialValues = z.infer<typeof testimonialSchema>;
export type PostValues = z.infer<typeof postSchema>;
export type EmailTemplateValues = z.infer<typeof emailTemplateSchema>;
export type TicketValues = z.infer<typeof ticketSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type SecurityValues = z.infer<typeof securitySchema>;
export type PreferencesValues = z.infer<typeof preferencesSchema>;
export type InviteValues = z.infer<typeof inviteSchema>;
export type ApiKeyValues = z.infer<typeof apiKeySchema>;
export type AdminSettingsValues = z.infer<typeof adminSettingsSchema>;
