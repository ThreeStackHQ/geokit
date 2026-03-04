import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

type AdapterAccountType = "oauth" | "oidc" | "email" | "webauthn";

// ─── Users ──────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash"),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  subscriptions: many(subscriptions),
  accounts: many(accounts),
  sessions: many(sessions),
}));

// ─── NextAuth: Accounts ─────────────────────────────────
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

// ─── NextAuth: Sessions ─────────────────────────────────
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// ─── NextAuth: Verification Tokens ─────────────────────
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ─── Workspaces ─────────────────────────────────────────
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  user: one(users, { fields: [workspaces.userId], references: [users.id] }),
  apiKeys: many(workspaceApiKeys),
  lookupLogs: many(lookupLogs),
  blocklists: many(blocklists),
  dailyQuotas: many(dailyQuotas),
  webhookEndpoints: many(webhookEndpoints),
}));

// ─── Workspace API Keys ─────────────────────────────────
export const workspaceApiKeys = pgTable("workspace_api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  keyHash: text("key_hash").notNull(),
  lastUsedAt: timestamp("last_used_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { mode: "date" }),
});

export const workspaceApiKeysRelations = relations(
  workspaceApiKeys,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [workspaceApiKeys.workspaceId],
      references: [workspaces.id],
    }),
    lookupLogs: many(lookupLogs),
  })
);

// ─── Lookup Logs ────────────────────────────────────────
export const lookupLogs = pgTable("lookup_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  ip: text("ip").notNull(),
  countryCode: text("country_code"),
  isVpn: boolean("is_vpn").default(false).notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  apiKeyId: uuid("api_key_id").references(() => workspaceApiKeys.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const lookupLogsRelations = relations(lookupLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [lookupLogs.workspaceId],
    references: [workspaces.id],
  }),
  apiKey: one(workspaceApiKeys, {
    fields: [lookupLogs.apiKeyId],
    references: [workspaceApiKeys.id],
  }),
}));

// ─── Blocklists ─────────────────────────────────────────
export const blocklists = pgTable("blocklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").$type<"deny" | "allow">().notNull(),
  countryCode: text("country_code").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const blocklistsRelations = relations(blocklists, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [blocklists.workspaceId],
    references: [workspaces.id],
  }),
}));

// ─── Subscriptions ──────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").$type<"free" | "pro" | "business">().notNull().default("free"),
  status: text("status")
    .$type<"active" | "canceled" | "past_due">()
    .notNull()
    .default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

// ─── Daily Quotas ───────────────────────────────────────
export const dailyQuotas = pgTable("daily_quotas", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  count: integer("count").default(0).notNull(),
});

export const dailyQuotasRelations = relations(dailyQuotas, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [dailyQuotas.workspaceId],
    references: [workspaces.id],
  }),
}));

// ─── Webhook Endpoints ──────────────────────────────────
export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").array().default(["geo.blocked"]).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const webhookEndpointsRelations = relations(
  webhookEndpoints,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [webhookEndpoints.workspaceId],
      references: [workspaces.id],
    }),
  })
);
