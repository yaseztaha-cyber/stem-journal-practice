import { createContext, useContext, useState, type ReactNode } from 'react';

export interface SemesterScope {
  grade: number;
  semester: number;
}

export const GRADES = [10, 11, 12];
export const SEMESTERS = [1, 2];

const KEY = 'sjp_context';

export function contextLabel(scope: SemesterScope | null): string {
  if (!scope) return 'Choose semester';
  return `G${scope.grade} • S${scope.semester}`;
}

function load(): SemesterScope {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (GRADES.includes(p.grade) && SEMESTERS.includes(p.semester)) return { grade: p.grade, semester: p.semester };
    }
  } catch {
    /* ignore */
  }
  return { grade: 11, semester: 1 };
}

const Ctx = createContext<{ scope: SemesterScope; setScope: (s: SemesterScope) => void; qs: string }>({
  scope: { grade: 11, semester: 1 },
  setScope: () => {},
  qs: 'grade=11&semester=1',
});

export function SemesterProvider({ children }: { children: ReactNode }) {
  const [scope, setScopeState] = useState<SemesterScope>(load);
  function setScope(s: SemesterScope) {
    setScopeState(s);
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }
  const qs = `grade=${scope.grade}&semester=${scope.semester}`;
  return <Ctx.Provider value={{ scope, setScope, qs }}>{children}</Ctx.Provider>;
}

export function useSemester() {
  return useContext(Ctx);
}

const LOS_KEY = 'sjp_los';

export function loadLOs(): string[] {
  try {
    const raw = localStorage.getItem(LOS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string');
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveLOs(los: string[]) {
  try {
    localStorage.setItem(LOS_KEY, JSON.stringify(los));
  } catch {
    /* ignore */
  }
}

export function isOfficialSource(source: string): boolean {
  return source === 'official' || source === 'official_example' || source === 'official_adapted';
}

/** Honest source labeling (§10): never present practice material as official. */
export function sourceBadge(source: string): { text: string; official: boolean } {
  switch (source) {
    case 'official':
    case 'official_example':
      return { text: 'Official journal question', official: true };
    case 'official_adapted':
      return { text: 'Adapted from official', official: true };
    case 'teacher_created':
      return { text: 'Teacher-created', official: false };
    case 'admin_created':
      return { text: 'Admin-created', official: false };
    default:
      return { text: 'Practice question', official: false };
  }
}

export function slotLabel(slot: number | null | undefined): string | null {
  if (slot === 1) return 'Journal Q1 · Reflection / Teamwork';
  if (slot === 2) return 'Journal Q2 · EDP';
  if (slot === 3) return 'Journal Q3 · Transfer';
  if (slot === 4) return 'Journal Q4 · Transfer';
  return null;
}
