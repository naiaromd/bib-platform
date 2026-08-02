"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./workspace.module.css";

type View = "today" | "crm" | "demos" | "evidence" | "approval";

type Lead = {
  id: string;
  accountId: string;
  name: string;
  status: string;
  score: number;
  temperature: string;
  next: string;
  nextActionAt: string;
  owner: string;
  segment: string;
  model: string;
  contact: string;
  role: string;
  city: string;
  source: string;
  lastContactAt: string;
  evidence: string[];
  risk: string;
  stage: string;
  opportunityId: string;
  expectedValueSatang: number;
  probabilityBps: number;
};

type WorkspaceData = {
  user: { email: string; displayName: string; role: string };
  tasks: Array<Record<string, unknown>>;
  leads: Lead[];
  forecast: Record<string, unknown>;
  demos: Array<Record<string, unknown>>;
  activities: Array<Record<string, unknown>>;
};

type AccountDetail = {
  account: Record<string, unknown> | null;
  contacts: Array<Record<string, unknown>>;
  opportunities: Array<Record<string, unknown>>;
  timeline: Array<{ type: string; date: string; data: Record<string, unknown> }>;
};

type CrmContact = {
  id: string;
  displayName?: string;
  positionTitle?: string;
  buyingRole?: string;
  portalRole?: string;
  phone?: string;
  email?: string;
  lineId?: string;
  preferredChannel?: string;
  decisionLevel?: string;
  consentStatus?: string;
  notes?: string;
  active?: boolean | number;
};

const menu: Array<{ key: View; icon: string; label: string; hint: string }> = [
  { key: "today", icon: "01", label: "งานวันนี้", hint: "งาน นัดหมาย และสิ่งที่ต้องติดตาม" },
  { key: "crm", icon: "02", label: "CRM", hint: "ลูกค้า ผู้ติดต่อ และโอกาสขาย" },
  { key: "demos", icon: "03", label: "นัดสาธิต", hint: "คัดกรอง วางแผน และสรุปผล" },
  { key: "evidence", icon: "04", label: "หลักฐานผลลัพธ์", hint: "การบ้าน Therapist และคิวตรวจ" },
  { key: "approval", icon: "05", label: "อนุมัติเอกสาร", hint: "สัญญา บันทึก และความเห็น" },
];

const money = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

function bahtFromSatang(value: unknown) {
  return money.format(Number(value || 0) / 100);
}

function shortDate(value: unknown) {
  const text = String(value || "");
  if (!text) return "ยังไม่กำหนด";
  const date = new Date(text.length === 10 ? `${text}T00:00:00+07:00` : text);
  if (Number.isNaN(date.getTime())) return text;
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(date);
}

function temperatureLabel(value: string) {
  if (value === "Hot") return "พร้อมติดตาม";
  if (value === "Warm") return "กำลังพัฒนา";
  return "เริ่มต้น";
}

function mapCrmPayload(payload: Record<string, unknown>): WorkspaceData {
  const accounts = (payload.accounts || []) as Array<Record<string, unknown>>;
  const crmLeads = (payload.leads || []) as Array<Record<string, unknown>>;
  const opportunities = (payload.opportunities || []) as Array<Record<string, unknown>>;
  const actor = (payload.actor || {}) as Record<string, unknown>;
  const mappedLeads = crmLeads.map((lead) => {
    const account = accounts.find((item) => item.id === lead.accountId) || {};
    const opportunity = opportunities.find((item) => item.accountId === lead.accountId) || {};
    let evidence: string[] = [];
    try {
      const parsed = JSON.parse(String(lead.evidenceJson || "[]"));
      evidence = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch { evidence = []; }
    return {
      id: String(lead.id || ""), accountId: String(lead.accountId || ""),
      name: String(lead.accountName || lead.contactName || "ยังไม่ระบุชื่อ"),
      status: String(lead.status || "New"), score: Number(lead.score || 0),
      temperature: String(lead.temperature || "Cold"),
      next: String(opportunity.nextAction || lead.nextAction || "กำหนดขั้นตอนถัดไป"),
      nextActionAt: String(opportunity.nextActionAt || lead.nextActionAt || ""),
      owner: String(opportunity.ownerUserId || lead.ownerUserId || "ยังไม่มอบหมาย"),
      segment: String(account.businessSegment || "ยังไม่จัดกลุ่ม"),
      model: String(opportunity.commercialModel || account.commercialModel || "ยังไม่เสนอ"),
      contact: String(lead.contactName || "ยังไม่ระบุผู้ติดต่อ"),
      role: String(lead.buyingRole || "ยังไม่ระบุบทบาท"),
      city: String(account.province || "ยังไม่ระบุจังหวัด"),
      source: String(lead.sourceName || "ยังไม่ระบุแหล่งที่มา"),
      lastContactAt: String(lead.lastContactAt || ""), evidence,
      risk: String(opportunity.riskNote || "ยังไม่มีบันทึกความเสี่ยง"),
      stage: String(opportunity.stage || lead.status || "New"),
      opportunityId: String(opportunity.id || ""),
      expectedValueSatang: Number(opportunity.expectedValueSatang || 0),
      probabilityBps: Number(opportunity.probabilityBps || 0),
    } satisfies Lead;
  });
  const weightedSatang = opportunities.reduce((sum, item) =>
    sum + (Number(item.expectedValueSatang || 0) * Number(item.probabilityBps || 0) / 10_000), 0);
  return {
    user: { email: "", displayName: String(actor.displayName || "ผู้ใช้งาน"), role: String(actor.role || "—") },
    tasks: (payload.tasks || []) as Array<Record<string, unknown>>,
    leads: mappedLeads,
    forecast: { weighted_satang: weightedSatang },
    demos: (payload.demos || []) as Array<Record<string, unknown>>,
    activities: (payload.activities || []) as Array<Record<string, unknown>>,
  };
}

export default function WorkspaceClient({ initialPayload = null }: { initialPayload?: Record<string, unknown> | null }) {
  const initialData = initialPayload ? mapCrmPayload(initialPayload) : null;
  const [view, setView] = useState<View>("today");
  const [data, setData] = useState<WorkspaceData | null>(initialData);
  const [selectedLeadId, setSelectedLeadId] = useState(initialData?.leads[0]?.id || "");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!initialData);
  const [message, setMessage] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingContact, setEditingContact] = useState<CrmContact | null>(null);
  const [accountDetail, setAccountDetail] = useState<AccountDetail | null>(null);

  async function loadWorkspace(fresh = false) {
    setLoading(true);
    try {
      const response = await fetch("/api/crm/workspace?limit=100", { cache: fresh ? "no-store" : "default" });
      const raw = (await response.json()) as Record<string, unknown> & { error?: string };
      if (!response.ok) throw new Error(raw.error || "ไม่สามารถเปิดพื้นที่ทำงานได้");
      const payload = mapCrmPayload(raw);
      setData(payload);
      setSelectedLeadId((current) => current || payload.leads[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดพื้นที่ทำงานได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialPayload) return;
    let active = true;
    fetch("/api/crm/workspace?limit=100")
      .then(async (response) => {
        const raw = (await response.json()) as Record<string, unknown> & { error?: string };
        if (!response.ok) throw new Error(raw.error || "ไม่สามารถเปิดพื้นที่ทำงานได้");
        const payload = mapCrmPayload(raw);
        if (!active) return;
        setData(payload);
        setSelectedLeadId(payload.leads[0]?.id || "");
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดพื้นที่ทำงานได้");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [initialPayload]);

  const leads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!data || !normalized) return data?.leads || [];
    return data.leads.filter((lead) =>
      [lead.name, lead.contact, lead.owner, lead.segment, lead.city].join(" ").toLowerCase().includes(normalized),
    );
  }, [data, query]);

  const selectedLead = (data?.leads || []).find((lead) => lead.id === selectedLeadId) || leads[0];
  const openTasks = (data?.tasks || []).filter((task) => task.status !== "เสร็จแล้ว");
  const demos = data?.demos || [];
  const weightedPipeline = Number(data?.forecast?.weighted_satang || 0);

  useEffect(() => {
    if (view !== "crm" || !selectedLead?.accountId) { setAccountDetail(null); return; }
    let active = true;
    fetch(`/api/crm/accounts/${encodeURIComponent(selectedLead.accountId)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as AccountDetail & { error?: string };
        if (!response.ok) throw new Error(payload.error || "ไม่สามารถเปิดประวัติลูกค้าได้");
        if (active) setAccountDetail(payload);
      })
      .catch((error: unknown) => { if (active) setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดประวัติลูกค้าได้"); });
    return () => { active = false; };
  }, [selectedLead?.accountId, view]);

  async function reloadAccountDetail(accountId = selectedLead?.accountId || "") {
    if (!accountId) return;
    const response = await fetch(`/api/crm/accounts/${encodeURIComponent(accountId)}`, { cache: "no-store" });
    const payload = (await response.json()) as AccountDetail & { error?: string };
    if (!response.ok) throw new Error(payload.error || "ไม่สามารถเปิดประวัติลูกค้าได้");
    setAccountDetail(payload);
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/crm/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        dueDate: form.get("dueDate"),
        priority: form.get("priority"),
        accountId: selectedLead?.accountId || undefined,
        leadId: selectedLead?.id || undefined,
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "บันทึกงานไม่สำเร็จ");
      return;
    }
    setShowTaskForm(false);
    setMessage("เพิ่มงานแล้ว");
    await loadWorkspace(true);
  }

  async function recordActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLead) return;
    const form = new FormData(event.currentTarget);
    const activityResponse = await fetch("/api/crm/activities", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        accountId: selectedLead.accountId,
        leadId: selectedLead.id,
        opportunityId: selectedLead.opportunityId || undefined,
        activityType: form.get("activityType"),
        channel: form.get("channel"),
        summary: form.get("summary"),
        outcome: form.get("outcome"),
      }),
    });
    const activityResult = (await activityResponse.json()) as { error?: string };
    if (!activityResponse.ok) { setMessage(activityResult.error || "บันทึกการติดตามไม่สำเร็จ"); return; }

    if (selectedLead.opportunityId) {
      const opportunityResponse = await fetch(`/api/crm/opportunities/${encodeURIComponent(selectedLead.opportunityId)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          stage: form.get("stage"),
          nextAction: form.get("nextAction"),
          nextActionAt: form.get("nextActionAt") || undefined,
          riskNote: form.get("riskNote"),
        }),
      });
      const opportunityResult = (await opportunityResponse.json()) as { error?: string };
      if (!opportunityResponse.ok) { setMessage(opportunityResult.error || "อัปเดตโอกาสขายไม่สำเร็จ"); return; }
    }
    setShowActivityForm(false);
    setMessage("บันทึกการติดตามและขั้นตอนถัดไปแล้ว");
    await loadWorkspace(true);
  }

  async function updateContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingContact?.id) return;
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/crm/contacts/${encodeURIComponent(editingContact.id)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        positionTitle: form.get("positionTitle"),
        buyingRole: form.get("buyingRole"),
        decisionLevel: form.get("decisionLevel"),
        phone: form.get("phone"),
        email: form.get("email"),
        lineId: form.get("lineId"),
        preferredChannel: form.get("preferredChannel"),
        consentStatus: form.get("consentStatus"),
        notes: form.get("notes"),
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) { setMessage(result.error || "แก้ไขข้อมูลผู้ติดต่อไม่สำเร็จ"); return; }
    setEditingContact(null);
    setMessage("บันทึกข้อมูลผู้ติดต่อแล้ว");
    await reloadAccountDetail();
    await loadWorkspace(true);
  }

  return (
    <main className={styles.application}>
      <header className={styles.brandHeader}>
        <a href="/workspace" className={styles.headerBrand} aria-label="BIB icoone Practice Intelligence">
          <img src="/logos/bib-logo.png" alt="BIB" />
          <span />
          <img src="/logos/icoone-laser-med.png" alt="icoone laser med" />
        </a>
        <div className={styles.brandCopy}>
          <strong>PRACTICE INTELLIGENCE</strong>
          <span>Knowledge to decision · Decision to better practice</span>
        </div>
        <nav className={styles.audienceNav} aria-label="พื้นที่ใช้งาน">
          <a className={styles.activeAudience} href="/workspace">สำหรับทีม BIB</a>
          <a href="/explore">สำหรับผู้สนใจ</a>
          <a href="/client">สำหรับลูกค้า</a>
        </nav>
        <em>{data?.user.role || "INTERNAL"}</em>
      </header>

      <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.workspaceTitle}>
          <p>BIB WORKSPACE</p>
          <strong>พื้นที่ทำงาน</strong>
          <span>แสดงเฉพาะงานที่มีข้อมูลและสิทธิ์ใช้งาน</span>
        </div>
        <nav className={styles.nav} aria-label="เมนูพื้นที่ทำงาน">
          {menu.map((item) => (
            <button
              key={item.key}
              className={view === item.key ? styles.activeNav : ""}
              onClick={() => setView(item.key)}
            >
              <b>{item.icon}</b>
              <span><strong>{item.label}</strong><small>{item.hint}</small></span>
            </button>
          ))}
        </nav>
        <div className={styles.identity}>
          <span>{data?.user.displayName || "กำลังตรวจสอบผู้ใช้"}</span>
          <small>{data?.user.role || "—"}</small>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <span>ระบบปฏิบัติงาน BIB</span>
            <strong>{menu.find((item) => item.key === view)?.label}</strong>
          </div>
          <div className={styles.topActions}>
            <a href="/?document=linna">อนุมัติเอกสาร</a>
            <button onClick={() => setShowTaskForm(true)}>+ เพิ่มงาน</button>
          </div>
        </header>

        {message && <button className={styles.notice} onClick={() => setMessage("")}>{message} <span>ปิด</span></button>}
        {loading && <div className={styles.loading}>กำลังจัดเตรียมข้อมูลของคุณ…</div>}

        {!loading && data && view === "today" && (
          <div className={styles.page}>
            <section className={styles.hero}>
              <div>
                <span>งานที่ต้องจัดการก่อน</span>
                <h1>สวัสดี {data.user.displayName}</h1>
                <p>เริ่มจากงานที่ถึงกำหนด นัดสาธิต และโอกาสขายที่ต้องตัดสินใจ</p>
              </div>
              <button onClick={() => setView("crm")}>เปิดรายชื่อลูกค้า</button>
            </section>

            <section className={styles.metrics} aria-label="ภาพรวมวันนี้">
              <article><span>งานที่ยังไม่เสร็จ</span><strong>{openTasks.length}</strong><small>เรียงตามวันครบกำหนด</small></article>
              <article><span>โอกาสขายที่ต้องติดตาม</span><strong>{data.leads.filter((lead) => lead.temperature === "Hot").length}</strong><small>จากคะแนนและพฤติกรรม</small></article>
              <article><span>นัดสาธิต</span><strong>{demos.length}</strong><small>รวมคำขอที่ยังรอยืนยัน</small></article>
              <article><span>มูลค่าถ่วงน้ำหนัก</span><strong>{bahtFromSatang(weightedPipeline)}</strong><small>คำนวณจากโอกาสขายจริง</small></article>
            </section>

            <section className={styles.twoColumns}>
              <article className={styles.panel}>
                <header><div><span>สิ่งที่ต้องทำต่อ</span><h2>งานของทีม</h2></div><button onClick={() => setShowTaskForm(true)}>เพิ่มงาน</button></header>
                <div className={styles.taskList}>
                  {openTasks.slice(0, 6).map((task) => (
                    <div key={String(task.id)}>
                      <b className={String(task.priority) === "สูง" ? styles.high : ""}>{String(task.priority || "กลาง")}</b>
                      <span><strong>{String(task.title)}</strong><small>ครบกำหนด {shortDate(task.dueDate)} · {String(task.ownerUserId || "ยังไม่มอบหมาย")}</small></span>
                      <em>{String(task.status)}</em>
                    </div>
                  ))}
                  {!openTasks.length && <p className={styles.empty}>ไม่มีงานค้าง</p>}
                </div>
              </article>

              <article className={styles.panel}>
                <header><div><span>โอกาสสำคัญ</span><h2>ควรติดตามวันนี้</h2></div><button onClick={() => setView("crm")}>ดู CRM</button></header>
                <div className={styles.leadRows}>
                  {data.leads.slice(0, 5).map((lead) => (
                    <button key={lead.id} onClick={() => { setSelectedLeadId(lead.id); setView("crm"); }}>
                      <i>{lead.name.slice(0, 2).toUpperCase()}</i>
                      <span><strong>{lead.name}</strong><small>{lead.next}</small></span>
                      <em>{lead.score}</em>
                    </button>
                  ))}
                </div>
              </article>
            </section>
          </div>
        )}

        {!loading && data && view === "crm" && (
          <div className={styles.crmPage}>
            <section className={styles.crmList}>
              <header><span>ลูกค้าและผู้สนใจ</span><h1>CRM</h1><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาลูกค้า ผู้ติดต่อ หรือจังหวัด" /></header>
              <div>
                {leads.map((lead) => (
                  <button key={lead.id} className={selectedLead?.id === lead.id ? styles.selectedLead : ""} onClick={() => setSelectedLeadId(lead.id)}>
                    <i>{lead.name.slice(0, 2).toUpperCase()}</i>
                    <span><strong>{lead.name}</strong><small>{lead.contact} · {lead.owner}</small></span>
                    <em>{lead.score}</em>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.crmDetail}>
              {selectedLead ? (
                <>
                  <header className={styles.accountHeader}>
                    <div className={styles.avatar}>{selectedLead.name.slice(0, 2).toUpperCase()}</div>
                    <div><span>{selectedLead.segment} · {selectedLead.city}</span><h1>{selectedLead.name}</h1><p>{selectedLead.contact} · {selectedLead.role}</p></div>
                    <div className={styles.score}><span>คะแนนความพร้อม</span><strong>{selectedLead.score}</strong><small>{temperatureLabel(selectedLead.temperature)}</small></div>
                  </header>

                  <div className={styles.accountGrid}>
                    <article><span>ขั้นตอนปัจจุบัน</span><strong>{selectedLead.stage}</strong><small>{selectedLead.status}</small></article>
                    <article><span>รูปแบบที่กำลังพิจารณา</span><strong>{selectedLead.model}</strong><small>แก้ได้เมื่อผ่านการอนุมัติ</small></article>
                    <article><span>มูลค่าโอกาสขาย</span><strong>{bahtFromSatang(selectedLead.expectedValueSatang)}</strong><small>โอกาส {Math.round(selectedLead.probabilityBps / 100)}%</small></article>
                  </div>

                  <section className={styles.nextAction}>
                    <div><span>ขั้นตอนถัดไป</span><h2>{selectedLead.next}</h2><p>กำหนด {shortDate(selectedLead.nextActionAt)} · ผู้รับผิดชอบ {selectedLead.owner}</p></div>
                    <button onClick={() => setShowActivityForm(true)}>บันทึกการติดตาม</button>
                  </section>

                  <section className={`${styles.panel} ${styles.contactPanel}`}>
                    <header>
                      <div><span>ข้อมูลผู้ติดต่อ</span><h2>บุคคลที่เกี่ยวข้องกับการตัดสินใจ</h2></div>
                      <small>{accountDetail?.contacts?.length || 0} ราย</small>
                    </header>
                    <div className={styles.contactGrid}>
                      {(accountDetail?.contacts || []).map((rawContact) => {
                        const contact = rawContact as CrmContact;
                        return (
                          <article key={contact.id}>
                            <div className={styles.contactName}>
                              <i>{String(contact.displayName || "—").slice(0, 2).toUpperCase()}</i>
                              <span><strong>{contact.displayName || "ยังไม่ระบุชื่อ"}</strong><small>{contact.positionTitle || contact.buyingRole || "ยังไม่ระบุตำแหน่ง"}</small></span>
                              <em>{contact.active ? "ใช้งาน" : "ไม่ใช้งาน"}</em>
                            </div>
                            <dl>
                              <div><dt>บทบาท</dt><dd>{contact.buyingRole || "ยังไม่ระบุ"}</dd></div>
                              <div><dt>การตัดสินใจ</dt><dd>{contact.decisionLevel || "ยังไม่ยืนยัน"}</dd></div>
                              <div><dt>โทรศัพท์</dt><dd>{contact.phone || "ยังไม่ระบุ"}</dd></div>
                              <div><dt>อีเมล</dt><dd>{contact.email || "ยังไม่ระบุ"}</dd></div>
                              <div><dt>LINE</dt><dd>{contact.lineId || "ยังไม่ระบุ"}</dd></div>
                              <div><dt>ช่องทางหลัก</dt><dd>{contact.preferredChannel || "ยังไม่ระบุ"}</dd></div>
                            </dl>
                            {contact.notes && <p>{contact.notes}</p>}
                            <button onClick={() => setEditingContact(contact)}>แก้ไขข้อมูลผู้ติดต่อ</button>
                          </article>
                        );
                      })}
                      {!accountDetail?.contacts?.length && <p className={styles.empty}>ยังไม่มีข้อมูลผู้ติดต่อ</p>}
                    </div>
                  </section>

                  <section className={styles.detailColumns}>
                    <article className={styles.panel}>
                      <header><div><span>ประวัติลูกค้า</span><h2>กิจกรรมล่าสุด</h2></div></header>
                      <div className={styles.timeline}>
                        {(accountDetail?.timeline || []).slice(0, 6).map((item, index) => (
                          <div key={`${item.type}-${item.date}-${index}`}>
                            <b>{item.type === "activity" ? "ติดตาม" : item.type === "demo" ? "สาธิต" : "งาน"}</b>
                            <span><strong>{String(item.data.summary || item.data.title || item.data.status || "อัปเดตข้อมูล")}</strong><small>{shortDate(item.date)} · {String(item.data.channel || item.data.ownerUserId || "ระบบ")}</small></span>
                          </div>
                        ))}
                        {!accountDetail?.timeline?.length && <p className={styles.empty}>ยังไม่มีประวัติการติดตาม</p>}
                      </div>
                    </article>
                    <article className={styles.panel}>
                      <header><div><span>ความเสี่ยง</span><h2>สิ่งที่ต้องตรวจสอบ</h2></div></header>
                      <p className={styles.riskText}>{selectedLead.risk}</p>
                      <dl className={styles.profileData}><div><dt>แหล่งที่มา</dt><dd>{selectedLead.source}</dd></div><div><dt>ติดต่อล่าสุด</dt><dd>{shortDate(selectedLead.lastContactAt)}</dd></div></dl>
                    </article>
                  </section>
                </>
              ) : <div className={styles.empty}>ไม่พบข้อมูลลูกค้า</div>}
            </section>
          </div>
        )}

        {!loading && data && view === "demos" && (
          <div className={styles.page}>
            <section className={styles.pageHeading}><span>คัดกรองก่อนใช้งบเดินทาง</span><h1>นัดสาธิต</h1><p>ให้ความสำคัญกับความต้องการจริง ผู้มีอำนาจตัดสินใจ และความพร้อมของสถานที่</p></section>
            <section className={styles.demoGrid}>
              {demos.map((demo) => {
                const lead = data.leads.find((item) => item.id === demo.leadId);
                return (
                <article key={String(demo.id)}>
                  <header><span>{String(demo.locationType || "ยังไม่ระบุสถานที่")}</span><strong>คะแนน {String(demo.qualificationScore || 0)}</strong></header>
                  <h2>{String(demo.accountName || lead?.name || "ยังไม่ระบุลูกค้า")}</h2><p>{lead?.contact || "ยังไม่ระบุผู้ติดต่อ"}</p>
                  <dl><div><dt>สถานะ</dt><dd>{String(demo.status || "Requested")}</dd></div><div><dt>ผู้ตัดสินใจ</dt><dd>{demo.decisionMakerAttending ? "เข้าร่วม" : "ยังไม่ยืนยัน"}</dd></div><div><dt>กำหนด</dt><dd>{shortDate(demo.scheduledAt)}</dd></div></dl>
                  <button onClick={() => { if (lead) setSelectedLeadId(lead.id); setView("crm"); }}>เปิดข้อมูลลูกค้า</button>
                </article>
              );})}
              {!demos.length && <p className={styles.empty}>ยังไม่มีรายการนัดสาธิต</p>}
            </section>
          </div>
        )}

        {!loading && data && view === "evidence" && (
          <div className={styles.page}>
            <section className={styles.pageHeading}><span>THERAPIST EVIDENCE</span><h1>การบ้านผลลัพธ์ประจำเดือน</h1><p>เก็บข้อมูลเป็นขั้นตอนบนโทรศัพท์ เพื่อเปลี่ยนประสบการณ์จริงให้เป็นหลักฐานที่ตรวจสอบได้</p></section>
            <section className={styles.evidenceJourney}>
              {[
                ["01", "รับการบ้าน", "ผู้จัดการหรือ BIB กำหนดประเภทเคสและวันส่ง"],
                ["02", "บันทึกเคส", "ใช้รหัสเคส เลือกเป้าหมาย โปรแกรม และจำนวนครั้ง"],
                ["03", "ภาพและเสียง", "ถ่ายภาพตามกรอบและเล่าข้อสังเกต 60–90 วินาที"],
                ["04", "ตรวจและส่ง", "ตรวจข้อความที่ถอดจากเสียงและยืนยันความยินยอม"],
                ["05", "ทบทวน", "ผู้จัดการและ BIB ขอแก้ไขหรืออนุมัติเข้า Result Book"],
              ].map(([number, title, description]) => <article key={number}><b>{number}</b><div><h2>{title}</h2><p>{description}</p></div></article>)}
            </section>
            <a className={styles.primaryLink} href="/therapist">เปิดหน้าส่งการบ้านสำหรับ Therapist</a>
          </div>
        )}

        {!loading && data && view === "approval" && (
          <div className={styles.page}>
            <section className={styles.pageHeading}>
              <span>เอกสารที่ต้องตัดสินใจ</span>
              <h1>ตรวจทานและอนุมัติเอกสาร</h1>
              <p>อ่านฉบับเต็ม แสดงความคิดเห็น ส่งกลับให้แก้ไข หรือยืนยันเพื่อดำเนินการลงนาม</p>
            </section>
            <section className={styles.approvalGrid}>
              <article>
                <header><span>LINNA Clinic</span><em>รอพิจารณา</em></header>
                <h2>สัญญาแบ่งรายได้ระยะยาว</h2>
                <p>รูปแบบ D2 · ส่วนแบ่ง 40/60 · ไม่มีรายได้ขั้นต่ำ</p>
                <dl><div><dt>ฉบับ</dt><dd>3.2</dd></div><div><dt>ประเด็น</dt><dd>เงินประกันและหลักฐานค่าโฆษณา</dd></div></dl>
                <a href="/?document=linna">เปิดตรวจทาน</a>
              </article>
              <article>
                <header><span>Dr.J Clinic</span><em>ข้อมูลไม่ครบ</em></header>
                <h2>สัญญาเช่าเพื่อซื้อ</h2>
                <p>รูปแบบ B · ระยะเวลา 24 เดือน</p>
                <dl><div><dt>ฉบับ</dt><dd>1.4</dd></div><div><dt>ประเด็น</dt><dd>ข้อมูลคู่สัญญาและการตรวจเครดิต</dd></div></dl>
                <a href="/?document=drj">เปิดตรวจทาน</a>
              </article>
              <article>
                <header><span>เอกสารภายใน BIB</span><em>รอผู้บริหาร</em></header>
                <h2>บันทึกนโยบายค่าตอบแทนการขาย</h2>
                <p>ครอบคลุมรูปแบบการค้า A–D2</p>
                <dl><div><dt>ฉบับ</dt><dd>2.0</dd></div><div><dt>ประเด็น</dt><dd>วันที่มีผลและผู้อนุมัตินโยบาย</dd></div></dl>
                <a href="/?document=memo">เปิดตรวจทาน</a>
              </article>
            </section>
          </div>
        )}
      </section>
      </div>

      {showTaskForm && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowTaskForm(false)}>
          <form className={styles.modal} onSubmit={createTask} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span>งานใหม่</span><h2>เพิ่มสิ่งที่ต้องติดตาม</h2></div><button type="button" onClick={() => setShowTaskForm(false)}>×</button></header>
            <label><span>เรื่องที่ต้องทำ</span><input name="title" required autoFocus /></label>
            <label><span>วันครบกำหนด</span><input name="dueDate" type="date" required /></label>
            <label><span>ความสำคัญ</span><select name="priority" defaultValue="กลาง"><option>ต่ำ</option><option>กลาง</option><option>สูง</option><option>เร่งด่วน</option></select></label>
            <footer><button type="button" onClick={() => setShowTaskForm(false)}>ยกเลิก</button><button type="submit">บันทึกงาน</button></footer>
          </form>
        </div>
      )}

      {showActivityForm && selectedLead && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowActivityForm(false)}>
          <form className={`${styles.modal} ${styles.activityModal}`} onSubmit={recordActivity} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span>ประวัติลูกค้า</span><h2>บันทึกการติดตาม {selectedLead.name}</h2></div><button type="button" onClick={() => setShowActivityForm(false)}>×</button></header>
            <div className={styles.formGrid}>
              <label><span>ประเภทกิจกรรม</span><select name="activityType" defaultValue="Follow-up"><option value="Follow-up">ติดตาม</option><option value="Meeting">ประชุม</option><option value="Call">โทรศัพท์</option><option value="Message">ข้อความ</option><option value="Demo">สาธิต</option></select></label>
              <label><span>ช่องทาง</span><select name="channel" defaultValue="LINE"><option>LINE</option><option>โทรศัพท์</option><option>อีเมล</option><option>พบที่สถานที่</option><option>ประชุมออนไลน์</option></select></label>
            </div>
            <label><span>สรุปสิ่งที่พูดคุย</span><textarea name="summary" required autoFocus rows={3} /></label>
            <label><span>ผลที่ได้</span><textarea name="outcome" rows={2} /></label>
            {selectedLead.opportunityId && <>
              <div className={styles.formGrid}>
                <label><span>ขั้นตอนขาย</span><select name="stage" defaultValue={selectedLead.stage}><option>New</option><option>Qualified</option><option>Demo Requested</option><option>Demo Scheduled</option><option>Demo Completed</option><option>Proposal</option><option>Negotiation</option><option>Contracting</option><option>Closed Won</option><option>Closed Lost</option><option>On Hold</option></select></label>
                <label><span>วันที่ต้องทำต่อ</span><input name="nextActionAt" type="date" defaultValue={selectedLead.nextActionAt?.slice(0, 10)} /></label>
              </div>
              <label><span>สิ่งที่ต้องทำต่อ</span><input name="nextAction" defaultValue={selectedLead.next} /></label>
              <label><span>ความเสี่ยงที่ต้องระวัง</span><textarea name="riskNote" rows={2} defaultValue={selectedLead.risk === "ยังไม่มีบันทึกความเสี่ยง" ? "" : selectedLead.risk} /></label>
            </>}
            <footer><button type="button" onClick={() => setShowActivityForm(false)}>ยกเลิก</button><button type="submit">บันทึกและอัปเดต</button></footer>
          </form>
        </div>
      )}

      {editingContact && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setEditingContact(null)}>
          <form className={`${styles.modal} ${styles.activityModal}`} onSubmit={updateContact} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span>ข้อมูลผู้ติดต่อ</span><h2>แก้ไขรายละเอียดผู้ติดต่อ</h2></div><button type="button" onClick={() => setEditingContact(null)}>×</button></header>
            <div className={styles.formGrid}>
              <label><span>ชื่อ–นามสกุล</span><input name="displayName" required autoFocus defaultValue={editingContact.displayName || ""} /></label>
              <label><span>ตำแหน่ง</span><input name="positionTitle" defaultValue={editingContact.positionTitle || ""} /></label>
              <label><span>บทบาทในการซื้อ</span><input name="buyingRole" defaultValue={editingContact.buyingRole || ""} placeholder="เช่น แพทย์ ผู้จัดการ ฝ่ายจัดซื้อ" /></label>
              <label><span>ระดับการตัดสินใจ</span><select name="decisionLevel" defaultValue={editingContact.decisionLevel || "ยังไม่ยืนยัน"}><option>ผู้ตัดสินใจ</option><option>ผู้มีอิทธิพล</option><option>ผู้ประเมิน</option><option>ผู้ประสานงาน</option><option>ยังไม่ยืนยัน</option></select></label>
              <label><span>เบอร์โทร</span><input name="phone" inputMode="tel" defaultValue={editingContact.phone || ""} /></label>
              <label><span>อีเมล</span><input name="email" type="email" defaultValue={editingContact.email || ""} /></label>
              <label><span>LINE ID</span><input name="lineId" defaultValue={editingContact.lineId || ""} /></label>
              <label><span>ช่องทางที่สะดวก</span><select name="preferredChannel" defaultValue={editingContact.preferredChannel || "LINE"}><option>LINE</option><option>โทรศัพท์</option><option>อีเมล</option><option>พบที่สถานที่</option><option>ประชุมออนไลน์</option></select></label>
              <label><span>สถานะการติดต่อ</span><select name="consentStatus" defaultValue={editingContact.consentStatus || "ยังไม่ยืนยัน"}><option>ติดต่อได้</option><option>รอยืนยัน</option><option>ไม่ประสงค์รับการติดต่อ</option><option>ยังไม่ยืนยัน</option></select></label>
            </div>
            <label><span>บันทึกที่จำเป็น</span><textarea name="notes" rows={3} defaultValue={editingContact.notes || ""} placeholder="เช่น เวลาที่สะดวก ความสนใจ หรือข้อควรระวังในการติดต่อ" /></label>
            <footer><button type="button" onClick={() => setEditingContact(null)}>ยกเลิก</button><button type="submit">บันทึกข้อมูล</button></footer>
          </form>
        </div>
      )}
    </main>
  );
}
