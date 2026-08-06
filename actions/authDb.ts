"use server";

import { and, eq, lt, gt } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

export async function insertVerificationCode(userId: string, code: string) {
  const db = getDb();
  await db.insert(schema.emailVerificationTokens).values({
    userId,
    code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    used: false,
  });
}

export async function verifyCodeAndMarkUsed(userId: string, code: string) {
  const db = getDb();
  const token = await db
    .select()
    .from(schema.emailVerificationTokens)
    .where(
      and(
        eq(schema.emailVerificationTokens.userId, userId),
        eq(schema.emailVerificationTokens.used, false),
        eq(schema.emailVerificationTokens.code, code),
        gt(schema.emailVerificationTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!token[0]) return false;
  await db
    .update(schema.emailVerificationTokens)
    .set({ used: true })
    .where(eq(schema.emailVerificationTokens.id, token[0].id));
  return true;
}

export async function insertResetToken(userId: string, token: string) {
  const db = getDb();
  await db.insert(schema.passwordResetTokens).values({
    userId,
    token,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    used: false,
  });
}

export async function getResetTokenUserId(token: string) {
  const db = getDb();
  const row = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.token, token),
        eq(schema.passwordResetTokens.used, false),
        gt(schema.passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row[0]) return null;
  await db
    .update(schema.passwordResetTokens)
    .set({ used: true })
    .where(eq(schema.passwordResetTokens.id, row[0].id));
  return row[0].userId;
}
