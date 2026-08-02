"use client";

import { useEffect } from "react";

export default function PlatformError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="v2-platform-error">
      <section>
        <span>ระบบปฏิบัติงาน BIB</span>
        <h1>เปิดหน้านี้ไม่สำเร็จ</h1>
        <p>ข้อมูลยังไม่สูญหาย กรุณาลองเปิดหน้าอีกครั้ง หรือกลับไปยังหน้าหลัก</p>
        <div>
          <button onClick={reset}>ลองเปิดอีกครั้ง</button>
          <a href="/platform">กลับหน้าหลัก</a>
        </div>
      </section>
    </main>
  );
}
