import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof createDb> | undefined;

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export type Database = ReturnType<typeof getDb>;

export * from "./schema";
export { eq, and, or, desc, asc, sql, gte, lte, lt, count, inArray } from "drizzle-orm";
export type { InferSelectModel } from "drizzle-orm";
