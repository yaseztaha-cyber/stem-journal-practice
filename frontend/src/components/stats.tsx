import { Link } from 'react-router-dom';
import { CATEGORY_LABELS } from '../lib/api';
import { GradeBadge } from './chrome';

const GRADES = ['BLUE', 'GREEN', 'YELLOW', 'RED'] as const;
type Grade = (typeof GRADES)[number];

const GRADE_ICONS: Record<Grade, string> = { BLUE: '💎', GREEN: '🌱', YELLOW: '🔧', RED: '🧱' };
const GRADE_HINTS: Record<Grade, string> = {
  BLUE: 'Excellent answers',
  GREEN: 'Good answers',
  YELLOW: 'Need work',
  RED: 'Major work left',
};
const GRADE_STROKE: Record<Grade, string> = {
  BLUE: 'var(--blue-fg)',
  GREEN: 'var(--green-fg)',
  YELLOW: '#CA8A04',
  RED: 'var(--red-fg)',
};

function Ring({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(1, Math.max(0, pct)));
  return (
    <svg className="ring" width="52" height="52" viewBox="0 0 52 52" role="img" aria-label={label}>
      <circle className="ring-bg" cx="26" cy="26" r={r} strokeWidth="6" />
      <circle
        className="ring-fg"
        cx="26" cy="26" r={r} strokeWidth="6"
        stroke={color}
        strokeDasharray={c}
        strokeDashoffset={off}
      />
    </svg>
  );
}

export function StatCards({ totals }: { totals: Record<string, number> & { attempts: number } }) {
  const total = GRADES.reduce((n, g) => n + (totals[g] ?? 0), 0);
  return (
    <div className="stat-row" aria-label="Overall rubric distribution">
      {GRADES.map((g) => {
        const count = totals[g] ?? 0;
        const pct = total ? count / total : 0;
        return (
          <div className="stat-card" key={g}>
            <Ring pct={pct} color={GRADE_STROKE[g]} label={`${g}: ${count} of ${total} graded answers`} />
            <div>
              <div className="s-num fine-num">{count}</div>
              <div className="s-cap">{GRADE_ICONS[g]} {g}</div>
              <div className="s-sub">{total ? `${Math.round(pct * 100)}% of answers` : GRADE_HINTS[g]}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryBars({ byCategory }: { byCategory: Record<string, any> }) {
  const cats = Object.values(byCategory ?? {});
  if (!cats.length) return null;
  return (
    <div className="cat-rows">
      {cats.map((c: any) => {
        const total = c.total_attempts ?? 0;
        const good = (c.blue_count ?? 0) + (c.green_count ?? 0);
        const pct = total ? Math.round((good / total) * 100) : 0;
        return (
          <div className="cat-row" key={c.category}>
            <div className="cat-top">
              <span className="cat-name">{CATEGORY_LABELS[c.category] ?? c.category}</span>
              <span className="cat-meta">
                {c.last_grade ? <GradeBadge grade={c.last_grade} /> : <span className="muted">not tried yet</span>}
                <span className="fine-num">{total} attempt{total === 1 ? '' : 's'} · {pct}% GREEN+</span>
              </span>
            </div>
            <div className="bar" role="img" aria-label={`${CATEGORY_LABELS[c.category] ?? c.category}: ${pct}% of answers at GREEN or BLUE`}>
              <span className="bar-fill is-mixed" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyProgress({ title = 'No attempts yet' }: { title?: string }) {
  return (
    <div className="empty">
      <div style={{ fontSize: 30 }} aria-hidden="true">🚀</div>
      <p style={{ margin: '8px 0 2px', fontWeight: 800, color: 'var(--ink)' }}>{title}</p>
      <p className="small muted" style={{ margin: '0 0 4px' }}>Your first answer takes two minutes — the coach does the rest.</p>
      <div className="empty-cta btn-row" style={{ justifyContent: 'center', marginTop: 8 }}>
        <Link className="btn btn-primary" to="/practice">Answer your first question</Link>
        <Link className="btn" to="/analyze">Or analyze a PDF</Link>
      </div>
    </div>
  );
}
