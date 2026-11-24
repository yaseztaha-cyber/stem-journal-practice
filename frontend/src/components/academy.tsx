import { useMemo, useState } from 'react';
import { api } from '../lib/api';

/** Minimal markdown: paragraphs, **bold**, "- " lists. No deps, no HTML injection (text-only). */
export function MiniMd({ text }: { text: string }) {
  const blocks = useMemo(() => {
    const out: { type: 'p' | 'ul'; lines: string[] }[] = [];
    for (const raw of (text ?? '').split(/\n\n+/)) {
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
      if (!lines.length) continue;
      if (lines.every((l) => l.startsWith('- '))) out.push({ type: 'ul', lines: lines.map((l) => l.slice(2)) });
      else out.push({ type: 'p', lines });
    }
    return out;
  }, [text]);

  function rich(line: string, key: number) {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={key}>
        {parts.map((p, i) =>
          p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
        )}
      </span>
    );
  }

  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'ul' ? (
          <ul key={i}>{b.lines.map((l, j) => <li key={j}>{rich(l, j)}</li>)}</ul>
        ) : (
          <p key={i}>{b.lines.map((l, j) => <span key={j}>{rich(l, j)}{j < b.lines.length - 1 ? <br /> : null}</span>)}</p>
        ),
      )}
    </>
  );
}

const BLUE_CHECKS = [
  'Did I answer every part of the question?',
  'Did I provide a specific example?',
  'Did I explain what happened?',
  'Did I explain why it mattered?',
  'Did I explain what I learned?',
  'Did I show how my thinking/behavior changed where relevant?',
  'Did I connect the answer to my project?',
  'Did I support important claims?',
  'Did I avoid vague statements?',
  'Did I reread the question after writing?',
];

/** Reusable BLUE CHECK pre-submit checklist (journal screen + Unit 15). Persisted per key. */
export function BlueCheck({ storageKey, compact = false }: { storageKey: string; compact?: boolean }) {
  const [checks, setChecks] = useState<boolean[]>(() => {
    try {
      const raw = localStorage.getItem(`sjp_bluecheck_${storageKey}`);
      const arr = raw ? JSON.parse(raw) : [];
      return BLUE_CHECKS.map((_, i) => !!arr[i]);
    } catch {
      return BLUE_CHECKS.map(() => false);
    }
  });
  function toggle(i: number) {
    setChecks((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      try {
        localStorage.setItem(`sjp_bluecheck_${storageKey}`, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }
  const done = checks.filter(Boolean).length;
  return (
    <div className={compact ? '' : 'card'} style={compact ? undefined : { marginTop: 16 }}>
      {!compact && <p className="eyebrow dim">Before you submit</p>}
      <p style={{ marginTop: 0 }}><strong>BLUE CHECK</strong> <span className="small muted">— {done}/{BLUE_CHECKS.length} verified</span></p>
      <div className="bar" role="img" aria-label={`${done} of ${BLUE_CHECKS.length} checks done`}>
        <span className="bar-fill is-mixed" style={{ width: `${(done / BLUE_CHECKS.length) * 100}%` }} />
      </div>
      <ul className="check-list" style={{ marginTop: 10 }}>
        {BLUE_CHECKS.map((c, i) => (
          <li key={i} style={{ cursor: 'pointer', listStyle: 'none', paddingLeft: 30 }} onClick={() => toggle(i)}>
            <input type="checkbox" checked={checks[i]} onChange={() => toggle(i)} onClick={(e) => e.stopPropagation()} aria-label={c} /> {c}
          </li>
        ))}
      </ul>
      {done === BLUE_CHECKS.length && <p className="small" style={{ color: 'var(--green-fg)', fontWeight: 700 }}>All checks verified — submit with confidence.</p>}
    </div>
  );
}

/** Interactive Research Question Builder (Unit 11): narrows topic → candidates. Never writes the paper. */
export function ResearchQuestionBuilder() {
  const [topic, setTopic] = useState('');
  const [problem, setProblem] = useState('');
  const [context, setContext] = useState('');
  const [factor, setFactor] = useState('');
  const [outcome, setOutcome] = useState('');
  const t = topic.trim();
  const ready = t && problem.trim() && context.trim() && factor.trim() && outcome.trim();
  const candidates = ready
    ? [
        `Does ${factor.trim()} affect ${outcome.trim()} in ${context.trim()}?`,
        `How does ${factor.trim()} change ${outcome.trim()} for ${context.trim()} facing ${problem.trim()}?`,
        `What is the effect of ${factor.trim()} on ${outcome.trim()} in ${context.trim()} over a fixed trial period?`,
      ]
    : [];
  return (
    <div className="card" style={{ background: 'var(--accent-soft)', borderColor: 'var(--green-border)', marginTop: 12 }}>
      <p className="eyebrow dim">Interactive tool — Research Question Builder</p>
      <div className="form-grid">
        <label className="label">Topic<input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. food packaging" /></label>
        <label className="label">Problem behind it<input className="input" value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. strawberries spoil in 3 days" /></label>
        <label className="label">Population / context<input className="input" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. classroom storage at room temperature" /></label>
        <label className="label">Factor you will vary<input className="input" value={factor} onChange={(e) => setFactor(e.target.value)} placeholder="e.g. chitosan coating" /></label>
        <label className="label">Outcome you will measure<input className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="e.g. shelf life in days" /></label>
      </div>
      {ready ? (
        <>
          <p className="small" style={{ marginTop: 12 }}><strong>Candidate questions — judge them, then narrow:</strong></p>
          <ul className="small">
            {candidates.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
          <p className="small muted">Now apply the three tests: answerable by evidence? fits your resources? tied to a real problem? Reject and narrow until all three pass.</p>
        </>
      ) : (
        <p className="small muted" style={{ marginTop: 12 }}>Fill all five fields to generate candidate questions.</p>
      )}
    </div>
  );
}

interface ExerciseProps {
  item: any;
  unitSlug: string;
  onProgress?: () => void;
}

export function ExerciseRunner({ item, onProgress }: ExerciseProps) {
  const p = item.payload ?? {};
  const [answer, setAnswer] = useState<any>(() =>
    item.kind === 'multi_select' || item.kind === 'compare_levels' ? [] :
    item.kind === 'order_steps' ? [] :
    item.kind === 'match' ? {} :
    item.kind === 'decoder' ? (p.blanks ?? []).map(() => -1) :
    item.kind === 'true_false' ? null : '',
  );
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function submit(preset?: any) {
    const a = preset !== undefined ? preset : answer;
    setBusy(true);
    try {
      const d = await api.post(`/api/academy/exercises/${item.id}/submit`, { answer: a });
      setResult(d);
      onProgress?.();
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  function toggleMulti(i: number) {
    setAnswer((prev: number[]) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  const fb = result && !result.error ? (
    <div className={result.correct ? 'alert alert-ok' : 'alert'} role="status" style={{ marginTop: 10 }}>
      <strong>{result.correct ? 'Correct.' : 'Not quite.'}</strong>{' '}
      <span className="small">{result.explanation ?? item.payload?.explanation}</span>
      {item.kind === 'short_answer' && result?.payload?.sample && (
        <p className="small" style={{ marginTop: 8 }}><strong>Sample strong response:</strong> {result.payload.sample}</p>
      )}
    </div>
  ) : null;

  return (
    <div className="card" style={{ background: 'var(--surface)' }}>
      <p style={{ marginTop: 0 }}><strong>Practice:</strong> {item.prompt}</p>

      {item.kind === 'single_choice' && (
        <div className="form-grid">
          {(p.options ?? []).map((o: string, i: number) => (
            <label key={i} className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="radio" name={`ex-${item.id}`} checked={answer === i} onChange={() => setAnswer(i)} /> {o}
            </label>
          ))}
        </div>
      )}

      {(item.kind === 'multi_select' || item.kind === 'compare_levels') && (
        <div className="form-grid">
          {item.kind === 'compare_levels' && (
            <div className="small" style={{ display: 'grid', gap: 8 }}>
              <details><summary><strong>Weak answer</strong> (click to read)</summary><p style={{ whiteSpace: 'pre-wrap' }}>{p.weak}</p></details>
              <details><summary><strong>Medium answer</strong> (click to read)</summary><p style={{ whiteSpace: 'pre-wrap' }}>{p.medium}</p></details>
              <details open><summary><strong>Strong answer</strong> (click to read)</summary><p style={{ whiteSpace: 'pre-wrap' }}>{p.strong}</p></details>
              <p className="muted" style={{ margin: 0 }}>What makes the strong one stronger? Select ALL that apply:</p>
            </div>
          )}
          {(p.options ?? []).map((o: string, i: number) => (
            <label key={i} className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={(answer as number[]).includes(i)} onChange={() => toggleMulti(i)} /> {o}
            </label>
          ))}
        </div>
      )}

      {item.kind === 'true_false' && (
        <div className="btn-row" style={{ marginTop: 4 }}>
          <button className="btn" onClick={() => submit(true)}>True</button>
          <button className="btn" onClick={() => submit(false)}>False</button>
        </div>
      )}

      {item.kind === 'match' && (
        <div className="form-grid">
          {(p.lefts ?? []).map((left: string) => (
            <label key={left} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>{left}</strong>
              <select
                className="select"
                style={{ maxWidth: 320 }}
                value={(answer as any)[left] ?? ''}
                onChange={(e) => setAnswer((prev: any) => ({ ...prev, [left]: e.target.value }))}
              >
                <option value="">— match —</option>
                {(p.rights ?? []).map((r: string) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      {item.kind === 'order_steps' && (
        <div>
          <p className="small muted">Click steps in order — click again to remove. Your sequence:</p>
          <p className="small">
            {(answer as string[]).length === 0 ? <span className="muted">nothing yet</span> : (answer as string[]).map((s, i) => (
              <span key={i}>
                <button type="button" className="tag" style={{ cursor: 'pointer', margin: '2px' }} onClick={() => setAnswer((prev: string[]) => prev.filter((_, j) => j !== i))} title="Remove">
                  {i + 1}. {s.slice(0, 60)}{s.length > 60 ? '…' : ''} ✕
                </button>{' '}
              </span>
            ))}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(p.steps ?? []).filter((s: string) => !(answer as string[]).includes(s)).map((s: string) => (
              <button key={s} type="button" className="pill" onClick={() => setAnswer((prev: string[]) => [...prev, s])}>
                + {s.slice(0, 60)}{s.length > 60 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {item.kind === 'short_answer' && (
        <>
          <textarea className="textarea" style={{ minHeight: 110 }} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your response — this is a self-check graded on key ideas, not exact wording." />
          <p className="small muted">Self-check: graded on covering the key ideas, not exact wording.</p>
        </>
      )}

      {item.kind === 'decoder' && (
        <div className="form-grid">
          <p className="small" style={{ background: 'var(--well)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}><strong>Question:</strong> {p.question}</p>
          {(p.blanks ?? []).map((b: any, i: number) => (
            <label key={i} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>{b.label}:</strong>
              <select className="select" style={{ maxWidth: 340 }} value={(answer as number[])[i] ?? -1} onChange={(e) => setAnswer((prev: number[]) => prev.map((v, j) => (j === i ? Number(e.target.value) : v)))}>
                <option value={-1}>— choose —</option>
                {(b.options ?? []).map((o: string, j: number) => <option key={j} value={j}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      {item.kind !== 'true_false' && (
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy} onClick={() => submit()}>
            {busy ? 'Checking…' : item.attempted ? 'Try again' : 'Check answer'}
          </button>
          {item.attempted && <span className="small muted" style={{ alignSelf: 'center' }}>{item.correct_before ? '✓ solved before' : 'Attempted — keep practicing'}</span>}
        </div>
      )}
      {result?.error && <div className="alert alert-error">{result.error}</div>}
      {fb}
    </div>
  );
}

interface QuizProps {
  items: any[];
  meta: { total_points: number; mastery_pct: number; attempts: number; best_pct: number; passed: boolean };
  unitSlug: string;
  onDone: () => void;
}

/** Unit quiz runner: answer all → submit → explanations + mastery + retry/review. */
export function QuizRunner({ items, meta, unitSlug, onDone }: QuizProps) {
  const [answers, setAnswers] = useState<any[]>(() =>
    items.map((it) =>
      it.kind === 'multi_select' || it.kind === 'compare_levels' ? [] :
      it.kind === 'order_steps' ? [] :
      it.kind === 'match' ? {} :
      it.kind === 'decoder' ? (it.payload?.blanks ?? []).map(() => -1) :
      it.kind === 'true_false' ? null : '',
    ),
  );
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  function setOne(i: number, v: any) {
    setAnswers((prev) => prev.map((a, j) => (j === i ? v : a)));
  }

  async function submit() {
    setBusy(true);
    try {
      const d = await api.post(`/api/academy/units/${unitSlug}/quiz`, {
        answers: items.map((it, i) => ({ item_id: it.id, answer: answers[i] })),
      });
      setResult(d);
      onDone();
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) return <p className="small muted">No quiz questions in this unit yet.</p>;

  if (result && !result.error) {
    return (
      <div>
        <div className={`card ${result.passed ? '' : ''}`} style={{ borderLeft: `6px solid ${result.passed ? 'var(--green-fg)' : 'var(--yellow-fg)'}` }}>
          <p className="eyebrow dim">Quiz result · attempt {result.attempt_number}</p>
          <h2 style={{ marginTop: 0 }}>{result.score}/{result.total} — {result.pct}% {result.passed ? '· PASSED 🎉' : `· need ${result.mastery_pct}%`}</h2>
          <p className="small muted" style={{ marginBottom: 0 }}>
            {result.passed
              ? result.unit_completed ? 'Unit complete — the next unit is now unlocked.' : 'Mastery reached. Finish the remaining lessons to complete the unit.'
              : 'Below mastery — review the explanations, revisit the lessons, and retry.'}
            {' '}Best so far: {result.best_pct}%.
          </p>
          {!result.passed && (
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => { setResult(null); }}>Retry quiz</button>
            </div>
          )}
        </div>
        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {result.feedback.map((f: any, i: number) => (
            <div className="card" key={f.item_id} style={{ borderLeft: `5px solid ${f.correct ? 'var(--green-fg)' : 'var(--red-fg)'}` }}>
              <p style={{ marginTop: 0 }}><strong>Q{i + 1}.</strong> {f.prompt} <span className="small muted">({f.score}/{f.max_score})</span></p>
              <p className="small" style={{ marginBottom: 0 }}>
                <strong>{f.correct ? 'Correct.' : 'Not quite.'}</strong> {f.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="small muted">
        {items.length} questions · {meta.total_points} points · mastery {meta.mastery_pct}% to pass
        {meta.attempts > 0 ? ` · attempt ${meta.attempts + 1} (best ${meta.best_pct}%)` : ' · first attempt'}
      </p>
      {result?.error && <div className="alert alert-error">{result.error}</div>}
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map((it, i) => (
          <div className="card" key={it.id}>
            <p style={{ marginTop: 0 }}><strong>Q{i + 1}.</strong> {it.prompt} <span className="small muted">({it.points} pt)</span></p>
            {(it.kind === 'single_choice') && (
              <div className="form-grid">
                {(it.payload?.options ?? []).map((o: string, j: number) => (
                  <label key={j} className="small" style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                    <input type="radio" name={`qz-${it.id}`} checked={answers[i] === j} onChange={() => setOne(i, j)} /> {o}
                  </label>
                ))}
              </div>
            )}
            {(it.kind === 'multi_select' || it.kind === 'compare_levels') && (
              <div className="form-grid">
                {it.kind === 'compare_levels' && (
                  <div className="small" style={{ display: 'grid', gap: 8 }}>
                    <details><summary><strong>Weak answer</strong></summary><p style={{ whiteSpace: 'pre-wrap' }}>{it.payload?.weak}</p></details>
                    <details><summary><strong>Medium answer</strong></summary><p style={{ whiteSpace: 'pre-wrap' }}>{it.payload?.medium}</p></details>
                    <details open><summary><strong>Strong answer</strong></summary><p style={{ whiteSpace: 'pre-wrap' }}>{it.payload?.strong}</p></details>
                  </div>
                )}
                {(it.payload?.options ?? []).map((o: string, j: number) => (
                  <label key={j} className="small" style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={(answers[i] as number[]).includes(j)} onChange={() => setOne(i, (answers[i] as number[]).includes(j) ? (answers[i] as number[]).filter((x) => x !== j) : [...(answers[i] as number[]), j])} /> {o}
                  </label>
                ))}
              </div>
            )}
            {it.kind === 'true_false' && (
              <div className="btn-row" style={{ marginTop: 4 }}>
                <button type="button" className={`btn${answers[i] === true ? ' btn-primary' : ''}`} onClick={() => setOne(i, true)}>True</button>
                <button type="button" className={`btn${answers[i] === false ? ' btn-primary' : ''}`} onClick={() => setOne(i, false)}>False</button>
              </div>
            )}
            {it.kind === 'match' && (
              <div className="form-grid">
                {(it.payload?.lefts ?? []).map((left: string) => (
                  <label key={left} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{left}</strong>
                    <select className="select" style={{ maxWidth: 320 }} value={(answers[i] as any)[left] ?? ''} onChange={(e) => setOne(i, { ...(answers[i] as any), [left]: e.target.value })}>
                      <option value="">— match —</option>
                      {(it.payload?.rights ?? []).map((r: string) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            )}
            {it.kind === 'order_steps' && (
              <div>
                <p className="small muted">Click in order:</p>
                <p className="small fine-num">{(answers[i] as string[]).map((s, k) => `${k + 1}. ${s.slice(0, 50)}`).join(' → ') || '—'}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(it.payload?.steps ?? []).filter((s: string) => !(answers[i] as string[]).includes(s)).map((s: string) => (
                    <button key={s} type="button" className="pill" onClick={() => setOne(i, [...(answers[i] as string[]), s])}>+ {s.slice(0, 50)}</button>
                  ))}
                </div>
                {(answers[i] as string[]).length > 0 && (
                  <button type="button" className="btn btn-ghost btn-small" style={{ marginTop: 8 }} onClick={() => setOne(i, [])}>Clear</button>
                )}
              </div>
            )}
            {it.kind === 'short_answer' && (
              <textarea className="textarea" style={{ minHeight: 90 }} value={answers[i]} onChange={(e) => setOne(i, e.target.value)} placeholder="Write your answer — graded on key ideas (self-check)." />
            )}
            {it.kind === 'decoder' && (
              <div className="form-grid">
                <p className="small" style={{ background: 'var(--well)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}><strong>Question:</strong> {it.payload?.question}</p>
                {(it.payload?.blanks ?? []).map((b: any, bi: number) => (
                  <label key={bi} className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{b.label}:</strong>
                    <select className="select" style={{ maxWidth: 340 }} value={(answers[i] as number[])[bi] ?? -1} onChange={(e) => setOne(i, (answers[i] as number[]).map((v, j) => (j === bi ? Number(e.target.value) : v)))}>
                      <option value={-1}>— choose —</option>
                      {(b.options ?? []).map((o: string, j: number) => <option key={j} value={j}>{o}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="btn-row">
        <button className="btn btn-primary btn-lg" disabled={busy} onClick={submit}>{busy ? 'Grading…' : 'Check your understanding'}</button>
      </div>
    </div>
  );
}

/** Answer Surgery: guided multi-step repair. Each step adds exactly one move. */
export function SurgeryRunner({ item, onProgress }: { item: any; onProgress?: () => void }) {
  const p = item.payload ?? {};
  const steps: any[] = p.steps ?? [];
  const [texts, setTexts] = useState<string[]>(() => steps.map(() => ''));
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const d = await api.post(`/api/academy/exercises/${item.id}/submit`, { answer: texts });
      setResult(d);
      onProgress?.();
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card surgery" style={{ background: 'var(--surface)' }}>
      <p className="eyebrow dim">Answer surgery — repair one move at a time</p>
      <div className="surgery-weak">
        <p className="small" style={{ margin: 0 }}><strong>Patient:</strong></p>
        <p style={{ margin: '4px 0 0' }}>{p.weak}</p>
      </div>
      {steps.map((s: any, i: number) => {
        const ok = result && !result.error ? result.steps?.[i] : undefined;
        return (
          <div key={i} className="surgery-step">
            <p style={{ margin: '0 0 4px' }}>
              <strong>Step {i + 1} — {s.label}:</strong> {s.prompt}
            </p>
            <p className="small muted" style={{ margin: '0 0 6px' }}>Hint: {s.hint}</p>
            <textarea
              className="textarea"
              style={{ minHeight: 70 }}
              value={texts[i] ?? ''}
              onChange={(e) => setTexts((prev) => prev.map((t, j) => (j === i ? e.target.value : t)))}
              placeholder={`Write the ${String(s.label ?? 'step').toLowerCase()} move…`}
              aria-label={`Surgery step ${i + 1}: ${s.label}`}
            />
            {ok !== undefined && (
              <p className={`small surgery-flag ${ok ? 'ok' : 'miss'}`} role="status">
                {ok ? '✓ Move present.' : '✗ Missing — compare with the sample below.'}
                {!ok && s.sample && <><br /><strong>Sample:</strong> {s.sample}</>}
              </p>
            )}
          </div>
        );
      })}
      <div className="btn-row">
        <button className="btn btn-primary" disabled={busy} onClick={submit}>
          {busy ? 'Checking…' : item.attempted ? 'Operate again' : 'Complete the surgery'}
        </button>
      </div>
      {result?.error && <div className="alert alert-error">{result.error}</div>}
      {result && !result.error && (
        <div className={result.correct ? 'alert alert-ok' : 'alert'} role="status">
          <strong>{result.correct ? 'Surgery complete.' : 'Partial repair.'}</strong>{' '}
          <span className="small">{result.score}/{result.max_score} moves present. {result.explanation ?? p.explanation}</span>
          {p.closing && <p className="small" style={{ margin: '6px 0 0' }}>{p.closing}</p>}
        </div>
      )}
    </div>
  );
}

/** Academic Breakdown: annotated CLAIM / EVIDENCE / EXPLANATION / ANALYSIS segments. */
export function Breakdown({ weak, strong, why, segments }: { weak: string; strong: string; why: string; segments?: { label: string; text: string }[] }) {
  const [revealed, setRevealed] = useState(false);
  const colors: Record<string, string> = {
    CLAIM: 'var(--blue-fg)',
    EVIDENCE: 'var(--green-fg)',
    EXPLANATION: 'var(--yellow-fg)',
    ANALYSIS: 'var(--accent-deep)',
  };
  return (
    <>
    <div className="ws-pair small">
      <p className="ws-weak" aria-label="Weak example"><strong>✕ Weak:</strong> {weak}</p>
      <p className="ws-strong" aria-label="Strong example"><strong>✓ Stronger:</strong> {strong}</p>
    </div>
    <div className="small" style={{ background: 'var(--well)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
      {!revealed ? (
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setRevealed(true)}>Reveal why it is stronger</button>
      ) : (
        <>
          <p className="muted" style={{ margin: '6px 0' }}><strong>Why stronger:</strong> {why}</p>
          {segments && segments.length > 0 && (
            <div className="breakdown" aria-label="Annotated answer segments">
              {segments.map((s, i) => (
                <div className="bd-seg" key={i}>
                  <span className="bd-label" style={{ color: colors[s.label] ?? 'var(--ink)', borderColor: 'currentColor' }}>{s.label}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
