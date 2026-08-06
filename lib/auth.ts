import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import bcrypt from "bcryptjs";
import { verifySync } from "otplib";

import { createUser, getUserByEmail, get2FASecret } from "./data";
import { AUTH_SECRET } from "./auth-secret";
import type { User } from "../db/schema";

export const ROLE_HIERARCHY = ["member", "manager", "admin", "owner"] as const;

export class TwoFactorRequiredError extends CredentialsSignin {
  code = "2FA_REQUIRED";
}

function getProviderList() {
  const providers = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(
      Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
    );
  }
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHub({ clientId: process.env.AUTH_GITHUB_ID, clientSecret: process.env.AUTH_GITHUB_SECRET }),
    );
  }
  if (process.env.AUTH_MICROSOFT_ID && process.env.AUTH_MICROSOFT_SECRET) {
    providers.push(
      MicrosoftEntraID({
        clientId: process.env.AUTH_MICROSOFT_ID,
        clientSecret: process.env.AUTH_MICROSOFT_SECRET,
      }),
    );
  }
  return providers;
}

async function findOrCreateUserForOAuth(profile: { email?: string | null; name?: string | null; image?: string | null }) {
  const email = profile.email?.toLowerCase();
  if (!email) return null;
  return getUserByEmail(email);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: "zacode.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "2FA code", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase();
        const password = String(credentials?.password ?? "");
        const code = credentials?.code ? String(credentials.code) : "";

        if (!email || !password) return null;
        const user = await getUserByEmail(email);
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const twoFactor = await get2FASecret(user.id);
        const requires2FA = !!twoFactor?.enabled;

        if (requires2FA) {
          if (!code) {
            throw new TwoFactorRequiredError();
          }
          const ok = verifySync({ secret: twoFactor.secret, token: code }).valid;
          if (!ok) return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
    ...getProviderList(),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        const existing = await getUserByEmail(user.email!.toLowerCase());
        if (!existing) {
          const created = await createUser({
            name: user.name ?? user.email!.split("@")[0],
            email: user.email!.toLowerCase(),
            image: user.image ?? "",
            emailVerified: true,
            role: "member",
          });
          user.id = created.id;
          user.role = created.role;
        } else {
          user.id = existing.id;
          user.role = existing.role;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as User & { role?: string }).role ?? "member";
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (trigger === "update" && token.sub) {
        const fresh = await getUserByIdSafe(token.sub);
        if (fresh) {
          token.name = fresh.name;
          token.email = fresh.email;
          token.picture = fresh.image ?? undefined;
          token.role = fresh.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as User["role"]) ?? "member";
      }
      return session;
    },
  },
});

async function getUserByIdSafe(id: string) {
  try {
    const { getUserById } = await import("./data");
    return await getUserById(id);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await getUserByEmail(session.user.email);
  return user ?? null;
}

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;
  const role = (user.role ?? "member") as (typeof ROLE_HIERARCHY)[number];
  if (role !== "admin" && role !== "owner") return null;
  return user;
}
