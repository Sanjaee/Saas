import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "admin" | "manager" | "member";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "owner" | "admin" | "manager" | "member";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "owner" | "admin" | "manager" | "member";
  }
}
