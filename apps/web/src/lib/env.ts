import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(10, "DATABASE_URL must be at least 10 characters"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET or NEXTAUTH_SECRET is required"),
  CRON_SECRET: z.string().min(32, "CRON_SECRET must be at least 32 characters"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

function validateEnv(): Env {
  if (cached) return cached;

  const raw = {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  };

  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Missing or invalid environment variables:\n${formatted}`);
  }

  cached = result.data;
  return cached;
}

/** Lazily validated environment variables — throws on first access if invalid. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    const validated = validateEnv();
    return validated[prop as keyof Env];
  },
});
