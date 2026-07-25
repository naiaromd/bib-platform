import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const portalUsers = sqliteTable(
  "portal_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull(),
    accountScope: text("account_scope").notNull().default("*"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("portal_users_email_idx").on(table.email)]
);

export const reviewDocuments = sqliteTable(
  "review_documents",
  {
    id: text("id").primaryKey(),
    account: text("account").notNull(),
    title: text("title").notNull(),
    model: text("model").notNull(),
    version: text("version").notNull(),
    stage: text("stage").notNull(),
    risk: text("risk").notNull(),
    owner: text("owner").notNull(),
    customerVisible: integer("customer_visible", { mode: "boolean" }).notNull().default(false),
    decision: text("decision").notNull().default("Pending"),
    versionHash: text("version_hash").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("review_documents_version_idx").on(table.id, table.version)]
);

export const reviewComments = sqliteTable("review_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: text("document_id").notNull(),
  authorEmail: text("author_email").notNull(),
  authorLabel: text("author_label").notNull(),
  role: text("role").notNull(),
  body: text("body").notNull(),
  visibility: text("visibility").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const reviewDecisions = sqliteTable("review_decisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: text("document_id").notNull(),
  version: text("version").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  decision: text("decision").notNull(),
  conditionText: text("condition_text").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: text("document_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  eventType: text("event_type").notNull(),
  eventData: text("event_data").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partnerMonthlyReports = sqliteTable("partner_monthly_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accountId: text("account_id").notNull(),
  reportMonth: text("report_month").notNull(),
  paidSessions: integer("paid_sessions").notNull().default(0),
  packageSessions: integer("package_sessions").notNull().default(0),
  complimentarySessions: integer("complimentary_sessions").notNull().default(0),
  grossRevenue: integer("gross_revenue").notNull().default(0),
  approvedRefunds: integer("approved_refunds").notNull().default(0),
  approvedMarketing: integer("approved_marketing").notNull().default(0),
  openingHours: integer("opening_hours").notNull().default(0),
  closingHours: integer("closing_hours").notNull().default(0),
  consumableNote: text("consumable_note").notNull().default(""),
  status: text("status").notNull().default("Submitted"),
  submittedBy: text("submitted_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
