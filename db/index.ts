import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

declare global {
   
  var __db: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file (see .env.example) or set DATA_SOURCE=mock.",
    );
  }
  const sql = neon(connectionString);
  return drizzle({ client: sql, schema });
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (process.env.NODE_ENV !== "production") {
    globalThis.__db ??= createClient();
    return globalThis.__db;
  }
  return createClient();
}

export type Db = ReturnType<typeof createClient>;
export type { schema };
