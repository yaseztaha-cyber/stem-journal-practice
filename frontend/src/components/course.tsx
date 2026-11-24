import { useState } from 'react';
import { api } from '../lib/api';

/** Word-level diff (LCS) for the revision loop. Texts are short; quadratic DP is fine. */
export function wordDiff(
  before: string,
  after: string,
): { t: string; type: 'same' | 'del' | 'ins' }[] {
  const a = before.split(/(\s+)/).filter((t) => t.length > 0);
  const b = after.split(/(\s+)/).filter((t) => t.length > 0);
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: { t: string; type: 'same' | 'del' | 'ins' }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ t: a[i], type: 'same' });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ t: a[i], type: 'del' });
      i++;
    } else {
      out.push({ t: b[j], type: 'ins' });
      j++;
    }
  }
  while (i < n) out.push({ t: a[i++], type: 'del' });
  while (j < m) out.push({ t: b[j++], type: 'ins' });
  return out;
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

const CHALLENGE_PROMPTS = [
  {
    id: 'failure',
    title: 'Failure',
    question: 'Explain why your first approach failed, what evidence showed it, and what you changed as a result.',
    parts: [
      { label: 'Failure named', keys: ['fail', 'wrong', 'broke', 'did not work', "didn't work", 'crack', 'clog', 'miss'] },
      { label: 'Evidence shown', keys: ['because', 'showed', 'measured', 'found', 'trial', 'test', 'reading', 'data', 'observed'] },
      { label: 'Change made', keys: ['changed', 'switched', 'rebuilt', 'replaced', 'now', 'instead', 'redesign', 'fixed'] },
    ],
  },
  {
    id: 'teamwork',
    title: 'Teamwork',
    question: 'Describe a disagreement in your team, how it was resolved, and what you learned about collaboration.',
    parts: [
      { label: 'Disagreement named', keys: ['disagree', 'conflict', 'argued', 'different', 'deadlock', 'dispute', 'opinion'] },
      { label: 'Resolution shown', keys: ['resolved', 'agreed', 'decided', 'compromise', 'criterion', 'rule', 'vote', 'test'] },
      { label: 'Lesson stated', keys: ['learned', 'realize', 'now', 'change', 'lesson', 'understood'] },
    ],
  },
  {
    id: 'evidence',
    title: 'Evidence',
    question: 'What evidence supports your most important design decision? Explain how the evidence led to it.',
    parts: [
      { label: 'Decision named', keys: ['chose', 'decided', 'selected', 'used', 'picked', 'adopted'] },
      { label: 'Evidence given', keys: ['measured', 'test', 'trial', 'data', 'showed', 'compared', 'reading', 'result', 'observed'] },
      { label: 'Reasoning shown', keys: ['because', 'therefore', 'led', 'meant', 'thus', 'which is why'] },
    ],
  },
];

const EVIDENCE_MARKS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '%', 'min', 'hour', 'day', 'week', 'trial', 'measured', 'reading', 'data', 'test'];
const FOG = ['very', 'really', 'a lot', 'things', 'stuff', 'good', 'bad', 'big', 'small', 'nice', 'great', 'utilize', 'lots'];

interface DimResult {
  dim: string;
  level: 'Strong' | 'Developing' | 'Missing';
  reason: string;
}

function analyzeDraft(promptIdx: number, text: string): DimResult[] {
  const t = ` ${text.toLowerCase()} `;
  const words = t.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const count = (keys: string[]) => keys.filter((k) => t.includes(k)).length;
  const prompt = CHALLENGE_PROMPTS[promptIdx];
  const covered = prompt.parts.filter((p) => p.keys.some((k) => t.includes(k))).length;
  const ev = count(EVIDENCE_MARKS);
  const ex = count(['because', 'therefore', 'since', 'led to', 'which meant', 'thus']);
  const an = count(['learned', 'realized', 'realised', 'rule', 'lesson', 'change']);
  const fog = count(FOG);
  const firstLen = sentences.length ? sentences[0].split(/\s+/).length : 0;
  const lvl = (n: number, full: number): DimResult['level'] => (n >= full ? 'Strong' : n >= 1 ? 'Developing' : 'Missing');
  return [
    { dim: 'Question coverage', level: lvl(covered, prompt.parts.length), reason: `${covered}/${prompt.parts.length} required parts present (${prompt.parts.map((p) => p.label.toLowerCase()).join(', ')}).` },
    { dim: 'Claim', level: firstLen >= 10 ? 'Strong' : firstLen >= 5 ? 'Developing' : 'Missing', reason: firstLen >= 5 ? 'Opening states a position.' : 'Open with one clear position sentence.' },
    { dim: 'Evidence', level: ev >= 2 ? 'Strong' : ev >= 1 ? 'Developing' : 'Missing', reason: ev ? `${ev} checkable marker(s) found (numbers, units, trials).` : 'No checkable markers — add numbers, times, or observations.' },
    { dim: 'Explanation', level: ex >= 2 ? 'Strong' : ex >= 1 ? 'Developing' : 'Missing', reason: ex ? 'Causal language present.' : 'Add a because-sentence: why did it happen?' },
    { dim: 'Analysis', level: an >= 2 ? 'Strong' : an >= 1 ? 'Developing' : 'Missing', reason: an ? 'Lesson/change language present.' : 'State what you learned and what you do differently now.' },
    { dim: 'Academic language', level: fog === 0 && words.length > 0 ? 'Strong' : fog <= 2 ? 'Developing' : 'Missing', reason: fog ? `${fog} foggy word(s) found — replace with precise terms.` : 'Clean, precise wording.' },
    { dim: 'Precision', level: fog === 0 && ev >= 1 ? 'Strong' : fog <= 1 ? 'Developing' : 'Missing', reason: 'Precision means named details instead of vague intensifiers.' },
    { dim: 'Structure', level: sentences.length >= 4 ? 'Strong' : sentences.length >= 2 ? 'Developing' : 'Missing', reason: `${sentences.length} sentence(s) — aim for claim, evidence, explanation, and lesson.` },
  ];
}

/** Full journal challenge: write → dimension feedback → revise → visual diff. Local self-check, honest labels. */
export function MasterChallenge() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [draft, setDraft] = useState('');
  const [dims, setDims] = useState<DimResult[] | null>(null);
  const [revision, setRevision] = useState('');
  const [compared, setCompared] = useState(false);
  const [changed, setChanged] = useState('');
  const [saved, setSaved] = useState(false);

  function analyze() {
    if (draft.trim().split(/\s+/).length < 10) return;
    setDims(analyzeDraft(promptIdx, draft));
    setCompared(false);
    if (!revision) setRevision(draft);
  }

  async function saveReflection() {
    if (!changed.trim()) return;
    try {
      localStorage.setItem('sjp_master_what_changed', changed.trim());
    } catch { /* ignore */ }
    try {
      await api.post('/api/academy/reflections', { key: 'master-challenge', body: changed.trim().slice(0, 1000) });
    } catch { /* account save is best-effort */ }
    setSaved(true);
  }

  const diff = compared ? wordDiff(draft, revision) : [];
  const weakDims = (dims ?? []).filter((d) => d.level !== 'Strong');

  return (
    <div className="card" style={{ background: 'var(--surface)' }}>
      <p className="eyebrow dim">Full journal challenge — can you turn RED into BLUE?</p>
      <div className="seg" role="group" aria-label="Challenge prompts">
        {CHALLENGE_PROMPTS.map((p, i) => (
          <button key={p.id} aria-pressed={promptIdx === i} onClick={() => { setPromptIdx(i); setDims(null); setCompared(false); }}>
            {p.title}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 10 }}><strong>Prompt:</strong> {CHALLENGE_PROMPTS[promptIdx].question}</p>
      <label className="label" htmlFor="mc-draft">Your first version (write fast — quality comes in revision)</label>
      <textarea id="mc-draft" className="textarea" style={{ minHeight: 130 }} value={draft} onChange={(e) => { setDraft(e.target.value); setDims(null); }} placeholder="Write your answer here…" />
      <div className="btn-row">
        <button className="btn btn-primary" disabled={draft.trim().split(/\s+/).length < 10} onClick={analyze}>
          Analyze my draft
        </button>
      </div>
      <p className="small muted">Self-check estimates from taught dimensions — not a grade. Minimum 10 words to analyze.</p>

      {dims && (
        <>
          <h3 style={{ fontSize: 15, marginTop: 14 }}>Dimension feedback</h3>
          <ul className="small" style={{ listStyle: 'none', padding: 0 }}>
            {dims.map((d) => (
              <li key={d.dim} style={{ margin: '6px 0' }}>
                <strong>{d.dim}:</strong>{' '}
                <span className={`grade-chip grade-${d.level === 'Strong' ? 'GREEN' : d.level === 'Developing' ? 'YELLOW' : 'RED'}`}>{d.level}</span>{' '}
                <span className="muted">{d.reason}</span>
              </li>
            ))}
          </ul>
          {weakDims.length > 0 && (
            <p className="small"><strong>Revise these next:</strong> {weakDims.map((d) => d.dim).join(', ')}</p>
          )}
          <label className="label" htmlFor="mc-rev">Your revised version</label>
          <textarea id="mc-rev" className="textarea" style={{ minHeight: 130 }} value={revision} onChange={(e) => { setRevision(e.target.value); setCompared(false); }} />
          <div className="btn-row">
            <button className="btn btn-primary" disabled={!revision.trim()} onClick={() => setCompared(true)}>Compare versions</button>
          </div>
        </>
      )}

      {compared && (
        <>
          <h3 style={{ fontSize: 15, marginTop: 14 }}>Before → after</h3>
          <div className="diff small" aria-label="Revision diff">
            {diff.map((w, i) =>
              w.type === 'same' ? <span key={i}>{w.t}</span>
              : w.type === 'del' ? <del key={i}>{w.t}</del>
              : <ins key={i}>{w.t}</ins>,
            )}
          </div>
          <div className="bar-legend" aria-hidden="true" style={{ marginTop: 6 }}>
            <span><span className="dot" style={{ background: 'var(--red-fg)' }} />removed</span>
            <span><span className="dot" style={{ background: 'var(--green-fg)' }} />added</span>
          </div>
          <label className="label" htmlFor="mc-changed">What changed? (one sentence)</label>
          <input id="mc-changed" className="input" value={changed} onChange={(e) => { setChanged(e.target.value); setSaved(false); }} placeholder="e.g. I added trial numbers and a because-sentence…" />
          <div className="btn-row">
            <button className="btn" disabled={!changed.trim()} onClick={saveReflection}>Save reflection</button>
            {saved && <span className="small" style={{ color: 'var(--green-fg)', fontWeight: 700, alignSelf: 'center' }}>Saved — this is the real certificate.</span>}
          </div>
        </>
      )}
    </div>
  );
}

/** One-sentence lesson reflection, saved account-side. */
export function ReflectionBox({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (!text.trim()) return;
    setError('');
    try {
      await api.post('/api/academy/reflections', { key: `lesson:${lessonId}`, body: text.trim().slice(0, 1000) });
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="small" style={{ background: 'var(--well)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', marginTop: 10 }}>
      <p style={{ margin: '0 0 6px' }}><strong>Reflect:</strong> in one sentence, what changed between the weak and strong answers in “{lessonTitle}”?</p>
      {saved ? (
        <p style={{ margin: 0, color: 'var(--green-fg)', fontWeight: 700 }}>✓ Saved — find it later under Progress → reflections.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="One sentence…" aria-label="Your one-sentence reflection" style={{ flex: 1 }} />
          <button className="btn btn-small" disabled={!text.trim()} onClick={save}>Save</button>
        </div>
      )}
      {error && <p className="alert alert-error" style={{ margin: '8px 0 0' }}>{error}</p>}
    </div>
  );
}

/** Blue Path: the course's signature mental model. */
export function BluePath({ compact = false }: { compact?: boolean }) {
  const steps = ['Question', 'Claim', 'Evidence', 'Explanation', 'Analysis', 'Precision', 'BLUE'];
  return (
    <div className={`bluepath${compact ? ' compact' : ''}`} aria-label="The Blue Path: from question to BLUE">
      {steps.map((s, i) => (
        <div className="bp-row" key={s}>
          {i > 0 && <div className="bp-arrow" aria-hidden="true">↓</div>}
          <div className={`bp-node${s === 'BLUE' ? ' bp-blue' : ''}`}>{s}</div>
        </div>
      ))}
    </div>
  );
}

export interface SkillDatumUI {
  skill: string;
  label: string;
  attempts: number;
  pct: number | null;
  status: 'NOT_STARTED' | 'PRACTICING' | 'UNDERSTOOD' | 'MASTERED';
}

/** Academic Writing Skill Map: structure/evidence/style → analysis → BLUE journal. */
export function SkillMap({ skills }: { skills: SkillDatumUI[] }) {
  const bySkill = new Map(skills.map((s) => [s.skill, s]));
  const st = (s: string) => bySkill.get(s)?.status ?? 'NOT_STARTED';
  const dot = (s: string) => {
    const v = st(s);
    return v === 'MASTERED' ? 'var(--green-fg)' : v === 'UNDERSTOOD' ? 'var(--mint)' : v === 'PRACTICING' ? '#CA8A04' : 'var(--border-strong)';
  };
  const leaf = (name: string, key: string) => <span className="skill-leaf" key={key}>{name}</span>;
  const branch = (skill: string, label: string, leaves: string[]) => (
    <div className="skill-branch" key={skill}>
      <p className="skill-branch-head"><span className="dot" style={{ background: dot(skill) }} aria-hidden="true" /> <strong>{label}</strong> <span className="small muted">{st(skill).replace('_', ' ').toLowerCase()}</span></p>
      <div className="skill-leaves">{leaves.map((l) => leaf(l, `${skill}-${l}`))}</div>
    </div>
  );
  return (
    <div className="skillmap" aria-label="Academic writing skill map">
      <div className="skill-root">ACADEMIC WRITING</div>
      <div className="skill-branches">
        {branch('structure', 'Structure', ['Claims', 'Paragraphs', 'Flow'])}
        {branch('evidence', 'Evidence', ['Examples', 'Sources', 'Citations'])}
        {branch('language', 'Style', ['Precision', 'Formality', 'Objectivity'])}
      </div>
      <div className="skill-fuse" aria-hidden="true">↓</div>
      <div className="skill-branch skill-analysis">
        <p className="skill-branch-head"><span className="dot" style={{ background: dot('analysis') }} aria-hidden="true" /> <strong>Analysis</strong> <span className="small muted">{st('analysis').replace('_', ' ').toLowerCase()} · explanation: {st('explanation').replace('_', ' ').toLowerCase()}</span></p>
      </div>
      <div className="skill-fuse" aria-hidden="true">↓</div>
      <div className="skill-goal">🔵 BLUE JOURNAL</div>
    </div>
  );
}
