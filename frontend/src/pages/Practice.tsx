import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api, CATEGORY_LABELS, wordCount } from '../lib/api';
import { useSemester, sourceBadge, slotLabel, isOfficialSource, loadLOs, saveLOs } from '../lib/semester';
import { WritingPanel } from '../components/writing';
import { LOPicker } from '../components/loBar';
import { WEAKNESS_UNITS } from '../lib/skills';
import { GradeBadge } from '../components/chrome';
import { BlueCheck } from '../components/academy';
import { wordDiff } from '../components/course';
import { JournalTimer } from '../components/JournalTimer';

const CATS = [
  { id: 'personal_reflection', short: 'Reflection', desc: 'Growth, insight, and change — with examples.' },
  { id: 'team_collaboration', short: 'Teamwork', desc: 'Your role and effective teamwork — with evidence.' },
  { id: 'learning_transfer', short: 'Transfer', desc: 'Subjects synthesized and applied in your project.' },
  { id: 'engineering_design_process', short: 'EDP', desc: 'Reflection and judgment another team could reuse.' },
];

function difficultyClass(d: string): string {
  const v = (d ?? '').toLowerCase();
  if (v === 'easy') return 'diff diff-easy';
  if (v === 'hard') return 'diff diff-hard';
  return 'diff diff-medium';
}

function QuestionCard({ q, n }: { q: any; n: number }) {
  const sb = sourceBadge(q.source);
  const slot = slotLabel(q.question_slot);
  return (
    <article className="card q-card q-row card-hover" key={q.id}>
      <div className="q-row-main">
        <div className="q-meta">
          <span className="tag">{CATEGORY_LABELS[q.category]}</span>
          <span className={difficultyClass(q.difficulty)}>{q.difficulty}</span>
          <span className={`tag ${sb.official ? 'tag-official' : ''}`}>{sb.text}</span>
          {slot && <span className="tag">{slot}</span>}
          {(q.learning_objectives ?? []).map((lo: string) => (<span className="tag" key={lo}>{lo}</span>))}
          <span className="q-source">{q.source_label}</span>
        </div>
        <p className="q-text" style={{ margin: '8px 0 4px' }}><strong className="fine-num">Q{n}.</strong> {q.question_text}</p>
        <p className="small muted" style={{ margin: '0 0 6px' }}>{q.what_testing}</p>
        {q.my_attempts > 0 && <span className="q-tries">✓ {q.my_attempts} attempt{q.my_attempts > 1 ? 's' : ''} so far — retry to climb higher</span>}
      </div>
      <div className="q-row-cta">
        <Link className="btn btn-primary btn-small" to={`/question/${q.id}`}>Answer →</Link>
      </div>
    </article>
  );
}

export function Practice() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') ?? 'personal_reflection';
  const [cat, setCat] = useState(CATS.some((c) => c.id === initialCat) ? initialCat : 'personal_reflection');
  const [list, setList] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [los, setLos] = useState<string[]>(loadLOs);
  const nav = useNavigate();
  const { scope, qs } = useSemester();

  useEffect(() => {
    saveLOs(los);
  }, [los]);

  const loParam = cat === 'learning_transfer' && los.length > 0 ? `&los=${encodeURIComponent(los.join(','))}` : '';
  useEffect(() => {
    setError('');
    api.get(`/api/questions?category=${cat}&${qs}${loParam}`).then((d) => setList(d.questions)).catch((e) => setError(e.message));
  }, [cat, qs, loParam]);

  // Full LO set for the chip row (from the unfiltered transfer pool, not the filtered list).
  const [allLOs, setAllLOs] = useState<string[]>([]);
  useEffect(() => {
    if (cat !== 'learning_transfer') return;
    api.get(`/api/questions?category=learning_transfer&${qs}`)
      .then((d) => setAllLOs([...new Set((d.questions ?? []).flatMap((q: any) => q.learning_objectives ?? []))].sort() as string[]))
      .catch(() => {});
  }, [cat, qs]);

  const [level, setLevel] = useState<string>('all');
  const visible = list.filter((q) => {
    if (level !== 'all' && (q.difficulty ?? '').toLowerCase() !== level) return false;
    if (!filter.trim()) return true;
    return `${q.question_text} ${q.what_testing} ${q.source_label}`.toLowerCase().includes(filter.trim().toLowerCase());
  });

  async function surprise() {
    try {
      const d = await api.get(`/api/questions/next?category=${cat}&${qs}${loParam}`);
      nav(`/question/${d.question.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <p className="eyebrow">Practice by category · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Choose what to train</h1>
      <div className="seg" role="group" aria-label="Categories">
        {CATS.map((c) => (
          <button key={c.id} aria-pressed={cat === c.id} onClick={() => setCat(c.id)} title={CATEGORY_LABELS[c.id]}>
            {c.short}
          </button>
        ))}
      </div>
      <p className="muted small" style={{ marginTop: 8 }}>
        <strong>{CATEGORY_LABELS[cat]}:</strong> {CATS.find((c) => c.id === cat)?.desc}
      </p>
      {cat === 'learning_transfer' && allLOs.length > 0 && (
        <div className="card" style={{ marginTop: 8 }} aria-label="Choose the LOs you have reached">
          <LOPicker all={allLOs} value={los} onChange={setLos} />
        </div>
      )}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={surprise}>Give me a question</button>
        <Link className="btn" to="/mock">Or try a full Mock Journal</Link>
      </div>
      <div className="seg" role="group" aria-label="Difficulty" style={{ marginTop: 12 }}>
        {['all', 'easy', 'medium', 'hard'].map((d) => (
          <button key={d} aria-pressed={level === d} onClick={() => setLevel(d)}>
            {d === 'all' ? 'All levels' : d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12, maxWidth: 420 }}>
        <label className="label" htmlFor="practice-search" style={{ marginTop: 0 }}>Filter questions</label>
        <input
          id="practice-search"
          className="input"
          type="search"
          autoComplete="off"
          placeholder="Type a word, e.g. packaging or reflection…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {(() => {
        // Three honest groups: semester-official (per journal), this semester's
        // practice pack, and the shared cross-grade practice pool. Practice is
        // never labeled official.
        const official = visible.filter((q) => q.grade != null && isOfficialSource(q.source));
        const semPractice = visible.filter((q) => q.grade != null && !isOfficialSource(q.source));
        const shared = visible.filter((q) => q.grade == null);
        const journals = new Map<number | string, any[]>();
        for (const q of official) {
          const key = q.question_number ?? 'Other';
          if (!journals.has(key)) journals.set(key, []);
          journals.get(key)!.push(q);
        }
        let n = 0;
        return (
          <>
            {[...journals.entries()].map(([j, qs]) => (
              <section key={String(j)} aria-label={j === 'Other' ? 'Official questions' : `Journal ${j}`}>
                <h2 className="group-title">
                  {j === 'Other' ? `G${scope.grade} S${scope.semester} · Official` : `G${scope.grade} S${scope.semester} · Journal ${j} · Official`}
                  <span className="muted small"> — {qs.length} question{qs.length > 1 ? 's' : ''}</span>
                </h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {qs.map((q) => (<QuestionCard key={q.id} q={q} n={++n} />))}
                </div>
              </section>
            ))}
            {semPractice.length > 0 && (
              <section aria-label="Semester practice pack">
                <h2 className="group-title">
                  G{scope.grade} S{scope.semester} · Practice pack
                  <span className="muted small"> — made for this semester, not official · {semPractice.length} question{semPractice.length > 1 ? 's' : ''}</span>
                </h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {semPractice.map((q) => (<QuestionCard key={q.id} q={q} n={++n} />))}
                </div>
              </section>
            )}
            {shared.length > 0 && (
              <section aria-label="Shared practice pool">
                <h2 className="group-title">
                  Shared practice pool
                  <span className="muted small"> — cross-grade practice, not semester-official · {shared.length} question{shared.length > 1 ? 's' : ''}</span>
                </h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  {shared.map((q) => (<QuestionCard key={q.id} q={q} n={++n} />))}
                </div>
              </section>
            )}
          </>
        );
      })()}
      {visible.length === 0 && !error && (
        <p className="empty">
          {filter.trim() ? `No questions match “${filter.trim()}”.` : 'No questions in this category yet.'}
          {filter.trim() && <span className="empty-cta"><button className="btn btn-small" onClick={() => setFilter('')}>Clear filter</button></span>}
        </p>
      )}
    </div>
  );
}

export function QuestionPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [q, setQ] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [openCrit, setOpenCrit] = useState<string | null>(null);
  const [timeup, setTimeup] = useState(false);

  useEffect(() => {
    api.get(`/api/questions/${id}`).then((d) => {
      setQ(d.question);
      setHistory(d.my_attempts ?? []);
    }).catch((e) => setError(e.message));
    api.get(`/api/drafts/${id}`).then((d) => {
      if (d.draft?.answer_text) {
        setAnswer(d.draft.answer_text);
        setSaving(`Draft restored from ${new Date(d.draft.updated_at).toLocaleString()}`);
      }
    }).catch(() => {});
  }, [id]);

  // autosave (debounced)
  useEffect(() => {
    if (!q) return;
    if (!answer.trim()) return;
    const t = setTimeout(async () => {
      try {
        setSaving('Saving…');
        const d = await api.put('/api/drafts', { question_id: id, answer_text: answer });
        setSaving(`Autosaved ${new Date(d.saved_at).toLocaleTimeString()}`);
      } catch {
        setSaving('Autosave failed — your text is still in this box.');
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [answer, q, id]);

  async function saveDraft() {
    try {
      setSaving('Saving…');
      const d = await api.put('/api/drafts', { question_id: id, answer_text: answer });
      setSaving(`Draft saved ${new Date(d.saved_at).toLocaleTimeString()}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function submit() {
    if (wordCount(answer) < 5) {
      setError('Please write a fuller answer before submitting (at least a few sentences).');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const d = await api.post('/api/attempts', { question_id: id, answer_text: answer });
      nav(`/attempt/${d.attempt.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !q) return <div className="alert alert-error">{error}</div>;
  if (!q) return <p className="muted">Loading question…</p>;

  const wc = wordCount(answer);
  const cc = answer.length;
  const comps = q.required_components ?? [];
  const lower = answer.toLowerCase();
  const compState = comps.map((c: any) => {
    const kws = (c.keywords ?? []).map((k: string) => String(k).toLowerCase()).filter(Boolean);
    const hits = kws.filter((k: string) => lower.includes(k));
    const rate = kws.length ? hits.length / kws.length : 0;
    return { comp: c, hits, rate, mark: rate === 0 ? 'no' : rate < 0.5 ? 'mid' : 'ok' };
  });

  return (
    <div>
      <p className="eyebrow">
        {history.length > 0 ? 'Second draft — try again using the feedback' : 'Journal Lab — first draft'}
      </p>
      <h1 style={{ marginTop: 0 }}>{history.length > 0 ? 'Rewrite it stronger' : 'Answer the prompt'}</h1>

      {history.length > 0 && (
        <div className="doc-sheet" style={{ marginBottom: 16 }} aria-label="Previous weaknesses">
          <p className="section-label">What to fix this time</p>
          {history.slice(-1).map((h: any) => (
            <div key={h.id} className="small">
              <p style={{ margin: '0 0 4px' }}>
                Last attempt: <GradeBadge grade={h.grade} /> <span className="muted">{h.summary}</span>
              </p>
              {h.next_level && <p className="muted" style={{ margin: 0 }}>Next target: <strong>{h.next_level}</strong> — cover every required part on the right before submitting.</p>}
            </div>
          ))}
        </div>
      )}

      <JournalTimer words={wordCount(answer)} running={!timeup} onExpired={() => setTimeup(true)} onDurationChange={() => setTimeup(false)} />

      {timeup && <div className="alert alert-error" role="alert"><strong>Time's up!</strong> The journal window has closed. Your draft was autosaved — you can still submit what you wrote, or increase the timer on the left to continue.</div>}

      <div className="lab-grid">
        <div className="doc-sheet lab-prompt" aria-label="Prompt">
          <p className="section-label">Prompt</p>
          <p className="small muted" style={{ margin: '0 0 6px' }}>
            <span className="tag">{CATEGORY_LABELS[q.category]}</span>{' '}
            <span className={`tag ${sourceBadge(q.source).official ? 'tag-official' : ''}`}>{sourceBadge(q.source).text}</span>{' '}
            {slotLabel(q.question_slot) && <span className="tag">{slotLabel(q.question_slot)}</span>}{' '}
            {q.grade != null && q.semester != null && <span className="tag">G{q.grade} • S{q.semester}</span>}{' '}
            <span className={difficultyClass(q.difficulty)}>{q.difficulty}</span>
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.6, fontWeight: 500 }}>{q.question_text}</p>
          <p className="small muted" style={{ marginBottom: 0 }}>{q.what_testing}</p>
          <p className="small muted" style={{ margin: '8px 0 0' }}>{q.source_label}</p>
          {history.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p className="section-label">Previous attempts</p>
              <div className="timeline" aria-label="Your previous attempts">
                {history.map((h: any) => (
                  <span className="step" key={h.id}>Attempt {h.attempt_number}: {h.grade}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="section-label">Your response</p>
          <div className="write-sheet">
            <textarea
              id="answer"
              className="textarea"
              spellCheck
              lang="en-US"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
              disabled={timeup}
              placeholder="Describe a specific situation from your Capstone: what happened, what you did, and what it meant…"
              aria-describedby="editor-meta"
              aria-label="Your answer"
            />
            <div className="write-meta" id="editor-meta">
              <span>{wc} words · {cc} chars</span>
              <span className={saving.startsWith('Autosaved') || saving.startsWith('Draft saved') ? 'autosave-on' : ''} role="status">{saving}</span>
            </div>
          </div>
          <p className="small muted" style={{ marginTop: 8 }}>Drafts autosave. Press <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> to submit.</p>
          <WritingPanel text={answer} onApply={setAnswer} />
          {error && <div className="alert alert-error" role="alert">{error}</div>}
          <div className="btn-row">
            <button className="btn" onClick={saveDraft}>Save Draft</button>
            <button className="btn" onClick={() => setShowTesting((s) => !s)} aria-expanded={showTesting}>
              {showTesting ? 'Hide rubric hint' : 'What is this asking?'}
            </button>
          </div>
          {showTesting && <div className="testing-box"><strong>What this question is testing: </strong>{q.what_testing}</div>}
        </div>

          <div className="rubric-sheet">
            <div className="rubric-rail" aria-label="Rubric — live coverage as you type">
              <p className="section-label">Rubric — live</p>
            {compState.map(({ comp, hits, rate, mark }: any) => (
              <div key={comp.key}>
                <button
                  className={`rubric-crit${openCrit === comp.key ? ' open' : ''}`}
                  onClick={() => setOpenCrit(openCrit === comp.key ? null : comp.key)}
                  aria-expanded={openCrit === comp.key}
                >
                  <span className="rc-top">{comp.label}<span className={`rc-mark ${mark}`} aria-label={`${comp.label}: ${mark === 'ok' ? 'covered' : mark === 'mid' ? 'partial' : 'missing'}`}>{mark === 'ok' ? '✓ Covered' : mark === 'mid' ? '~ Partial' : '✕ Missing'}</span></span>
                  {openCrit === comp.key && (
                    <span className="rc-body">
                      The coach scans for: <strong>{(comp.keywords ?? []).join(', ')}</strong>
                      <br />{hits.length > 0 ? `Found in your draft: ${hits.join(', ')}.` : 'Not found in your draft yet — add it before submitting.'}
                      <br /><Link to={`/academy/${( { personal_reflection: 'reflection-depth', team_collaboration: 'teamwork-writing', learning_transfer: 'synthesis-transfer', engineering_design_process: 'edp-writing' } as any)[q.category] ?? 'blue-method'}`}>Learn this skill →</Link>
                    </span>
                  )}
                </button>
              </div>
            ))}
            {!compState.length && <p className="small muted">No rubric breakdown for this question.</p>}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} disabled={submitting || wc < 5} onClick={submit}>
              {submitting ? 'Analyzing answer…' : history.length > 0 ? 'Submit Second Draft' : 'Submit Answer'}
            </button>
            <p className="small muted" style={{ margin: '8px 0 0' }}>Grades only BLUE / GREEN / YELLOW / RED — never a percentage.</p>
          </div>
        </div>
      </div>

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14.5 }}>BLUE CHECK — review before submitting</summary>
        <BlueCheck storageKey={`question-${id}`} compact />
      </details>
      <p className="small muted" style={{ marginTop: 12 }}>The coach grades only BLUE / GREEN / YELLOW / RED — never a percentage. Grammar alone never decides your level.</p>
    </div>
  );
}

export function AttemptResult() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [openAnnot, setOpenAnnot] = useState<number | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    api.get(`/api/attempts/${id}`).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p className="muted">Analyzing…</p>;
  const { attempt, evaluation, timeline } = data;

  const coverage = evaluation.question_coverage ?? [];
  const prev = (timeline ?? []).find((t: any) => t.attempt_number === attempt.attempt_number - 1 && t.answer_text);

  function evidenceWords(evidence: string): string[] {
    return String(evidence ?? '')
      .toLowerCase()
      .split(/[^a-z0-9%°/.-]+/)
      .filter((w) => w.length >= 5)
      .slice(0, 24);
  }

  function renderAnswer() {
    const text = attempt.answer_text ?? '';
    const sel = openAnnot == null ? null : coverage[openAnnot];
    if (!sel) return <span>{text}</span>;
    const keys = evidenceWords(sel.evidence);
    if (!keys.length) return <span>{text}</span>;
    const tone = sel.covered ? 'mk-good' : 'mk-missing';
    const parts = text.split(/(\s+)/);
    return (
      <span>
        {parts.map((part: string, i: number) => {
          const clean = part.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
          const hit = clean.length >= 5 && keys.some((k) => clean.includes(k) || k.includes(clean));
          return hit ? <mark key={i} className={tone}>{part}</mark> : <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  const LEVELS = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
  const idx = LEVELS.indexOf(evaluation.grade);
  const reached = idx + 1;

  return (
    <div>
      <p className="eyebrow">Attempt {attempt.attempt_number} · evaluated · {CATEGORY_LABELS[attempt.category] ?? ''}</p>
      <h1 style={{ marginTop: 0 }}>What the rubric saw</h1>

      {/* ANSWER + ANNOTATIONS */}
      <div className="annotate-split">
        <div>
          <p className="section-label">Your answer</p>
          <div className="annot-answer">{renderAnswer()}</div>
          <p className="small muted" style={{ marginTop: 8 }}>Select an annotation on the right to locate it in your text.</p>
        </div>
        <div className="annot-side" aria-label="Coach annotations">
          <p className="section-label">Coach annotations</p>
          {coverage.length === 0 && <p className="small muted">No component breakdown for this question.</p>}
          {coverage.map((c: any, i: number) => (
            <button
              key={i}
              className={`annot${openAnnot === i ? ' open' : ''}`}
              data-tone={c.covered ? 'good' : 'missing'}
              onClick={() => setOpenAnnot(openAnnot === i ? null : i)}
              aria-expanded={openAnnot === i}
            >
              <span className="annot-head">{c.covered ? '✓' : '✕'} {c.label}</span>
              {openAnnot === i && (
                <span className="annot-more small">{c.evidence || (c.covered ? 'Covered.' : 'Not found in your answer.')}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ANALYSIS → WORKED → MISSING → IMPROVE */}
      <div className="doc-sheet" style={{ marginTop: 16 }} aria-label="Rubric analysis">
        <p className="section-label">Rubric analysis</p>
        <p style={{ marginTop: 0 }}>{evaluation.why_level}</p>
        <p className="muted small">{evaluation.summary}</p>
      </div>

      <div className="doc-sheet" style={{ marginTop: 16 }} aria-label="Feedback">
        <p className="section-label">What worked</p>
        <ul>{evaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
        <p className="section-label" style={{ marginTop: 18 }}>What is missing</p>
        <ul>{evaluation.missing_elements.length ? evaluation.missing_elements.map((s: string, i: number) => <li key={i}>{s}</li>) : <li>Nothing critical missing — deepen interpretation to hold BLUE.</li>}</ul>
        {evaluation.weaknesses.length > 0 && (
          <>
            <p className="section-label" style={{ marginTop: 18 }}>Friction points</p>
            <ul>{evaluation.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
          </>
        )}
        <p className="section-label" style={{ marginTop: 18 }}>How to improve</p>
        <ul>{evaluation.improvement_actions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
        {evaluation.next_level && (
          <>
            <p className="section-label" style={{ marginTop: 18 }}>Next target: {evaluation.next_level}</p>
            <ul className="check-list">{evaluation.next_level_requirements.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
          </>
        )}
        <p className="section-label" style={{ marginTop: 18 }}>Recommended practice</p>
        <p className="small">{evaluation.recommended_practice}</p>
      </div>

      {attempt.reference_answer ? (
        <div className="card" style={{ marginTop: 16 }}>
          <details>
            <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Model answer from {attempt.source_label}</summary>
            <p className="small muted" style={{ margin: '6px 0' }}>A graded exemplar answer to compare against your own writing.</p>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{attempt.reference_answer}</p>
          </details>
        </div>
      ) : null}

      {/* REVISION */}
      {prev && (
        <div className="doc-sheet" style={{ marginTop: 16 }} aria-label="Revision">
          <p className="section-label">Revision — attempt {prev.attempt_number} ({prev.grade}) → attempt {attempt.attempt_number} ({evaluation.grade})</p>
          <div className="revise-grid">
            <div className="revise-pane">
              <h4>Before — attempt {prev.attempt_number}</h4>
              <div className="rev-text">{prev.answer_text}</div>
            </div>
            <div className="revise-pane">
              <h4>After — attempt {attempt.attempt_number}</h4>
              <div className="rev-text">{attempt.answer_text}</div>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-ghost btn-small" onClick={() => setShowDiff((s) => !s)} aria-expanded={showDiff}>
              {showDiff ? 'Hide word changes' : 'Show word changes'}
            </button>
          </div>
          {showDiff && (
            <div className="diff small" style={{ marginTop: 10 }} aria-label="Word-level changes">
              {wordDiff(prev.answer_text ?? '', attempt.answer_text ?? '').map((w, i) =>
                w.type === 'same' ? <span key={i}>{w.t}</span>
                : w.type === 'del' ? <del key={i}>{w.t}</del>
                : <ins key={i}>{w.t}</ins>,
              )}
            </div>
          )}
        </div>
      )}

      {timeline?.length > 1 && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="eyebrow dim">Your improvement on this question</p>
          <div className="timeline">
            {timeline.map((t: any) => (
              <span className="step" key={t.id}>Attempt {t.attempt_number}: <GradeBadge grade={t.grade} /></span>
            ))}
          </div>
        </div>
      )}

      {(() => {
        const codes: string[] = evaluation.weakness_codes ?? [];
        const seen = new Set<string>();
        const units = codes
          .map((c) => WEAKNESS_UNITS[c])
          .filter((u) => u && !seen.has(u.slug) && (seen.add(u.slug), true))
          .slice(0, 2);
        if (!units.length) return null;
        return (
          <div className="card" style={{ marginTop: 16, background: 'var(--accent-soft)', borderColor: 'var(--green-border)' }}>
            <p className="eyebrow dim">Keep improving — learn this skill</p>
            {units.map((u) => (
              <p key={u.slug} style={{ margin: '6px 0' }}>
                <Link className="btn btn-small" to={`/academy/${u.slug}`}>Learn: {u.title}</Link>
              </p>
            ))}
            <p className="small muted" style={{ margin: '6px 0 0' }}>Study the unit, then come back and <strong>Try Again</strong> below.</p>
          </div>
        );
      })()}

      {/* CURRENT LEVEL — revealed after the learning */}
      <div className={`result-hero grade-${evaluation.grade}`} style={{ marginTop: 16 }} aria-label="Current level">
        <p className="section-label">Current level</p>
        <h1 style={{ margin: '0 0 8px' }}><GradeBadge grade={evaluation.grade} size="lg" /></h1>
        <div className="level-progress">
          <div className="lp-label">Level reached {reached}/{LEVELS.length} · {evaluation.next_level ? `next target: ${evaluation.next_level}` : 'you reached the top level'}</div>
          <div className="lp-track" aria-label={`Level ${reached} of ${LEVELS.length}`}>
            {LEVELS.map((l, i) => (
              <div
                key={l}
                title={l}
                className={`lp-seg lp-seg--${l}${i < reached ? ' filled' : ''}${l === evaluation.grade ? ' current' : ''}`}
              />
            ))}
          </div>
          <div className="lp-caption"><span>{evaluation.grade}</span><span>{evaluation.next_level ?? 'BLUE'}</span></div>
        </div>
      </div>

      {(attempt.grade === 'GREEN' || attempt.grade === 'BLUE') && (
        <div className="alert alert-ok" role="status" style={{ marginTop: 12 }}>
          <strong>{attempt.grade} — ready for harder?</strong> This level is solid. Push into hard questions in {CATEGORY_LABELS[attempt.category] ?? 'this category'}.
        </div>
      )}
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => nav(`/question/${attempt.question_id}`)}>Try Again</button>
        <button className="btn" onClick={async () => {
          try {
            const d = await api.get(`/api/questions/next?category=${attempt.category ?? ''}&exclude=${attempt.question_id}`);
            nav(`/question/${d.question.id}`);
          } catch {
            nav('/practice');
          }
        }}>Next Question</button>
        {(attempt.grade === 'GREEN' || attempt.grade === 'BLUE') && (
          <button className="btn" onClick={async () => {
            try {
              const d = await api.get(`/api/questions/next?category=${attempt.category ?? ''}&exclude=${attempt.question_id}&min_difficulty=hard`);
              nav(`/question/${d.question.id}`);
            } catch {
              nav('/practice');
            }
          }}>Harder →</button>
        )}
        <button className="btn" onClick={() => nav('/progress')}>View Progress</button>
      </div>
    </div>
  );
}
