"use client";
export function Tag({ children, tone = "line" }: { children: React.ReactNode; tone?: "line" | "rose" | "ink" | "warn" | "good" }) {
  const cls = {
    line: "border-line text-ink-2 bg-card",
    rose: "border-rose text-ink bg-rose-soft",
    ink: "border-ink text-paper bg-ink",
    warn: "border-warn text-warn bg-card",
    good: "border-good text-good bg-card",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-5 ${cls}`}>{children}</span>;
}
/** ป้ายสถานะ · เห็นเฉพาะโหมดภายใน */
export function Status({ show, children }: { show: boolean; children: React.ReactNode }) {
  return show ? <Tag tone="warn">{children}</Tag> : null;
}
export function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-t border-line py-2 text-sm">
      <dt className="text-muted">{k}</dt>
      <dd className="m-0 min-w-0 whitespace-pre-line break-words text-ink">{children}</dd>
    </div>
  );
}
export function Sheet({ title, kicker, onClose, children }: { title: string; kicker?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="h-full w-full max-w-[460px] overflow-y-auto bg-paper p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {kicker ? <p className="text-[11px] text-muted">{kicker}</p> : null}
            <h3 className="m-0 text-2xl font-semibold leading-tight text-ink">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-line px-3 py-1 text-sm text-ink-2 hover:border-ink">ปิด</button>
        </div>
        {children}
      </div>
    </div>
  );
}
