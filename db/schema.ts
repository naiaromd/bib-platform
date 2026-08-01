import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
    tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
  documentId: text("document_id").notNull(),
  version: text("version").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  decision: text("decision").notNull(),
  conditionText: text("condition_text").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const approvalRecords = sqliteTable("approval_records", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  documentId: text("document_id").notNull(),
  documentVersion: text("document_version").notNull(),
  versionHash: text("version_hash").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  decision: text("decision").notNull(),
  approvalScope: text("approval_scope").notNull().default("Internal workflow"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const auditEvents = sqliteTable("audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull().default("bib"),
  documentId: text("document_id").notNull(),
  actorEmail: text("actor_email").notNull(),
  actorRole: text("actor_role").notNull(),
  eventType: text("event_type").notNull(),
  eventData: text("event_data").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partnerMonthlyReports = sqliteTable("partner_monthly_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
  legalName: text("legal_name").notNull(),
  displayName: text("display_name").notNull(),
  businessSegment: text("business_segment").notNull(),
  province: text("province").notNull().default(""),
  commercialModel: text("commercial_model").notNull(),
  accountStatus: text("account_status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const clientContacts = sqliteTable("client_contacts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  positionTitle: text("position_title").notNull().default(""),
  buyingRole: text("buying_role").notNull(),
  portalRole: text("portal_role").notNull(),
  phone: text("phone").notNull().default(""),
  lineId: text("line_id").notNull().default(""),
  preferredChannel: text("preferred_channel").notNull().default("LINE"),
  decisionLevel: text("decision_level").notNull().default("ยังไม่ยืนยัน"),
  consentStatus: text("consent_status").notNull().default("ยังไม่ยืนยัน"),
  notes: text("notes").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const deviceDeployments = sqliteTable("device_deployments", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  model: text("model").notNull(),
  serialNumber: text("serial_number").notNull().default(""),
  installedAt: text("installed_at").notNull().default(""),
  cumulativeHours: integer("cumulative_hours").notNull().default(0),
  status: text("status").notNull().default("Pending delivery"),
});

export const warranties = sqliteTable("warranties", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  deploymentId: text("deployment_id").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  status: text("status").notNull(),
  documentVersionId: text("document_version_id").notNull(),
});

export const trainingRecords = sqliteTable("training_records", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  contactId: text("contact_id").notNull(),
  courseCode: text("course_code").notNull(),
  completedAt: text("completed_at").notNull().default(""),
  competencyStatus: text("competency_status").notNull().default("Scheduled"),
  certificateDocumentId: text("certificate_document_id").notNull().default(""),
});

export const serviceEvents = sqliteTable("service_events", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  deploymentId: text("deployment_id").notNull(),
  eventType: text("event_type").notNull(),
  status: text("status").notNull(),
  scheduledAt: text("scheduled_at").notNull().default(""),
  completedAt: text("completed_at").notNull().default(""),
  summary: text("summary").notNull().default(""),
});

export const customerOrders = sqliteTable("customer_orders", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  orderType: text("order_type").notNull(),
  status: text("status").notNull(),
  totalAmount: integer("total_amount").notNull().default(0),
  quotationDocumentId: text("quotation_document_id").notNull().default(""),
  orderedAt: text("ordered_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const knowledgeEntitlements = sqliteTable("knowledge_entitlements", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  commercialModel: text("commercial_model").notNull(),
  resourceCode: text("resource_code").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const treatmentMenus = sqliteTable("treatment_menus", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
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
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull().default(""),
  contactId: text("contact_id").notNull().default(""),
  sourceId: text("source_id").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  status: text("status").notNull(),
  score: integer("score").notNull().default(0),
  temperature: text("temperature").notNull().default("Cold"),
  evidenceJson: text("evidence_json").notNull().default("[]"),
  lastContactAt: text("last_contact_at").notNull().default(""),
  nextAction: text("next_action").notNull().default(""),
  nextActionAt: text("next_action_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const partnerPerformanceSnapshots = sqliteTable("partner_performance_snapshots", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
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

export const sourceImports = sqliteTable("source_imports", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  sourceFileId: text("source_file_id").notNull(),
  fileName: text("file_name").notNull(),
  sourceModifiedAt: text("source_modified_at").notNull(),
  importedAt: text("imported_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  status: text("status").notNull().default("Imported"),
});

export const companyTeamDirectory = sqliteTable("company_team_directory", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  displayName: text("display_name").notNull(),
  responsibility: text("responsibility").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  sourceImportId: text("source_import_id").notNull(),
});

export const kpiEventRecords = sqliteTable("kpi_event_records", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  periodKey: text("period_key").notNull(),
  name: text("name").notNull(),
  activityType: text("activity_type").notNull(),
  targetLeads: integer("target_leads").notNull().default(0),
  actualLeads: integer("actual_leads").notNull().default(0),
  demos: integer("demos").notNull().default(0),
  quotations: integer("quotations").notNull().default(0),
  potentialSales: integer("potential_sales").notNull().default(0),
  closedSales: integer("closed_sales").notNull().default(0),
  followUp: text("follow_up").notNull().default(""),
  status: text("status").notNull(),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  sourceImportId: text("source_import_id").notNull(),
});

export const trainingActivityRecords = sqliteTable("training_activity_records", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  activityDate: text("activity_date").notNull().default(""),
  projectName: text("project_name").notNull(),
  targetSegment: text("target_segment").notNull().default(""),
  location: text("location").notNull().default(""),
  topic: text("topic").notNull(),
  studentCount: integer("student_count").notNull().default(0),
  durationLabel: text("duration_label").notNull().default(""),
  trainers: text("trainers").notNull().default(""),
  trainerNote: text("trainer_note").notNull().default(""),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  sourceImportId: text("source_import_id").notNull(),
});

export const afterSalesActivityRecords = sqliteTable("after_sales_activity_records", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  clientName: text("client_name").notNull(),
  activityDate: text("activity_date").notNull().default(""),
  activity: text("activity").notNull(),
  status: text("status").notNull(),
  sourceSheet: text("source_sheet").notNull(),
  sourceRow: integer("source_row").notNull(),
  sourceImportId: text("source_import_id").notNull(),
});

export const businessIssues = sqliteTable("business_issues", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  title: text("title").notNull(),
  details: text("details").notNull().default(""),
  dueDate: text("due_date").notNull().default(""),
  status: text("status").notNull(),
  sourceImportId: text("source_import_id").notNull(),
});

export const tenantCompanies = sqliteTable("tenant_companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  brandCode: text("brand_code").notNull(),
  status: text("status").notNull().default("Active"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tenantMemberships = sqliteTable(
  "tenant_memberships",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    userEmail: text("user_email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull(),
    accountScope: text("account_scope").notNull().default("*"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("tenant_memberships_tenant_email_idx").on(table.tenantId, table.userEmail)],
);

export const crmOpportunities = sqliteTable("crm_opportunities", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull(),
  primaryContactId: text("primary_contact_id").notNull().default(""),
  ownerUserId: text("owner_user_id").notNull(),
  name: text("name").notNull(),
  stage: text("stage").notNull(),
  commercialModel: text("commercial_model").notNull().default(""),
  expectedValueSatang: integer("expected_value_satang").notNull().default(0),
  probabilityBps: integer("probability_bps").notNull().default(0),
  expectedCloseDate: text("expected_close_date").notNull().default(""),
  nextAction: text("next_action").notNull().default(""),
  nextActionAt: text("next_action_at").notNull().default(""),
  riskNote: text("risk_note").notNull().default(""),
  status: text("status").notNull().default("Open"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const crmActivities = sqliteTable("crm_activities", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  accountId: text("account_id").notNull().default(""),
  contactId: text("contact_id").notNull().default(""),
  leadId: text("lead_id").notNull().default(""),
  opportunityId: text("opportunity_id").notNull().default(""),
  activityType: text("activity_type").notNull(),
  channel: text("channel").notNull().default(""),
  summary: text("summary").notNull(),
  outcome: text("outcome").notNull().default(""),
  occurredAt: text("occurred_at").notNull(),
  ownerUserId: text("owner_user_id").notNull(),
  sourceRecordId: text("source_record_id").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const demoAppointments = sqliteTable("demo_appointments", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().default("bib"),
  leadId: text("lead_id").notNull(),
  opportunityId: text("opportunity_id").notNull().default(""),
  locationType: text("location_type").notNull(),
  siteId: text("site_id").notNull().default(""),
  scheduledAt: text("scheduled_at").notNull().default(""),
  decisionMakerAttending: integer("decision_maker_attending", { mode: "boolean" }).notNull().default(false),
  qualificationScore: integer("qualification_score").notNull().default(0),
  approvalStatus: text("approval_status").notNull().default("Pending"),
  status: text("status").notNull().default("Requested"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const moduleDefinitions = sqliteTable("module_definitions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: text("module_key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const fieldDefinitions = sqliteTable("field_definitions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: text("module_key").notNull(),
  fieldKey: text("field_key").notNull(),
  label: text("label").notNull(),
  fieldType: text("field_type").notNull(),
  required: integer("required", { mode: "boolean" }).notNull().default(false),
  optionsJson: text("options_json").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const documentTemplateRegistry = sqliteTable("document_template_registry", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: text("module_key").notNull(),
  templateCode: text("template_code").notNull(),
  name: text("name").notNull(),
  approvalWorkflow: text("approval_workflow").notNull(),
  currentVersion: text("current_version").notNull().default("1.0"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const taskTemplateRegistry = sqliteTable("task_template_registry", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: text("module_key").notNull(),
  name: text("name").notNull(),
  defaultOwnerRole: text("default_owner_role").notNull(),
  dueOffsetDays: integer("due_offset_days").notNull().default(0),
  triggerEvent: text("trigger_event").notNull().default("Manual"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workflowDefinitions = sqliteTable("workflow_definitions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  moduleKey: text("module_key").notNull(),
  workflowCode: text("workflow_code").notNull(),
  name: text("name").notNull(),
  stepsJson: text("steps_json").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const evidenceAssignments = sqliteTable(
  "evidence_assignments",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    title: text("title").notNull(),
    periodKey: text("period_key").notNull(),
    instructions: text("instructions").notNull().default(""),
    requiredCaseCount: integer("required_case_count").notNull().default(1),
    dueAt: text("due_at").notNull().default(""),
    assignedRole: text("assigned_role").notNull().default("Therapist"),
    status: text("status").notNull().default("Draft"),
    createdByEmail: text("created_by_email").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("evidence_assignments_tenant_account_status_idx").on(table.tenantId, table.accountId, table.status),
    index("evidence_assignments_tenant_period_idx").on(table.tenantId, table.periodKey),
  ],
);

export const evidenceCases = sqliteTable(
  "evidence_cases",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    assignmentId: text("assignment_id").notNull().default(""),
    therapistContactId: text("therapist_contact_id").notNull().default(""),
    createdByEmail: text("created_by_email").notNull(),
    caseReference: text("case_reference").notNull(),
    ageBand: text("age_band").notNull().default(""),
    concernCode: text("concern_code").notNull(),
    protocolCode: text("protocol_code").notNull().default(""),
    programCodesJson: text("program_codes_json").notNull().default("[]"),
    sessionCount: integer("session_count").notNull().default(0),
    baselineDate: text("baseline_date").notNull().default(""),
    followUpDate: text("follow_up_date").notNull().default(""),
    outcomeMeasuresJson: text("outcome_measures_json").notNull().default("{}"),
    customerFeedbackJson: text("customer_feedback_json").notNull().default("{}"),
    therapistSummary: text("therapist_summary").notNull().default(""),
    voiceTranscript: text("voice_transcript").notNull().default(""),
    status: text("status").notNull().default("Draft"),
    submittedAt: text("submitted_at").notNull().default(""),
    approvedAt: text("approved_at").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("evidence_cases_tenant_account_status_idx").on(table.tenantId, table.accountId, table.status),
    index("evidence_cases_tenant_assignment_idx").on(table.tenantId, table.assignmentId),
    uniqueIndex("evidence_cases_tenant_account_reference_idx").on(table.tenantId, table.accountId, table.caseReference),
  ],
);

export const evidenceSubmissions = sqliteTable(
  "evidence_submissions",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    caseId: text("case_id").notNull(),
    version: integer("version").notNull(),
    status: text("status").notNull().default("Submitted"),
    snapshotJson: text("snapshot_json").notNull(),
    submittedByEmail: text("submitted_by_email").notNull(),
    submittedAt: text("submitted_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("evidence_submissions_tenant_case_version_idx").on(table.tenantId, table.caseId, table.version),
    index("evidence_submissions_tenant_account_status_idx").on(table.tenantId, table.accountId, table.status),
  ],
);

export const evidenceMedia = sqliteTable(
  "evidence_media",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    caseId: text("case_id").notNull(),
    submissionId: text("submission_id").notNull().default(""),
    mediaType: text("media_type").notNull(),
    captureStage: text("capture_stage").notNull(),
    objectKey: text("object_key").notNull().default(""),
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    byteSize: integer("byte_size").notNull().default(0),
    checksum: text("checksum").notNull().default(""),
    uploadStatus: text("upload_status").notNull().default("Pending upload"),
    takenAt: text("taken_at").notNull().default(""),
    uploadedByEmail: text("uploaded_by_email").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("evidence_media_tenant_case_idx").on(table.tenantId, table.caseId),
    index("evidence_media_tenant_upload_status_idx").on(table.tenantId, table.uploadStatus),
  ],
);

export const evidenceReviews = sqliteTable(
  "evidence_reviews",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    caseId: text("case_id").notNull(),
    submissionId: text("submission_id").notNull(),
    reviewerEmail: text("reviewer_email").notNull(),
    reviewerRole: text("reviewer_role").notNull(),
    decision: text("decision").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("evidence_reviews_tenant_case_idx").on(table.tenantId, table.caseId, table.createdAt),
  ],
);

export const consentRecords = sqliteTable(
  "consent_records",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    accountId: text("account_id").notNull(),
    caseId: text("case_id").notNull(),
    consentType: text("consent_type").notNull(),
    status: text("status").notNull().default("Pending"),
    scopeJson: text("scope_json").notNull().default("{}"),
    consentedAt: text("consented_at").notNull().default(""),
    expiresAt: text("expires_at").notNull().default(""),
    withdrawnAt: text("withdrawn_at").notNull().default(""),
    capturedByEmail: text("captured_by_email").notNull(),
    evidenceDocumentId: text("evidence_document_id").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("consent_records_tenant_case_type_idx").on(table.tenantId, table.caseId, table.consentType),
    index("consent_records_tenant_account_status_idx").on(table.tenantId, table.accountId, table.status),
  ],
);
