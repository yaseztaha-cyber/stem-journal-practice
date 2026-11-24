import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester } from '../lib/semester';

const TRACKS = [
  { id: 'ALL', label: 'All tracks' },
  { id: 'MINE', label: 'Core + my semester' },
  { id: 'CORE', label: 'Core' },
  { id: 'JOURNAL', label: 'Journal' },
  { id: 'RESEARCH', label: 'Research' },
] as const;

export function trackLabel(u: any): string {
  const t = u.track_scope ?? 'CORE';
  if (t === 'CORE') return 'Core';
  if (t === 'SEMESTER') return `Semester${u.grade != null ? ` G${u.grade}S${u.semester ?? ''}` : ''}`;
  return t.charAt(0) + t.slice(1).toLowerCase();
}
import { MiniMd, BlueCheck, ResearchQuestionBuilder, ExerciseRunner, QuizRunner } from '../components/academy';
import { SurgeryRunner, Breakdown, MasterChallenge, ReflectionBox, BluePath, SkillMap } from '../components/course';

const FRAMEWORK = [
  {
    grade: 'RED',
    meaning: 'Missing parts, vague, unsupported.',
    example: '“I learned teamwork.”',
    mistake: 'Answering a different question than the one asked.',
    checklist: ['Name every part of the question', 'Add one checkable fact', 'Say what happened first'],
    unit: 'strong-academic-answer',
  },
  {
    grade: 'YELLOW',
    meaning: 'Some useful content, but weak evidence or explanation.',
    example: '“We tested three designs and the second worked best.”',
    mistake: 'Evidence with no because-sentence behind it.',
    checklist: ['Add the cause', 'Add one measurement', 'Link back to the question'],
    unit: 'evidence-examples',
  },
  {
    grade: 'GREEN',
    meaning: 'Mostly complete and supported, but reasoning or precision wobbles.',
    example: '“Flow held 1.1 L/min after the gravel swap because coarse media resists surface sealing.”',
    mistake: 'Stopping before the reusable lesson.',
    checklist: ['State the lesson', 'Name who can reuse it', 'Cut one vague word'],
    unit: 'blue-method',
  },
  {
    grade: 'BLUE',
    meaning: 'Clear claim, specific evidence, strong explanation, meaningful analysis, precise language, full coverage.',
    example: '“…sizing pre-filters by debris type first — a rule any team fighting early clogging can copy.”',
    mistake: 'Overclaiming beyond what the evidence lifts.',
    checklist: ['Every part covered', 'Evidence checkable', 'Insight reusable by others'],
    unit: 'blue-masterclass',
  },
];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'available', label: 'Not started' },
  { id: 'completed', label: 'Completed · Mastered' },
  { id: 'practice', label: 'Needs practice' },
] as const;

function stateBadge(status: string | undefined): string {
  switch (status) {
    case 'completed': return 'grade-chip grade-BLUE';
    case 'in_progress': return 'grade-chip grade-GREEN';
    case 'available': return 'grade-chip grade-YELLOW';
    default: return 'tag';
  }
}

function stateLabel(status: string | undefined): string {
  switch (status) {
    case 'completed': return '● COMPLETED';
    case 'in_progress': return '● IN PROGRESS';
    case 'available': return '● AVAILABLE';
    default: return '🔒 LOCKED';
  }
}

function fmtDuration(sec: number): string {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AcademyHome() {
  const [overview, setOverview] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [cert, setCert] = useState<any>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get('/api/academy/overview').then((d) => {
      setOverview(d);
      setUnits(d.units ?? []);
    }).catch((e) => setError(e.message));
    api.get('/api/academy/recommendations').then((d) => setRecs(d.recommendations ?? [])).catch(() => {});
    api.get('/api/academy/certificate').then(setCert).catch(() => {});
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api.get(`/api/academy/search?q=${encodeURIComponent(q)}`)
        .then((d) => { setResults(d); setSearching(false); })
        .catch(() => setSearching(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const [track, setTrack] = useState<string>('ALL');
  const { scope } = useSemester();

  const visible = useMemo(() => {
    let list = units;
    // Track scope (§12): CORE always shows; grade/semester tracks narrow to context.
    if (track === 'CORE') list = list.filter((u: any) => (u.track_scope ?? 'CORE') === 'CORE');
    else if (track === 'MINE') list = list.filter((u: any) => {
      const t = u.track_scope ?? 'CORE';
      if (t === 'CORE') return true;
      if (t === `G${scope.grade}`) return true;
      if (t === 'SEMESTER') return (u.grade == null || u.grade === scope.grade) && (u.semester == null || u.semester === scope.semester);
      return false;
    });
    else if (track !== 'ALL') list = list.filter((u: any) => (u.track_scope ?? 'CORE') === track);
    if (filter === 'practice') return list.filter((u: any) => u.state === 'in_progress');
    if (filter !== 'all') return list.filter((u: any) => u.state === filter);
    return list;
  }, [units, filter, track, scope]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!overview) return <p className="muted">Loading the academy…</p>;
  const p = overview.progress ?? { pct: 0, completed: 0, total: 0 };
  const lvl = overview.level ?? { band: 'RED', next: 'YELLOW', recent: 0 };

  return (
    <div>
      <p className="eyebrow">Academic Writing Academy</p>
      <h1 style={{ marginTop: 0 }}>From a basic answer to a <span className="grad-text">BLUE-quality</span> response.</h1>
      <p className="muted">Learn → see → break down → practice → get feedback → revise → master. Every concept ends in something you do.</p>
      <div className="btn-row" style={{ marginBottom: 4 }}>
        <Link className="btn" to="/analyze">Analyze a challenge PDF instead</Link>
        <Link className="btn" to="/lab">Open Research Paper Lab</Link>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="eyebrow dim">Course progress</p>
          <h2 className="fine-num" style={{ margin: '0 0 6px', fontSize: 34 }}>{p.pct}%</h2>
          <div className="bar" role="img" aria-label={`Course progress ${p.pct}%`}>
            <span className="bar-fill is-mixed" style={{ width: `${p.pct}%` }} />
          </div>
          <p className="small muted" style={{ margin: '8px 0 0' }}>
            <strong className="fine-num">{p.completed} / {p.total}</strong> units complete
          </p>
          {overview.continue ? (
            <div className="btn-row">
              <Link className="btn btn-primary" to={`/academy/${overview.continue.unit_slug}?lesson=${overview.continue.lesson_id}`}>
                Continue — {overview.continue.lesson_title}
              </Link>
            </div>
          ) : (
            <p className="small" style={{ color: 'var(--green-fg)', fontWeight: 700 }}>Course complete 🎓</p>
          )}
          {cert?.eligible && (
            <div className="alert alert-ok" style={{ marginTop: 12 }}>
              <strong>🎓 Course complete!</strong> {cert.title} — {cert.name}.
              <br /><span className="small">{cert.note}</span>
            </div>
          )}
        </div>
        <div className="card">
          <p className="eyebrow dim">Your writing level</p>
          <p style={{ margin: '0 0 4px' }}>
            <span className={`grade-chip grade-${lvl.band}`}>{lvl.band}</span>
            {lvl.next && <span className="small muted"> → next: <strong>{lvl.next}</strong></span>}
          </p>
          <p className="small muted" style={{ margin: '0 0 8px' }}>From your recent journal attempts{lvl.recent ? ` (${lvl.recent})` : ' — answer a journal question to set your level'}.</p>
          <p className="small" style={{ margin: '4px 0 0' }}>💪 Strongest: <strong>{overview.strongest ? overview.strongest.label : '—'}</strong> · 🎯 To improve: <strong>{overview.weakest ? overview.weakest.label : '—'}</strong></p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow dim">Skill mastery — from your real activity, never invented</p>
        <div className="cat-rows">
          {(overview.skills ?? []).map((s: any) => (
            <div className="cat-row" key={s.skill}>
              <div className="cat-top">
                <span className="cat-name">{s.label}</span>
                <span className="cat-meta">
                  <span className={`grade-chip grade-${s.status === 'MASTERED' ? 'GREEN' : s.status === 'UNDERSTOOD' ? 'BLUE' : s.status === 'PRACTICING' ? 'YELLOW' : 'RED'}`}>{s.status.replace('_', ' ')}</span>
                  <span className="fine-num">{s.pct == null ? 'no attempts yet' : `${s.pct}% · ${s.attempts} tries`}</span>
                </span>
              </div>
              <div className="bar" role="img" aria-label={`${s.label}: ${s.pct == null ? 'not started' : `${s.pct} percent`}`}>
                <span className="bar-fill is-mixed" style={{ width: `${s.pct ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {recs.length > 0 && (
        <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', borderColor: 'var(--green-border)' }}>
          <p className="eyebrow dim">Recommended from your actual mistakes</p>
          {recs.map((r: any) => (
            <p key={r.slug} style={{ margin: '6px 0' }}>
              <Link to={`/academy/${r.slug}`}><strong>{r.title}</strong></Link>
              <span className="small muted"> — {r.reason}</span>
            </p>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow dim">What does BLUE actually mean?</p>
        <div className="grid-2">
          {FRAMEWORK.map((f) => (
            <div key={f.grade} className="card" style={{ boxShadow: 'none' }}>
              <p style={{ marginTop: 0 }}><span className={`grade-chip grade-${f.grade}`}>{f.grade}</span></p>
              <p className="small" style={{ margin: '4px 0' }}>{f.meaning}</p>
              <p className="small" style={{ margin: '4px 0' }}><strong>Example:</strong> {f.example}</p>
              <p className="small muted" style={{ margin: '4px 0' }}><strong>Typical mistake:</strong> {f.mistake}</p>
              <ul className="small check-list">
                {f.checklist.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <Link className="btn btn-ghost btn-small" to={`/academy/${units.find((u: any) => u.slug === (f.unit === 'blue-masterclass' ? 'blue-masterclass' : f.unit))?.slug ?? f.unit}`}>Practice this level →</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <p className="eyebrow dim">Skill map — what do you need for BLUE?</p>
          <SkillMap skills={overview.skills ?? []} />
        </div>
        <div className="card">
          <p className="eyebrow dim">The Blue Path</p>
          <BluePath compact />
          <p className="small muted">The mental model behind every unit: raw material becomes reusable insight. <Link to="/academy/blue-method">Study it in Unit 6 →</Link></p>
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Course units</h2>
      <p className="small" style={{ marginTop: -6 }}>
        <Link to="/mistakes">Browse the Mistake Library →</Link>
        <span className="muted"> every common mistake, searchable by unit.</span>
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        <div className="seg" role="group" aria-label="Filter units">
          {FILTERS.map((f) => (
            <button key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="seg" role="group" aria-label="Filter by track">
          {TRACKS.map((t) => (
            <button key={t.id} aria-pressed={track === t.id} onClick={() => setTrack(t.id)}>{t.label}</button>
          ))}
        </div>
        <input
          className="input"
          style={{ maxWidth: 300 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons: analysis, APA, paragraph…"
          aria-label="Search lessons"
          autoComplete="off"
        />
      </div>

      {results ? (
        <div className="card">
          <p className="eyebrow dim">Search results{searching ? '…' : ''}</p>
          {results.lessons.length === 0 && results.units.length === 0 && <p className="small muted">No lessons match “{query}”. Try “evidence”, “paragraph”, or “citation”.</p>}
          {results.lessons.map((l: any) => (
            <p key={l.id} style={{ margin: '8px 0' }}>
              <Link to={`/academy/${l.unit_slug}?lesson=${l.id}`}><strong>{l.title}</strong></Link>
              <span className="small muted"> — Unit {l.unit_number} · {l.unit_title} · ~{l.est_minutes} min · {l.completed ? '✓ done' : 'not done'}</span>
              <br /><span className="small muted">{l.objective}</span>
            </p>
          ))}
          {results.units.map((u: any) => (
            <p key={u.slug} style={{ margin: '8px 0' }}>
              <Link to={`/academy/${u.slug}`}><strong>Unit {u.unit_number} — {u.title}</strong></Link>
            </p>
          ))}
        </div>
      ) : (
        <>
          {([
            { id: 'foundations', label: 'Part I — Foundations · how journal answers work', match: (u: any) => u.unit_number <= 10 },
            { id: 'research', label: 'Part II — Research writing · from question to paper', match: (u: any) => u.unit_number > 10 },
          ] as const).map((group) => {
            const list = visible.filter(group.match);
            if (!list.length) return null;
            return (
              <div key={group.id}>
                <p className="index-group">{group.label}</p>
                <div>
                  {list.map((u: any) => {
                    const locked = !u.state || u.state === 'locked';
                    return locked ? (
                      <div className="index-row" key={u.slug ?? u.id} style={{ opacity: 0.72 }}>
                        <span className="idx-num">🔒 {String(u.unit_number).padStart(2, '0')}</span>
                        <span className="idx-title">{u.title} <span className="tag">{trackLabel(u)}</span></span>
                        <span className="idx-meta">Complete the previous unit first</span>
                      </div>
                    ) : (
                      <Link key={u.slug ?? u.id} to={`/academy/${u.slug}`} className="index-row">
                        <span className="idx-num">{String(u.unit_number).padStart(2, '0')}</span>
                        <span className="idx-title">{u.title} <span className="tag">{trackLabel(u)}</span></span>
                        <span className="idx-meta"><span className={stateBadge(u.state)}>{stateLabel(u.state)}</span></span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <div className="empty">No units match this filter yet — keep going, this list fills as you learn.</div>}
        </>
      )}
    </div>
  );
}

function VideoSlot({ video, unitNumber, unitTitle }: { video: any; unitNumber: number; unitTitle: string }) {
  const [takeaways, setTakeaways] = useState(false);
  if (!video) return null;
  const m = (video.video_url ?? '').match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  const yt = m ? m[1] : null;
  return (
    <div className="card video-row">
      <div className="video-main">
        <p className="eyebrow dim">Video lesson</p>
        {yt ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 10, background: '#000' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${yt}`}
              title={video.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            />
          </div>
        ) : video.video_url ? (
          <video controls preload="metadata" style={{ width: '100%', borderRadius: 10, background: '#000' }} poster={video.thumbnail_url || undefined}>
            <source src={video.video_url} />
            Your browser cannot play this video. Read the transcript below instead.
          </video>
        ) : (
          <div className="empty" style={{ textAlign: 'left' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 800, color: 'var(--ink)' }}>🎬 {video.title}</p>
            <p className="small muted" style={{ margin: '0 0 4px' }}>Unit {unitNumber} · intro video not yet recorded — nothing fake plays here</p>
            <p className="small" style={{ margin: 0 }}>{video.description}</p>
            <p className="small muted" style={{ margin: '6px 0 0' }}>Start with the lessons below; they teach the same ground the video will preview.</p>
          </div>
        )}
        <p style={{ margin: '10px 0 2px' }}><strong>{video.title}</strong>
          {video.duration_seconds > 0 && <span className="small muted"> · {fmtDuration(video.duration_seconds)}</span>}
          {yt && <span className="small muted"> · <a href={video.video_url} target="_blank" rel="noreferrer">Watch on YouTube</a></span>}
        </p>
        {video.description && <p className="small muted" style={{ margin: 0 }}>{video.description}</p>}
      </div>
      <div className="video-side">
        <p className="eyebrow dim">What to watch for</p>
        <p className="small">Watch once for the big idea, then rewatch pausing at each example: <strong>claim → evidence → explanation → analysis</strong>. Which move does each example demonstrate?</p>
        <div className="btn-row">
          <button className="btn btn-primary btn-small" onClick={() => document.getElementById('academy-practice')?.scrollIntoView({ behavior: 'smooth' })}>Try the concept ↓</button>
        </div>
        {video.transcript && (
          <>
            <div className="btn-row">
              <button className="btn btn-ghost btn-small" onClick={() => setTakeaways((t) => !t)}>{takeaways ? 'Hide key takeaways' : 'Key takeaways'}</button>
            </div>
            {takeaways && (
              <div className="small" style={{ background: 'var(--well)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                <MiniMd text={video.transcript} />
              </div>
            )}
            <details className="small" style={{ marginTop: 8 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Full transcript</summary>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}><MiniMd text={video.transcript} /></div>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

const RESEARCH_LAB_LINKS: Record<string, string> = {
  'research-fundamentals': 'Build your question in the Lab after the Builder →',
  'research-paper': 'Draft these sections in the Lab →',
  'synthesis-transfer': 'Your literature review lives in the Lab →',
  'sources-citations': 'Track sources in the Lab →',
};

export function AcademyUnit() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [completing, setCompleting] = useState('');
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [lockedInfo, setLockedInfo] = useState('');

  async function load(keepOpen = true) {
    try {
      const d = await api.get(`/api/academy/units/${slug}`);
      setLockedInfo('');
      setData(d);
      const wanted = searchParams.get('lesson');
      if (wanted && d.lessons?.some((l: any) => l.id === wanted)) {
        setOpenLesson(wanted);
      } else if (!keepOpen || !openLesson) {
        const firstOpen = d.lessons?.find((l: any) => !l.completed)?.id ?? d.lessons?.[0]?.id ?? null;
        setOpenLesson(firstOpen);
      }
    } catch (e: any) {
      if (e?.status === 403 && /locked/i.test(e.message ?? '')) {
        setLockedInfo((e?.data?.prerequisite as string) || 'Complete the previous unit first.');
        setData(null);
      } else {
        setError(e.message);
      }
    }
  }

  useEffect(() => {
    setData(null);
    setError('');
    setLockedInfo('');
    setOpenLesson(null);
    setJustCompleted(null);
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (lockedInfo) {
    return (
      <div>
        <p className="eyebrow"><Link to="/academy">Academic Writing</Link></p>
        <div className="empty" style={{ marginTop: 12 }}>
          <div style={{ fontSize: 30 }} aria-hidden="true">🔒</div>
          <p style={{ margin: '8px 0 2px', fontWeight: 800, color: 'var(--ink)' }}>This unit is locked</p>
          <p className="small muted">{lockedInfo}</p>
          <div className="empty-cta btn-row" style={{ justifyContent: 'center' }}>
            <Link className="btn btn-primary" to="/academy">Back to course</Link>
          </div>
        </div>
      </div>
    );
  }
  if (!data) return <p className="muted">Loading unit…</p>;
  const { unit, state, videos, lessons, practice, quiz, quiz_meta, tricks, mistakes } = data;
  const locked = !state || state.status === 'locked';
  const openIdx = lessons.findIndex((l: any) => l.id === openLesson);
  const practiceByLesson = (lessonId: string) => practice.filter((it: any) => it.lesson_id === lessonId);

  async function completeLesson(id: string) {
    setCompleting(id);
    try {
      const d = await api.post(`/api/academy/lessons/${id}/complete`, {});
      setJustCompleted(id);
      await load();
      if (d.unit_completed) {
        setJustCompleted(`unit:${id}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCompleting('');
    }
  }

  function pickLesson(id: string) {
    setOpenLesson(id);
    setJustCompleted(null);
    setSearchParams(id ? { lesson: id } : {}, { replace: true });
    setRailOpen(false);
    document.getElementById('lesson-top')?.scrollIntoView({ behavior: 'smooth' });
  }

  const rail = (
    <nav className="course-rail" aria-label="Lessons in this unit">
      <p className="eyebrow dim">Unit {unit.unit_number} — {lessons.length} lessons</p>
      {lessons.map((l: any, i: number) => (
        <button
          key={l.id}
          className={`rail-item${openLesson === l.id ? ' current' : ''}${l.completed ? ' done' : ''}`}
          onClick={() => pickLesson(l.id)}
          aria-current={openLesson === l.id}
        >
          <span className="rail-ico" aria-hidden="true">{l.completed ? '✓' : openLesson === l.id ? '●' : '○'}</span>
          <span><span className="rail-num">Lesson {i + 1}</span><br />{l.title}</span>
        </button>
      ))}
      <button className="rail-item" onClick={() => { document.getElementById('academy-quiz')?.scrollIntoView({ behavior: 'smooth' }); setRailOpen(false); }}>
        <span className="rail-ico" aria-hidden="true">?</span>
        <span><span className="rail-num">Final</span><br />Check your understanding</span>
      </button>
    </nav>
  );

  return (
    <div>
      <p className="eyebrow"><Link to="/academy">Academic Writing</Link> · Unit {unit.unit_number}</p>
      <h1 style={{ marginTop: 0 }}>{unit.title}</h1>
      <p className="muted">{unit.description}</p>
      <p>
        <span className={stateBadge(state?.status)}>{stateLabel(state?.status)}</span>{' '}
        {(unit.skills ?? []).map((s: string) => <span key={s} className="tag" style={{ marginLeft: 6 }}>{s}</span>)}
      </p>
      {locked && (
        <div className="alert">
          🔒 <strong>Locked.</strong> Complete “{(unit.unit_number ?? 1) > 1 ? `Unit ${unit.unit_number - 1}` : 'the previous unit'}” first — this unit builds directly on those skills, especially {unit.skills?.[0] ?? 'the fundamentals'}.
        </div>
      )}

      {!locked && (
        <>
          <div className="sticky-progress" aria-label="Unit progress">
            <strong>Unit {unit.unit_number}</strong>
            <div className="bar" style={{ flex: 1 }} role="img" aria-label={`${lessons.filter((l: any) => l.completed).length} of ${lessons.length} lessons complete`}>
              <span className="bar-fill is-mixed" style={{ width: `${lessons.length ? Math.round((lessons.filter((l: any) => l.completed).length / lessons.length) * 100) : 0}%` }} />
            </div>
            <span className="small muted fine-num">{lessons.filter((l: any) => l.completed).length}/{lessons.length}</span>
            <button className="btn btn-ghost btn-small rail-toggle" onClick={() => setRailOpen((o) => !o)} aria-expanded={railOpen}>
              {railOpen ? 'Close lessons' : 'Lessons'}
            </button>
          </div>

          <VideoSlot video={videos[0]} unitNumber={unit.unit_number} unitTitle={unit.title} />

          <nav className="stage-strip" aria-label="Unit path">
            {[
              { id: 'top', label: 'Watch' },
              { id: 'lesson-top', label: 'Understand' },
              { id: 'academy-practice', label: 'Try' },
              { id: 'academy-quiz', label: 'Check' },
            ].map((s, i, arr) => (
              <span key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  className="btn btn-ghost btn-small"
                  onClick={() => document.getElementById(s.id === 'top' ? 'lesson-top' : s.id)?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {i + 1}. {s.label}
                </button>
                {i < arr.length - 1 && <span className="mono-dim" aria-hidden="true" style={{ margin: '0 4px' }}>→</span>}
              </span>
            ))}
          </nav>

          <div className="course-layout">
            <aside className={`rail-wrap${railOpen ? ' open' : ''}`}>{rail}</aside>
            <div className="course-main" id="lesson-top">
              {openLesson ? (
                (() => {
                  const l = lessons[openIdx];
                  if (!l) return null;
                  const items = practiceByLesson(l.id);
                  return (
                    <div key={l.id}>
                      <p className="eyebrow dim">Lesson {openIdx + 1} of {lessons.length} · ~{l.est_minutes} min</p>
                      <h2 style={{ marginTop: 0 }}>{l.title}</h2>
                      <p><strong>You will learn:</strong> {l.objective}</p>

                      <h3 style={{ fontSize: 16 }}>Learn — the concept</h3>
                      <div><MiniMd text={l.body_md} /></div>

                      <h3 style={{ fontSize: 16, marginTop: 18 }}>See — worked example</h3>
                      {(l.examples ?? []).map((ex: any, ei: number) => (
                        <Breakdown key={ei} weak={ex.weak} strong={ex.strong} why={ex.why} segments={ex.breakdown} />
                      ))}

                      <h3 style={{ fontSize: 16, marginTop: 18 }} id="academy-practice">Try — interactive practice</h3>
                      {items.length === 0 && <p className="small muted">No practice items in this lesson — the unit quiz below covers it.</p>}
                      {items.map((it: any) =>
                        it.kind === 'surgery' ? (
                          <div key={it.id} style={{ marginTop: 10 }}>
                            <SurgeryRunner item={it} onProgress={() => load()} />
                          </div>
                        ) : (
                          <div key={it.id} style={{ marginTop: 10 }}>
                            <ExerciseRunner item={it} unitSlug={unit.slug} onProgress={() => load()} />
                          </div>
                        ),
                      )}

                      {l.widget === 'rq_builder' && <ResearchQuestionBuilder />}
                      {l.widget === 'blue_check' && <BlueCheck storageKey={`unit-${unit.slug}-bluecheck`} />}
                      {l.widget === 'master_challenge' && <div style={{ marginTop: 10 }}><MasterChallenge /></div>}

                      {l.takeaway && (
                        <div className="takeaway" role="note">
                          <strong>Key takeaway:</strong> {l.takeaway}
                        </div>
                      )}

                      <ReflectionBox lessonId={l.id} lessonTitle={l.title} />

                      {justCompleted === l.id ? (
                        <div className="alert alert-ok" style={{ marginTop: 12 }} role="status">
                            <strong>LESSON COMPLETE ✓</strong>
                          <br /><span className="small">You practiced: {(unit.skills ?? []).join(', ') || 'core writing'}. {l.takeaway}</span>
                          {openIdx + 1 < lessons.length ? (
                            <div className="btn-row">
                              <button className="btn btn-primary" onClick={() => pickLesson(lessons[openIdx + 1].id)}>Continue — {lessons[openIdx + 1].title} →</button>
                            </div>
                          ) : (
                            <div className="btn-row">
                              <button className="btn btn-primary" onClick={() => document.getElementById('academy-quiz')?.scrollIntoView({ behavior: 'smooth' })}>Take the unit quiz ↓</button>
                            </div>
                          )}
                        </div>
                      ) : justCompleted === `unit:${l.id}` ? (
                        <div className="alert alert-ok" style={{ marginTop: 12 }} role="status">
                          <strong>🎓 UNIT COMPLETE — well done.</strong>
                          <br /><span className="small">Lessons done and quiz passed. The next unit is now unlocked.</span>
                          <div className="btn-row">
                            <Link className="btn btn-primary" to="/academy">Back to course →</Link>
                          </div>
                        </div>
                      ) : l.completed ? (
                        <p className="small" style={{ color: 'var(--green-fg)', fontWeight: 700, marginTop: 12 }}>✓ Lesson complete — review anytime, or move on below.</p>
                      ) : (
                        <div className="btn-row">
                          <button className="btn btn-primary" disabled={completing === l.id} onClick={() => completeLesson(l.id)}>
                            {completing === l.id ? 'Saving…' : 'Mark lesson complete'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <p className="muted">Select a lesson from the course rail.</p>
              )}
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <div className="card">
              <p className="eyebrow dim">💡 Smart tricks</p>
              <ul className="small">
                {tricks.map((t: any) => <li key={t.id}><strong>{t.title}.</strong> {t.body}</li>)}
              </ul>
            </div>
            <div className="card">
              <p className="eyebrow dim">⚠️ Common mistakes</p>
              <ul className="small">
                {mistakes.map((m: any) => <li key={m.id}><strong>{m.title}.</strong> {m.body}</li>)}
              </ul>
            </div>
          </div>

          {RESEARCH_LAB_LINKS[unit.slug] && (
            <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', borderColor: 'var(--green-border)' }}>
              <p style={{ margin: 0 }}><strong>Ready to apply this in a research paper?</strong> <Link to="/lab">{RESEARCH_LAB_LINKS[unit.slug]}</Link></p>
            </div>
          )}

          <h2 style={{ marginTop: 24 }} id="academy-quiz">Check your understanding</h2>
          <p className="small muted" style={{ marginTop: 0 }}>Unit quiz · {quiz_meta.mastery_pct}% to pass{quiz_meta.attempts > 0 ? ` · best so far ${quiz_meta.best_pct}%` : ''}.</p>
          <QuizRunner items={quiz} meta={quiz_meta} unitSlug={unit.slug} onDone={() => load()} />
        </>
      )}
    </div>
  );
}
