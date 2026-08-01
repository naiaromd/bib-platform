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

export const clientAccounts = sqliteTable("client_accounts", {
  id: text("id").primaryKey(),
  legalName: text("legal_name").notNull(),
  displayName: text("display_name").notNull(),
  businessSegment: text("business_segment").notNull(),
  commercialModel: text("commercial_model").notNull(),
  accountStatus: text("account_status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const clientContacts = sqliteTable("client_contacts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  buyingRole: text("buying_role").notNull(),
  portalRole: text("portal_role").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const deviceDeployments = sqliteTable("device_deployments", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull().default(""),
  installedAt: text("installed_at").notNull().default(""),
  cumulativeHours: integer("cumulative_hours").notNull().default(0),
  status: text("status").notNull().default("Pending delivery"),
});

export const warranties = sqliteTable("warranties", {
  id: text("id").primaryKey(),
  deploymentId: text("deployment_id").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  status: text("status").notNull(),
  documentVersionId: text("document_version_id").notNull(),
});

export const trainingRecords = sqliteTable("training_records", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  contactId: text("contact_id").notNull(),
  courseCode: text("course_code").notNull(),
  completedAt: text("completed_at").notNull().default(""),
  competencyStatus: text("competency_status").notNull().default("Scheduled"),
  certificateDocumentId: text("certificate_document_id").notNull().default(""),
});

export const serviceEvents = sqliteTable("service_events", {
  id: text("id").primaryKey(),
  deploymentId: text("deployment_id").notNull(),
  eventType: text("event_type").notNull(),
  status: text("status").notNull(),
  scheduledAt: text("scheduled_at").notNull().default(""),
  completedAt: text("completed_at").notNull().default(""),
  summary: text("summary").notNull().default(""),
});

export const customerOrders = sqliteTable("customer_orders", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  orderType: text("order_type").notNull(),
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull().default(0),
  quotationDocumentId: text("quotation_document_id").notNull().default(""),
  orderedAt: text("ordered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const knowledgeEntitlements = sqliteTable("knowledge_entitlements", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  commercialModel: text("commercial_model").notNull(),
  resourceCode: text("resource_code").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const treatmentMenus = sqliteTable("treatment_menus", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  serviceName: text("service_name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  price: integer("price").notNull(),
  customerDescription: text("customer_description").notNull().default(""),
  protocolId: text("protocol_id").notNull(),
  status: text("status").notNull().default("Draft"),
  version: integer("version").notNull().default(1),
});

export const protocolRecords = sqliteTable("protocol_records", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  approvedProtocolCode: text("approved_protocol_code").notNull(),
  preparationText: text("preparation_text").notNull().default(""),
  followUpText: text("follow_up_text").notNull().default(""),
  internalNote: text("internal_note").notNull().default(""),
  lockedClinicalData: text("locked_clinical_data").notNull().default("{}"),
  status: text("status").notNull().default("Draft"),
  version: integer("version").notNull().default(1),
});

export const workspaceTasks = sqliteTable("workspace_tasks", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  accountId: text("account_id").notNull().default(""),
  leadId: text("lead_id").notNull().default(""),
  sourceId: text("source_id").notNull().default(""),
  title: text("title").notNull(),
  status: text("status").notNull().default("ยังไม่เริ่ม"),
  priority: text("priority").notNull().default("กลาง"),
  dueDate: text("due_date").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const salesTargets = sqliteTable("sales_targets", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull(),
  periodKey: text("period_key").notNull(),
  metricCode: text("metric_code").notNull(),
  targetValue: integer("target_value").notNull().default(0),
  actualValue: integer("actual_value").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const leadSources = sqliteTable("lead_sources", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  name: text("name").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  budget: integer("budget").notNull().default(0),
  status: text("status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const crmLeads = sqliteTable("crm_leads", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().default(""),
  contactId: text("contact_id").notNull().default(""),
  sourceId: text("source_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  status: text("status").notNull(),
  score: integer("score").notNull().default(0),
  nextAction: text("next_action").notNull().default(""),
  nextActionAt: text("next_action_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partnerPerformanceSnapshots = sqliteTable("partner_performance_snapshots", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  reportMonth: text("report_month").notNull(),
  reportedPaidSessions: integer("reported_paid_sessions").notNull().default(0),
  eligiblePaidSessions: integer("eligible_paid_sessions").notNull().default(0),
  complimentarySessions: integer("complimentary_sessions").notNull().default(0),
  trainingSessions: integer("training_sessions").notNull().default(0),
  reportedGrossRevenue: integer("reported_gross_revenue").notNull().default(0),
  eligibleGrossRevenue: integer("eligible_gross_revenue").notNull().default(0),
  bibShareRateBps: integer("bib_share_rate_bps").notNull().default(4000),
  bibShareVatInclusive: integer("bib_share_vat_inclusive").notNull().default(0),
  linnaShare: integer("linna_share").notNull().default(0),
  deductibleMarketing: integer("deductible_marketing").notNull().default(0),
  approvedRefunds: integer("approved_refunds").notNull().default(0),
  totalUsageMinutes: integer("total_usage_minutes").notNull().default(0),
  exceptionCount: integer("exception_count").notNull().default(0),
  status: text("status").notNull().default("Needs Review"),
  sourceNote: text("source_note").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
