"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./workspace.module.css";

type View = "today" | "crm" | "demos" | "evidence";

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
  funnel: Array<Record<string, unknown>>;
  forecast: Record<string, unknown>;
};

const menu: Array<{ key: View; icon: string; label: string; hint: string }> = [
  { key: "today", icon: "01", label: "งานวันนี้", hint: "งาน นัดหมาย และสิ่งที่ต้องติดตาม" },
  { key: "crm", icon: "02", label: "CRM", hint: "ลูกค้า ผู้ติดต่อ และโอกาสขาย" },
  { key: "demos", icon: "03", label: "นัดสาธิต", hint: "คัดกรอง วางแผน และสรุปผล" },
  { key: "evidence", icon: "04", label: "หลักฐานผลลัพธ์", hint: "การบ้าน Therapist และคิวตรวจ" },
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

export default function WorkspaceClient() {
  const [view, setView] = useState<View>("today");
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);

  async function loadWorkspace() {
    setLoading(true);
    try {
      const response = await fetch("/api/workspace", { cache: "no-store" });
      const payload = (await response.json()) as WorkspaceData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "ไม่สามารถเปิดพื้นที่ทำงานได้");
      setData(payload);
      setSelectedLeadId((current) => current || payload.leads[0]?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดพื้นที่ทำงานได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/workspace", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as WorkspaceData & { error?: string };
        if (!response.ok) throw new Error(payload.error || "ไม่สามารถเปิดพื้นที่ทำงานได้");
        if (!active) return;
        setData(payload);
        setSelectedLeadId(payload.leads[0]?.id || "");
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดพื้นที่ทำงานได้");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const leads = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!data || !normalized) return data?.leads || [];
    return data.leads.filter((lead) =>
      [lead.name, lead.contact, lead.owner, lead.segment, lead.city].join(" ").toLowerCase().includes(normalized),
    );
  }, [data, query]);

  const selectedLead = (data?.leads || []).find((lead) => lead.id === selectedLeadId) || leads[0];
  const openTasks = (data?.tasks || []).filter((task) => task.status !== "เสร็จแล้ว");
  const demoLeads = (data?.leads || []).filter((lead) => /Demo|สาธิต/.test(`${lead.stage} ${lead.status}`));
  const weightedPipeline = Number(data?.forecast?.weighted_satang || 0);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/workspace", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "create_task", title: form.get("title"), dueDate: form.get("dueDate") }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "บันทึกงานไม่สำเร็จ");
      return;
    }
    setShowTaskForm(false);
    setMessage("เพิ่มงานแล้ว");
    await loadWorkspace();
  }

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <a href="/workspace" className={styles.brand} aria-label="BIB icoone Workspace">
          <img src="/logos/bib-logo.png" alt="BIB" />
          <span />
          <img src="/logos/icoone-laser-med.png" alt="icoone laser med" />
        </a>
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
            <button onClick={() => setShowTaskForm(true)}>+ เพิ่มงาน</button>
            <a href="/platform">ดูระบบเดิม</a>
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
              <article><span>นัดสาธิต</span><strong>{demoLeads.length}</strong><small>รวมคำขอที่ยังรอยืนยัน</small></article>
              <article><span>มูลค่าถ่วงน้ำหนัก</span><strong>{bahtFromSatang(weightedPipeline)}</strong><small>คำนวณจากโอกาสขายจริง</small></article>
            </section>

            <section className={styles.twoColumns}>
              <article className={styles.panel}>
                <header><div><span>สิ่งที่ต้องทำต่อ</span><h2>งานของทีม</h2></div><button onClick={() => setShowTaskForm(true)}>เพิ่มงาน</button></header>
                <div className={styles.taskList}>
                  {openTasks.slice(0, 6).map((task) => (
                    <div key={String(task.id)}>
                      <b className={String(task.priority) === "สูง" ? styles.high : ""}>{String(task.priority || "กลาง")}</b>
                      <span><strong>{String(task.title)}</strong><small>ครบกำหนด {shortDate(task.due_date)} · {String(task.owner_user_id)}</small></span>
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
                    <button>บันทึกการติดตาม</button>
                  </section>

                  <section className={styles.detailColumns}>
                    <article className={styles.panel}>
                      <header><div><span>ข้อมูลประกอบ</span><h2>สัญญาณความสนใจ</h2></div></header>
                      <ul className={styles.signalList}>{selectedLead.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
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
              {demoLeads.map((lead) => (
                <article key={lead.id}>
                  <header><span>{temperatureLabel(lead.temperature)}</span><strong>คะแนน {lead.score}</strong></header>
                  <h2>{lead.name}</h2><p>{lead.contact} · {lead.role}</p>
                  <dl><div><dt>สถานะ</dt><dd>{lead.status}</dd></div><div><dt>ขั้นตอนถัดไป</dt><dd>{lead.next}</dd></div><div><dt>กำหนด</dt><dd>{shortDate(lead.nextActionAt)}</dd></div></dl>
                  <button onClick={() => { setSelectedLeadId(lead.id); setView("crm"); }}>เปิดข้อมูลลูกค้า</button>
                </article>
              ))}
              {!demoLeads.length && <p className={styles.empty}>ยังไม่มีรายการนัดสาธิต</p>}
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
      </section>

      {showTaskForm && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setShowTaskForm(false)}>
          <form className={styles.modal} onSubmit={createTask} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span>งานใหม่</span><h2>เพิ่มสิ่งที่ต้องติดตาม</h2></div><button type="button" onClick={() => setShowTaskForm(false)}>×</button></header>
            <label><span>เรื่องที่ต้องทำ</span><input name="title" required autoFocus /></label>
            <label><span>วันครบกำหนด</span><input name="dueDate" type="date" required /></label>
            <footer><button type="button" onClick={() => setShowTaskForm(false)}>ยกเลิก</button><button type="submit">บันทึกงาน</button></footer>
          </form>
        </div>
      )}
    </main>
  );
}
