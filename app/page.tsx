"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type Role = "Executive" | "Finance" | "Legal" | "Sales" | "Customer";
type ItemId = "linna" | "drj" | "memo";

const items = {
  linna: {
    account: "LINNA Clinic",
    title: "สัญญาแบ่งรายได้ระยะยาว",
    model: "รูปแบบ D2 · แบ่งรายได้ 40/60 · ไม่มีรายได้ขั้นต่ำ",
    version: "ฉบับที่ 3.2",
    stage: "ฝ่ายการเงินกำลังพิจารณา",
    due: "วันนี้",
    risk: "ขอยกเว้นเงินประกัน",
    owner: "นลิน · ฝ่ายขาย",
    allowed: ["Executive", "Finance", "Legal", "Sales", "Customer"],
    customer: true,
  },
  drj: {
    account: "Dr.J Clinic",
    title: "สัญญาเช่าเพื่อซื้อ",
    model: "รูปแบบ B · ระยะเวลา 24 เดือน",
    version: "ฉบับที่ 1.4",
    stage: "รอข้อมูลเพิ่มเติม",
    due: "28 ก.ค.",
    risk: "ต้องตรวจสอบตัวตนคู่สัญญา",
    owner: "มุก · ฝ่ายขาย",
    allowed: ["Executive", "Finance", "Legal", "Sales", "Customer"],
    customer: true,
  },
  memo: {
    account: "เอกสารภายใน BIB",
    title: "บันทึกนโยบายค่าตอบแทนการขาย",
    model: "รูปแบบ A–D2",
    version: "ฉบับที่ 1.1",
    stage: "รอผู้บริหารอนุมัติ",
    due: "วันนี้",
    risk: "การเปลี่ยนแปลงนโยบาย",
    owner: "สุนัย · ผู้รับผิดชอบนโยบาย",
    allowed: ["Executive", "Finance", "Legal", "Sales"],
    customer: false,
  },
} as const;

const roleCopy: Record<Role, string> = {
  Executive: "เห็นข้อมูลสรุป ความเสี่ยง ข้อยกเว้น และมีสิทธิอนุมัติขั้นสุดท้าย",
  Finance: "เห็นราคา ภาษีมูลค่าเพิ่ม เงินประกัน รายได้ขั้นต่ำ ค่าตอบแทน และผลกระทบต่องบกำไรขาดทุน",
  Legal: "เห็นข้อสัญญา ฉบับเอกสาร และความเห็นที่เกี่ยวข้อง",
  Sales: "เห็นข้อมูลลูกค้าที่รับผิดชอบ สถานะงาน และงานที่ต้องดำเนินการต่อ",
  Customer: "เห็นเฉพาะเอกสารของตนและความเห็นที่อนุญาตให้ลูกค้าเห็น",
};

const roleLabels: Record<Role, string> = {
  Executive: "ผู้บริหาร",
  Finance: "ฝ่ายการเงิน",
  Legal: "ฝ่ายกฎหมาย",
  Sales: "ฝ่ายขาย",
  Customer: "ลูกค้า",
};

const documentFiles: Record<ItemId, string> = {
  linna: "/documents/linna-contract.pdf",
  drj: "/documents/drj-contract.pdf",
  memo: "/documents/commission-memo.pdf",
};

function StatusDot({ color }: { color: "green" | "amber" | "blue" | "gray" }) {
  return <span className={`status-dot ${color}`} />;
}

export default function Home() {
  const pathname = usePathname();
  const dedicatedClient = pathname === "/linna";
  const [role, setRole] = useState<Role>(dedicatedClient ? "Customer" : "Executive");
  const [active, setActive] = useState<ItemId>("linna");
  const [tab, setTab] = useState<"summary" | "history">("summary");
  const [fullView, setFullView] = useState(false);
  const [fullDocumentOverride, setFullDocumentOverride] = useState<{ file: string; title: string; version: string } | null>(null);
  const [comment, setComment] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportMonth: "2026-07",
    paidSessions: "42",
    packageSessions: "18",
    complimentarySessions: "3",
    grossRevenue: "227500",
    approvedRefunds: "0",
    approvedMarketing: "50000",
    openingHours: "1248",
    closingHours: "1289",
    consumableNote: "",
  });
  const [notes, setNotes] = useState([
    { documentId: "linna", author: "ฝ่ายการเงิน · พิม", text: "กรุณาระบุเลขที่อนุมัติการยกเว้นเงินประกันในเอกสารแนบท้ายฉบับที่ 1", visibility: "ภายใน", time: "09:42" },
    { documentId: "linna", author: "LINNA · ผู้ตรวจทาน", text: "ยืนยันส่วนแบ่ง 60/40 และไม่มีรายได้ขั้นต่ำ", visibility: "ลูกค้าเห็นได้", time: "10:18" },
  ]);
  const [decisions, setDecisions] = useState<Record<ItemId, string>>({
    linna: "Pending",
    drj: "Blocked",
    memo: "Pending",
  });
  const [saveState, setSaveState] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading");
  const [systemMessage, setSystemMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setSaveState("loading");
      try {
        const response = await fetch(`/api/reviews?role=${encodeURIComponent(role)}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
        if (cancelled) return;
        const incomingNotes = (data.comments || []).map((n: {
          document_id: ItemId; author_label: string; body: string; visibility: string; created_at: string;
        }) => ({
          documentId: n.document_id,
          author: n.author_label,
          text: n.body,
          visibility: n.visibility,
          time: new Date(n.created_at).toLocaleString("th-TH", { hour: "2-digit", minute: "2-digit" }),
        }));
        if (incomingNotes.length) setNotes(incomingNotes);
        const incomingDecisions = { ...decisions };
        for (const d of data.documents || []) {
          if (d.id in items) incomingDecisions[d.id as ItemId] = d.decision;
        }
        setDecisions(incomingDecisions);
        setSaveState("ready");
        setSystemMessage("");
      } catch (error) {
        if (!cancelled) {
          setSaveState("error");
          setSystemMessage(error instanceof Error ? error.message : "ไม่สามารถเชื่อมระบบบันทึกข้อมูลได้");
        }
      }
    }
    load();
    return () => { cancelled = true; };
    // Role changes intentionally refresh server-filtered records.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const visibleItems = useMemo(
    () => (Object.keys(items) as ItemId[]).filter((id) => items[id].allowed.includes(role as never)),
    [role]
  );
  const current = items[active];
  const canApprove =
    (active === "memo" && ["Executive", "Finance"].includes(role)) ||
    (active === "linna" && ["Executive", "Finance", "Legal", "Customer"].includes(role)) ||
    (active === "drj" && ["Legal", "Customer"].includes(role));
  const blocked = active === "drj" && ["Executive", "Finance"].includes(role);
  const isCustomer = role === "Customer";

  async function addComment() {
    if (!comment.trim()) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "comment", documentId: active, role, body: comment.trim(),
          visibility: isCustomer ? "Customer-visible" : "Internal",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "บันทึกความเห็นไม่สำเร็จ");
      setNotes((n) => [...n, {
        documentId: active,
        author: role === "Customer" ? `${current.account} · ผู้ตรวจทาน` : `${roleLabels[role]} · ผู้ใช้งานปัจจุบัน`,
        text: comment.trim(),
        visibility: isCustomer ? "Customer-visible" : "Internal",
        time: "เมื่อสักครู่",
      }]);
      setComment(""); setSaveState("saved"); setSystemMessage("บันทึกความเห็นและประวัติการดำเนินการแล้ว");
    } catch (error) {
      setSaveState("error");
      setSystemMessage(error instanceof Error ? error.message : "บันทึกความเห็นไม่สำเร็จ");
    }
  }

  async function decide(value: string) {
    setSaveState("saving");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "decision", documentId: active, role, decision: value, version: current.version }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "บันทึกผลการพิจารณาไม่สำเร็จ");
      setDecisions((d) => ({ ...d, [active]: value }));
      setSaveState("saved");
      setSystemMessage(`บันทึกผลการพิจารณาพร้อมผู้ดำเนินการ เวลา และฉบับเอกสารแล้ว`);
    } catch (error) {
      setSaveState("error");
      setSystemMessage(error instanceof Error ? error.message : "บันทึกผลการพิจารณาไม่สำเร็จ");
    }
  }

  async function submitMonthlyReport() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: "monthly_report",
          documentId: "linna",
          role: "Customer",
          ...reportForm,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ส่งรายงานไม่สำเร็จ");
      setSaveState("saved");
      setSystemMessage("ส่งรายงานประจำเดือนให้ BIB ตรวจสอบแล้ว");
      setShowReportForm(false);
    } catch (error) {
      setSaveState("error");
      setSystemMessage(error instanceof Error ? error.message : "ส่งรายงานไม่สำเร็จ");
    }
  }

  return (
    <main className={`app-shell ${dedicatedClient ? "dedicated-client-shell" : ""}`}>
      {!dedicatedClient && <aside className="sidebar">
        <div className="brand">
          <div className="brand-lockup">
            <img src="/logos/bib-logo.png" alt="BIB" className="bib-logo" />
            <i>×</i>
            <img src="/logos/icoone-laser-med.png" alt="icoone Laser Med" className="icoone-logo" />
          </div>
          <div><strong>ศูนย์ข้อมูลและการอนุมัติ</strong><span>BIB PRACTICE INTELLIGENCE</span></div>
        </div>
        <nav>
          <p className="nav-label">พื้นที่ทำงาน</p>
          <button><span>⌁</span> สุขภาพฐานความรู้</button>
          <button className="active"><span>✓</span> การอนุมัติเชิงพาณิชย์ <b>3</b></button>
          <button><span>▤</span> หลักฐานและข้อความกล่าวอ้าง</button>
          <button><span>◇</span> ทะเบียนผลิตภัณฑ์</button>
          <p className="nav-label">การดำเนินงาน</p>
          <button><span>◎</span> ลูกค้าและข้อมูลการขาย</button>
          <button><span>↗</span> การส่งมอบและติดตั้ง</button>
          <button><span>◌</span> การรับประกันและบริการ</button>
          <button><span>↻</span> การสั่งซื้อซ้ำ</button>
        </nav>
        <div className="security-card">
          <span>🔒</span>
          <div><strong>เปิดใช้การควบคุมสิทธิ์แล้ว</strong><p>กำหนดตามบทบาท ลูกค้า เอกสาร และขั้นตอน</p></div>
        </div>
      </aside>}

      <section className="workspace">
        {dedicatedClient ? (
          <header className="client-topbar">
            <div className="client-brand-pair">
              <img src="/logos/bib-logo.png" alt="BIB" />
              <i>×</i>
              <img src="/logos/icoone-laser-med.png" alt="icoone Laser Med" />
            </div>
            <div className="client-account-title"><strong>LINNA Clinic</strong><span>พื้นที่ข้อมูลและบริการสำหรับลูกค้า</span></div>
            <div className="client-account-menu"><span>กล</span><div><strong>ผู้รับผิดชอบ</strong><small>ผู้ดูแลบัญชี LINNA</small></div><button aria-label="เมนูบัญชี LINNA">⋮</button></div>
          </header>
        ) : <header className="topbar">
          <div>
            <div className="breadcrumbs">BIB / การอนุมัติเชิงพาณิชย์</div>
            <h1>ศูนย์ตรวจทานและอนุมัติเอกสาร</h1>
          </div>
          <div className="top-actions">
            <button className="client-preview-button" onClick={() => {
              setRole(role === "Customer" ? "Executive" : "Customer");
              setActive("linna");
            }}>{role === "Customer" ? "กลับสู่หน้าทีม BIB" : "เปิดหน้าลูกค้า LINNA"}</button>
            <label className="role-switcher">
              <span>แสดงในฐานะ</span>
              <select value={role} onChange={(e) => {
                const next = e.target.value as Role;
                setRole(next);
                const first = (Object.keys(items) as ItemId[]).find((id) => items[id].allowed.includes(next as never));
                if (first && !items[active].allowed.includes(next as never)) setActive(first);
              }}>
                {(Object.keys(roleCopy) as Role[]).map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
              </select>
            </label>
            <div className="avatar">{role.slice(0, 2).toUpperCase()}</div>
          </div>
        </header>}

        {!dedicatedClient && <div className="role-banner">
          <span>กำลังแสดงสิทธิ์ของ <strong>{roleLabels[role]}</strong></span>
          <p>{roleCopy[role]}</p>
          <em>ตัวอย่างตามสิทธิ์ที่ได้รับ</em>
        </div>}
        {dedicatedClient && <aside className="client-navigation" aria-label="เมนูพื้นที่ลูกค้า">
          <div className="client-profile">
            <span>กล</span>
            <div><strong>คุณผู้รับผิดชอบ</strong><small>บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด</small></div>
          </div>
          <nav>
            <a className="active" href="#overview"><i>⌂</i>ภาพรวมบัญชี</a>
            <a href="#plan-services"><i>◇</i>บริการตามแผน D2</a>
            <a href="#orders"><i>▣</i>ประวัติการสั่งซื้อ</a>
            <a href="#training"><i>✓</i>ประวัติการฝึกอบรม</a>
            <a href="#service"><i>⚙</i>ประวัติการบริการ</a>
            <a href="#warranty"><i>◷</i>การรับประกัน</a>
            <a href="#knowledge"><i>▤</i>ฐานความรู้</a>
            <a href="#toolkit"><i>▦</i>เครื่องมือหลังการขาย</a>
            <a href="#documents"><i>≡</i>เอกสารของฉัน</a>
          </nav>
          <div className="plan-identity"><span>รูปแบบความร่วมมือ</span><strong>D2 · แบ่งรายได้ระยะยาว</strong><small>40/60 · ไม่มีรายได้ขั้นต่ำ</small></div>
        </aside>}
        <div className={`system-state ${saveState}`}>
          <span>{saveState === "loading" ? "กำลังเชื่อมข้อมูล…" : saveState === "saving" ? "กำลังบันทึก…" : saveState === "error" ? "ต้องตรวจสอบ" : "พร้อมตรวจสอบย้อนหลัง"}</span>
          <p>{systemMessage || "ทุกความเห็นและผลการอนุมัติจะผูกกับฉบับเอกสารที่เกี่ยวข้อง"}</p>
        </div>

        {isCustomer && (
          <section className="client-dashboard" id="overview">
            <header className="client-welcome">
              <div>
                <p>สวัสดี ผู้รับผิดชอบ</p>
                <h2>ยินดีต้อนรับสู่พื้นที่ดูแล LINNA Clinic</h2>
                <span>ข้อมูลรอบเดือนกรกฎาคม 2569 · ปรับปรุงล่าสุดเมื่อ 24 กรกฎาคม 2569</span>
              </div>
              <button onClick={() => setShowReportForm(true)}>ส่งรายงานประจำเดือน</button>
            </header>

            <div className="client-alert">
              <div><span>กำหนดส่งรายงาน</span><strong>5 ส.ค. 2569</strong></div>
              <p>กรุณาส่งยอดบริการ รายได้ และภาพชั่วโมงสะสมของเครื่องเพื่อให้ BIB ตรวจสอบส่วนแบ่งรายได้</p>
              <button onClick={() => setShowReportForm(true)}>เริ่มกรอกข้อมูล</button>
            </div>

            <div className="client-metrics">
              <article><span>รายได้จากบริการ</span><strong>฿227,500</strong><small>ข้อมูลที่ LINNA กำลังจัดเตรียม</small></article>
              <article><span>ส่วนแบ่ง LINNA</span><strong>฿106,500</strong><small>ร้อยละ 60 ของรายได้สุทธิ</small></article>
              <article><span>ส่วนแบ่ง IPQ</span><strong>฿75,970</strong><small>รวมภาษีมูลค่าเพิ่มแล้ว</small></article>
              <article><span>จำนวนครั้งที่ให้บริการ</span><strong>63 ครั้ง</strong><small>ชำระเงิน 42 · ใช้ชุดบริการ 18 · ไม่มีค่าใช้จ่าย 3</small></article>
            </div>

            <div className="client-grid" id="plan-services">
              <article className="client-card machine-card">
                <header><div><span>การใช้งานเครื่อง</span><h3>icoone Laser Med</h3></div><em>ทำงานปกติ</em></header>
                <div className="hour-reading">
                  <div><span>ชั่วโมงสะสมล่าสุด</span><strong>1,289.0</strong></div>
                  <div><span>ใช้ในเดือนนี้</span><strong>41.0 ชม.</strong></div>
                </div>
                <div className="usage-bar"><i style={{ width: "68%" }} /></div>
                <p>เหลือประมาณ 711 ชั่วโมงก่อนถึงเกณฑ์ตรวจตามชั่วโมงใช้งาน</p>
                <button onClick={() => setShowReportForm(true)}>บันทึกชั่วโมงและแนบภาพ</button>
              </article>

              <article className="client-card" id="warranty">
                <header><div><span>สถานะรายงาน</span><h3>รอบเดือนกรกฎาคม 2569</h3></div><em className="amber-label">รอ LINNA ส่ง</em></header>
                <ol className="report-steps">
                  <li className="done"><i>✓</i><div><strong>เปิดรอบรายงาน</strong><span>1 ก.ค. 2569</span></div></li>
                  <li className="current"><i>2</i><div><strong>LINNA กรอกข้อมูล</strong><span>กำหนดส่ง 5 ส.ค. 2569</span></div></li>
                  <li><i>3</i><div><strong>BIB ตรวจสอบและรับรองยอด</strong><span>ภายใน 5 วันทำการ</span></div></li>
                  <li><i>4</i><div><strong>ชำระส่วนแบ่งและปิดรอบ</strong><span>ภายในวันที่ 10</span></div></li>
                </ol>
              </article>

              <article className="client-card">
                <header><div><span>การรับประกันและบริการ</span><h3>สถานะเครื่อง</h3></div><em>ปกติ</em></header>
                <dl className="service-list">
                  <div><dt>หมายเลขเครื่อง</dt><dd>รอยืนยันหลังส่งมอบ</dd></div>
                  <div><dt>ระยะเวลารับประกัน</dt><dd>12 เดือนนับจากวันที่ติดตั้ง</dd></div>
                  <div><dt>ตรวจบำรุงรักษาครั้งถัดไป</dt><dd>15 ต.ค. 2569</dd></div>
                  <div><dt>รายการแจ้งปัญหาที่เปิดอยู่</dt><dd>ไม่มี</dd></div>
                  <div><dt>ผู้ปฏิบัติงานที่ผ่านการรับรอง</dt><dd>2 คน</dd></div>
                </dl>
                <button>แจ้งปัญหาการใช้งาน</button>
              </article>

              <article className="client-card">
                <header><div><span>วัสดุและการสั่งซื้อซ้ำ</span><h3>รายการที่ควรตรวจสอบ</h3></div><em className="amber-label">1 รายการ</em></header>
                <div className="reorder-item"><div><strong>ชุดวัสดุสิ้นเปลือง icoone</strong><span>คงเหลือประมาณ 3 สัปดาห์</span></div><b>ควรสั่งเพิ่ม</b></div>
                <div className="reorder-item"><div><strong>อุปกรณ์ทำความสะอาด</strong><span>ปริมาณเพียงพอ</span></div><b className="ok">ปกติ</b></div>
                <button>ดูรายการและขอสั่งซื้อ</button>
              </article>
            </div>

            <section className="client-service-hub" id="service">
              <header>
                <div><span>ข้อมูลจากชุดสัญญาและการรับประกันของ BIB</span><h3>การส่งมอบ การฝึกอบรม และบริการหลังการขาย</h3></div>
                <em>ปรับให้ตรงกับ LINNA ก่อนลงนาม</em>
              </header>
              <div className="service-hub-grid">
                <article>
                  <b>01</b>
                  <div><span>รับประกันเครื่อง</span><h4>12 เดือนนับจากวันที่ติดตั้ง</h4><p>ครอบคลุมการตรวจและซ่อมตามเงื่อนไขผู้ผลิต ไม่ครอบคลุมความเสียหายจากการตกหล่น ไฟฟ้าไม่เหมาะสม การใช้ผิดคู่มือ หรือการซ่อมโดยผู้ที่ไม่ได้รับอนุญาต</p></div>
                </article>
                <article>
                  <b>02</b>
                  <div><span>การบำรุงรักษา</span><h4>ตรวจเชิงป้องกันทุก 6 เดือน</h4><p>ระบบจะแจ้งเตือนล่วงหน้า บันทึกผลตรวจ ประวัติอะไหล่ และรายการแก้ไขที่ต้องติดตามไว้กับหมายเลขเครื่อง</p></div>
                </article>
                <article>
                  <b>03</b>
                  <div><span>การฝึกอบรมเริ่มต้น</span><h4>รวม 18 ชั่วโมง</h4><p>ครอบคลุมหลักการทำงาน การประเมิน โปรแกรม การดูแลเครื่อง ข้อห้าม และการฝึกปฏิบัติ โดยสิทธิอบรมสุดท้ายให้ยึดสัญญา LINNA ฉบับลงนาม</p></div>
                </article>
                <article>
                  <b>04</b>
                  <div><span>การรับมอบอุปกรณ์</span><h4>ตรวจรายการและสภาพในวันส่งมอบ</h4><p>บันทึกเครื่อง หัวใช้งาน อุปกรณ์ประกอบ วัสดุสิ้นเปลือง และอุปกรณ์ส่งเสริมการตลาด พร้อมลงนามรับมอบในระบบ</p></div>
                </article>
              </div>
              <p className="service-source-note">ข้อมูลส่วนนี้สรุปจากชุดเอกสาร “Sales Contract &amp; Warranty” ที่ BIB ใช้อ้างอิง ข้อความที่มีผลผูกพันให้ยึดสัญญาและใบรับประกันของ LINNA ที่ลงนามครบถ้วนแล้วเท่านั้น</p>
            </section>

            <section className="account-history">
              <header><div><span>ข้อมูลร่วมสำหรับทุกแผน</span><h3>ประวัติการดูแลบัญชี</h3></div><em>เชื่อมกับเครื่องและสัญญาของ LINNA</em></header>
              <div className="history-columns">
                <article id="orders">
                  <header><span>01</span><div><small>ประวัติการสั่งซื้อ</small><h4>สินค้าและวัสดุ</h4></div></header>
                  <ul>
                    <li><time>รอวันส่งมอบ</time><strong>icoone Laser Med และอุปกรณ์ตามสัญญา</strong><span>กำลังตรวจรายการก่อนส่งมอบ</span></li>
                    <li><time>ยังไม่มีรายการ</time><strong>คำขอสั่งซื้อวัสดุเพิ่มเติม</strong><span>เมื่อส่งคำขอ ระบบจะแสดงใบเสนอราคาและสถานะจัดส่งที่นี่</span></li>
                  </ul>
                  <button>ดูประวัติทั้งหมด</button>
                </article>
                <article id="training">
                  <header><span>02</span><div><small>ประวัติการฝึกอบรม</small><h4>ผู้ปฏิบัติงานและความพร้อม</h4></div></header>
                  <ul>
                    <li><time>หลักสูตรเริ่มต้น</time><strong>การฝึกอบรมรวม 18 ชั่วโมง</strong><span>รอยืนยันวันอบรมและรายชื่อผู้เข้าอบรม</span></li>
                    <li><time>ผู้เข้าอบรม 2 คน</time><strong>สถานะรอประเมินภาคปฏิบัติ</strong><span>ใบรับรองจะแสดงหลังผู้ฝึกสอนลงนามรับรอง</span></li>
                  </ul>
                  <button>จัดการรายชื่อผู้เข้าอบรม</button>
                </article>
                <article>
                  <header><span>03</span><div><small>ประวัติการบริการ</small><h4>บำรุงรักษาและแก้ไขปัญหา</h4></div></header>
                  <ul>
                    <li><time>ทุก 6 เดือน</time><strong>การตรวจบำรุงรักษาเชิงป้องกัน</strong><span>ครั้งถัดไปจะแจ้งเมื่อยืนยันวันที่ติดตั้ง</span></li>
                    <li><time>0 รายการ</time><strong>ไม่มีรายการแจ้งปัญหาที่เปิดอยู่</strong><span>สามารถแจ้งปัญหาและแนบภาพหรือวิดีโอได้</span></li>
                  </ul>
                  <button>แจ้งปัญหาการใช้งาน</button>
                </article>
              </div>
            </section>

            <section className="support-resources">
              <header><div><span>ข้อมูลและเครื่องมือสนับสนุน</span><h3>พร้อมใช้เมื่อเริ่มให้บริการ</h3></div></header>
              <div>
                <article id="knowledge"><b>ฐานความรู้</b><h4>คู่มือและความรู้สำหรับทีม LINNA</h4><p>คู่มือการใช้งาน ข้อห้าม การดูแลเครื่อง แนวทางคัดกรอง และคำตอบสำหรับคำถามที่พบบ่อย โดยแสดงเฉพาะฉบับปัจจุบัน</p><button>เปิดฐานความรู้</button></article>
                <article id="toolkit"><b>เครื่องมือหลังการขาย</b><h4>เอกสารสำหรับเปิดและดูแลบริการ</h4><p>แบบบันทึกผล แบบตรวจรับเครื่อง รายการตรวจประจำวัน สื่อที่ผ่านการอนุมัติ และแบบฟอร์มขอรับบริการ</p><button>เปิดชุดเครื่องมือ</button></article>
                <article><b>บริการเฉพาะแผน D2</b><h4>ติดตามผลการดำเนินงานร่วมกัน</h4><p>รายงานรายได้และชั่วโมงใช้งานรายเดือน การทบทวนวันที่ 90 การทบทวนรายไตรมาส และการแจ้งเตือนเมื่อไม่มีบริการที่ชำระเงินจริง</p><button onClick={() => setShowReportForm(true)}>ส่งรายงานเดือนนี้</button></article>
              </div>
            </section>

            <section className="reorder-catalog">
              <header>
                <div><span>รายการสำหรับสั่งซื้อเพิ่ม</span><h3>วัสดุสิ้นเปลืองที่ใช้ประจำ</h3></div>
                <button>สร้างคำขอสั่งซื้อ</button>
              </header>
              <div className="reorder-table">
                <div className="reorder-head"><span>รูป</span><span>รหัสสินค้า</span><span>รายการ</span><span>ราคาต่อหน่วย</span><span>สถานะ</span></div>
                <div><figure><img src="/catalog/icoone-filter.png" alt="ไส้กรองสีขาว icoone" /></figure><span>BIB002-540051002</span><strong>ไส้กรองสีขาว icoone</strong><span>350 บาท</span><em>ควรตรวจทุกเดือน</em></div>
                <div><figure><img src="/catalog/icoone-robosolo-flaps.png" alt="แผ่นยาง Robosolo" /></figure><span>BIB002-585200002</span><strong>แผ่นยาง Robosolo</strong><span>150 บาท</span><em>พร้อมสั่ง</em></div>
                <div><figure><img src="/catalog/icoone-robomini-flaps.png" alt="แผ่นยาง Robomini" /></figure><span>BIB002-585200001</span><strong>แผ่นยาง Robomini</strong><span>150 บาท</span><em>พร้อมสั่ง</em></div>
                <div><figure><img src="/catalog/icoone-robotwin-flaps.png" alt="แผ่นยาง Robotwin" /></figure><span>BIB002-585200003</span><strong>แผ่นยาง Robotwin</strong><span>150 บาท</span><em>พร้อมสั่ง</em></div>
                <div><figure><img src="/catalog/icoone-bodysuit.png" alt="ชุดสวมตัว icoone" /></figure><span>BIB002-504085009</span><strong>ชุดสวมตัวผู้หญิง ขนาด M</strong><span>900 บาท</span><em>พร้อมสั่ง</em></div>
                <div><figure><img src="/catalog/icoone-bodysuit.png" alt="ชุดสวมตัว icoone" /></figure><span>BIB002-504085114</span><strong>ชุดสวมตัวผู้หญิง ขนาด L</strong><span>900 บาท</span><em>พร้อมสั่ง</em></div>
                <div><figure><img src="/catalog/icoone-bag.png" alt="กระเป๋าสำหรับชุดสวมตัว icoone" /></figure><span>BIB002-090067002</span><strong>กระเป๋าสำหรับชุดสวมตัว</strong><span>500 บาท</span><em>พร้อมสั่ง</em></div>
              </div>
              <p>ราคาข้างต้นรวมภาษีมูลค่าเพิ่มตามบัญชีราคาที่นำเข้าระบบ และต้องยืนยันราคาและจำนวนสินค้าก่อนออกใบเสนอราคา</p>
            </section>

            <section className="client-documents" id="documents">
              <header><div><span>เอกสารของ LINNA</span><h3>เอกสารล่าสุด</h3></div><button onClick={() => { setActive("linna"); setFullView(true); }}>ดูเอกสารทั้งหมด</button></header>
              <div><span>สัญญาแบ่งรายได้</span><strong>ฉบับรอทบทวน</strong><button onClick={() => { setActive("linna"); setFullView(true); }}>เปิดอ่าน</button></div>
              <div><span>หนังสือรับรองนิติบุคคล</span><strong>รับเอกสารแล้ว · ออกวันที่ 26 มี.ค. 2569</strong><button onClick={() => {
                setFullDocumentOverride({ file: "/documents/linna-company-certificate.pdf", title: "หนังสือรับรองบริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด", version: "เลขอ้างอิง E10091220326545" });
                setFullView(true);
              }}>เปิดอ่าน</button></div>
              <div><span>เงื่อนไขการรับประกัน</span><strong>รอยืนยันเลขเครื่องและวันที่ติดตั้งก่อนลงนาม</strong><button>เปิดอ่าน</button></div>
              <div><span>ใบรับรองการฝึกอบรม</span><strong>มี 2 รายการ</strong><button>เปิดดู</button></div>
            </section>

            <section className="company-profile-card">
              <header>
                <div><span>ข้อมูลนิติบุคคลตามหนังสือรับรอง</span><h3>บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด</h3></div>
                <em>รับเอกสารแล้ว</em>
              </header>
              <div className="company-profile-grid">
                <div><span>เลขทะเบียนนิติบุคคล</span><strong>[IDENTIFIER OMITTED]</strong></div>
                <div><span>วันที่จดทะเบียน</span><strong>11 เมษายน 2559</strong></div>
                <div><span>ทุนจดทะเบียน</span><strong>5,000,000 บาท</strong></div>
                <div><span>วันที่ออกหนังสือรับรอง</span><strong>26 มีนาคม 2569</strong></div>
                <div className="wide"><span>กรรมการ</span><strong>นางสาวผู้รับผิดชอบ และนายผู้รับผิดชอบ</strong></div>
                <div className="wide"><span>อำนาจลงนาม</span><strong>กรรมการหนึ่งคนลงลายมือชื่อและประทับตราสำคัญของบริษัท</strong></div>
                <div className="wide"><span>สำนักงานใหญ่</span><strong>[ADDRESS OMITTED]</strong></div>
              </div>
              <div className="company-review-note">
                <strong>รายการที่ต้องตรวจเพิ่มเติมก่อนลงนาม</strong>
                <p>ตรวจสอบเอกสารผ่านรหัสคิวอาร์ของกรมพัฒนาธุรกิจการค้า และขอใบอนุญาตสถานพยาบาลหรือหลักฐานสิทธิใช้สถานที่แยกต่างหาก เนื่องจากหนังสือรับรองนิติบุคคลไม่ใช่ใบอนุญาตประกอบสถานพยาบาล</p>
              </div>
            </section>
          </section>
        )}

        {!isCustomer && <div className="content-grid">
          <section className="queue">
            <div className="queue-head">
              <div><h2>เอกสารที่รอตรวจทาน</h2><p>{visibleItems.length} รายการที่คุณมีสิทธิ์เข้าถึง</p></div>
              <button className="filter">☷ ตัวกรอง</button>
            </div>
            <div className="queue-tabs"><button className="on">รอฉันตรวจ <b>{visibleItems.length}</b></button><button>ติดตาม</button><button>เสร็จแล้ว</button></div>
            <div className="queue-list">
              {visibleItems.map((id) => {
                const it = items[id];
                return (
                  <button key={id} className={`queue-item ${active === id ? "selected" : ""}`} onClick={() => setActive(id)}>
                    <div className="item-line"><span className="account">{it.account}</span><span className={`decision ${decisions[id].toLowerCase()}`}>{decisions[id] === "Pending" ? "รอพิจารณา" : decisions[id] === "Blocked" ? "ข้อมูลไม่ครบ" : decisions[id]}</span></div>
                    <strong>{it.title}</strong>
                    <div className="item-meta"><span>{it.model}</span><span>{it.version}</span></div>
                    <div className="item-foot"><span><StatusDot color={id === "drj" ? "amber" : id === "memo" ? "blue" : "green"} />{it.stage}</span><time>{it.due}</time></div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="review-panel document-panel">
            <div className="review-head">
              <div>
                <div className="eyebrow">{current.account} · {current.version}</div>
                <h2>{current.title}</h2>
                <div className="badges"><span>{current.model}</span><span className="risk">⚑ {current.risk}</span></div>
              </div>
              <button className="more">•••</button>
            </div>

            <div className="flow">
              {(active === "memo"
                ? ["ผู้รับผิดชอบนโยบาย", "ฝ่ายการเงิน", "ผู้บริหาร", "ประกาศใช้"]
                : ["ฝ่ายขายจัดเตรียม", "ฝ่ายการเงิน", "กฎหมายและผู้บริหาร", "ลูกค้า", "ลงนามอิเล็กทรอนิกส์"]
              ).map((step, i, arr) => (
                <div key={step} className={i <= (active === "memo" ? 1 : 1) ? "done" : i === 2 ? "current" : ""}>
                  <span>{i < 2 ? "✓" : i + 1}</span><small>{step}</small>{i < arr.length - 1 && <i />}
                </div>
              ))}
            </div>

            <div className="review-tabs">
              <button className={tab === "summary" ? "on" : ""} onClick={() => setTab("summary")}>ข้อมูลสรุป</button>
              <button onClick={() => setFullView(true)}>อ่านเอกสารฉบับเต็ม</button>
              <button className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>ประวัติเอกสาร</button>
            </div>

            <div className="review-body">
              {tab === "summary" && (
                <div className="summary-view">
                  <div className="summary-intro">
                    <p className="paper-kicker">{active === "memo" ? "สรุปเพื่อพิจารณานโยบาย" : "สรุปเพื่อพิจารณาเอกสาร"}</p>
                    <h3>{current.title}</h3>
                    <p>สรุปสาระสำคัญเพื่อใช้ตรวจทานและตัดสินใจก่อนเปิดอ่านเอกสารฉบับเต็ม</p>
                    <button onClick={() => setFullView(true)}>เปิดอ่านแบบเต็มพื้นที่ →</button>
                  </div>
                  <div className="summary-grid">
                    <div><span>ลูกค้า</span><strong>{current.account}</strong></div>
                    <div><span>รูปแบบทางการค้า</span><strong>{current.model}</strong></div>
                    <div><span>ฉบับเอกสาร</span><strong>{current.version}</strong></div>
                    <div><span>ขั้นตอนปัจจุบัน</span><strong>{current.stage}</strong></div>
                  </div>
                  <section className="summary-section">
                    <h4>สาระสำคัญ</h4>
                    {active === "linna" && <ul>
                      <li>แบ่งรายได้ LINNA ร้อยละ 60 และ IPQ ร้อยละ 40</li>
                      <li>ไม่มีรายได้ขั้นต่ำ และส่วนแบ่งของ IPQ รวมภาษีมูลค่าเพิ่มแล้ว</li>
                      <li>การยกเว้นเงินประกันต้องได้รับอนุมัติจากฝ่ายการเงินและผู้บริหาร พร้อมเลขที่อนุมัติ</li>
                      <li>ทบทวนเมื่อครบ 90 วันและทุกไตรมาส หากไม่มีบริการที่มีรายได้ติดต่อกัน 3 เดือน ให้พิจารณาเรียกคืนเครื่อง</li>
                    </ul>}
                    {active === "drj" && <ul>
                      <li>เช่าเพื่อซื้อเป็นเวลา 24 เดือน พร้อมเงินประกันและเงื่อนไขโอนกรรมสิทธิ์</li>
                      <li>คู่สัญญาเป็นบุคคล จึงต้องตรวจสอบตัวตนและสิทธิใช้สถานที่ติดตั้ง</li>
                      <li>ยังไม่พร้อมลงนามจนกว่าจะได้รับใบอนุญาต ข้อมูลสถานที่ และข้อสรุปด้านภาษีครบถ้วน</li>
                    </ul>}
                    {active === "memo" && <ul>
                      <li>รูปแบบ A คงอัตราค่าตอบแทนแบบขั้นบันไดตามราคาขายก่อนภาษีมูลค่าเพิ่ม</li>
                      <li>การแบ่งมาตรฐาน: ฝ่ายขายร้อยละ 3 ผู้แนะนำร้อยละ 1 และผู้ฝึกอบรมร้อยละ 1</li>
                      <li>หากไม่มีผู้แนะนำ ให้ส่วนดังกล่าวแก่ฝ่ายขาย หากผู้ฝึกอบรมขายเอง ให้ได้รับค่าตอบแทนรวมตามนโยบาย</li>
                    </ul>}
                  </section>
                  <section className="summary-section attention">
                    <h4>ประเด็นที่ต้องตัดสินใจ</h4>
                    <p>{active === "linna" ? "อนุมัติการยกเว้นเงินประกัน และยืนยันวิธีปฏิบัติด้านภาษีก่อนส่งให้ลูกค้าลงนาม"
                      : active === "drj" ? "ขอเอกสารตรวจสอบตัวตนและใบอนุญาตให้ครบ หรือส่งกลับให้ฝ่ายขายแก้ไข"
                      : "ยืนยันอัตราขั้นบันไดของรูปแบบ A วันที่เริ่มใช้ และผู้มีสิทธิ์ได้รับค่าตอบแทน"}</p>
                  </section>
                  <section className="summary-section">
                    <h4>เอกสารประกอบที่ต้องมี</h4>
                    <div className="attachment-list">
                      <span>✓ เงื่อนไขทางการค้าที่ได้รับอนุมัติ</span>
                      <span>✓ ร่างสัญญา {current.version}</span>
                      <span>{active === "drj" ? "○ เอกสารยืนยันตัวตนและใบอนุญาตคลินิก — ยังไม่ครบ" : "✓ เอกสารเงื่อนไขการรับประกัน"}</span>
                    </div>
                  </section>
                </div>
              )}
              {tab === "history" && (
                <div className="history-view">
                  <div><StatusDot color="green" /><p><strong>สร้าง {current.version} แล้ว</strong><span>สร้างจากเงื่อนไขที่อนุมัติและล็อกฉบับเอกสาร</span></p><time>วันนี้ 08:30</time></div>
                  <div><StatusDot color="blue" /><p><strong>เริ่มการพิจารณาของฝ่ายการเงิน</strong><span>มอบหมายให้ผู้ตรวจทานจากฝ่ายการเงินแล้ว</span></p><time>09:10</time></div>
                  <div><StatusDot color="gray" /><p><strong>จัดเก็บเอกสารฉบับก่อนหน้าแล้ว</strong><span>เอกสารฉบับเดิมยังคงอยู่ในประวัติการดำเนินการ</span></p><time>เมื่อวาน</time></div>
                </div>
              )}
            </div>
          </section>

          <aside className="decision-panel">
            <header className="decision-head">
              <div><p>การตรวจทานและตัดสินใจ</p><h2>ความเห็นและการอนุมัติ</h2></div>
              <span>{notes.filter((n) => n.documentId === active && (!isCustomer || n.visibility === "Customer-visible")).length}</span>
            </header>
            <div className="decision-context">
              <span>ผลการพิจารณาปัจจุบัน</span>
              <strong>{decisions[active] === "Pending" ? "รอพิจารณา" : decisions[active] === "Blocked" ? "ยังไม่พร้อมอนุมัติ" : decisions[active]}</strong>
              <small>เลขอ้างอิงเอกสาร · {active.toUpperCase()}-{current.version}</small>
            </div>
            <div className="comments-stream">
              {notes.filter((n) => n.documentId === active && (!isCustomer || n.visibility === "Customer-visible")).map((n, i) => (
                <div className="comment-card" key={i}><div><strong>{n.author}</strong><time>{n.time}</time></div><p>{n.text}</p><span>{n.visibility}</span></div>
              ))}
            </div>
            <div className="comment-compose">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isCustomer ? "พิมพ์ความเห็นหรือจุดที่ต้องการแก้ไข…" : "เพิ่มความเห็นหรือคำแนะนำสำหรับผู้เกี่ยวข้องภายใน…"} />
              <div><span>ผู้ที่เห็นความเห็น: <strong>{isCustomer ? "ลูกค้าและผู้เกี่ยวข้อง" : "ผู้เกี่ยวข้องภายในเท่านั้น"}</strong></span><button disabled={saveState === "saving"} onClick={addComment}>บันทึกความเห็น</button></div>
            </div>

            <footer className="decision-bar">
              <div className="decision-actions">
                <button className="ghost" disabled={saveState === "saving"} onClick={() => decide("Changes requested")}>ส่งกลับเพื่อแก้ไข</button>
                {!isCustomer && <button className="conditional" disabled={saveState === "saving"} onClick={() => decide("Conditional")}>อนุมัติโดยมีเงื่อนไข</button>}
                <button className="primary" disabled={!canApprove || blocked || saveState === "saving"} onClick={() => decide(isCustomer ? "Ready for E‑Signature" : "Approved")}>
                  {blocked ? "ยังอนุมัติไม่ได้เนื่องจากข้อมูลไม่ครบ" : isCustomer ? "ยืนยันเพื่อดำเนินการลงนาม" : active === "memo" ? "อนุมัติบันทึกนโยบาย" : "อนุมัติ"}
                </button>
              </div>
            </footer>
          </aside>
        </div>}
      </section>
      {showReportForm && (
        <div className="report-modal" role="dialog" aria-modal="true" aria-label="ส่งรายงานประจำเดือน">
          <div className="report-sheet">
            <header><div><span>LINNA Clinic</span><h2>ส่งรายงานประจำเดือน</h2><p>ระบบจะคำนวณส่วนแบ่งและส่งให้ BIB ตรวจสอบ</p></div><button onClick={() => setShowReportForm(false)}>ปิด</button></header>
            <div className="report-form">
              <label><span>เดือนที่รายงาน</span><input type="month" value={reportForm.reportMonth} onChange={(e) => setReportForm({ ...reportForm, reportMonth: e.target.value })} /></label>
              <div className="form-section"><h3>จำนวนครั้งที่ให้บริการ</h3><div className="form-row">
                <label><span>ชำระเงินจริง</span><input type="number" value={reportForm.paidSessions} onChange={(e) => setReportForm({ ...reportForm, paidSessions: e.target.value })} /></label>
                <label><span>ใช้สิทธิจากชุดบริการ</span><input type="number" value={reportForm.packageSessions} onChange={(e) => setReportForm({ ...reportForm, packageSessions: e.target.value })} /></label>
                <label><span>ไม่มีค่าใช้จ่าย</span><input type="number" value={reportForm.complimentarySessions} onChange={(e) => setReportForm({ ...reportForm, complimentarySessions: e.target.value })} /></label>
              </div></div>
              <div className="form-section"><h3>รายได้และรายการหัก</h3><div className="form-row">
                <label><span>รายได้รวม</span><input type="number" value={reportForm.grossRevenue} onChange={(e) => setReportForm({ ...reportForm, grossRevenue: e.target.value })} /></label>
                <label><span>เงินคืนที่อนุมัติ</span><input type="number" value={reportForm.approvedRefunds} onChange={(e) => setReportForm({ ...reportForm, approvedRefunds: e.target.value })} /></label>
                <label><span>ค่าโฆษณาที่อนุมัติให้หัก</span><input type="number" value={reportForm.approvedMarketing} onChange={(e) => setReportForm({ ...reportForm, approvedMarketing: e.target.value })} /></label>
              </div></div>
              <div className="form-section"><h3>ชั่วโมงการใช้งานเครื่อง</h3><div className="form-row">
                <label><span>ชั่วโมงสะสมต้นงวด</span><input type="number" value={reportForm.openingHours} onChange={(e) => setReportForm({ ...reportForm, openingHours: e.target.value })} /></label>
                <label><span>ชั่วโมงสะสมปลายงวด</span><input type="number" value={reportForm.closingHours} onChange={(e) => setReportForm({ ...reportForm, closingHours: e.target.value })} /></label>
                <label className="file-field"><span>ภาพหน้าจอแสดงชั่วโมง</span><input type="file" accept="image/*,.pdf" /><small>รับภาพถ่ายหรือเอกสาร PDF</small></label>
              </div></div>
              <label><span>หมายเหตุเกี่ยวกับวัสดุหรือการใช้งาน</span><textarea value={reportForm.consumableNote} onChange={(e) => setReportForm({ ...reportForm, consumableNote: e.target.value })} /></label>
              <div className="calculation-preview"><div><span>รายได้สุทธิเบื้องต้น</span><strong>฿177,500</strong></div><div><span>ส่วนแบ่ง LINNA</span><strong>฿106,500</strong></div><div><span>ส่วนแบ่ง IPQ รวมภาษี</span><strong>฿75,970</strong></div></div>
            </div>
            <footer><button onClick={() => setShowReportForm(false)}>บันทึกร่างไว้ก่อน</button><button className="submit-report" disabled={saveState === "saving"} onClick={submitMonthlyReport}>ยืนยันและส่งให้ BIB ตรวจสอบ</button></footer>
          </div>
        </div>
      )}
      {fullView && (
        <div className="full-document" role="dialog" aria-modal="true" aria-label={`เอกสารฉบับเต็ม ${fullDocumentOverride?.title || current.title}`}>
          <header>
            <div className="full-brand"><img src="/logos/bib-logo.png" alt="BIB" /><i>×</i><img src="/logos/icoone-laser-med.png" alt="icoone Laser Med" /></div>
            <div><span>{current.account}</span><h2>{fullDocumentOverride?.title || current.title}</h2><p>{fullDocumentOverride?.version || current.version} · เอกสารสำหรับตรวจทาน</p></div>
            <div className="full-actions">
              <a href={fullDocumentOverride?.file || documentFiles[active]} download>ดาวน์โหลดเอกสาร</a>
              <button onClick={() => { setFullView(false); setFullDocumentOverride(null); }} aria-label="ปิดเอกสารฉบับเต็ม">ปิด</button>
            </div>
          </header>
          <iframe src={`${fullDocumentOverride?.file || documentFiles[active]}#view=FitH&toolbar=1&navpanes=0`} title={`เอกสารฉบับเต็ม ${fullDocumentOverride?.title || current.title}`} />
        </div>
      )}
    </main>
  );
}
