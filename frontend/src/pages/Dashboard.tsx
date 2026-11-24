import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getUser, CATEGORY_LABELS } from '../lib/api';
import { useSemester } from '../lib/semester';
import { GradeBadge } from '../components/chrome';
import { JOURNAL_SKILLS, WEAKNESS_UNITS } from '../lib/skills';

const BANDS = ['RED', 'YELLOW', 'GREEN', 'BLUE'] as const;

function bandOf(recent: any[]): string {
  const rank: Record<string, number> = { RED: 0, YELLOW: 1, GREEN: 2, BLUE: 3 };
  if (!recent.length) return 'RED';
  const avg = recent.slice(0, 10).reduce((n, a) => n + (rank[a.grade] ?? 0), 0) / Math.min(10, recent.length);
  return BANDS[Math.max(0, Math.min(3, Math.round(avg)))];
}

function Journey({ totals, band }: { totals: any; band: string }) {
  const idx = BANDS.indexOf(band as any);
  const good = (totals?.GREEN ?? 0) + (totals?.BLUE ?? 0);
  const all = (totals?.RED ?? 0) + (totals?.YELLOW ?? 0) + good;
  // Width reflects real GREEN+BLUE share, pinned to the current band marker.
  const pct = all > 0 ? Math.round(8 + (92 * good) / all) : [8, 38, 68, 100][Math.max(0, idx)];
  const colors = ['var(--red)', 'var(--yellow-fg)', 'var(--green)', 'var(--blue)'];
  return (
    <div className="ascent" role="img" aria-label={`Writing journey: you are at ${band}`}>
      <div className="ascent-track">
        <div className="ascent-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="ascent-nodes">
        {BANDS.map((b, i) => (
          <div
            key={b}
            className={`ascent-node${i < idx ? ' lit' : ''}${i === idx ? ' lit now' : ''}`}
            style={i <= idx ? { color: colors[i] } : undefined}
          >
            <div className="an-name">{b}</div>
            <div className="an-sub fine-num">{totals?.[b] ?? 0} attempts{i === idx ? ' · YOU' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusLine({ context, band, attempts, weakest }: { context: string; band: string; attempts: number; weakest: string | null }) {
  return (
    <p className="hero-stats" aria-label="Lab status">
      <span className="hs">{context}</span>
      <span className="hs"><strong>{band}</strong> current</span>
      <span className="hs"><strong className="fine-num">{attempts}</strong> attempts</span>
      {weakest && <span className="hs">weakest: <strong>{weakest}</strong></span>}
    </p>
  );
}

export function Dashboard() {
  const user = getUser();
  const [data, setData] = useState<any>(null);
  const [academy, setAcademy] = useState<any>(null);
  const [paper, setPaper] = useState<any>(null);
  const [error, setError] = useState('');
  const { scope, qs } = useSemester();

  useEffect(() => {
    setData(null);
    api.get(`/api/progress?${qs}`).then(setData).catch((e) => setError(e.message));
    api.get('/api/academy/overview').then(setAcademy).catch(() => {});
    api.get('/api/research').then((d) => setPaper((d.projects ?? [])[0] ?? null)).catch(() => {});
  }, [qs]);

  const recent = data?.recent_attempts ?? [];
  const band = bandOf(recent);
  const nextBand = BANDS[Math.min(3, BANDS.indexOf(band as any) + 1)];
  const rec = data?.recommendation;
  const skills: Record<string, { rate: number | null; n: number }> = data?.journal_skills ?? {};
  const topWeakCode: string | null = (data?.weaknesses ?? [])[0]?.code ?? null;
  const weakUnit = topWeakCode ? WEAKNESS_UNITS[topWeakCode] : null;
  const weakestSkill = JOURNAL_SKILLS.map((s) => ({ ...s, ...(skills[s.key] ?? { rate: null, n: 0 }) }))
    .filter((s) => s.rate != null)
    .sort((a, b) => (a.rate ?? 0) - (b.rate ?? 0))[0];

  function paperStatus() {
    if (!paper) return null;
    const secs = ['title', 'research_question', 'background', 'hypothesis', 'methods', 'results', 'discussion', 'conclusion', 'references_text'];
    const filled = secs.filter((s) => (paper[s] ?? '').trim().length > 0).length;
    const sources = Array.isArray(paper.sources) ? paper.sources.length : 0;
    const next = !paper.research_question?.trim() ? 'State your research question'
      : !paper.methods?.trim() ? 'Draft your methods'
      : !paper.results?.trim() ? 'Record your results'
      : !paper.discussion?.trim() ? 'Interpret in the discussion'
      : !paper.references_text?.trim() ? 'Complete your references'
      : 'Review and finalize';
    return { filled, total: secs.length, sources, next };
  }
  const ps = paperStatus();

  return (
    <div>
      {/* HERO — status first, not greeting */}
      <section aria-label="Your writing lab">
        <h1 className="hero-display" style={{ marginTop: 0 }}>Build stronger answers, one revision at a time.</h1>
        <StatusLine
          context={`G${scope.grade} S${scope.semester}`}
          band={band}
          attempts={data?.totals.attempts ?? 0}
          weakest={weakestSkill ? weakestSkill.label : null}
        />
        <p className="muted" style={{ maxWidth: 640 }}>
          Practice a journal response, inspect the rubric, revise your weaknesses, and move toward BLUE.
          {user?.display_name ? <> Signed in as <strong>{user.display_name}</strong>.</> : null}
        </p>
        <div className="btn-row">
          <Link className="btn btn-primary" to="/practice">Start Practice</Link>
          <Link className="btn" to="/mock">Mock Journal</Link>
          <Link className="btn" to="/analyze">Analyze PDF</Link>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
      </section>

      {data && (
        <>
          {/* JOURNEY */}
          <section className="doc-sheet" style={{ marginTop: 20 }} aria-label="Your writing journey">
            <p className="section-label">Your journey — RED → BLUE</p>
            <Journey totals={data.totals} band={band} />
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              Current level: <GradeBadge grade={band} />
              {band !== 'BLUE' && <span> — next target: <GradeBadge grade={nextBand} /></span>}
            </p>
          </section>

          {/* NEXT MOVE */}
          <section className="doc-sheet" style={{ marginTop: 16 }} aria-label="Your next move">
            <p className="section-label">Your next move</p>
            {rec ? (
              <>
                <p style={{ marginTop: 0 }}>
                  <strong>Focus: {CATEGORY_LABELS[rec.focus_category] ?? rec.focus_category}</strong> — {rec.reason}
                </p>
                <p className="small muted">{rec.practice_tip}</p>
                <div className="btn-row">
                  {rec.suggested_question ? (
                    <Link className="btn btn-primary" to={`/question/${rec.suggested_question.id}`}>Practice this</Link>
                  ) : (
                    <Link className="btn btn-primary" to="/practice">Practice this</Link>
                  )}
                  {weakUnit && (
                    <Link className="btn btn-ghost btn-small" to={`/academy/${weakUnit.slug}`}>Learn: {weakUnit.title}</Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <p style={{ marginTop: 0 }}><strong>You have not completed a journal yet.</strong></p>
                <p className="small">One prompt. Two minutes. Immediate rubric feedback — then write, get coached, revise, retry.</p>
                <div className="btn-row">
                  <Link className="btn btn-primary" to="/practice">Start your first journal</Link>
                  <Link className="btn" to="/analyze">Analyze a PDF</Link>
                </div>
              </>
            )}
          </section>

          {/* SKILLS */}
          {weakestSkill && (
            <section className="doc-sheet" style={{ marginTop: 16 }} aria-label="Your skills">
              <p className="section-label">Your skills — from real coverage data</p>
              <div className="cat-rows">
                {JOURNAL_SKILLS.map((s) => {
                  const v = skills[s.key];
                  const pct = v?.rate == null ? null : Math.round(v.rate * 100);
                  return (
                    <div className="cat-row" key={s.key}>
                      <div className="cat-top">
                        <span className="cat-name" title={s.hint}>{s.label}</span>
                        <span className="cat-meta fine-num">{pct == null ? 'no data yet' : `${pct}% covered`}</span>
                      </div>
                      <div className="bar" role="img" aria-label={`${s.label}: ${pct == null ? 'no data' : `${pct} percent`}`}>
                        <span className="bar-fill is-mixed" style={{ width: `${pct ?? 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* RECENT WORK */}
          {recent.length > 0 && (
            <section className="doc-sheet" style={{ marginTop: 16 }} aria-label="Recent work">
              <p className="section-label">Recent work</p>
              <div className="timeline-v">
                {recent.slice(0, 3).map((a: any) => (
                  <div className="tl-item" key={a.id}>
                    <div className="tl-date">{new Date(a.submitted_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div>
                      <Link to={`/attempt/${a.id}`}>Journal #{a.attempt_number} — {CATEGORY_LABELS[a.category]}</Link>{' '}
                      <span className="tl-grade" style={{ color: `var(--${a.grade.toLowerCase()}-fg)` }}>{a.grade}</span>{' '}
                      <span className="small muted">{a.preview}…</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ACADEMY + LAB */}
          <section style={{ marginTop: 16 }} className="grid-2" aria-label="Continue learning">
            <div className="doc-sheet">
              <p className="section-label">Academic writing — continue</p>
              {academy?.continue ? (
                <>
                  <p style={{ marginTop: 0 }}><strong>{academy.continue.lesson_title}</strong></p>
                  <p className="small muted">{academy.continue.unit_title} · {academy.progress.completed}/{academy.progress.total} units complete</p>
                  <div className="btn-row">
                    <Link className="btn btn-primary btn-small" to={`/academy/${academy.continue.unit_slug}?lesson=${academy.continue.lesson_id}`}>Continue lesson →</Link>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ marginTop: 0 }}>Learn the skills behind BLUE answers — 16 units, real practice, honest quizzes.</p>
                  <div className="btn-row"><Link className="btn btn-primary btn-small" to="/academy">Open Academy</Link></div>
                </>
              )}
            </div>
            <div className="doc-sheet">
              <p className="section-label">Research Paper Lab</p>
              {ps ? (
                <>
                  <p style={{ marginTop: 0 }}><strong>{paper.title || 'Untitled research'}</strong></p>
                  <p className="small muted">{ps.filled}/{ps.total} sections drafted · {ps.sources} sources</p>
                  <p className="small"><strong>Next:</strong> {ps.next}</p>
                  <div className="btn-row"><Link className="btn btn-primary btn-small" to={`/lab/${paper.id}`}>Open paper →</Link></div>
                </>
              ) : (
                <>
                  <p style={{ marginTop: 0 }}>Turn journal skills into a real paper, section by section.</p>
                  <div className="btn-row"><Link className="btn btn-primary btn-small" to="/lab">Open Lab</Link></div>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
