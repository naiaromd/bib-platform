"use client";

import { useMemo, useState } from "react";

type Role = "Executive" | "Finance" | "Legal" | "Sales" | "Customer";
type ItemId = "linna" | "drj" | "memo";

const items = {
  linna: {
    account: "LINNA Clinic",
    title: "Long-Term Revenue Share Agreement",
    model: "D2 · 40/60 · No MG",
    version: "v3.2",
    stage: "Finance review",
    due: "วันนี้",
    risk: "Deposit waiver",
    owner: "Nalin · Sales",
    allowed: ["Executive", "Finance", "Legal", "Sales", "Customer"],
    customer: true,
  },
  drj: {
    account: "Dr.J Clinic",
    title: "Rent-to-Own Agreement",
    model: "B · 24 months",
    version: "v1.4",
    stage: "Open items",
    due: "28 ก.ค.",
    risk: "KYC required",
    owner: "Mook · Sales",
    allowed: ["Executive", "Finance", "Legal", "Sales", "Customer"],
    customer: true,
  },
  memo: {
    account: "BIB Internal",
    title: "Commission Policy Memo",
    model: "Model A–D2",
    version: "v1.1",
    stage: "Executive approval",
    due: "วันนี้",
    risk: "Policy change",
    owner: "Sunai · Policy owner",
    allowed: ["Executive", "Finance", "Legal", "Sales"],
    customer: false,
  },
} as const;

const roleCopy: Record<Role, string> = {
  Executive: "เห็นสรุป ความเสี่ยง Exception และสิทธิอนุมัติขั้นสุดท้าย",
  Finance: "เห็นราคา VAT Deposit, MG, Commission และผลกระทบ P&L",
  Legal: "เห็นข้อสัญญา Version และ Comment ที่เกี่ยวข้อง",
  Sales: "เห็น Account ของตน สถานะงาน และ Next action",
  Customer: "เห็นเฉพาะเอกสารของบริษัทตนและ Comment ที่เปิดให้ลูกค้า",
};

function StatusDot({ color }: { color: "green" | "amber" | "blue" | "gray" }) {
  return <span className={`status-dot ${color}`} />;
}

export default function Home() {
  const [role, setRole] = useState<Role>("Executive");
  const [active, setActive] = useState<ItemId>("linna");
  const [tab, setTab] = useState<"document" | "comments" | "history">("document");
  const [comment, setComment] = useState("");
  const [notes, setNotes] = useState([
    { author: "Finance · Pim", text: "ขอระบุ Deposit Waiver Approval ID ใน Schedule 1", visibility: "Internal", time: "09:42" },
    { author: "LINNA · Reviewer", text: "ยืนยันส่วนแบ่ง 60/40 และไม่มี Minimum Guarantee", visibility: "Customer-visible", time: "10:18" },
  ]);
  const [decisions, setDecisions] = useState<Record<ItemId, string>>({
    linna: "Pending",
    drj: "Blocked",
    memo: "Pending",
  });

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

  function addComment() {
    if (!comment.trim()) return;
    setNotes((n) => [
      ...n,
      {
        author: role === "Customer" ? `${current.account} · Reviewer` : `${role} · Current user`,
        text: comment.trim(),
        visibility: isCustomer ? "Customer-visible" : "Internal",
        time: "เมื่อสักครู่",
      },
    ]);
    setComment("");
    setTab("comments");
  }

  function decide(value: string) {
    setDecisions((d) => ({ ...d, [active]: value }));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div><strong>BIB Intelligence</strong><span>Knowledge & Commercial OS</span></div>
        </div>
        <nav>
          <p className="nav-label">WORKSPACES</p>
          <button><span>⌁</span> Knowledge Health</button>
          <button className="active"><span>✓</span> Commercial Health <b>3</b></button>
          <button><span>▤</span> Evidence & Claims</button>
          <button><span>◇</span> Product Registry</button>
          <p className="nav-label">OPERATIONS</p>
          <button><span>◎</span> Accounts & CRM</button>
          <button><span>↗</span> Deployment</button>
          <button><span>◌</span> Warranty & Support</button>
          <button><span>↻</span> Reorder</button>
        </nav>
        <div className="security-card">
          <span>🔒</span>
          <div><strong>Authorization active</strong><p>Role + Account + Document + Stage</p></div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="breadcrumbs">BIB Intelligence / Commercial Health</div>
            <h1>Commercial Approval Center</h1>
          </div>
          <div className="top-actions">
            <label className="role-switcher">
              <span>Preview as</span>
              <select value={role} onChange={(e) => {
                const next = e.target.value as Role;
                setRole(next);
                const first = (Object.keys(items) as ItemId[]).find((id) => items[id].allowed.includes(next as never));
                if (first && !items[active].allowed.includes(next as never)) setActive(first);
              }}>
                {Object.keys(roleCopy).map((r) => <option key={r}>{r}</option>)}
              </select>
            </label>
            <div className="avatar">{role.slice(0, 2).toUpperCase()}</div>
          </div>
        </header>

        <div className="role-banner">
          <span>Viewing as <strong>{role}</strong></span>
          <p>{roleCopy[role]}</p>
          <em>Permission preview</em>
        </div>

        <div className="content-grid">
          <section className="queue">
            <div className="queue-head">
              <div><h2>My Review Queue</h2><p>{visibleItems.length} รายการที่คุณมีสิทธิ์เห็น</p></div>
              <button className="filter">☷ Filter</button>
            </div>
            <div className="queue-tabs"><button className="on">รอฉันตรวจ <b>{visibleItems.length}</b></button><button>ติดตาม</button><button>เสร็จแล้ว</button></div>
            <div className="queue-list">
              {visibleItems.map((id) => {
                const it = items[id];
                return (
                  <button key={id} className={`queue-item ${active === id ? "selected" : ""}`} onClick={() => setActive(id)}>
                    <div className="item-line"><span className="account">{it.account}</span><span className={`decision ${decisions[id].toLowerCase()}`}>{decisions[id]}</span></div>
                    <strong>{it.title}</strong>
                    <div className="item-meta"><span>{it.model}</span><span>{it.version}</span></div>
                    <div className="item-foot"><span><StatusDot color={id === "drj" ? "amber" : id === "memo" ? "blue" : "green"} />{it.stage}</span><time>{it.due}</time></div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="review-panel">
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
                ? ["Policy Owner", "Finance", "Executive", "Published"]
                : ["Sales prepared", "Finance", "Legal / Executive", "Customer", "E‑Signature"]
              ).map((step, i, arr) => (
                <div key={step} className={i <= (active === "memo" ? 1 : 1) ? "done" : i === 2 ? "current" : ""}>
                  <span>{i < 2 ? "✓" : i + 1}</span><small>{step}</small>{i < arr.length - 1 && <i />}
                </div>
              ))}
            </div>

            <div className="review-tabs">
              <button className={tab === "document" ? "on" : ""} onClick={() => setTab("document")}>Document</button>
              <button className={tab === "comments" ? "on" : ""} onClick={() => setTab("comments")}>Comments <b>{notes.length}</b></button>
              <button className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>History</button>
            </div>

            <div className="review-body">
              {tab === "document" && (
                <div className="document-view">
                  <div className="doc-toolbar"><span>Page 1 of {active === "memo" ? 5 : 12}</span><span>− &nbsp; 100% &nbsp; +</span><button>Download</button></div>
                  <article className="paper">
                    <div className="paper-brand">BIB <span>INTERNAL COMMERCIAL POLICY</span></div>
                    <p className="paper-kicker">{active === "memo" ? "บันทึกข้อความ" : "COMMERCIAL AGREEMENT"}</p>
                    <h3>{current.title}</h3>
                    {active === "memo" ? (
                      <>
                        <p className="lead">นโยบายค่าคอมมิชชัน icoone® ตาม Commercial Model A–D2</p>
                        <div className="memo-callout"><strong>ข้อเสนอเพื่ออนุมัติ</strong><p>Model A คงอัตราขั้นบันได 2%–10% ตามราคาขายก่อน VAT ส่วน Model B–D2 ใช้ Commission Pool สูงสุด 5%</p></div>
                        <h4>Model A — Tier เดิม</h4>
                        <table><tbody>
                          <tr><th>ราคาก่อน VAT</th><th>อัตรารวม</th><th>การแบ่ง</th></tr>
                          <tr><td>≥ 2.50m</td><td>10%</td><td>Sales 8 + Referral 1 + Trainer 1</td></tr>
                          <tr><td>≥ 2.10m</td><td>6%</td><td>Sales 4 + Referral 1 + Trainer 1</td></tr>
                          <tr><td>≥ 2.00m</td><td>5%</td><td>Sales 3 + Referral 1 + Trainer 1</td></tr>
                        </tbody></table>
                        <p className="paper-note">จุดควบคุม: 2.15 ล้านบาทรวม VAT มีฐานก่อน VAT 2.009 ล้านบาท จึงเข้า Tier 5%</p>
                      </>
                    ) : (
                      <>
                        <p className="lead">ระหว่าง บริษัท ไอ พลัส คิว จำกัด และ {current.account}</p>
                        <div className="contract-meta"><span>Commercial model</span><strong>{current.model}</strong><span>Current version</span><strong>{current.version}</strong></div>
                        <h4>1. Commercial Terms</h4>
                        <p>คู่สัญญาตกลงใช้โครงสร้างทางการค้าที่ได้รับอนุมัติตาม Offer และ Approval Record ที่อ้างถึงในเอกสารฉบับนี้</p>
                        <h4>2. Payment and reporting</h4>
                        <p>รายได้ การชำระเงิน การรายงาน และรายการหัก ให้เป็นไปตาม Schedule ที่ได้รับอนุมัติและตรวจสอบย้อนหลังได้</p>
                        <div className="clause-highlight"><b>Reviewer note</b><p>{active === "linna" ? "Deposit waiver ต้องมี Finance + Executive Approval ID" : "Contract ถูกบล็อกจนกว่า KYC, Installation Site และ VAT Treatment จะครบ"}</p></div>
                      </>
                    )}
                  </article>
                </div>
              )}
              {tab === "comments" && (
                <div className="comments-view">
                  {notes.filter((n) => !isCustomer || n.visibility === "Customer-visible").map((n, i) => (
                    <div className="comment-card" key={i}><div><strong>{n.author}</strong><time>{n.time}</time></div><p>{n.text}</p><span>{n.visibility}</span></div>
                  ))}
                </div>
              )}
              {tab === "history" && (
                <div className="history-view">
                  <div><StatusDot color="green" /><p><strong>{current.version} created</strong><span>สร้างจาก Approved Terms และล็อก Document Version</span></p><time>วันนี้ 08:30</time></div>
                  <div><StatusDot color="blue" /><p><strong>Finance review started</strong><span>มอบหมายให้ Finance reviewer</span></p><time>09:10</time></div>
                  <div><StatusDot color="gray" /><p><strong>Previous version archived</strong><span>Version เดิมยังเก็บใน Audit Trail</span></p><time>เมื่อวาน</time></div>
                </div>
              )}
            </div>

            <div className="comment-compose">
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isCustomer ? "พิมพ์ Comment หรือจุดที่ต้องการแก้ไข…" : "เพิ่ม Internal comment หรือคำแนะนำ…"} />
              <div><span>Visibility: <strong>{isCustomer ? "Customer-visible" : "Internal only"}</strong></span><button onClick={addComment}>Save comment</button></div>
            </div>

            <footer className="decision-bar">
              <div><span>Decision</span><strong>{decisions[active]}</strong><small>Document ID · {active.toUpperCase()}-{current.version}</small></div>
              <div className="decision-actions">
                <button className="ghost" onClick={() => decide("Changes requested")}>Request changes</button>
                {!isCustomer && <button className="conditional" onClick={() => decide("Conditional")}>Approve with conditions</button>}
                <button className="primary" disabled={!canApprove || blocked} onClick={() => decide(isCustomer ? "Ready for E‑Signature" : "Approved")}>
                  {blocked ? "Blocked by open items" : isCustomer ? "Approve for E‑Signature" : active === "memo" ? "Approve memo" : "Approve"}
                </button>
              </div>
            </footer>
          </section>
        </div>
      </section>
    </main>
  );
}
