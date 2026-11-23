"use client";
import { PROGRAM_ICON } from "@/lib/assets";
import { PROGRAM_GROUP_COLOR, type ProgramGroup } from "@/lib/programs";
import type { Program } from "@/lib/bodymap/data";

const GROUP: Record<string, ProgramGroup> = { base: "Base", focus: "Focus", healthcare: "Healthcare" };

/** ไอคอน 1 ตัวต่อ 1 โปรแกรม · กุญแจ = Program ID · ชื่อตามหน้าจอเครื่อง */
export default function ProgramIcon({
  program, minutes, showMinutes, onOpen,
}: { program: Program; minutes?: number | null; showMinutes?: boolean; onOpen: (id: string) => void }) {
  const group = GROUP[program.group.toLowerCase()];
  const color = group ? PROGRAM_GROUP_COLOR[group] : "#E4DCCD";
  const icon = PROGRAM_ICON[program.name];
  return (
    <button
      type="button"
      onClick={() => onOpen(program.id)}
      data-program={program.id}
      className="flex w-[84px] flex-col items-center gap-1 rounded-xl p-1.5 text-center transition hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose"
      aria-label={`เปิดรายละเอียดโปรแกรม ${program.name}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-lg border-2 bg-white" style={{ borderColor: color }}>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={icon} alt="" className="h-12 w-12 object-contain" />
        ) : (
          <span className="font-mono text-[10px] text-ink">{program.id.slice(4)}</span>
        )}
      </span>
      <span className="font-mono text-[10px] leading-tight text-ink">{program.name}</span>
      {showMinutes ? (
        <span className="text-[11px] leading-none text-muted">{minutes != null ? `${minutes} นาที` : "— นาที"}</span>
      ) : null}
    </button>
  );
}
