"use server";
import type { ActionState } from "@/lib/action-state";

import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  twoFactorSchema,
} from "@/lib/validations";
import { env, isMock } from "@/lib/env";
import { signOut, requireUser } from "@/lib/auth";
import {
  createUser,
  getUserByEmail,
  updateUser,
  get2FASecret,
  upsert2FASecret,
  tables,
} from "@/lib/data";
import { mock } from "@/lib/mock/store";
import { sendEmail, layoutEmail } from "@/lib/email";
import {
  insertVerificationCode,
  verifyCodeAndMarkUsed,
  insertResetToken,
  getResetTokenUserId,
} from "./authDb";

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function safeVerify(secret: string, token: string): boolean {
  try {
    return verifySync({ secret, token }).valid;
  } catch {
    return false;
  }
}

function randomToken() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
}

export async function registerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms") === "on",
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "An account with this email already exists.", fieldErrors: {} };
  }

  const passwordHash = bcrypt.hashSync(parsed.data.password, 10);
  const user = await createUser({
    name: parsed.data.name,
    email,
    company: parsed.data.company || null,
    passwordHash,
    emailVerified: false,
    role: "member",
  });

  const code = generateCode();
  if (isMock) {
    mock.insert(tables.emailVerificationTokens, {
      id: crypto.randomUUID(),
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
      createdAt: new Date(),
    });
  } else {
    await insertVerificationCode(user.id, code);
  }

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: layoutEmail(
      "Verify your email",
      `Hi ${parsed.data.name},<br/>Your verification code is <strong>${code}</strong>. It expires in 15 minutes.`,
    ),
  });

  redirect(`/verify-email?email=${encodeURIComponent(email)}${isMock ? `&dev=${code}` : ""}`);
}

export async function verifyEmailAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = verifyEmailSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await getUserByEmail(parsed.data.email.toLowerCase());
  if (!user) return { error: "Account not found." };

  let valid = false;
  if (isMock) {
    const token = mock.findOne<{ id: string; userId: string; code: string; expiresAt: Date; used: boolean }>(
      tables.emailVerificationTokens,
      (t) => t.userId === user.id && !t.used && t.expiresAt.getTime() > Date.now() && t.code === parsed.data.code,
    );
    if (token) {
      valid = true;
      mock.update(tables.emailVerificationTokens, token.id, { used: true });
    }
  } else {
    valid = await verifyCodeAndMarkUsed(user.id, parsed.data.code);
  }
  if (!valid) return { error: "Invalid or expired code. Please try again." };

  await updateUser(user.id, { emailVerified: true });
  revalidatePath("/");
  return { success: "Email verified! You can now sign in." };
}

export async function resendVerificationAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const user = await getUserByEmail(email.toLowerCase());
  if (!user) return { error: "Account not found." };
  const code = generateCode();
  if (isMock) {
    mock.insert(tables.emailVerificationTokens, {
      id: crypto.randomUUID(),
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      used: false,
      createdAt: new Date(),
    });
  } else {
    await insertVerificationCode(user.id, code);
  }
  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: layoutEmail("Verify your email", `Your verification code is <strong>${code}</strong>.`),
  });
  return { success: "A new code was sent.", devCode: isMock ? code : undefined };
}

export async function forgotPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Enter a valid email address." };

  const email = parsed.data.email.toLowerCase();
  const user = await getUserByEmail(email);
  if (user) {
    const token = randomToken();
    const link = `${env.public.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    if (isMock) {
      mock.insert(tables.passwordResetTokens, {
        id: crypto.randomUUID(),
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        used: false,
        createdAt: new Date(),
      });
    } else {
      await insertResetToken(user.id, token);
    }
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: layoutEmail("Reset your password", `Click the button below to choose a new password.`, "Reset password", link),
    });
  }
  return { success: "If that email exists, a reset link is on its way." };
}

export async function resetPasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let userId: string | null = null;
  if (isMock) {
    const token = mock.findOne<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean }>(
      tables.passwordResetTokens,
      (t) => t.token === parsed.data.token && !t.used && t.expiresAt.getTime() > Date.now(),
    );
    if (token) {
      userId = token.userId;
      mock.update(tables.passwordResetTokens, token.id, { used: true });
    }
  } else {
    userId = await getResetTokenUserId(parsed.data.token);
  }

  if (!userId) return { error: "This reset link is invalid or has expired." };

  await updateUser(userId, { passwordHash: bcrypt.hashSync(parsed.data.password, 10) });
  redirect("/login?reset=success");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function setup2FAAction() {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const existing = await get2FASecret(user.id);
  if (existing?.enabled) return { error: "2FA is already enabled." };

  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: env.public.NEXT_PUBLIC_APP_NAME,
    label: user.email,
    secret,
  });
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);
  await upsert2FASecret(user.id, { secret, enabled: false, backupCodes: [] });

  return { secret, qrDataUrl, otpauthUrl };
}

export async function enable2FAAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const code = String(formData.get("code") ?? "");
  const secret = await get2FASecret(user.id);
  if (!secret?.secret) return { error: "Start setup first." };

  const valid = safeVerify(secret.secret, code);
  if (!valid) return { error: "Invalid code. Check your authenticator app and try again." };

  const backupCodes = Array.from({ length: 8 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(""),
  );
  await upsert2FASecret(user.id, { enabled: true, backupCodes });
  revalidatePath("/settings/security");
  return { success: "2FA enabled.", backupCodes };
}

export async function disable2FAAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const code = String(formData.get("code") ?? "");
  const secret = await get2FASecret(user.id);
  if (!secret?.secret) return { error: "2FA is not set up." };
  const valid = safeVerify(secret.secret, code);
  if (!valid) return { error: "Invalid code." };
  await upsert2FASecret(user.id, { enabled: false, backupCodes: [] });
  revalidatePath("/settings/security");
  return { success: "2FA disabled." };
}

export async function verifyTwoFactorAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = twoFactorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: "Enter the 6-digit code." };

  const { signIn } = await import("@/lib/auth");
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      code: parsed.data.code,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    const err = error as { type?: string; digest?: string; message?: string };
    if (err?.type === "CredentialsSignin") {
      return { error: "Invalid code. Please try again." };
    }
    if (
      err?.digest?.startsWith("NEXT_REDIRECT") ||
      err?.message?.includes("NEXT_REDIRECT")
    ) {
      redirect("/dashboard");
    }
    throw error;
  }
  redirect("/dashboard");
}
