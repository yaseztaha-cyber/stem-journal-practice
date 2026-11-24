import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CATEGORY_LABELS } from '../lib/api';
import { useSemester } from '../lib/semester';
import { GradeBadge } from '../components/chrome';
import { JOURNAL_SKILLS, WEAKNESS_UNITS } from '../lib/skills';
import { StatCards, CategoryBars, EmptyProgress } from '../components/stats';

export function Progress() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [academy, setAcademy] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const { scope, qs } = useSemester();

  useEffect(() => {
    setData(null);
    setError('');
    api.get(`/api/progress?${qs}`).then(setData).catch((e) => setError(e.message));
    api.get('/api/academy/overview').then(setAcademy).catch(() => {});
    api.get('/api/academy/reflections').then((d) => setReflections(d.reflections ?? [])).catch(() => {});
  }, [qs]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p className="muted">Loading progress…</p>;

  const trend = data.trend;
  const goodRate = trend.recent_good_rate == null ? null : Math.round(trend.recent_good_rate * 100);
  const trendText =
    trend.recent_good_rate == null
      ? 'Answer a few questions to see your trend.'
      : trend.previous_good_rate == null
        ? `${goodRate}% of your recent answers reached GREEN or BLUE.`
        : trend.recent_good_rate > trend.previous_good_rate
          ? 'More BLUE/GREEN answers than before — you are improving.'
          : trend.recent_good_rate < trend.previous_good_rate
            ? 'Fewer BLUE/GREEN answers recently — review your feedback and retry.'
            : 'Steady performance — push one category to BLUE.';

  return (
    <div>
      <p className="eyebrow">Progress · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>What am I good at? What needs work?</h1>
      <p className="small muted">Showing this semester only — <Link to="/semester">change semester</Link>.</p>

      {data.totals.attempts === 0 ? (
        <EmptyProgress title="Your journey starts here" />
      ) : (
        <>
          <StatCards totals={data.totals} />
          <p className="small muted">{data.totals.attempts} attempts · {data.totals.questions_completed} questions completed · {trendText}</p>
          <section className="card" style={{ marginTop: 12 }} aria-label="Journal snapshot">
            <p className="section-label">Journal snapshot — latest level per slot</p>
            <ol className="rank-strip">
              {[1, 2, 3, 4].map((n) => {
                const s = (data.slot_profile ?? {})[`Q${n}`];
                return (
                  <li key={n} data-grade={s?.grade ?? ''}>
                    <span className="rank-q">Q{n}</span>
                    <span className="rank-cat">{s ? CATEGORY_LABELS[s.category] ?? s.category : 'Not answered yet'}</span>
                    {s ? <GradeBadge grade={s.grade} /> : <span className="muted small">—</span>}
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      {data.totals.attempts > 0 && goodRate != null && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="eyebrow dim">Recent answers at GREEN or BLUE</p>
          <div className="level-progress">
            <div className="lp-track" aria-label={`${goodRate}% of recent answers reach GREEN or BLUE`}>
              <div className="lp-seg filled lp-seg--GREEN" style={{ width: `${goodRate}%` }} />
              <div className="lp-seg" style={{ width: `${100 - goodRate}%` }} />
            </div>
            <div className="lp-caption"><span>{goodRate}% achieved</span><span>target ≥ 60%</span></div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="eyebrow dim">Journal skills — growth, not activity</p>
          <div className="cat-rows">
            {JOURNAL_SKILLS.map((s) => {
              const v = (data.journal_skills ?? {})[s.key] as { rate: number | null; n: number } | undefined;
              const pct = v?.rate == null ? null : Math.round(v.rate * 100);
              return (
                <div className="cat-row" key={s.key}>
                  <div className="cat-top">
                    <span className="cat-name" title={s.hint}>{s.label}</span>
                    <span className="cat-meta fine-num">{pct == null ? 'no data yet' : `${pct}% solid`}</span>
                  </div>
                  <div className="bar" role="img" aria-label={`${s.label}: ${pct == null ? 'no data' : `${pct} percent`}`}>
                    <span className="bar-fill is-mixed" style={{ width: `${pct ?? 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {(() => {
            const rated = JOURNAL_SKILLS.map((s) => ({ ...s, v: (data.journal_skills ?? {})[s.key] })).filter((s) => s.v?.rate != null);
            if (!rated.length) return <p className="small muted">Answer a journal to grow these bars.</p>;
            const best = [...rated].sort((a, b) => (b.v.rate ?? 0) - (a.v.rate ?? 0))[0];
            const worst = [...rated].sort((a, b) => (a.v.rate ?? 0) - (b.v.rate ?? 0))[0];
            return (
              <p className="small" style={{ margin: '10px 0 0' }}>
                <strong>Strongest skill:</strong> {best.label} · <strong>Next skill:</strong> {worst.label}
              </p>
            );
          })()}
        </div>
        <div className="card">
          <p className="eyebrow dim">Mastery map</p>
          {(() => {
            const dims = ['evidence', 'explanation', 'specificity'] as const;
            const labels: Record<string, string> = { evidence: 'EVIDENCE', explanation: 'EXPLANATION', specificity: 'SPECIFICITY' };
            const skills = data.journal_skills ?? {};
            function level(rate: number | null): { color: string; word: string } {
              if (rate == null) return { color: 'var(--border-strong)', word: 'no data' };
              if (rate >= 0.8) return { color: 'var(--blue-fg)', word: 'strong' };
              if (rate >= 0.5) return { color: 'var(--green-fg)', word: 'growing' };
              return { color: 'var(--yellow-fg)', word: 'needs work' };
            }
            return (
              <>
                <div className="mastery-map" aria-label="Skill mastery map">
                  <div className="mm-node">
                    <span className="dot" style={{ background: level(skills.evidence?.rate ?? null).color }} aria-hidden="true" /> EVIDENCE
                    <span className="small muted"> {level(skills.evidence?.rate ?? null).word}</span>
                  </div>
                  <div className="mm-row">
                    {(['explanation', 'specificity'] as const).map((k) => (
                      <div className="mm-node" key={k}>
                        <span className="dot" style={{ background: level(skills[k]?.rate ?? null).color }} aria-hidden="true" /> {labels[k]}
                        <span className="small muted"> {level(skills[k]?.rate ?? null).word}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mm-link" aria-hidden="true">↓</div>
                  <div className="mm-node">JOURNAL</div>
                  <div className="mm-link" aria-hidden="true">↓</div>
                  <div className="mm-node mm-goal">BLUE</div>
                </div>
                <p className="small muted">Dot color and word come from your real coverage data — {dims.filter((k) => (skills[k]?.rate ?? null) == null).length === 0 ? 'all three measured.' : 'answer more journals to measure every node.'}</p>
              </>
            );
          })()}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow dim">Your writing patterns</p>
        {data.weaknesses.length === 0 ? <p className="small muted">No patterns yet — keep practicing.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Pattern</th><th>Issues</th><th></th></tr></thead>
              <tbody>
                {data.weaknesses.map((w: any) => {
                  const u = WEAKNESS_UNITS[w.code];
                  return (
                    <tr key={w.code}>
                      <td>{w.label}</td>
                      <td className="fine-num">{w.occurrences}</td>
                      <td>{u ? <Link to={`/academy/${u.slug}`}>Practice this weakness</Link> : <span className="muted">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="eyebrow dim">Category performance</p>
          <CategoryBars byCategory={data.by_category} />
        </div>
        <div className="card">
          <p className="eyebrow dim">Most common weaknesses</p>
          {data.weaknesses.length === 0 ? <p className="small muted">No patterns yet — keep practicing.</p> : (
            <ul className="small">
              {data.weaknesses.map((w: any) => <li key={w.code}><strong>{w.label}</strong> — seen {w.occurrences}×</li>)}
            </ul>
          )}
          {data.recommendation && (
            <>
              <p className="eyebrow dim" style={{ marginTop: 16 }}>Recommended practice</p>
              <p><strong>{CATEGORY_LABELS[data.recommendation.focus_category]}</strong> — {data.recommendation.reason}</p>
              <p className="small muted">{data.recommendation.practice_tip}</p>
              <Link className="btn btn-primary" to="/practice">Practice now</Link>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow dim">Academic writing skills</p>
        {academy ? (
          <>
            <p className="small muted" style={{ marginTop: 0 }}>
              {academy.progress.completed}/{academy.progress.total} units complete
              {academy.strongest && <> · 💪 <strong>{academy.strongest.label}</strong> mastered</>}
              {academy.weakest && academy.weakest.pct != null && <> · 🎯 work on <strong>{academy.weakest.label}</strong> ({academy.weakest.pct}%)</>}
            </p>
            <div className="cat-rows">
              {(academy.skills ?? []).map((s: any) => (
                <div className="cat-row" key={s.skill}>
                  <div className="cat-top">
                    <span className="cat-name">{s.label}</span>
                    <span className="cat-meta">
                      <span className={`grade-chip grade-${s.status === 'MASTERED' ? 'GREEN' : s.status === 'UNDERSTOOD' ? 'BLUE' : s.status === 'PRACTICING' ? 'YELLOW' : 'RED'}`}>{s.status.replace('_', ' ')}</span>
                      <span className="fine-num">{s.pct == null ? '—' : `${s.pct}%`}</span>
                    </span>
                  </div>
                  <div className="bar" role="img" aria-label={`${s.label}: ${s.pct == null ? 'not started' : `${s.pct} percent`}`}>
                    <span className="bar-fill is-mixed" style={{ width: `${s.pct ?? 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            {academy.continue && (
              <div className="btn-row">
                <Link className="btn btn-primary btn-small" to={`/academy/${academy.continue.unit_slug}?lesson=${academy.continue.lesson_id}`}>
                  Continue — {academy.continue.lesson_title} →
                </Link>
                <Link className="btn btn-ghost btn-small" to="/academy">Course home</Link>
              </div>
            )}
            {reflections.length > 0 && (
              <>
                <p className="eyebrow dim" style={{ marginTop: 16 }}>Your recent reflections</p>
                <ul className="small">
                  {reflections.slice(0, 4).map((r: any) => (
                    <li key={r.key}>“{r.body}”</li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p className="small muted">Loading academy data…</p>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow dim">Improvement history</p>
        {data.recent_attempts.length === 0 ? <p className="small muted">No attempts yet.</p> : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Date</th><th>Category</th><th>Attempt</th><th>Result</th><th>Change</th><th></th></tr></thead>
              <tbody>
                {data.recent_attempts.map((a: any) => (
                  <tr key={a.id}>
                    <td className="small">{new Date(a.submitted_at).toLocaleDateString()}</td>
                    <td className="small">{CATEGORY_LABELS[a.category]}</td>
                    <td className="fine-num">#{a.attempt_number}</td>
                    <td><GradeBadge grade={a.grade} /></td>
                    <td className="small">{a.improvement_from_previous}</td>
                    <td><Link to={`/attempt/${a.id}`}>Review</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
