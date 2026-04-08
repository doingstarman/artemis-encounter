// Official Artemis II mission stages with approximate T+ start times.
// Based on NASA's published mission timeline for the free-return lunar flyby.
export type ArtemisMissionStage = {
  id: string;
  label: string;
  startMs: number; // mission elapsed time (T+) in milliseconds at stage start
};

export const ARTEMIS2_STAGES: ArtemisMissionStage[] = [
  { id: "launch",     label: "Запуск",                startMs: 0 },
  { id: "maxq",       label: "Макс. давление",         startMs: 63_000 },      // T+1:03
  { id: "srb_sep",    label: "Отделение SRB",          startMs: 132_000 },     // T+2:12
  { id: "beco",       label: "Отделение ступени",      startMs: 492_000 },     // T+8:12
  { id: "parking",    label: "Орбита Земли",           startMs: 565_000 },     // T+9:25
  { id: "tli",        label: "Манёвр TLI",             startMs: 5_816_000 },   // T+1ч 36м
  { id: "tl_coast",   label: "Транслунный перелёт",    startMs: 6_000_000 },   // T+1ч 40м
  { id: "perilune",   label: "Облёт Луны",             startMs: 354_600_000 }, // T+4д 2ч 30м
  { id: "te_coast",   label: "Возвращение",            startMs: 369_000_000 }, // T+4д 6ч 30м
  { id: "cm_sep",     label: "Разделение модулей",     startMs: 856_800_000 }, // T+9д 22ч
  { id: "reentry",    label: "Вход в атмосферу",       startMs: 857_100_000 }, // T+9д 22ч 5м
  { id: "splashdown", label: "Приводнение",            startMs: 864_000_000 }, // T+10д
];

export function getCurrentStageIndex(elapsedMs: number): number {
  let idx = 0;
  for (let i = 0; i < ARTEMIS2_STAGES.length; i++) {
    if (elapsedMs >= ARTEMIS2_STAGES[i].startMs) idx = i;
    else break;
  }
  return idx;
}

export function fmtTPlus(ms: number): string {
  const totalSec = Math.floor(Math.abs(ms) / 1000);
  const d = Math.floor(totalSec / 86_400);
  const h = Math.floor((totalSec % 86_400) / 3_600);
  const m = Math.floor((totalSec % 3_600) / 60);
  const s = totalSec % 60;
  const hms = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return d > 0 ? `T+${d}д ${hms}` : `T+${hms}`;
}
