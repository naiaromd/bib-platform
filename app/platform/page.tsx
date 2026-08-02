"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FinanceModule from "./FinanceModule";

type InternalView = "today" | "crm" | "account" | "customers" | "campaigns" | "operations" | "approval" | "performance" | "finance" | "settings";

const workspaces: Array<[InternalView, string, string, string]> = [
  ["today", "01", "งานวันนี้", "สิ่งที่ต้องตัดสินใจและติดตาม"],
  ["crm", "02", "ลูกค้าและโอกาสขาย", "บุคคล องค์กร และขั้นตอนถัดไป"],
  ["customers", "03", "ลูกค้าและเครื่องที่ติดตั้ง", "สัญญา การติดตั้ง และผลการดำเนินงาน"],
  ["campaigns", "04", "กิจกรรมและแคมเปญ", "Event Promotion และ Campaign"],
  ["operations", "05", "ฝึกอบรมและบริการ", "กิจกรรม Trainer และงานหลังการขาย"],
  ["approval", "06", "ข้อเสนอและการอนุมัติ", "รูปแบบธุรกิจและเอกสาร"],
  ["performance", "07", "ผลการดำเนินงาน", "เป้าหมาย คุณภาพ และความเสี่ยง"],
  ["finance", "08", "การเงินผู้บริหาร", "รายเดือน ไตรมาส และรายปี"],
  ["settings", "09", "ตั้งค่าพื้นที่ BIB", "ช่องข้อมูล เอกสาร งาน และขั้นอนุมัติ"],
];

type LeadRecord = {
  id: string; accountId: string; name: string; status: string; score: number; temperature: string;
  next: string; nextActionAt: string; due: string; owner: string; segment: string; model: string;
  contact: string; role: string; city: string; source: string; sourceId: string;
  lastContactAt: string; lastContact: string; evidence: string[]; risk: string; stage: string;
  opportunityId: string; expectedValueSatang: number; probabilityBps: number;
};

const emptyLead: LeadRecord = {
  id: "", accountId: "", name: "ยังไม่ได้เลือกลูกค้า", status: "รอข้อมูล", score: 0, temperature: "Cold",
  next: "ยังไม่มีขั้นตอนถัดไป", nextActionAt: "", due: "ยังไม่กำหนด", owner: "ยังไม่ระบุ", segment: "ยังไม่ระบุ",
  model: "ยังไม่เลือก", contact: "ยังไม่มีผู้ติดต่อ", role: "ยังไม่ระบุ", city: "ยังไม่ระบุ",
  source: "ยังไม่ระบุ", sourceId: "", lastContactAt: "", lastContact: "ยังไม่มีข้อมูล", evidence: [],
  risk: "ยังไม่มีข้อมูล", stage: "Lead", opportunityId: "", expectedValueSatang: 0, probabilityBps: 0,
};

function formatThaiDate(value: string) {
  if (!value) return "ยังไม่กำหนด";
  const date = new Date(`${value.slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function BrandHeader({ area }: { area: string }) {
  return (
    <header className="v2-brand-header">
      <a href="/platform" className="v2-brand-lockup">
        <img src="/logos/bib-logo.png" alt="BIB" />
        <span />
        <img src="/logos/icoone-laser-med.png" alt="icoone laser med" />
      </a>
      <div className="v2-brand-copy"><b>PRACTICE INTELLIGENCE</b><span>Knowledge to decision · Decision to better practice</span></div>
      <nav aria-label="เลือกพื้นที่ใช้งาน">
        <a className="active" href="/platform">สำหรับทีม BIB</a>
        <a href="/explore">สำหรับผู้สนใจ</a>
        <a href="/client">สำหรับลูกค้า</a>
      </nav>
      <em>{area}</em>
    </header>
  );
}

export default function InternalPlatformPage() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<InternalView>(() => searchParams.get("view") === "approval" ? "approval" : "today");
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<LeadRecord>(emptyLead);
  const [currentUser, setCurrentUser] = useState({ displayName: "กำลังโหลด", role: "" });
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const toast = (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const roleViews: Record<string, InternalView[]> = {
    Executive: ["today", "crm", "account", "customers", "campaigns", "operations", "approval", "performance", "finance", "settings"],
    Finance: ["today", "customers", "approval", "performance", "finance"],
    Legal: ["today", "approval"],
    Approver: ["approval"],
    Sales: ["today", "crm", "account", "customers", "campaigns", "approval"],
    Trainer: ["today", "customers", "operations"],
    Marketing: ["today", "crm", "account", "campaigns"],
    "After Sales": ["today", "customers", "operations"],
  };
  const visibleWorkspaces = workspaces.filter(([id]) => !currentUser.role || (roleViews[currentUser.role] || ["today"]).includes(id));
  useEffect(() => {
    fetch("/api/workspace", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload) => {
        const records = (Array.isArray(payload.leads) ? payload.leads : []).map((lead: Record<string, unknown>) => ({
          ...lead,
          due: formatThaiDate(String(lead.nextActionAt || "")),
          lastContact: formatThaiDate(String(lead.lastContactAt || "")),
        })) as LeadRecord[];
        setLeads(records);
        if (records.length) setSelectedAccount(records[0]);
        if (payload.user) setCurrentUser({ displayName: String(payload.user.displayName || payload.user.email), role: String(payload.user.role || "") });
      }).catch(async () => {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        if (!response.ok) throw new Error("ไม่สามารถยืนยันผู้ใช้งานได้");
        const payload = await response.json();
        if (payload.actor) {
          setCurrentUser({ displayName: String(payload.actor.displayName || payload.actor.email), role: String(payload.actor.role || "") });
          setView("approval");
        }
      }).catch(() => toast("ยังโหลดข้อมูลผู้ใช้งานไม่สำเร็จ"));
  }, []);
  const visibleLeads = leads.filter((lead) => Object.values(lead).flat().join(" ").toLowerCase().includes(query.toLowerCase()));
  const openAccount = (account: LeadRecord) => { if (!account.id) return; setSelectedAccount(account); setView("account"); };

  return (
    <main className="v2-shell">
      <BrandHeader area={`${currentUser.displayName}${currentUser.role ? ` · ${currentUser.role}` : ""}`} />

      <section className="v2-layout">
        <aside className="v2-job-nav">
          <span>CHOOSE A JOB TO DO</span>
          <h2>พื้นที่ทำงาน</h2>
          <p>แสดงเฉพาะงานตามหน้าที่และสิทธิ์</p>
          <nav>
            {visibleWorkspaces.map(([id, no, title, text]) => (
              <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
                <i>{no}</i><span><b>{title}</b><small>{text}</small></span><em>↗</em>
              </button>
            ))}
          </nav>
          <div className="v2-control-note"><b>หลักควบคุม</b><p>ระบบช่วยสรุป ผู้มีอำนาจเป็นผู้อนุมัติ</p></div>
        </aside>

        <div className="v2-work">
          <header className="v2-work-head">
            <div><span>BIB INTERNAL WORKSPACE</span><h2>{visibleWorkspaces.find(([id]) => id === view)?.[2] || "พื้นที่ทำงาน"}</h2></div>
            <label><i>⌕</i><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาลูกค้า งาน หรือเอกสาร" /></label>
            <button onClick={() => toast("เปิดแบบฟอร์มสร้างรายการใหม่แล้ว")}>＋ สร้างรายการ</button>
          </header>
          {view === "today" && <TodayView changeView={setView} toast={toast} user={currentUser} />}
          {view === "crm" && <CrmView leads={visibleLeads} toast={toast} openAccount={openAccount} />}
          {view === "customers" && <CustomersView toast={toast} />}
          {view === "account" && <AccountView account={selectedAccount} back={() => setView("crm")} openSource={() => setView("campaigns")} toast={toast} />}
          {view === "campaigns" && <CampaignView leads={leads} toast={toast} openAccount={openAccount} />}
          {view === "operations" && <OperationsView />}
          {view === "approval" && <ApprovalView toast={toast} />}
          {view === "performance" && <PerformanceView />}
          {view === "finance" && <FinanceModule toast={toast} />}
          {view === "settings" && <ConfigurationView toast={toast} />}
        </div>
      </section>
      {notice && <div className="v2-toast">✓ {notice}</div>}
    </main>
  );
}

type CustomerRecord = { id: string; legal_name: string; display_name: string; business_segment: string; commercial_model: string; device_model: string; serial_number: string; installed_at: string; deployment_status: string };
type LinnaPerformance = { report_month: string; reported_paid_sessions: number; eligible_paid_sessions: number; complimentary_sessions: number; training_sessions: number; reported_gross_revenue: number; eligible_gross_revenue: number; bib_share_vat_inclusive: number; linna_share: number; deductible_marketing: number; approved_refunds: number; total_usage_minutes: number; exception_count: number; status: string };
type LinnaMarketing = { id: string; report_month: string; submitted_amount_satang: number; eligible_amount_satang: number; excluded_amount_satang: number; monthly_cap_satang: number; invoice_document_id: string; payment_document_id: string; evidence_status: string; review_status: string; review_note: string; updated_at: string };
type LinnaMarketingItem = { id: string; claim_id: string; channel: string; service_period_start: string; service_period_end: string; description: string; submitted_amount_satang: number; source_document_id: string; source_file_name: string; source_file_hash: string; source_document_status: string; evidence_status: string };
type LinnaMarketingReview = { id: string; claim_id: string; action: string; comment: string; actor_display_name: string; actor_role: string; created_at: string };

function CustomersView({ toast }: { toast: (message: string) => void }) {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [linna, setLinna] = useState<LinnaPerformance | null>(null);
  const [marketingClaims, setMarketingClaims] = useState<LinnaMarketing[]>([]);
  const [marketingItems, setMarketingItems] = useState<LinnaMarketingItem[]>([]);
  const [marketingReviews, setMarketingReviews] = useState<LinnaMarketingReview[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showMarketingForm, setShowMarketingForm] = useState(false);
  const [marketingForm, setMarketingForm] = useState({ reportMonth: "2026-07", submittedAmount: "1640", eligibleAmount: "0", evidenceStatus: "ได้รับตารางสรุปแล้ว", reviewNote: "" });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [tab, setTab] = useState<"installed" | "linna">("installed");
  const [selectedMonth, setSelectedMonth] = useState("2026-06");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch("/api/workspace", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/finance/marketing?accountId=linna", { cache: "no-store" }).then((response) => response.ok ? response.json() : { claims: [], items: [], reviews: [] }),
    ]).then(([workspace, ads]) => {
      setCustomers(Array.isArray(workspace.customers) ? workspace.customers : []);
      setLinna(workspace.linnaPerformance || null);
      setUserRole(String(workspace.user?.role || ""));
      const claims = Array.isArray(ads.claims) ? ads.claims as LinnaMarketing[] : [];
      setMarketingClaims(claims);
      setMarketingItems(Array.isArray(ads.items) ? ads.items : []);
      setMarketingReviews(Array.isArray(ads.reviews) ? ads.reviews : []);
      const matchingClaim = claims.find((claim) => claim.report_month === workspace.linnaPerformance?.report_month) || claims[0];
      if (matchingClaim) {
        setSelectedClaimId(matchingClaim.id);
        setSelectedMonth(matchingClaim.report_month);
      } else if (workspace.linnaPerformance?.report_month) setSelectedMonth(workspace.linnaPerformance.report_month);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const installed = customers.filter((customer) => customer.id !== "linna");
  const currency = (value: number) => `฿${Number(value || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const currencySatang = (value: number) => currency(Number(value || 0) / 100);
  const selectedClaim = marketingClaims.find((claim) => claim.id === selectedClaimId) || null;
  const availableMonths = Array.from(new Set([linna?.report_month, ...marketingClaims.map((claim) => claim.report_month)].filter(Boolean) as string[])).sort().reverse();
  const monthLabel = (month: string) => new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00+07:00`));
  const hasPerformanceForMonth = linna?.report_month === selectedMonth;
  const selectedItems = marketingItems.filter((item) => item.claim_id === selectedClaim?.id);
  const selectedReviews = marketingReviews.filter((review) => review.claim_id === selectedClaim?.id);
  const canReview = ["Executive", "Finance"].includes(userRole);
  const uploadEvidence = async (file: File, documentType: string, reportMonth: string) => {
    const [year, month] = reportMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const form = new FormData();
    form.set("file", file); form.set("documentType", documentType);
    form.set("periodStart", `${reportMonth}-01`); form.set("periodEnd", `${reportMonth}-${String(lastDay).padStart(2, "0")}`);
    const response = await fetch("/api/finance/files", { method: "POST", body: form });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "แนบเอกสารไม่สำเร็จ");
    return String(payload.id);
  };
  const reloadMarketing = async (claimId?: string) => {
    const response = await fetch("/api/finance/marketing?accountId=linna", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "โหลดข้อมูลค่าโฆษณาไม่สำเร็จ");
    setMarketingClaims(Array.isArray(payload.claims) ? payload.claims : []);
    setMarketingItems(Array.isArray(payload.items) ? payload.items : []);
    setMarketingReviews(Array.isArray(payload.reviews) ? payload.reviews : []);
    if (claimId) setSelectedClaimId(claimId);
  };
  const saveMarketing = async () => {
    try {
      const invoiceDocumentId = invoiceFile ? await uploadEvidence(invoiceFile, "ใบเสร็จค่าโฆษณา LINNA", marketingForm.reportMonth) : "";
      const paymentDocumentId = paymentFile ? await uploadEvidence(paymentFile, "หลักฐานการชำระค่าโฆษณา LINNA", marketingForm.reportMonth) : "";
      const response = await fetch("/api/finance/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", accountId: "linna", ...marketingForm, invoiceDocumentId, paymentDocumentId }) });
      const payload = await response.json();
      if (!response.ok) return toast(payload.error || "บันทึกไม่สำเร็จ");
      await reloadMarketing(payload.id);
      setSelectedMonth(marketingForm.reportMonth);
      setShowMarketingForm(false); setInvoiceFile(null); setPaymentFile(null);
      toast("บันทึกรายการและส่งให้ฝ่ายการเงินตรวจแล้ว");
    } catch (error) { toast(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ"); }
  };
  const reviewMarketing = async (action: "comment" | "request_changes" | "approve") => {
    if (!selectedClaim) return;
    const response = await fetch("/api/finance/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, accountId: "linna", claimId: selectedClaim.id, comment: reviewComment }) });
    const payload = await response.json();
    if (!response.ok) return toast(payload.error || "บันทึกการตรวจไม่สำเร็จ");
    await reloadMarketing(selectedClaim.id); setReviewComment("");
    toast(action === "approve" ? "อนุมัติและบันทึกผู้ดำเนินการแล้ว" : action === "request_changes" ? "ส่งคำขอเอกสารเพิ่มเติมแล้ว" : "บันทึกความเห็นแล้ว");
  };
  const selectMonth = (month: string) => {
    setSelectedMonth(month);
    const claim = marketingClaims.find((item) => item.report_month === month);
    setSelectedClaimId(claim?.id || "");
  };
  return <div className="v2-view v2-customers-view">
    <section className="v2-kicker-row"><div><span>ฐานลูกค้าและเครื่องที่ติดตั้ง</span><h2>ฐานลูกค้า icoone</h2><p>ติดตามสัญญา เครื่องที่ติดตั้ง และผลการดำเนินงานของลูกค้าแต่ละราย</p></div><em>{loading ? "กำลังโหลด" : `ทั้งหมด ${customers.length} บัญชี`}</em></section>
    <nav className="v2-customer-tabs"><button className={tab === "installed" ? "active" : ""} onClick={() => setTab("installed")}>ลูกค้าซื้อเครื่อง · {installed.length}</button><button className={tab === "linna" ? "active" : ""} onClick={() => setTab("linna")}>LINNA · สัญญาแบ่งรายได้</button></nav>
    {tab === "installed" && <section className="v2-installed-customers">
      <header><div><span>เครื่องที่จำหน่ายแล้ว</span><h3>ลูกค้าและเครื่องที่ส่งมอบแล้ว</h3></div><em>ข้อมูลที่ขาดจะแสดงเพื่อให้ทีมติดตาม</em></header>
      <div className="head"><span>ลูกค้า</span><span>ประเภทธุรกิจ</span><span>เงื่อนไขการค้า</span><span>รุ่นเครื่อง</span><span>สถานะข้อมูล</span></div>
      {installed.map((customer) => <article key={customer.id}><span><i>{customer.display_name.slice(0, 2)}</i><b>{customer.display_name}</b></span><span>{customer.business_segment}</span><strong>{customer.commercial_model}</strong><span>{customer.device_model}</span><em>{customer.serial_number ? "ข้อมูลเครื่องครบ" : "รอเลขเครื่องและวันติดตั้ง"}</em></article>)}
    </section>}
    {tab === "linna" && linna && <div className="v2-linna-performance">
      <section className="v2-linna-head"><div><span>LINNA · สัญญาแบ่งรายได้แบบ D2</span><h3>รอบบัญชี {monthLabel(selectedMonth)}</h3><p>BIB 40% รวม VAT แล้ว · LINNA 60% · ไม่มีรายได้ขั้นต่ำที่รับประกัน</p></div><div className="v2-linna-head-actions"><em>{hasPerformanceForMonth ? `มี ${linna.exception_count} รายการต้องตรวจ` : "รอรายงานรายได้ประจำเดือน"}</em>{canReview && <button onClick={() => setShowMarketingForm(!showMarketingForm)}>＋ เพิ่มรายการค่าโฆษณา</button>}</div></section>
      <nav className="v2-linna-months" aria-label="เลือกรอบบัญชี">{availableMonths.map((month) => <button className={selectedMonth === month ? "active" : ""} onClick={() => selectMonth(month)} key={month}><b>{monthLabel(month)}</b><small>{linna?.report_month === month ? "มีรายงานรายได้" : "มีรายการค่าโฆษณา"}</small></button>)}</nav>
      {showMarketingForm && <section className="v2-linna-marketing-form"><header><div><span>ค่าโฆษณาที่ขอหักจากรายได้</span><h3>บันทึกรายการและเอกสารประกอบ</h3></div><em>ไม่เกิน 50,000 บาทต่อเดือน</em></header><div><label>รอบบัญชี<input type="month" value={marketingForm.reportMonth} onChange={(event) => setMarketingForm({ ...marketingForm, reportMonth: event.target.value })} /></label><label>ยอดที่ LINNA แจ้ง<input type="number" min="0" value={marketingForm.submittedAmount} onChange={(event) => setMarketingForm({ ...marketingForm, submittedAmount: event.target.value })} /></label><label>ยอดเสนอให้หัก<input type="number" min="0" max="50000" value={marketingForm.eligibleAmount} onChange={(event) => setMarketingForm({ ...marketingForm, eligibleAmount: event.target.value })} /></label><label>สถานะเอกสาร<select value={marketingForm.evidenceStatus} onChange={(event) => setMarketingForm({ ...marketingForm, evidenceStatus: event.target.value })}><option>ยังไม่ได้รับหลักฐาน</option><option>ได้รับตารางสรุปแล้ว</option><option>ได้รับเอกสารบางส่วน</option><option>ได้รับใบเสร็จและหลักฐานการชำระครบ</option></select></label><label>ใบเสร็จ<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setInvoiceFile(event.target.files?.[0] || null)} /></label><label>หลักฐานการชำระ<input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setPaymentFile(event.target.files?.[0] || null)} /></label><label className="wide">หมายเหตุ<input value={marketingForm.reviewNote} onChange={(event) => setMarketingForm({ ...marketingForm, reviewNote: event.target.value })} placeholder="ระบุช่องทาง ช่วงวันที่ และประเด็นที่ต้องตรวจ" /></label><button onClick={saveMarketing}>บันทึกและส่งตรวจ</button></div></section>}
      {hasPerformanceForMonth ? <>
        <section className="v2-linna-period-summary"><header><div><span>สรุปรอบบัญชี</span><h3>รายได้และส่วนแบ่งประจำเดือน</h3></div><em>{linna.status}</em></header><div className="v2-linna-metrics five"><article><span>รายได้ที่ LINNA รายงาน</span><strong>{currency(linna.reported_gross_revenue)}</strong><small>{linna.reported_paid_sessions} รายการ · {monthLabel(selectedMonth)}</small></article><article className="review"><span>รายได้ที่อยู่ในรอบบัญชี</span><strong>{currency(linna.eligible_gross_revenue)}</strong><small>{linna.eligible_paid_sessions} รายการ · รอตรวจ</small></article><article><span>ค่าโฆษณาที่อนุมัติให้หัก</span><strong>{currency(linna.deductible_marketing)}</strong><small>รายการที่รอหลักฐานยังไม่นำมาหัก</small></article><article><span>ส่วนแบ่ง BIB 40%</span><strong>{currency(linna.bib_share_vat_inclusive)}</strong><small>ยอดรวม VAT แล้ว</small></article><article><span>ส่วนแบ่ง LINNA 60%</span><strong>{currency(linna.linna_share)}</strong><small>จากรายได้สุทธิที่ผ่านการตรวจ</small></article></div></section>
        <div className="v2-linna-grid"><section className="v2-panel v2-linna-usage"><header><div><span>สรุปการใช้เครื่อง</span><h3>กิจกรรมที่เกิดขึ้นในเดือนนี้</h3></div></header><article><span>บริการที่ชำระเงินจริง</span><b>{linna.reported_paid_sessions}</b></article><article><span>บริการทดลองหรือไม่มีค่าใช้จ่าย</span><b>{linna.complimentary_sessions}</b></article><article><span>การฝึกอบรม</span><b>{linna.training_sessions}</b></article><article><span>เวลารวมจากไฟล์</span><b>{(linna.total_usage_minutes / 60).toFixed(2)} ชั่วโมง</b></article></section>
        <section className="v2-panel v2-linna-check"><header><div><span>ตรวจตามสัญญา</span><h3>ประเด็นก่อนปิดรอบ</h3></div><em>{linna.status}</em></header><article className="pass"><i>✓</i><span><b>มีรายการให้บริการที่ชำระเงินจริง</b><small>ยังไม่เข้าเงื่อนไขไม่มีรายได้ติดต่อกัน 3 เดือน</small></span></article><article className={selectedClaim?.review_status === "อนุมัติแล้ว" ? "pass" : "alert"}><i>{selectedClaim?.review_status === "อนุมัติแล้ว" ? "✓" : "!"}</i><span><b>{selectedClaim?.review_status === "อนุมัติแล้ว" ? "ค่าโฆษณาผ่านการตรวจแล้ว" : "ค่าโฆษณายังไม่ถูกหักจากรายได้"}</b><small>{selectedClaim ? `${currencySatang(selectedClaim.submitted_amount_satang)} · ${selectedClaim.review_status}` : "ยังไม่มีรายการค่าโฆษณา"}</small></span></article><article className="alert"><i>!</i><span><b>พบรายการวันที่ 29 พฤษภาคม</b><small>4,360.20 บาทอยู่ในไฟล์เดือนมิถุนายน ต้องยืนยันรอบรับรู้รายได้</small></span></article><article className="alert"><i>!</i><span><b>รูปแบบวันที่ในไฟล์ไม่ถูกต้อง</b><small>ต้องแก้ปีเป็น 2569/2026 ก่อนปิดรอบ</small></span></article></section></div>
      </> : <section className="v2-linna-no-performance"><span>รายได้ประจำเดือน</span><h3>ยังไม่ได้รับรายงานรายได้ของ {monthLabel(selectedMonth)}</h3><p>รายการค่าโฆษณาด้านล่างจะแยกเก็บไว้ในเดือนนี้ และจะยังไม่ถูกนำไปหักจนกว่าจะได้รับรายงานรายได้และหลักฐานครบถ้วน</p></section>}
      <section className="v2-linna-ads"><header><div><span>หลักฐานค่าโฆษณา</span><h3>รายการของ {monthLabel(selectedMonth)}</h3></div><em>ตารางสรุปไม่ใช่หลักฐานการชำระ</em></header>{selectedClaim ? <div className="v2-linna-ads-detail"><div className="v2-linna-ads-summary"><article><span>ยอดที่ LINNA แจ้ง</span><strong>{currencySatang(selectedClaim.submitted_amount_satang)}</strong></article><article><span>ยอดที่อนุมัติให้หัก</span><strong>{currencySatang(selectedClaim.review_status === "อนุมัติแล้ว" ? selectedClaim.eligible_amount_satang : 0)}</strong></article><article><span>สถานะ</span><strong>{selectedClaim.review_status}</strong></article></div><div className="v2-linna-ad-items">{selectedItems.map((item) => <article key={item.id}><span><b>{item.channel}</b><small>{item.service_period_start}{item.service_period_end ? ` – ${item.service_period_end}` : " เป็นต้นไป"}</small></span><strong>{currencySatang(item.submitted_amount_satang)}</strong><em>{item.evidence_status}</em><small>ที่มา: {item.source_file_name || "ยังไม่แนบไฟล์"}</small></article>)}</div><p className="v2-linna-review-note"><b>หมายเหตุล่าสุด</b>{selectedClaim.review_note || "ยังไม่มีหมายเหตุ"}</p>{canReview && <div className="v2-linna-review-box"><label>ความเห็นของผู้ตรวจ<textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="ระบุเอกสารที่ขาด เหตุผล หรือข้อสรุปการตรวจ" /></label><div><button onClick={() => reviewMarketing("comment")}>บันทึกความเห็น</button><button className="request" onClick={() => reviewMarketing("request_changes")}>ขอเอกสารเพิ่มเติม</button><button className="approve" disabled={selectedClaim.evidence_status !== "ได้รับใบเสร็จและหลักฐานการชำระครบ" || !selectedClaim.invoice_document_id || !selectedClaim.payment_document_id} onClick={() => reviewMarketing("approve")}>อนุมัติยอดหัก</button></div>{selectedClaim.review_status !== "อนุมัติแล้ว" && <small>ปุ่มอนุมัติจะใช้งานได้เมื่อมีใบเสร็จและหลักฐานการชำระครบ</small>}</div>}<div className="v2-linna-review-history"><b>ประวัติการตรวจ</b>{selectedReviews.length ? selectedReviews.map((review) => <article key={review.id}><span>{review.action} · {review.actor_display_name} ({review.actor_role})</span><small>{review.comment || "ไม่มีความเห็นเพิ่มเติม"} · {formatThaiDate(review.created_at)}</small></article>) : <p>ยังไม่มีการอนุมัติหรือความเห็นในรายการนี้</p>}</div></div> : <div className="v2-linna-no-ads"><span>ยังไม่มีรายการค่าโฆษณาในรอบเดือนนี้</span>{canReview && <button onClick={() => setShowMarketingForm(true)}>＋ เพิ่มรายการค่าโฆษณา</button>}</div>}</section>
      <footer className="v2-linna-source">แหล่งข้อมูลรอบ {monthLabel(selectedMonth)}: {hasPerformanceForMonth ? "รายงานบริการ LINNA" : "ยังไม่มีรายงานบริการ"} · {selectedItems.length ? `หลักฐานค่าโฆษณา ${Array.from(new Set(selectedItems.map((item) => item.source_file_name).filter(Boolean))).join(", ") || "รอแนบไฟล์"}` : "ไม่มีรายการค่าโฆษณา"} · ใช้ยอดที่ผ่านการตรวจแล้วในการคำนวณเท่านั้น</footer>
    </div>}
    {tab === "linna" && !linna && !loading && <section className="v2-empty">ยังไม่พบรายงาน LINNA</section>}
  </div>;
}

function TodayView({ changeView, toast, user }: { changeView: (view: InternalView) => void; toast: (text: string) => void; user: { displayName: string; role: string } }) {
  const [tasks, setTasks] = useState<Array<{ id: string; account: string; title: string; owner: string; due: number; status: string; priority: string }>>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [newTask, setNewTask] = useState("");
  const [annualTarget, setAnnualTarget] = useState(0);
  const [sold, setSold] = useState(0);
  const [importedCounts, setImportedCounts] = useState({ events: 0, training: 0, afterSales: 0, openService: 0 });
  const [leadFollowUps, setLeadFollowUps] = useState(0);
  const [pipelineRows, setPipelineRows] = useState<Array<{ stage: string; total: number; valueSatang: number }>>([]);
  const [sourceHighlights, setSourceHighlights] = useState<Array<{ name: string; leads: number; status: string }>>([]);
  const [dataState, setDataState] = useState<"loading" | "saved" | "fallback">("loading");
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  const remaining = Math.max(annualTarget - sold, 0);
  useEffect(() => {
    fetch("/api/workspace").then((response) => response.ok ? response.json() : Promise.reject()).then((payload) => {
      if (Array.isArray(payload.tasks)) setTasks(payload.tasks.map((task: Record<string, unknown>) => ({ id: String(task.id), account: String(task.account_id || "งานทั่วไป"), title: String(task.title), owner: "ผู้รับผิดชอบ", due: Number(String(task.due_date).slice(-2)), status: String(task.status), priority: String(task.priority) })));
      if (payload.target) { setAnnualTarget(Number(payload.target.target_value || 0)); setSold(Number(payload.target.actual_value || 0)); }
      const afterSales = Array.isArray(payload.afterSales) ? payload.afterSales : [];
      setImportedCounts({
        events: Array.isArray(payload.events) ? payload.events.length : 0,
        training: Array.isArray(payload.training) ? payload.training.length : 0,
        afterSales: afterSales.length,
        openService: afterSales.filter((item: Record<string, unknown>) => String(item.status).toLowerCase() !== "done").length,
      });
      const crmLeads = Array.isArray(payload.leads) ? payload.leads : [];
      setLeadFollowUps(crmLeads.filter((item: Record<string, unknown>) => String(item.next || "").length > 0).length);
      setPipelineRows((Array.isArray(payload.funnel) ? payload.funnel : []).map((item: Record<string, unknown>) => ({ stage: String(item.stage), total: Number(item.total || 0), valueSatang: Number(item.value_satang || 0) })));
      setSourceHighlights((Array.isArray(payload.events) ? payload.events : []).slice(0, 3).map((item: Record<string, unknown>) => ({ name: String(item.name), leads: Number(item.actual_leads || 0), status: String(item.status) })));
      setDataState("saved");
    }).catch(() => setDataState("fallback"));
  }, []);
  const updateStatus = async (id: string, status: string) => { setTasks(tasks.map((task) => task.id === id ? { ...task, status } : task)); const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_task", id, status }) }); if (!response.ok) setDataState("fallback"); };
  const addTask = async () => { if (!newTask.trim()) return; const title = newTask.trim(); const temporaryId = `temporary-${Date.now()}`; setTasks([...tasks, { id: temporaryId, account: "งานทั่วไป", title, owner: "ผู้รับผิดชอบ", due: selectedDay, status: "ยังไม่เริ่ม", priority: "กลาง" }]); setNewTask(""); const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create_task", title, dueDate: `2026-08-${String(selectedDay).padStart(2, "0")}` }) }); if (response.ok) { const payload = await response.json(); setTasks((current) => current.map((task) => task.id === temporaryId ? { ...task, id: payload.id } : task)); toast("เพิ่มและบันทึกงานแล้ว"); } else { setDataState("fallback"); toast("เพิ่มงานในหน้าจอแล้ว แต่ยังบันทึกถาวรไม่ได้"); } };
  const saveTarget = async () => { const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_target", targetValue: annualTarget, actualValue: sold }) }); if (response.ok) { setDataState("saved"); toast("บันทึกเป้าหมายแล้ว"); } else { setDataState("fallback"); toast("ยังบันทึกเป้าหมายไม่ได้"); } };
  const openTasks = tasks.filter((task) => task.status !== "เสร็จแล้ว");
  return <div className="v2-view">
    <section className="v2-user-dashboard"><div className="v2-user-identity"><i>{user.displayName.slice(0, 1)}</i><span><small>สวัสดี</small><h2>{user.displayName}</h2><p>{user.role || "กำลังตรวจสอบสิทธิ์"} · 1 ส.ค. 2569</p></span></div><div className="v2-user-focus"><small>สิ่งที่ควรดูเป็นอันดับแรก</small><b>{leadFollowUps} Lead มีขั้นตอนถัดไป</b><button onClick={() => changeView("crm")}>เปิดรายการ →</button></div></section>
    <section className="v2-kicker-row"><div><span>CURRENT DASHBOARD</span><h2>งานและนัดหมายของคุณ</h2><p>เห็นสิ่งที่ต้องทำ สถานะ และกำหนดเวลาในหน้าเดียว</p></div><em className={`data-${dataState}`}>{dataState === "saved" ? "● บันทึกในระบบแล้ว" : dataState === "loading" ? "กำลังโหลดข้อมูล" : "เชื่อมข้อมูลไม่สำเร็จ"}</em></section>
    <section className="v2-home-target"><header><div><span>ACTIONABLE TARGET · 2569</span><h3>เป้าหมายที่ต้องลงมือทำ</h3></div><button onClick={() => changeView("performance")}>ดูรายละเอียดทั้งหมด</button></header><div className="inputs"><label>เป้าขายทั้งปี<input type="number" min="0" value={annualTarget} onChange={(event) => setAnnualTarget(Math.max(0, Number(event.target.value) || 0))} /></label><label>ขายแล้ว<input type="number" min="0" max={annualTarget} value={sold} onChange={(event) => setSold(Math.min(annualTarget, Math.max(0, Number(event.target.value) || 0)))} /></label><article><span>ต้องขายเพิ่ม</span><strong>{remaining} เครื่อง</strong></article><article><span>นัดสาธิตที่ควรมี</span><strong>{remaining * 5} ครั้ง</strong></article><article><span>Lead ที่ผ่านเกณฑ์</span><strong>{Math.ceil((remaining * 5) / .4)} ราย</strong></article><button className="save" onClick={saveTarget}>บันทึกเป้าหมาย</button></div><footer>อัตราแปลงเป็นสมมติฐานสำหรับวางแผน จนกว่าจะมีข้อมูลจริงย้อนหลังเพียงพอ</footer></section>
    <section className="v2-import-overview"><header><div><span>KPI EVALUATION · THAILAND</span><h3>ข้อมูลปี 2569 ที่นำเข้าแล้ว</h3></div><em>แหล่งข้อมูลจริง · 24 ก.ค. 2569</em></header><div>{[[String(importedCounts.events), "กิจกรรมและแคมเปญ", "campaigns"], [String(importedCounts.training), "ฝึกอบรมและสาธิต", "operations"], [String(importedCounts.afterSales), "งานหลังการขาย", "operations"], [String(importedCounts.openService), "งานบริการที่ยังเปิด", "operations"]].map((item) => <button key={item[1]} onClick={() => changeView(item[2] as InternalView)}><strong>{item[0]}</strong><span>{item[1]}</span><small>เปิดดูรายละเอียด →</small></button>)}</div></section>
    <div className="v2-today-metrics">{[[String(openTasks.length), "งานที่ยังเปิด"], [String(tasks.filter((task) => task.status === "กำลังทำ").length), "กำลังดำเนินการ"], [String(tasks.filter((task) => task.priority === "สูง" && task.status !== "เสร็จแล้ว").length), "งานสำคัญ"], [String(new Set(openTasks.map((task) => task.due)).size), "วันที่มีนัดหมาย"]].map((item) => <article key={item[1]}><strong>{item[0]}</strong><span>{item[1]}</span></article>)}</div>
    <div className="v2-todo-calendar">
      <section className="v2-panel v2-todo-list"><header><div><span>MY TO-DO LIST</span><h3>รายการงาน</h3></div><button onClick={() => changeView("crm")}>เปิดรายชื่อลูกค้า</button></header>
        <div className="v2-todo-filters"><button className="active">ทั้งหมด {tasks.length}</button><button>สำคัญ {tasks.filter((task) => task.priority === "สูง").length}</button><button>เสร็จแล้ว {tasks.filter((task) => task.status === "เสร็จแล้ว").length}</button></div>
        {tasks.map((task) => <article className={task.status === "เสร็จแล้ว" ? "done" : ""} key={task.id}><button className="check" aria-label={`ทำเครื่องหมาย ${task.title} ว่าเสร็จแล้ว`} onClick={() => updateStatus(task.id, task.status === "เสร็จแล้ว" ? "ยังไม่เริ่ม" : "เสร็จแล้ว")}>{task.status === "เสร็จแล้ว" ? "✓" : ""}</button><span><small>{task.account} · {task.owner}</small><b>{task.title}</b><em>ครบกำหนด {task.due} ส.ค. · ความสำคัญ{task.priority}</em></span><select aria-label={`สถานะ ${task.title}`} value={task.status} onChange={(event) => updateStatus(task.id, event.target.value)}><option>ยังไม่เริ่ม</option><option>กำลังทำ</option><option>รอตรวจ</option><option>เสร็จแล้ว</option></select></article>)}
      </section>
      <section className="v2-panel v2-calendar"><header><div><span>CALENDAR</span><h3>สิงหาคม 2569</h3></div><button onClick={() => setSelectedDay(1)}>วันนี้</button></header><div className="week"><span>จ</span><span>อ</span><span>พ</span><span>พฤ</span><span>ศ</span><span>ส</span><span>อา</span></div><div className="days"><i /><i /><i /><i /><i />{days.map((day) => { const dayTasks = tasks.filter((task) => task.due === day); return <button className={`${selectedDay === day ? "active" : ""} ${dayTasks.length ? "has-task" : ""}`} onClick={() => setSelectedDay(day)} key={day}><b>{day}</b>{dayTasks.length > 0 && <small>{dayTasks.length}</small>}</button>; })}</div><div className="v2-calendar-detail"><span>{selectedDay} สิงหาคม</span>{tasks.filter((task) => task.due === selectedDay).map((task) => <p key={task.id}><i /><b>{task.title}</b><small>{task.status}</small></p>)}{!tasks.some((task) => task.due === selectedDay) && <em>ยังไม่มีงานในวันนี้</em>}<label><input value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} placeholder="เพิ่มงานในวันที่เลือก" /><button onClick={addTask}>＋ เพิ่ม</button></label></div></section>
    </div>
    <div className="v2-split v2-dashboard-secondary"><section className="v2-panel v2-pipeline"><header><div><span>PIPELINE</span><h3>มูลค่าตามขั้นตอน</h3></div><button onClick={() => changeView("performance")}>ดูประมาณการ</button></header>{pipelineRows.length ? pipelineRows.map((item) => { const max = Math.max(...pipelineRows.map((row) => row.valueSatang), 1); return <div key={item.stage}><span>{item.stage}</span><i><b style={{ width: `${Math.max((item.valueSatang / max) * 100, 4)}%` }} /></i><strong>฿{Math.round(item.valueSatang / 100).toLocaleString("th-TH")}</strong></div>; }) : <p>ยังไม่มีข้อมูล Opportunity</p>}</section><section className="v2-panel v2-source-mini"><header><div><span>LEAD SOURCE</span><h3>ต้นทางที่ต้องติดตาม</h3></div><button onClick={() => changeView("campaigns")}>ดูกิจกรรม</button></header>{sourceHighlights.length ? sourceHighlights.map((item) => <article key={item.name}><span><b>{item.name}</b><small>{item.status}</small></span><strong>{item.leads} Lead</strong></article>) : <p>ยังไม่มีข้อมูลกิจกรรม</p>}</section></div>
  </div>;
}

function CrmView({ leads: items, toast, openAccount }: { leads: LeadRecord[]; toast: (text: string) => void; openAccount: (account: LeadRecord) => void }) {
  const lifecycle = [
    ["ผู้สนใจ", items.length],
    ["ผ่านเกณฑ์", items.filter((item) => item.score >= 30).length],
    ["นัดสาธิต", items.filter((item) => item.stage.includes("Demo")).length],
    ["เสนอราคา", items.filter((item) => ["Offered", "Offer Approval"].includes(item.stage)).length],
    ["เจรจา", items.filter((item) => item.stage === "Negotiating").length],
    ["ทำสัญญา", items.filter((item) => item.stage === "Contracting").length],
  ];
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>CRM · PERSON → ORGANIZATION → OPPORTUNITY</span><h2>ลูกค้าและโอกาสขาย</h2><p>ติดตามบุคคล องค์กร และขั้นตอนถัดไป</p></div><button onClick={() => toast("เปิดแบบฟอร์มเพิ่มผู้ติดต่อแล้ว")}>＋ เพิ่มผู้ติดต่อ</button></section>
    <div className="v2-lifecycle">{lifecycle.map((item, index) => <article key={item[0]}><i>0{index + 1}</i><strong>{item[1]}</strong><span>{item[0]}</span></article>)}</div>
    <section className="v2-panel v2-table"><header><div><span>CONTACT & ACCOUNT VIEW</span><h3>รายการที่ต้องติดตาม</h3></div><em>{items.length} รายการ</em></header>
      <div className="v2-table-head"><span>บุคคลหรือองค์กร</span><span>สถานะ</span><span>คะแนน</span><span>ขั้นตอนถัดไป</span><span>กำหนด</span></div>
      {items.map((lead) => <button key={lead.name} onClick={() => openAccount(lead)}><span className="v2-contact-card"><i>{lead.contact.replace(/^(นพ\.|พญ\.|Dr\.\s*)/i, "").trim().slice(0, 2)}</i><span><b>{lead.contact}</b><small>{lead.name} · {lead.owner}</small></span></span><em>{lead.status}</em><strong>{lead.score}</strong><span>{lead.next}</span><time>{lead.due}</time></button>)}
    </section>
    <section className="v2-segmentation"><article><span>PERSON</span><h3>บุคคล</h3><p>บทบาท อิทธิพลต่อการตัดสินใจ และความสนใจ</p></article><article><span>ORGANIZATION</span><h3>องค์กร</h3><p>ประเภทธุรกิจ สถานที่ และความพร้อม</p></article><article><span>RELATIONSHIP</span><h3>ความสัมพันธ์</h3><p>ผู้สนใจ ลูกค้า Supplier หรือ Ecosystem</p></article></section>
  </div>;
}

function AccountView({ account, back, openSource, toast }: { account: LeadRecord; back: () => void; openSource: () => void; toast: (text: string) => void }) {
  const [tab, setTab] = useState<"overview" | "demo" | "offer" | "activity" | "comments">("overview");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{ author: string; text: string; date: string }>>([{ author: "ผู้ดูแลบัญชี", text: `ขั้นตอนถัดไป: ${account.next}`, date: "วันนี้" }]);
  const addComment = () => { if (!comment.trim()) return; setComments([{ author: "ผู้รับผิดชอบ", text: comment.trim(), date: "ขณะนี้" }, ...comments]); setComment(""); };
  const tabs: Array<[typeof tab, string]> = [["overview", "ภาพรวม"], ["demo", "การสาธิต"], ["offer", "ข้อเสนอและสัญญา"], ["activity", "บันทึกการติดต่อ"], ["comments", `ความคิดเห็น ${comments.length}`]];
  return <div className="v2-view v2-account-view">
    <button className="v2-back" onClick={back}>← กลับไปรายชื่อลูกค้า</button>
    <section className="v2-account-head">
      <div><span>{account.segment} · ผู้ดูแล {account.owner}</span><h2>{account.name}</h2><p>รูปแบบธุรกิจ {account.model} · {account.status}</p></div>
      <aside><small>คะแนนความพร้อม</small><strong>{account.score}</strong><em>จากหลักฐาน {account.evidence.length} รายการ</em></aside>
    </section>
    <nav className="v2-account-tabs" aria-label="ข้อมูลลูกค้า">{tabs.map(([id, label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav>

    {tab === "overview" && <div className="v2-account-grid">
      <section><div className="v2-profile-grid"><article><span>ผู้ติดต่อ</span><b>{account.contact}</b></article><article><span>บทบาท</span><b>{account.role}</b></article><article><span>พื้นที่</span><b>{account.city}</b></article><article className="source"><span>แหล่งที่มา · {account.sourceId}</span><b>{account.source}</b><button onClick={openSource}>ย้อนดูต้นทาง →</button></article><article><span>ติดต่อล่าสุด</span><b>{account.lastContact}</b></article><article><span>ผู้ดูแล</span><b>{account.owner}</b></article></div>
      <section className="v2-panel v2-signal-list"><header><div><span>QUALIFICATION SIGNALS</span><h3>เหตุผลที่ระบบให้คะแนน</h3></div><em>ตรวจสอบได้</em></header>
        {account.evidence.map((item, index) => <article key={item}><i>✓</i><span><b>{item}</b><small>{index === 0 ? "ข้อมูลที่ลูกค้ายืนยัน" : "บันทึกจากกิจกรรมล่าสุด"}</small></span><strong>+{index === 2 ? 10 : 5}</strong></article>)}
        <article className="risk"><i>!</i><span><b>ความเสี่ยงที่ต้องจัดการ</b><small>{account.risk}</small></span><strong>ตรวจ</strong></article>
      </section></section>
      <section className="v2-panel v2-next-card"><header><div><span>NEXT BEST ACTION</span><h3>ขั้นตอนถัดไป</h3></div></header><strong>{account.next}</strong><p>กำหนด {account.due} · ผู้รับผิดชอบ {account.owner}</p><button onClick={() => toast(`บันทึกงาน ${account.next} แล้ว`)}>บันทึกว่าเริ่มดำเนินการ</button><button className="secondary" onClick={() => setTab("activity")}>เพิ่มบันทึกการติดต่อ</button></section>
    </div>}

    {tab === "demo" && <div className="v2-account-grid">
      <section className="v2-panel v2-demo-readiness"><header><div><span>DEMO READINESS</span><h3>ประเมินก่อนออกสาธิตนอกสถานที่</h3></div><em>{account.score >= 60 ? "ผ่านเกณฑ์" : "ต้องทบทวน"}</em></header>
        {["ยืนยันวันและเวลาจากลูกค้า", "ผู้มีอำนาจหรือผู้มีอิทธิพลเข้าร่วม", "มีโครงการเปิดหรือขยายบริการ", "สถานที่และใบอนุญาตมีความพร้อม"].map((item, index) => <label key={item}><input type="checkbox" defaultChecked={index < (account.score >= 60 ? 3 : 2)} /><span>{item}</span></label>)}
      </section>
      <section className="v2-panel v2-next-card"><header><div><span>DEMO OPTIONS</span><h3>รูปแบบการสาธิต</h3></div></header><button onClick={() => toast("สร้างคำเชิญสาธิตที่สำนักงานแล้ว")}>ที่สำนักงาน BIB</button><button className="secondary" onClick={() => toast("ส่งคำขออนุมัติสาธิตนอกสถานที่แล้ว")}>นอกสถานที่ · ขออนุมัติค่าใช้จ่าย</button><p>การสาธิตนอกสถานที่ต้องผ่านเกณฑ์ความพร้อมและระบุผู้เข้าร่วม</p></section>
    </div>}

    {tab === "offer" && <div className="v2-account-grid">
      <section className="v2-panel v2-offer-summary"><header><div><span>APPROVED COMMERCIAL PATH</span><h3>เงื่อนไขที่เสนอได้</h3></div><em>แบบ {account.model}</em></header><div><span>สถานะ</span><b>{account.status}</b></div><div><span>รูปแบบธุรกิจ</span><b>{account.model}</b></div><div><span>ข้อยกเว้น</span><b>{account.model === "D2" ? "ไม่มี MG · VAT รวมในส่วนแบ่ง" : "ยังไม่มี"}</b></div><div><span>เอกสารฉบับล่าสุด</span><b>{account.model === "A" ? "Term Sheet A" : account.model === "B" ? "สัญญาเช่าเพื่อซื้อ" : "บันทึกเงื่อนไข"}</b></div></section>
      <section className="v2-panel v2-next-card"><header><div><span>DOCUMENT ACTION</span><h3>จัดทำเอกสาร</h3></div></header><button onClick={() => toast("เปิดแบบสร้างเอกสารจากแม่แบบแล้ว")}>สร้างเอกสารจากแม่แบบ</button><button className="secondary" onClick={() => toast("เปิดขั้นตอนตรวจทานและแสดงความคิดเห็นแล้ว")}>ส่งให้ลูกค้าตรวจทาน</button><p>ลูกค้าเห็นเฉพาะฉบับที่ได้รับอนุมัติและข้อมูลของตนเอง</p></section>
    </div>}

    {tab === "activity" && <div className="v2-account-grid">
      <section className="v2-panel v2-activity"><header><div><span>ACTIVITY TIMELINE</span><h3>ประวัติการติดต่อ</h3></div><button onClick={() => toast("เปิดแบบบันทึกด้วยเสียงแล้ว")}>🎙 บันทึกด้วยเสียง</button></header>{[["31 ก.ค.", account.next, account.owner], ["28 ก.ค.", "ส่งข้อมูลผลิตภัณฑ์และหลักฐาน", "ระบบ"], ["25 ก.ค.", "สนทนาหลังจบกิจกรรม", account.owner]].map((item) => <article key={item.join("")}><time>{item[0]}</time><span><b>{item[1]}</b><small>บันทึกโดย {item[2]}</small></span></article>)}</section>
      <section className="v2-panel v2-next-card"><header><div><span>QUICK NOTE</span><h3>เพิ่มบันทึก</h3></div></header><textarea placeholder="สรุปสิ่งที่คุย ความกังวล และขั้นตอนถัดไป" /><button onClick={() => toast("บันทึกกิจกรรมและกำหนดงานถัดไปแล้ว")}>บันทึกพร้อมกำหนดงานถัดไป</button></section>
    </div>}
    {tab === "comments" && <div className="v2-account-grid">
      <section className="v2-panel v2-comments"><header><div><span>TEAM COMMENTS</span><h3>ความคิดเห็นต่อ Lead รายนี้</h3></div><em>{comments.length} รายการ</em></header>{comments.map((item, index) => <article key={`${item.date}-${index}`}><i>{item.author.slice(0, 1)}</i><span><b>{item.author}</b><p>{item.text}</p><small>{item.date}</small></span></article>)}</section>
      <section className="v2-panel v2-comment-compose"><header><div><span>ADD COMMENT</span><h3>เพิ่มความคิดเห็น</h3></div></header><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="ระบุข้อสังเกต ความเสี่ยง หรือข้อเสนอแนะ" /><button onClick={addComment}>ส่งความคิดเห็น</button><p>ความคิดเห็นนี้เป็นข้อมูลภายใน ลูกค้าจะไม่เห็น</p></section>
    </div>}
  </div>;
}

type ImportedEvent = { id: string; period_key: string; name: string; activity_type: string; target_leads: number; actual_leads: number; demos: number; quotations: number; potential_sales: number; closed_sales: number; follow_up: string; status: string; source_sheet: string; source_row: number };
type TrainingActivity = { id: string; activity_date: string; project_name: string; target_segment: string; location: string; topic: string; student_count: number; duration_label: string; trainers: string; trainer_note: string; source_sheet: string; source_row: number };
type AfterSalesActivity = { id: string; client_name: string; activity_date: string; activity: string; status: string; source_sheet: string; source_row: number };
type SourceImport = { file_name: string; source_modified_at: string; imported_at: string; status: string };

function OperationsView() {
  const [training, setTraining] = useState<TrainingActivity[]>([]);
  const [afterSales, setAfterSales] = useState<AfterSalesActivity[]>([]);
  const [source, setSource] = useState<SourceImport | null>(null);
  const [tab, setTab] = useState<"training" | "service">("training");
  useEffect(() => {
    fetch("/api/workspace").then((response) => response.json()).then((payload) => {
      setTraining(Array.isArray(payload.training) ? payload.training : []);
      setAfterSales(Array.isArray(payload.afterSales) ? payload.afterSales : []);
      setSource(payload.sourceImport || null);
    });
  }, []);
  const activeService = afterSales.filter((item) => item.status.toLowerCase() !== "done").length;
  const students = training.reduce((total, item) => total + Number(item.student_count || 0), 0);
  const thaiDate = (value: string) => value ? new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "ยังไม่ระบุวัน";
  return <div className="v2-view v2-operations-view">
    <section className="v2-kicker-row"><div><span>TRAINING & AFTER SALES</span><h2>ฝึกอบรมและบริการหลังการขาย</h2><p>กิจกรรมจริงจากรายงาน KPI ของทีมประเทศไทย</p></div><em className="v2-import-badge">นำเข้าแล้ว · {source?.file_name || "กำลังโหลด"}</em></section>
    <div className="v2-operations-summary"><article><strong>{training.length}</strong><span>กิจกรรมฝึกอบรมและสาธิต</span></article><article><strong>{students}</strong><span>ผู้เข้าร่วมที่บันทึกไว้</span></article><article><strong>{afterSales.length}</strong><span>งานหลังการขาย</span></article><article className={activeService ? "alert" : ""}><strong>{activeService}</strong><span>งานที่ยังดำเนินการ</span></article></div>
    <nav className="v2-customer-tabs"><button className={tab === "training" ? "active" : ""} onClick={() => setTab("training")}>การฝึกอบรมและสาธิต</button><button className={tab === "service" ? "active" : ""} onClick={() => setTab("service")}>บริการหลังการขาย</button></nav>
    {tab === "training" && <section className="v2-imported-list"><header><div><span>TRAINING ACTIVITY</span><h3>ประวัติกิจกรรมรายโครงการ</h3></div><em>{training.length} รายการ</em></header><div className="head"><span>วันที่และโครงการ</span><span>หัวข้อ</span><span>ผู้เข้าร่วม</span><span>ผู้ฝึกอบรม</span><span>หลักฐานต้นทาง</span></div>{training.map((item) => <article key={item.id}><span><b>{item.project_name}</b><small>{thaiDate(item.activity_date)} · {item.location}</small></span><span><b>{item.topic}</b><small>{item.target_segment}{item.trainer_note ? ` · ${item.trainer_note}` : ""}</small></span><strong>{item.student_count || "—"}</strong><span>{item.trainers || "ยังไม่ระบุ"}</span><em>{item.source_sheet} · แถว {item.source_row}</em></article>)}</section>}
    {tab === "service" && <section className="v2-imported-list v2-service-list"><header><div><span>AFTER SALES ACTIVITY</span><h3>คำขอและงานบริการลูกค้า</h3></div><em>{afterSales.length} รายการ</em></header><div className="head"><span>ลูกค้า</span><span>กิจกรรม</span><span>วันที่</span><span>สถานะ</span><span>หลักฐานต้นทาง</span></div>{afterSales.map((item) => <article key={item.id}><span><b>{item.client_name}</b></span><span>{item.activity}</span><span>{thaiDate(item.activity_date)}</span><strong className={item.status.toLowerCase() === "done" ? "done" : "active"}>{item.status === "Done" ? "เสร็จแล้ว" : "กำลังดำเนินการ"}</strong><em>{item.source_sheet} · แถว {item.source_row}</em></article>)}</section>}
    <footer className="v2-data-quality-note"><b>หมายเหตุคุณภาพข้อมูล</b><span>ช่องว่างยังคงเป็น “ไม่ระบุ” และไม่ถูกนับเป็นศูนย์ · รายการวันที่ 25 ธ.ค. 2568 ถูกเก็บตามวันที่จริงแม้อยู่ในแผ่นงานปี 2569</span></footer>
  </div>;
}

function CampaignView({ leads, toast, openAccount }: { leads: LeadRecord[]; toast: (text: string) => void; openAccount: (account: LeadRecord) => void }) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [importedEvents, setImportedEvents] = useState<ImportedEvent[]>([]);
  const [source, setSource] = useState<SourceImport | null>(null);
  useEffect(() => {
    fetch("/api/workspace").then((response) => response.json()).then((payload) => {
      setImportedEvents(Array.isArray(payload.events) ? payload.events : []);
      setSource(payload.sourceImport || null);
    });
  }, []);
  const campaigns = [
    { id: "EVT-2605-01", type: "EVENT", name: "Phuket Demo Roadshow", date: "25–30 พ.ค. 2569", owner: "ผู้รับผิดชอบ", leads: 10, qualified: 3, customers: 0, result: "Citycare Clinic สนใจสาธิต", status: "ติดตามผล", lead: leads.find((item) => item.name === "Citycare Clinic") || emptyLead },
    { id: "EVT-WEBINAR", type: "EVENT", name: "Beauty Innovation Trend Webinar", date: "ข้อมูลจากแผ่นงาน Webinar", owner: "ผู้รับผิดชอบ", leads: 27, qualified: 0, customers: 0, result: "ต้องคัดกรองผู้ลงทะเบียน", status: "รอคัดกรอง", lead: leads.find((item) => item.name === "Modiolistics Clinic") || emptyLead },
    { id: "CMP-2608-01", type: "CAMPAIGN", name: "CME Evidence Outreach", date: "ส.ค.–ก.ย. 2569", owner: "ผู้รับผิดชอบ", leads: 1, qualified: 1, customers: 0, result: "รอกำหนดเป้าหมายหลังอนุมัติ", status: "กำลังดำเนินการ", lead: leads.find((item) => item.name === "Modiolistics Clinic") || emptyLead },
    { id: "PRO-2608-01", type: "PROMOTION", name: "Model A Event Offer", date: "สิ้นสุด 31 ส.ค. 2569", owner: "ผู้รับผิดชอบ", leads: 1, qualified: 1, customers: 0, result: "ราคา 2.15 ล้านบาท · 10 งวด", status: "รออนุมัติ", lead: leads.find((item) => item.name === "Dr. J Clinic") || emptyLead },
  ];
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>EVENT · PROMOTION · CAMPAIGN</span><h2>กิจกรรมที่ต้องสร้างผลลัพธ์</h2><p>ทุกกิจกรรมต้องมีเป้าหมาย ผู้ดูแล Lead และการติดตามผล</p></div><button onClick={() => toast("เปิดแบบสร้างกิจกรรมแล้ว")}>＋ สร้างกิจกรรม</button></section>
    <section className="v2-imported-events"><header><div><span>ข้อมูลจริงที่นำเข้า</span><h3>กิจกรรมจาก KPI Evaluation</h3></div><em>{source ? `${importedEvents.length} รายการ · ${source.status}` : "กำลังโหลด"}</em></header><div className="head"><span>กิจกรรม</span><span>ช่วงเวลา</span><span>เป้า Lead</span><span>Lead จริง</span><span>ใบเสนอราคา</span><span>โอกาสขาย</span><span>ปิดการขาย</span></div>{importedEvents.map((item) => <article key={item.id}><span><b>{item.name}</b><small>{item.activity_type} · {item.status}</small></span><span>{item.period_key}</span><strong>{item.target_leads || "—"}</strong><strong>{item.actual_leads || "—"}</strong><strong>{item.quotations || "—"}</strong><strong>{item.potential_sales || "—"}</strong><strong>{item.closed_sales || "—"}</strong></article>)}</section>
    <div className="v2-campaign-summary">{[["4", "แหล่ง Lead ที่กำลังติดตาม"], ["39", "Lead ที่ตรวจพบในต้นแบบ"], ["5", "ผ่านเกณฑ์เบื้องต้น"], ["3", "ผู้รับผิดชอบจากตารางเดิม"]].map((item) => <article key={item[1]}><strong>{item[0]}</strong><span>{item[1]}</span></article>)}</div>
    <section className="v2-source-table"><header><div><span>LEAD SOURCE PERFORMANCE</span><h3>ย้อนจาก Lead ถึงต้นทางและต้นทุน</h3></div><em>ค่าใช้จ่ายที่ยังไม่มีจะไม่คำนวณ</em></header><div className="head"><span>ต้นทาง</span><span>Lead</span><span>ผ่านเกณฑ์</span><span>ลูกค้า</span><span>ค่าใช้จ่าย</span><span>ต้นทุน/Lead</span><span>ต้นทุน/ลูกค้า</span></div>{campaigns.map((item) => { const cost = budgets[item.id] || 0; return <article key={item.id}><span><i>{item.id}</i><b>{item.name}</b><small>{item.type} · {item.owner}</small></span><strong>{item.leads}</strong><strong>{item.qualified}</strong><strong>{item.customers}</strong><label>฿<input aria-label={`ค่าใช้จ่าย ${item.name}`} type="number" min="0" placeholder="กรอก" value={budgets[item.id] || ""} onChange={(event) => setBudgets({ ...budgets, [item.id]: Number(event.target.value) })} /></label><em>{cost ? `฿${Math.round(cost / item.leads).toLocaleString("th-TH")}` : "รอข้อมูล"}</em><em>{cost && item.customers ? `฿${Math.round(cost / item.customers).toLocaleString("th-TH")}` : item.customers ? "฿0" : "ยังไม่มีลูกค้า"}</em></article>; })}</section>
    <section className="v2-campaign-list">{campaigns.map((item, index) => <article key={item.name}><i>0{index + 1}</i><div><span>{item.id} · {item.type} · {item.status}</span><h3>{item.name}</h3><p>{item.date} · ผู้ดูแล {item.owner}</p></div><dl><div><dt>จำนวน Lead</dt><dd>{item.leads} ราย</dd></div><div><dt>ผลล่าสุด</dt><dd>{item.result}</dd></div></dl><button onClick={() => openAccount(item.lead)}>ดู Lead ที่เกี่ยวข้อง →</button></article>)}</section>
    <section className="v2-owner-target"><header><div><span>SALES OWNERSHIP</span><h3>ผู้ดูแลตามตาราง Lead เดิม</h3></div><em>แหล่งข้อมูล: Lead Update.xlsx</em></header>{[["ผู้รับผิดชอบ", "พบชื่อในตารางรวม", "รอยืนยันเป้ารายบุคคล"], ["ผู้รับผิดชอบ", "มีแผ่นงานรายบุคคล", "รอยืนยันเป้ารายบุคคล"], ["ผู้รับผิดชอบ", "มีแผ่นงานรายบุคคลและ Roadshow", "รอยืนยันเป้ารายบุคคล"]].map((item) => <article key={item[0]}><i>{item[0].slice(0, 1)}</i><span><b>{item[0]}</b><small>{item[1]}</small></span><strong>{item[2]}</strong><button onClick={() => toast(`กรองรายการของ ${item[0]} แล้ว`)}>เปิดรายการ</button></article>)}</section>
  </div>;
}

function ApprovalView({ toast }: { toast: (text: string) => void }) {
  type ReviewId = "linna" | "drj" | "memo";
  type ApprovalRecord = { id: string; document_id: ReviewId; document_version: string; actor_display_name: string; actor_email: string; actor_role: string; decision: string; created_at: string };
  const reviewDocs: Record<ReviewId, { account: string; title: string; version: string; model: string; file: string; status: string; summary: string[]; issue: string }> = {
    linna: { account: "LINNA Clinic", title: "สัญญาแบ่งรายได้ระยะยาว", version: "ฉบับที่ 3.2", model: "D2 · 40/60 · ไม่มีรายได้ขั้นต่ำ", file: "/documents/linna-contract.pdf", status: "รอพิจารณา", summary: ["LINNA ร้อยละ 60 และ IPQ ร้อยละ 40", "ส่วนแบ่ง IPQ เป็นยอดรวมภาษีมูลค่าเพิ่มแล้ว", "ไม่มีรายได้ขั้นต่ำ และทบทวนเมื่อครบ 90 วัน", "หักค่าโฆษณาที่เข้าเกณฑ์ได้ไม่เกิน 50,000 บาทต่อเดือน โดยต้องมีหลักฐาน"], issue: "ยืนยันวิธีตรวจหลักฐานค่าโฆษณา การยกเว้นเงินประกัน และข้อมูลนิติบุคคลก่อนส่งลงนาม" },
    drj: { account: "Dr.J Clinic", title: "สัญญาเช่าเพื่อซื้อ", version: "ฉบับที่ 1.4", model: "B · 24 เดือน", file: "/documents/drj-contract.pdf", status: "ข้อมูลไม่ครบ", summary: ["เช่าเพื่อซื้อ 24 เดือน", "มีเงินประกันและเงื่อนไขโอนกรรมสิทธิ์", "คู่สัญญาเป็นบุคคล", "ต้องตรวจข้อมูลสถานที่และความพร้อมด้านการเงิน"], issue: "ยังไม่ควรส่งลงนามจนกว่าจะได้ข้อมูลยืนยันตัวตน สิทธิใช้สถานที่ และเอกสารประกอบครบ" },
    memo: { account: "เอกสารภายใน BIB", title: "บันทึกนโยบายค่าตอบแทนการขาย", version: "ฉบับที่ 2.0", model: "รูปแบบ A–D2", file: "/documents/commission-memo.pdf", status: "รอผู้บริหาร", summary: ["รูปแบบ A คงอัตราขั้นบันไดเดิมร้อยละ 2–10 ตามราคาก่อนภาษี", "รูปแบบ B–D2 มีวงเงินค่าตอบแทนรวมไม่เกินร้อยละ 5", "ค่าเริ่มต้นคือ ฝ่ายขายร้อยละ 3 ผู้แนะนำร้อยละ 1 ผู้ฝึกอบรมร้อยละ 1", "จ่ายเฉพาะยอดที่บริษัทได้รับเงินจริงและผ่านเงื่อนไขของรูปแบบธุรกิจ"], issue: "ยืนยันวันที่มีผล ผู้อนุมัตินโยบาย และให้ฝ่ายบัญชีรับทราบก่อนประกาศใช้" },
  };
  const [reviewId, setReviewId] = useState<ReviewId>("linna");
  const [reviewMode, setReviewMode] = useState<"summary" | "full">("summary");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewComments, setReviewComments] = useState<Array<{ document_id: string; author_label: string; body: string; visibility: string }>>([]);
  const [reviewApprovals, setReviewApprovals] = useState<ApprovalRecord[]>([]);
  const [reviewActor, setReviewActor] = useState({ displayName: "ผู้ตรวจทาน", role: "" });
  const [reviewDecision, setReviewDecision] = useState<Record<ReviewId, string>>({ linna: "Pending", drj: "Blocked", memo: "Pending" });
  const current = reviewDocs[reviewId];
  useEffect(() => {
    fetch("/api/reviews").then((response) => response.json()).then((payload) => {
      if (Array.isArray(payload.comments)) setReviewComments(payload.comments);
      if (Array.isArray(payload.approvals)) setReviewApprovals(payload.approvals);
      if (payload.actor) setReviewActor({ displayName: String(payload.actor.displayName || payload.actor.email), role: String(payload.actor.role || "") });
      if (Array.isArray(payload.documents)) {
        const next = { linna: "Pending", drj: "Blocked", memo: "Pending" };
        payload.documents.forEach((document: { id: ReviewId; decision: string }) => { if (document.id in next) next[document.id] = document.decision; });
        setReviewDecision(next);
      }
    }).catch(() => undefined);
  }, []);
  const saveReviewComment = async () => {
    if (!reviewComment.trim()) return;
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "comment", documentId: reviewId, body: reviewComment, visibility: "Internal" }) });
    if (response.ok) { setReviewComments([...reviewComments, { document_id: reviewId, author_label: `${reviewActor.displayName} · ผู้อนุมัติ`, body: reviewComment, visibility: "Internal" }]); setReviewComment(""); toast("บันทึกความเห็นแล้ว"); }
  };
  const decideReview = async (decision: string) => {
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "decision", documentId: reviewId, decision, version: current.version }) });
    if (response.ok) {
      const result = await response.json() as { approvalId: string; actorDisplayName: string; actorRole: string; createdAt: string };
      setReviewDecision({ ...reviewDecision, [reviewId]: decision });
      setReviewApprovals([{ id: result.approvalId, document_id: reviewId, document_version: current.version.replace("ฉบับที่ ", "v"), actor_display_name: result.actorDisplayName, actor_email: "", actor_role: result.actorRole, decision, created_at: result.createdAt }, ...reviewApprovals]);
      toast(decision === "Approved" ? `บันทึกชื่อผู้อนุมัติ ${result.actorDisplayName} แล้ว` : "ส่งกลับเพื่อแก้ไขแล้ว");
    }
    else toast("รายการนี้ยังไม่ผ่านเงื่อนไขการอนุมัติ");
  };
  const visibleComments = reviewComments.filter((comment) => comment.document_id === reviewId);
  const latestApproval = reviewApprovals.find((approval) => approval.document_id === reviewId && approval.decision === reviewDecision[reviewId]);
  const approvalTime = latestApproval?.created_at ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date(latestApproval.created_at.replace(" ", "T") + (latestApproval.created_at.includes("Z") ? "" : "Z"))) : "";
  return <div className="v2-view v2-integrated-review">
    <section className="v2-kicker-row"><div><span>COMMERCIAL & DOCUMENT CONTROL</span><h2>ตรวจทานและอนุมัติเอกสาร</h2><p>รายการเอกสาร สาระสำคัญ และคำตัดสินอยู่ในหน้าเดียว</p></div><a href="/term-templates">สร้างเอกสารจากแม่แบบ</a></section>
    <section className="v2-review-workbench">
      <aside className="v2-review-queue"><header><span>เอกสารที่ต้องตรวจ</span><strong>3 ฉบับ</strong></header>{(Object.keys(reviewDocs) as ReviewId[]).map((id) => { const document = reviewDocs[id]; return <button key={id} className={reviewId === id ? "active" : ""} onClick={() => { setReviewId(id); setReviewMode("summary"); }}><i>{id === "linna" ? "LI" : id === "drj" ? "DJ" : "ME"}</i><span><small>{document.account}</small><b>{document.title}</b><em>{document.version} · {reviewDecision[id] === "Pending" ? document.status : reviewDecision[id]}</em></span></button>; })}<a href="/">เปิดหน้าตรวจทานเดิม</a></aside>
      <article className="v2-review-document"><header><div><span>{current.account} · {current.version}</span><h3>{current.title}</h3><p>{current.model}</p></div><nav><button className={reviewMode === "summary" ? "active" : ""} onClick={() => setReviewMode("summary")}>สรุป</button><button className={reviewMode === "full" ? "active" : ""} onClick={() => setReviewMode("full")}>อ่านฉบับเต็ม</button></nav></header>
        {reviewMode === "summary" ? <div className="v2-review-summary"><span>สาระสำคัญ</span><ul>{current.summary.map((line) => <li key={line}>{line}</li>)}</ul><section><b>ประเด็นที่ต้องตัดสินใจ</b><p>{current.issue}</p></section><footer><small>สถานะเอกสาร</small><strong>{reviewDecision[reviewId] === "Pending" ? current.status : reviewDecision[reviewId]}</strong></footer></div> : <iframe title={`${current.title} ${current.version}`} src={`${current.file}#view=FitH&toolbar=1`} />}
      </article>
      <aside className="v2-review-decision"><header><span>ความเห็นและคำตัดสิน</span><strong>{visibleComments.length}</strong></header><div className="v2-review-current"><small>ผลการพิจารณาปัจจุบัน</small><b>{reviewDecision[reviewId]}</b><em>{reviewId.toUpperCase()} · {current.version}</em></div>{latestApproval && <div className="v2-approval-record"><small>{latestApproval.decision === "Approved" ? "อนุมัติโดย" : "บันทึกคำตัดสินโดย"}</small><b>{latestApproval.actor_display_name || latestApproval.actor_email}</b><span>{approvalTime} · {latestApproval.document_version}</span></div>}<div className="v2-review-comments">{visibleComments.length ? visibleComments.map((comment, index) => <article key={`${comment.author_label}-${index}`}><b>{comment.author_label}</b><p>{comment.body}</p><small>{comment.visibility === "Internal" ? "ภายในเท่านั้น" : "ลูกค้าเห็นได้"}</small></article>) : <p>ยังไม่มีความเห็นในเอกสารนี้</p>}</div><div className="v2-review-compose"><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="พิมพ์ความเห็นหรือสิ่งที่ต้องแก้ไข" /><button onClick={saveReviewComment}>บันทึกความเห็น</button></div><div className="v2-approval-scope"><b>การอนุมัติภายใน</b><span>ระบบบันทึกผู้อนุมัติ เวลา ฉบับเอกสาร และรหัสตรวจสอบ ไม่ใช่การลงนามอิเล็กทรอนิกส์</span></div><footer><button onClick={() => decideReview("Changes requested")}>ส่งกลับเพื่อแก้ไข</button><button className="approve" disabled={reviewId === "drj"} onClick={() => decideReview("Approved")}>{reviewId === "drj" ? "รอข้อมูลให้ครบ" : "อนุมัติภายใน"}</button></footer></aside>
    </section>
  </div>;
}

type ConfigKind = "field" | "document" | "task" | "workflow";
type ConfigRow = Record<string, string | number>;

function ConfigurationView({ toast }: { toast: (text: string) => void }) {
  const [kind, setKind] = useState<ConfigKind>("field");
  const [data, setData] = useState<{ modules: ConfigRow[]; fields: ConfigRow[]; documents: ConfigRow[]; tasks: ConfigRow[]; workflows: ConfigRow[] }>({ modules: [], fields: [], documents: [], tasks: [], workflows: [] });
  const [moduleKey, setModuleKey] = useState("crm");
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);
  const [templateCode, setTemplateCode] = useState("");
  const [approvalWorkflow, setApprovalWorkflow] = useState("ตรวจทาน → อนุมัติภายใน");
  const [ownerRole, setOwnerRole] = useState("Sales");
  const [dueOffsetDays, setDueOffsetDays] = useState(1);
  const [triggerEvent, setTriggerEvent] = useState("Manual");
  const [steps, setSteps] = useState("ร่าง, ตรวจทาน, ส่งกลับแก้ไข, อนุมัติภายใน, ลงนาม, ใช้งาน");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await fetch("/api/configuration", { cache: "no-store" });
    if (!response.ok) return;
    const payload = await response.json();
    setData({ modules: payload.modules || [], fields: payload.fields || [], documents: payload.documents || [], tasks: payload.tasks || [], workflows: payload.workflows || [] });
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!label.trim()) { toast("กรุณาระบุชื่อรายการ"); return; }
    setSaving(true);
    const payload: Record<string, unknown> = { kind, moduleKey, name: label.trim() };
    if (kind === "field") Object.assign(payload, { label: label.trim(), fieldType, required });
    if (kind === "document") Object.assign(payload, { templateCode: templateCode.trim() || `DOC-${Date.now()}`, approvalWorkflow });
    if (kind === "task") Object.assign(payload, { ownerRole, dueOffsetDays, triggerEvent });
    if (kind === "workflow") Object.assign(payload, { workflowCode: templateCode.trim() || `WF-${Date.now()}`, steps: steps.split(",").map((item) => item.trim()).filter(Boolean) });
    const response = await fetch("/api/configuration", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (!response.ok) { const error = await response.json(); toast(error.error || "บันทึกไม่สำเร็จ"); return; }
    setLabel(""); setTemplateCode(""); await load(); toast("เพิ่มแม่แบบและบันทึกในระบบแล้ว");
  };

  const rows = kind === "field" ? data.fields : kind === "document" ? data.documents : kind === "task" ? data.tasks : data.workflows;
  const kindLabel = { field: "ช่องข้อมูล", document: "แม่แบบเอกสาร", task: "แม่แบบงาน", workflow: "ขั้นอนุมัติ" }[kind];
  return <div className="v2-view v2-configuration">
    <section className="v2-kicker-row"><div><span>BIB WORKSPACE CONFIGURATION</span><h2>ตั้งค่าพื้นที่ BIB</h2><p>ส่วนนี้ปรับข้อมูลของบริษัท BIB ไม่ใช่ศูนย์สร้างบริษัทใหม่</p></div><a href="/saas-admin">ดูโครงสร้าง SaaS</a></section>
    <section className="v2-template-map">
      {[['โมดูล', data.modules.length, 'กำหนดขอบเขตงาน'], ['ช่องข้อมูล', data.fields.length, 'กำหนดสิ่งที่ต้องกรอก'], ['เอกสาร', data.documents.length, 'กำหนดฉบับและการอนุมัติ'], ['งาน', data.tasks.length, 'กำหนดผู้รับผิดชอบและกำหนดเวลา'], ['ขั้นอนุมัติ', data.workflows.length, 'กำหนดลำดับและสิทธิ์']].map((item, index) => <article key={String(item[0])}><i>0{index + 1}</i><strong>{item[1]}</strong><b>{item[0]}</b><small>{item[2]}</small></article>)}
    </section>
    <section className="v2-config-workbench">
      <aside><span>เลือกสิ่งที่จะเพิ่ม</span>{([['field', 'ช่องข้อมูล'], ['document', 'แม่แบบเอกสาร'], ['task', 'แม่แบบงาน'], ['workflow', 'ขั้นอนุมัติ']] as Array<[ConfigKind, string]>).map(([id, text]) => <button key={id} className={kind === id ? 'active' : ''} onClick={() => setKind(id)}>{text}<em>→</em></button>)}</aside>
      <article className="v2-config-form"><header><span>เพิ่ม{kindLabel}</span><h3>สร้างครั้งเดียว ใช้ได้หลายรายการ</h3></header><div className="v2-config-grid"><label>โมดูล<select value={moduleKey} onChange={(event) => setModuleKey(event.target.value)}>{data.modules.map((module) => <option key={String(module.module_key)} value={String(module.module_key)}>{String(module.name)}</option>)}</select></label><label>ชื่อ{kindLabel}<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={`เช่น ${kind === 'field' ? 'วันที่ติดตามครั้งถัดไป' : kind === 'task' ? 'ติดตามหลังสาธิตเครื่อง' : 'สัญญารูปแบบใหม่'}`} /></label>
        {kind === 'field' && <><label>ชนิดข้อมูล<select value={fieldType} onChange={(event) => setFieldType(event.target.value)}><option value="text">ข้อความ</option><option value="number">ตัวเลข</option><option value="date">วันที่</option><option value="select">ตัวเลือก</option><option value="user">ผู้ใช้งาน</option><option value="file">ไฟล์เอกสาร</option></select></label><label className="check"><input type="checkbox" checked={required} onChange={(event) => setRequired(event.target.checked)} /> ต้องกรอก</label></>}
        {(kind === 'document' || kind === 'workflow') && <label>รหัสแม่แบบ<input value={templateCode} onChange={(event) => setTemplateCode(event.target.value)} placeholder="ระบบสร้างให้อัตโนมัติได้" /></label>}
        {kind === 'document' && <label>ขั้นอนุมัติ<input value={approvalWorkflow} onChange={(event) => setApprovalWorkflow(event.target.value)} /></label>}
        {kind === 'task' && <><label>ผู้รับผิดชอบเริ่มต้น<select value={ownerRole} onChange={(event) => setOwnerRole(event.target.value)}><option value="Sales">ฝ่ายขาย</option><option value="Finance">ฝ่ายการเงิน</option><option value="Trainer">ผู้ฝึกอบรม</option><option value="After Sales">บริการหลังการขาย</option><option value="Marketing">ฝ่ายการตลาด</option></select></label><label>ครบกำหนดหลังเหตุการณ์<input type="number" min="0" value={dueOffsetDays} onChange={(event) => setDueOffsetDays(Number(event.target.value))} /></label><label>เหตุการณ์เริ่มงาน<input value={triggerEvent} onChange={(event) => setTriggerEvent(event.target.value)} /></label></>}
        {kind === 'workflow' && <label className="wide">ลำดับขั้น คั่นด้วยเครื่องหมายจุลภาค<textarea value={steps} onChange={(event) => setSteps(event.target.value)} /></label>}
      </div><footer><span>รายการใหม่จะใช้กับข้อมูลที่สร้างหลังจากนี้ โดยไม่แก้ข้อมูลเดิมย้อนหลัง</span><button disabled={saving} onClick={save}>{saving ? 'กำลังบันทึก' : `＋ เพิ่ม${kindLabel}`}</button></footer></article>
      <aside className="v2-config-list"><header><span>{kindLabel}ที่ใช้งาน</span><strong>{rows.length}</strong></header>{rows.slice(0, 8).map((row) => <article key={String(row.id)}><b>{String(row.label || row.name)}</b><small>{String(row.module_key)} · {String(row.field_type || row.template_code || row.default_owner_role || row.workflow_code)}</small></article>)}</aside>
    </section>
    <section className="v2-reuse-note"><div><span>ทิศทางผลิตภัณฑ์</span><h3>System Blueprint สำหรับสร้างพื้นที่บริษัทใหม่ทั้งระบบ</h3><p>ต้องแยกข้อมูล ผู้ใช้ สิทธิ โมดูล และตราสินค้ารายบริษัทก่อนเปิดใช้งานจริง</p><a href="/saas-admin">เปิดศูนย์ควบคุม SaaS →</a></div><ol><li>สร้างบริษัทจาก Blueprint รุ่นที่อนุมัติ</li><li>เลือกแพ็กเกจและโมดูล</li><li>กำหนดผู้ดูแลและสิทธิ</li><li>ปรับแบรนด์ ฟอร์ม เอกสาร และ Workflow</li><li>ทดสอบการแยกข้อมูลก่อนเปิดใช้</li></ol></section>
  </div>;
}

function PerformanceView() {
  const [annualTarget, setAnnualTarget] = useState(0);
  const [sold, setSold] = useState(0);
  const [saved, setSaved] = useState(false);
  const [forecast, setForecast] = useState({ pipelineSatang: 0, weightedSatang: 0, openOpportunities: 0, updatedAt: "" });
  useEffect(() => {
    fetch("/api/workspace").then((response) => response.ok ? response.json() : Promise.reject()).then((payload) => {
      if (payload.target) {
        setAnnualTarget(Number(payload.target.target_value || 0));
        setSold(Number(payload.target.actual_value || 0));
      }
      if (payload.forecast) setForecast({
        pipelineSatang: Number(payload.forecast.pipeline_satang || 0),
        weightedSatang: Number(payload.forecast.weighted_satang || 0),
        openOpportunities: Number(payload.forecast.open_opportunities || 0),
        updatedAt: String(payload.forecast.updated_at || ""),
      });
    }).catch(() => undefined);
  }, []);
  const saveGoal = async () => {
    const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_target", targetValue: annualTarget, actualValue: sold }) });
    setSaved(response.ok);
  };
  const remaining = Math.max(annualTarget - sold, 0);
  const monthsLeft = 5;
  const targetRevenue = annualTarget * 2150000;
  const bookedRevenue = sold * 2150000;
  const demosNeeded = remaining * 5;
  const qualifiedNeeded = Math.ceil(demosNeeded / .4);
  const newLeadsNeeded = qualifiedNeeded * 2;
  const sunaiTarget = Math.ceil(remaining / 3);
  const oiTarget = Math.ceil((remaining - sunaiTarget) / 2);
  const topTarget = Math.max(remaining - sunaiTarget - oiTarget, 0);
  const money = (satang: number) => `฿${Math.round(satang / 100).toLocaleString("th-TH")}`;
  return <div className="v2-view">
    <section className="v2-kicker-row"><div><span>PERFORMANCE & QUALITY</span><h2>ผลการดำเนินงาน</h2><p>รวมยอดขาย รูปแบบธุรกิจ และงานบริการ</p></div><em>อัปเดตล่าสุด 31 ก.ค.</em></section>
    <section className="v2-goal-builder">
      <header><div><span>ACTIONABLE SALES TARGET</span><h3>จากเป้าหมายยอดขายสู่งานที่ต้องทำ</h3><p>ระบบคำนวณย้อนกลับจากจำนวนเครื่องที่ต้องขาย</p></div><div className="v2-goal-inputs"><label>เป้าทั้งปี<input type="number" min="1" value={annualTarget} onChange={(event) => setAnnualTarget(Math.max(1, Number(event.target.value) || 1))} /></label><label>ขายแล้ว<input type="number" min="0" max={annualTarget} value={sold} onChange={(event) => setSold(Math.min(annualTarget, Math.max(0, Number(event.target.value) || 0)))} /></label></div></header>
      <div className="v2-goal-summary"><article><span>ต้องขายเพิ่ม</span><strong>{remaining}</strong><small>เครื่อง ภายใน {monthsLeft} เดือน</small></article><article><span>รายได้ที่ต้องเพิ่ม</span><strong>฿{(targetRevenue - bookedRevenue).toLocaleString("th-TH")}</strong><small>จากเป้ารวม ฿{targetRevenue.toLocaleString("th-TH")}</small></article><article><span>เป้าต่อเดือน</span><strong>{Math.ceil(remaining / monthsLeft)}</strong><small>เครื่อง หรือ ฿{Math.ceil((targetRevenue - bookedRevenue) / monthsLeft).toLocaleString("th-TH")}</small></article></div>
      <div className="v2-funnel-target">
        {[["01", "ผู้สนใจใหม่", newLeadsNeeded, `${Math.ceil(newLeadsNeeded / monthsLeft)} ราย/เดือน`], ["02", "ผู้สนใจที่ผ่านเกณฑ์", qualifiedNeeded, `${Math.ceil(qualifiedNeeded / monthsLeft)} ราย/เดือน`], ["03", "นัดสาธิต", demosNeeded, `${Math.ceil(demosNeeded / monthsLeft)} ครั้ง/เดือน`], ["04", "ข้อเสนอที่มีโอกาส", remaining * 2, `${Math.ceil((remaining * 2) / monthsLeft)} ฉบับ/เดือน`], ["05", "ปิดการขาย", remaining, `${Math.ceil(remaining / monthsLeft)} เครื่อง/เดือน`]].map((item, index) => <article key={item[1]}><i>{item[0]}</i><span><b>{item[1]}</b><small>{item[3]}</small></span><strong>{item[2]}</strong>{index < 4 && <em>→</em>}</article>)}
      </div>
      <div className="v2-action-breakdown"><article><span>งานสัปดาห์นี้</span><b>สร้างผู้สนใจใหม่ {Math.ceil(newLeadsNeeded / 20)} ราย</b><small>จากกิจกรรม ออนไลน์ และการแนะนำ</small></article><article><span>งานสัปดาห์นี้</span><b>ยืนยันนัดสาธิต {Math.ceil(demosNeeded / 20)} ราย</b><small>ให้ผู้มีอำนาจเข้าร่วมอย่างน้อย 1 ราย</small></article><article><span>งานบริหาร</span><b>ทบทวน Pipeline ทุกวันจันทร์</b><small>ทุกดีลต้องมีผู้ดูแลและขั้นตอนถัดไป</small></article><article><span>จุดเตือน</span><b>Pipeline ปัจจุบันยังไม่พอ {Math.max(remaining * 2 - 5, 0)} ดีล</b><small>ต้องเติมดีลที่ผ่านเกณฑ์ก่อนเพิ่ม Forecast</small></article></div>
      <section className="v2-sales-targets"><header><div><span>SALES TARGET BY OWNER</span><h4>ข้อเสนอการแบ่งเป้าตามผู้ดูแล</h4></div><em>คำแนะนำเบื้องต้น · ไม่ใช่เป้าที่อนุมัติแล้ว</em></header>{[["ผู้รับผิดชอบ", sunaiTarget], ["ผู้รับผิดชอบ", oiTarget], ["ผู้รับผิดชอบ", topTarget]].map((item) => <article key={item[0]}><i>{String(item[0]).slice(0, 1)}</i><span><b>{item[0]}</b><small>ต้องมีนัดสาธิตประมาณ {Number(item[1]) * 5} ครั้ง</small></span><strong>{item[1]} เครื่อง</strong></article>)}</section>
      <footer><span>สมมติฐาน: ผู้สนใจใหม่ 50% ผ่านเกณฑ์ · 40% ได้นัดสาธิต · สาธิต 20% ปิดการขาย</span><button onClick={saveGoal}>{saved ? "✓ บันทึกแล้ว" : "บันทึกเป็นเป้าหมายทีม"}</button></footer>
    </section>
    <div className="v2-metrics">{[[money(forecast.weightedSatang), "มูลค่าถ่วงน้ำหนัก", `จาก Pipeline ${money(forecast.pipelineSatang)}`], [String(forecast.openOpportunities), "โอกาสขายที่เปิดอยู่", "คำนวณจาก CRM"], ["รอข้อมูล", "กำไรขั้นต้น", "ยังไม่มีต้นทุนที่ตรวจสอบแล้ว"], ["รอข้อมูล", "ประมาณการค่าตอบแทน", "ต้องเชื่อม Commission Rule"]].map((item, index) => <article key={item[1]}><i>0{index + 1}</i><strong>{item[0]}</strong><span>{item[1]}</span><small>{item[2]}</small></article>)}</div>
    <div className="v2-split"><section className="v2-panel v2-pnl"><header><div><span>FORECAST P&L</span><h3>สถานะข้อมูลประมาณการ</h3></div><em>คำนวณจาก CRM</em></header>{[["Pipeline ที่เปิดอยู่", money(forecast.pipelineSatang)], ["มูลค่าถ่วงน้ำหนัก", money(forecast.weightedSatang)], ["ยอดขายจริงตามเป้าหมาย", `฿${bookedRevenue.toLocaleString("th-TH")}`], ["ต้นทุนและการส่งมอบ", "รอข้อมูล"], ["ค่าตอบแทน", "รอเชื่อมกฎ"], ["กำไรประมาณการ", "ยังไม่คำนวณ"]].map((item, index) => <p className={index === 5 ? "total" : ""} key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong></p>)}<footer>ไม่แสดงกำไรจนกว่าจะมีต้นทุน ค่าตอบแทน และภาระบริการที่ตรวจสอบแล้ว</footer></section><section className="v2-panel v2-quality"><header><div><span>SYSTEM QUALITY</span><h3>สิ่งที่ต้องแก้ก่อนใช้จริง</h3></div><em>3 รายการ</em></header>{[["สูง", "Dr. J ยังไม่มีข้อมูลนิติบุคคล"], ["สูง", "LINNA ยังไม่มี Serial Number"], ["กลาง", "ต้นทุนและ Commission ยังไม่เชื่อม Forecast"]].map((item) => <article key={item[1]}><b>{item[0]}</b><span>{item[1]}</span><em>เปิดรายการ</em></article>)}</section></div>
  </div>;
}
