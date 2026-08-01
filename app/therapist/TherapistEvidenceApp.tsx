"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./therapist.module.css";

type Assignment = {
  id: string;
  account_id?: string;
  title: string;
  period_key?: string;
  instructions?: string;
  required_case_count?: number;
  due_at?: string;
  status: string;
};

type CaseSummary = {
  id: string;
  assignment_id?: string;
  case_reference?: string;
  concern_code?: string;
  status: string;
  updated_at?: string;
};

type EvidenceList = { assignments: Assignment[]; cases: CaseSummary[]; error?: string };
type Step = "home" | "case" | "photos" | "voice" | "consent" | "done";

const steps: Array<{ key: Exclude<Step, "home" | "done">; label: string }> = [
  { key: "case", label: "ข้อมูลเคส" },
  { key: "photos", label: "ภาพผลลัพธ์" },
  { key: "voice", label: "สรุปด้วยเสียง" },
  { key: "consent", label: "ตรวจและส่ง" },
];

function friendlyDate(value?: string) {
  if (!value) return "ยังไม่กำหนด";
  const date = new Date(value.length === 10 ? `${value}T00:00:00+07:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default function TherapistEvidenceApp() {
  const [step, setStep] = useState<Step>("home");
  const [list, setList] = useState<EvidenceList>({ assignments: [], cases: [] });
  const [assignmentId, setAssignmentId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [caseReference, setCaseReference] = useState("");
  const [ageBand, setAgeBand] = useState("35–44");
  const [concernCode, setConcernCode] = useState("Body contouring");
  const [protocolCode, setProtocolCode] = useState("");
  const [programCodes, setProgramCodes] = useState("");
  const [sessionCount, setSessionCount] = useState(1);
  const [baselineDate, setBaselineDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [measureType, setMeasureType] = useState("Circumference");
  const [beforeValue, setBeforeValue] = useState("");
  const [afterValue, setAfterValue] = useState("");
  const [measureUnit, setMeasureUnit] = useState("cm");
  const [customerRating, setCustomerRating] = useState("");
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [internalConsent, setInternalConsent] = useState(false);
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function requestEvidence(body?: Record<string, unknown>) {
    const response = await fetch("/api/evidence", body ? {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    } : { cache: "no-store" });
    const payload = await response.json() as Record<string, unknown> & { error?: string };
    if (!response.ok) throw new Error(payload.error || "ไม่สามารถบันทึกข้อมูลได้");
    return payload;
  }

  async function load() {
    try {
      const payload = await requestEvidence() as unknown as EvidenceList;
      setList(payload);
      if (!assignmentId && payload.assignments[0]) setAssignmentId(payload.assignments[0].id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดข้อมูลได้");
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/evidence", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json() as EvidenceList;
        if (!response.ok) throw new Error(payload.error || "ไม่สามารถเปิดข้อมูลได้");
        if (!active) return;
        setList(payload);
        if (payload.assignments[0]) setAssignmentId(payload.assignments[0].id);
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "ไม่สามารถเปิดข้อมูลได้");
      });
    return () => { active = false; };
  }, []);

  function begin(assignment: Assignment) {
    setAssignmentId(assignment.id);
    setCaseReference(`CASE-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-`);
    setStep("case");
  }

  async function saveCase(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await requestEvidence({
        action: "save-case",
        caseId: caseId || undefined,
        assignmentId,
        caseReference: caseReference.trim(),
        ageBand,
        concernCode,
        protocolCode: protocolCode.trim(),
        programCodes: programCodes.split(",").map((item) => item.trim()).filter(Boolean),
        sessionCount,
        baselineDate,
        followUpDate,
        outcomeMeasures: { measureType, beforeValue, afterValue, unit: measureUnit },
        customerFeedback: { rating: customerRating },
      });
      setCaseId(String(payload.id));
      setStep("photos");
      setMessage("บันทึกร่างแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  async function uploadFile(file: File, captureStage: string, mediaType: string) {
    const form = new FormData();
    form.set("caseId", caseId);
    form.set("captureStage", captureStage);
    form.set("mediaType", mediaType);
    form.set("file", file);
    const response = await fetch("/api/evidence/files", { method: "POST", body: form });
    const payload = await response.json() as { error?: string };
    if (!response.ok) throw new Error(payload.error || `อัปโหลด ${file.name} ไม่สำเร็จ`);
  }

  async function savePhotos() {
    if (!beforePhoto || !afterPhoto) {
      setMessage("กรุณาถ่ายภาพก่อนและหลังให้ครบ");
      return;
    }
    setBusy(true);
    try {
      await uploadFile(beforePhoto, "Before", "Before image");
      await uploadFile(afterPhoto, "After", "After image");
      setStep("voice");
      setMessage("เก็บภาพแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "อัปโหลดภาพไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("อุปกรณ์นี้ไม่รองรับการอัดเสียง กรุณาเลือกไฟล์เสียงแทน");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setVoiceFile(new File([blob], `voice-${Date.now()}.webm`, { type: blob.type }));
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setMessage("ไม่สามารถเปิดไมโครโฟนได้ กรุณาอนุญาตการใช้งานหรือเลือกไฟล์เสียง");
    }
  }

  async function saveVoice() {
    if (!voiceFile && !transcript.trim()) {
      setMessage("กรุณาอัดเสียงหรือพิมพ์สรุปสั้น ๆ ก่อน");
      return;
    }
    setBusy(true);
    try {
      if (voiceFile) await uploadFile(voiceFile, "Narrative", "Voice note");
      await requestEvidence({
        action: "save-case", caseId, assignmentId, caseReference, ageBand, concernCode,
        protocolCode, programCodes: programCodes.split(",").map((item) => item.trim()).filter(Boolean),
        sessionCount, baselineDate, followUpDate,
        outcomeMeasures: { measureType, beforeValue, afterValue, unit: measureUnit },
        customerFeedback: { rating: customerRating },
        therapistSummary: transcript.trim(), voiceTranscript: transcript.trim(),
      });
      setStep("consent");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "บันทึกเสียงไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  async function submit() {
    if (!internalConsent) {
      setMessage("ต้องได้รับความยินยอมสำหรับการบันทึกและตรวจสอบภายในก่อนส่ง");
      return;
    }
    setBusy(true);
    try {
      await requestEvidence({ action: "record-consent", caseId, consentType: "Clinical documentation", status: "Granted", scope: { purpose: "Case documentation" } });
      await requestEvidence({ action: "record-consent", caseId, consentType: "Internal evidence", status: "Granted", scope: { purpose: "De-identified internal review" } });
      await requestEvidence({ action: "record-consent", caseId, consentType: "External publication", status: publicationConsent ? "Granted" : "Declined", scope: { purpose: "Result Book and approved communication" } });
      await requestEvidence({ action: "submit-case", caseId });
      setStep("done");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ส่งการบ้านไม่สำเร็จ");
    } finally { setBusy(false); }
  }

  const activeIndex = steps.findIndex((item) => item.key === step);

  return (
    <main className={styles.app}>
      <header className={styles.header}>
        <a href="/therapist"><img src="/logos/icoone-laser-med.png" alt="icoone" /></a>
        <div><span>THERAPIST WORKSPACE</span><strong>ผลลัพธ์ของฉัน</strong></div>
        <a className={styles.help} href="/workspace">BIB</a>
      </header>

      {step !== "home" && step !== "done" && (
        <nav className={styles.stepper} aria-label="ขั้นตอนส่งผลลัพธ์">
          {steps.map((item, index) => <div key={item.key} className={index <= activeIndex ? styles.currentStep : ""}><b>{index + 1}</b><span>{item.label}</span></div>)}
        </nav>
      )}

      {message && <button className={styles.message} onClick={() => setMessage("")}>{message}<span>ปิด</span></button>}

      {step === "home" && (
        <div className={styles.home}>
          <section className={styles.greeting}><span>การบ้านประจำเดือน</span><h1>เปลี่ยนเคสจริง<br />ให้เป็นหลักฐานที่ใช้ได้</h1><p>ใช้รหัสเคส ถ่ายภาพ และเล่าข้อสังเกตด้วยเสียง โดยไม่ต้องกรอกข้อมูลยาว</p></section>
          <section className={styles.assignments}>
            <header><div><span>งานที่ต้องส่ง</span><h2>การบ้านของคุณ</h2></div><em>{list.assignments.filter((item) => item.status === "Open").length} รายการ</em></header>
            {list.assignments.map((assignment) => (
              <article key={assignment.id}>
                <div><span>{assignment.period_key || "รอบปัจจุบัน"}</span><h3>{assignment.title}</h3><p>{assignment.instructions || "ส่งเคสที่มีข้อมูลก่อนและหลังครบถ้วน"}</p></div>
                <dl><div><dt>จำนวน</dt><dd>{assignment.required_case_count || 1} เคส</dd></div><div><dt>กำหนดส่ง</dt><dd>{friendlyDate(assignment.due_at)}</dd></div></dl>
                <button disabled={assignment.status !== "Open"} onClick={() => begin(assignment)}>เริ่มส่งผลลัพธ์</button>
              </article>
            ))}
            {!list.assignments.length && <p className={styles.empty}>ยังไม่มีการบ้านที่เปิดให้ส่ง</p>}
          </section>
          <section className={styles.recent}><span>เคสล่าสุด</span>{list.cases.slice(0, 4).map((item) => <div key={item.id}><strong>{item.case_reference || item.id}</strong><small>{item.concern_code || "ยังไม่ระบุเป้าหมาย"}</small><em>{item.status}</em></div>)}</section>
        </div>
      )}

      {step === "case" && (
        <form className={styles.formPage} onSubmit={saveCase}>
          <div className={styles.title}><span>ขั้นที่ 1</span><h1>ข้อมูลเคส</h1><p>ไม่ต้องใส่ชื่อ เบอร์โทร หรือข้อมูลที่ระบุตัวผู้รับบริการ</p></div>
          <label><span>รหัสเคส</span><input value={caseReference} onChange={(event) => setCaseReference(event.target.value.toUpperCase())} required pattern="[A-Za-z0-9_-]+" /><small>ใช้ตัวอักษรอังกฤษ ตัวเลข ขีดกลาง หรือขีดล่าง</small></label>
          <div className={styles.twoFields}><label><span>ช่วงอายุ</span><select value={ageBand} onChange={(event) => setAgeBand(event.target.value)}><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option><option>55–64</option><option>65+</option></select></label><label><span>จำนวนครั้ง</span><input type="number" min="1" max="99" value={sessionCount} onChange={(event) => setSessionCount(Number(event.target.value))} /></label></div>
          <label><span>เป้าหมายหลัก</span><select value={concernCode} onChange={(event) => setConcernCode(event.target.value)}><option>Body contouring</option><option>Cellulite appearance</option><option>Facial contouring</option><option>Tissue comfort</option><option>Post-procedure care</option><option>Other approved use</option></select></label>
          <label><span>รหัส Protocol</span><input value={protocolCode} onChange={(event) => setProtocolCode(event.target.value)} placeholder="เช่น BODY-01" required /></label>
          <label><span>โปรแกรมที่ใช้</span><input value={programCodes} onChange={(event) => setProgramCodes(event.target.value)} placeholder="คั่นหลายโปรแกรมด้วยเครื่องหมายจุลภาค" /></label>
          <div className={styles.twoFields}><label><span>วันที่เริ่มต้น</span><input type="date" value={baselineDate} onChange={(event) => setBaselineDate(event.target.value)} /></label><label><span>วันที่ติดตามผล</span><input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} /></label></div>
          <label><span>ประเภทค่าที่วัด</span><select value={measureType} onChange={(event) => setMeasureType(event.target.value)}><option>Circumference</option><option>Weight</option><option>3D volume</option><option>Skin measurement</option><option>Symptom score</option><option>Other</option></select></label>
          <div className={styles.measureFields}><label><span>ก่อนทำ</span><input inputMode="decimal" value={beforeValue} onChange={(event) => setBeforeValue(event.target.value)} /></label><label><span>หลังทำ</span><input inputMode="decimal" value={afterValue} onChange={(event) => setAfterValue(event.target.value)} /></label><label><span>หน่วย</span><input value={measureUnit} onChange={(event) => setMeasureUnit(event.target.value)} /></label></div>
          <label><span>คะแนนความพึงพอใจที่ผู้รับบริการแจ้ง</span><select value={customerRating} onChange={(event) => setCustomerRating(event.target.value)}><option value="">ยังไม่ได้ประเมิน</option><option value="1">1 — น้อยมาก</option><option value="2">2 — น้อย</option><option value="3">3 — ปานกลาง</option><option value="4">4 — ดี</option><option value="5">5 — ดีมาก</option></select></label>
          <footer><button type="button" onClick={() => setStep("home")}>กลับ</button><button disabled={busy} type="submit">{busy ? "กำลังบันทึก…" : "บันทึกและถ่ายภาพ"}</button></footer>
        </form>
      )}

      {step === "photos" && (
        <section className={styles.formPage}>
          <div className={styles.title}><span>ขั้นที่ 2</span><h1>ภาพก่อนและหลัง</h1><p>ใช้มุม ระยะ และแสงใกล้เคียงกัน ภาพจะถูกเก็บในพื้นที่จำกัดสิทธิ์</p></div>
          <div className={styles.photoGrid}>
            <label className={beforePhoto ? styles.hasFile : ""}><b>ก่อนทำ</b><span>{beforePhoto ? beforePhoto.name : "แตะเพื่อเปิดกล้องหรือเลือกภาพ"}</span><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setBeforePhoto(event.target.files?.[0] || null)} /></label>
            <label className={afterPhoto ? styles.hasFile : ""}><b>หลังทำ</b><span>{afterPhoto ? afterPhoto.name : "แตะเพื่อเปิดกล้องหรือเลือกภาพ"}</span><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => setAfterPhoto(event.target.files?.[0] || null)} /></label>
          </div>
          <aside className={styles.tip}><strong>ก่อนถ่าย</strong><p>วางเครื่องหมายตำแหน่งยืน · ใช้ฉากหลังเดิม · ไม่ปรับแต่งภาพ · หลีกเลี่ยงข้อมูลระบุตัวตน</p></aside>
          <footer><button onClick={() => setStep("case")}>กลับ</button><button disabled={busy} onClick={savePhotos}>{busy ? "กำลังอัปโหลด…" : "บันทึกภาพและไปต่อ"}</button></footer>
        </section>
      )}

      {step === "voice" && (
        <section className={styles.formPage}>
          <div className={styles.title}><span>ขั้นที่ 3</span><h1>เล่าข้อสังเกต</h1><p>พูด 60–90 วินาทีตามหัวข้อ แล้วตรวจข้อความสรุปก่อนส่ง</p></div>
          <ol className={styles.prompts}><li>ผู้รับบริการต้องการแก้ปัญหาอะไร</li><li>ใช้โปรแกรมและจำนวนครั้งเท่าใด</li><li>เห็นการเปลี่ยนแปลงอะไรที่วัดหรือสังเกตได้</li><li>มีข้อจำกัดหรือเหตุการณ์ไม่พึงประสงค์หรือไม่</li></ol>
          <button className={recording ? styles.recording : styles.record} onClick={toggleRecording}><i />{recording ? "แตะเพื่อหยุดอัดเสียง" : voiceFile ? "อัดเสียงใหม่" : "เริ่มอัดเสียง"}</button>
          {voiceFile && <p className={styles.fileReady}>มีไฟล์เสียงพร้อมส่ง · {Math.ceil(voiceFile.size / 1024)} KB</p>}
          <label><span>ข้อความสรุปที่ตรวจแล้ว</span><textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="ระบบถอดเสียงจะเติมข้อความในช่องนี้ เมื่อเชื่อมบริการถอดเสียงแล้ว ขณะนี้สามารถพิมพ์หรือแก้ไขเองได้" /></label>
          <footer><button onClick={() => setStep("photos")}>กลับ</button><button disabled={busy} onClick={saveVoice}>{busy ? "กำลังบันทึก…" : "บันทึกและตรวจความยินยอม"}</button></footer>
        </section>
      )}

      {step === "consent" && (
        <section className={styles.formPage}>
          <div className={styles.title}><span>ขั้นที่ 4</span><h1>ตรวจและส่ง</h1><p>การเก็บเพื่อดูแลภายในกับการนำไปเผยแพร่เป็นคนละการอนุญาต</p></div>
          <div className={styles.summary}><div><span>รหัสเคส</span><strong>{caseReference}</strong></div><div><span>เป้าหมาย</span><strong>{concernCode}</strong></div><div><span>จำนวนครั้ง</span><strong>{sessionCount}</strong></div><div><span>ไฟล์</span><strong>ภาพ 2 · เสียง {voiceFile ? 1 : 0}</strong></div></div>
          <label className={styles.consent}><input type="checkbox" checked={internalConsent} onChange={(event) => setInternalConsent(event.target.checked)} /><span><strong>ยินยอมให้บันทึกและตรวจสอบภายใน</strong><small>ใช้เพื่อประเมินผลลัพธ์ ปรับการฝึกอบรม และพัฒนาคุณภาพ โดยใช้รหัสเคส</small></span></label>
          <label className={styles.consent}><input type="checkbox" checked={publicationConsent} onChange={(event) => setPublicationConsent(event.target.checked)} /><span><strong>ยินยอมให้นำข้อมูลที่ปกปิดตัวตนไปใช้ภายนอก</strong><small>ใช้ใน Result Book หรือเนื้อหาที่ผ่านการอนุมัติ สามารถปฏิเสธข้อนี้และยังส่งการบ้านได้</small></span></label>
          <footer><button onClick={() => setStep("voice")}>กลับ</button><button disabled={busy || !internalConsent} onClick={submit}>{busy ? "กำลังส่ง…" : "ยืนยันและส่งตรวจ"}</button></footer>
        </section>
      )}

      {step === "done" && (
        <section className={styles.done}><b>✓</b><span>ส่งการบ้านแล้ว</span><h1>ข้อมูลเข้าสู่คิวตรวจสอบ</h1><p>ผู้จัดการหรือ BIB สามารถขอข้อมูลเพิ่มก่อนอนุมัติเข้า Result Book ได้</p><button onClick={() => { setStep("home"); setCaseId(""); setBeforePhoto(null); setAfterPhoto(null); setVoiceFile(null); }}>กลับหน้าหลัก</button></section>
      )}
    </main>
  );
}
