import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, CATEGORY_LABELS, wordCount } from '../lib/api';
import { useSemester, slotLabel, loadLOs, saveLOs } from '../lib/semester';
import { GradeBadge } from '../components/chrome';
import { JournalTimer } from '../components/JournalTimer';
import { WritingPanel } from '../components/writing';
import { LOPicker } from '../components/loBar';

interface EdpStage {
  stage_no: number;
  title: string;
  body: string;
  prompt: string;
  source: string;
}

export function MockStart() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [allLOs, setAllLOs] = useState<string[]>([]);
  const [los, setLos] = useState<string[]>(loadLOs);
  const [stages, setStages] = useState<EdpStage[]>([]);
  const [stageNo, setStageNo] = useState<number | ''>('');
  const { scope, qs } = useSemester();

  useEffect(() => {
    api.get('/api/sessions').then((d) => setHistory(d.sessions.filter((s: any) => s.mode === 'mock').slice(0, 5))).catch(() => {});
  }, []);

  useEffect(() => {
    api.get(`/api/questions?category=learning_transfer&${qs}`)
      .then((d) => setAllLOs([...new Set((d.questions ?? []).flatMap((q: any) => q.learning_objectives ?? []))].sort() as string[]))
      .catch(() => {});
  }, [qs]);

  useEffect(() => {
    api.get(`/api/edp/stages?${qs}`).then((d) => setStages(d.stages ?? [])).catch(() => {});
  }, [qs]);

  useEffect(() => {
    saveLOs(los);
  }, [los]);

  async function start() {
    setBusy(true);
    setError('');
    try {
      const d = await api.post('/api/sessions/start', {
        grade: scope.grade,
        semester: scope.semester,
        los,
        ...(stageNo === '' ? {} : { edp_stage_no: stageNo }),
      });
      nav(`/mock/${d.session.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="narrow">
      <p className="eyebrow">Mock Journal · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Simulated journal experience</h1>
      <div className="card">
        <p>Four journal-style questions for <strong>G{scope.grade} S{scope.semester}</strong> — answered in sequence. A <strong>countdown timer</strong> runs across all four, exactly like the real journal, and a live <strong>words/minute speed readout</strong> tracks your pace. You can shorten or lengthen the time (default 60:00). At the end you receive a <strong>rubric profile</strong> (not a percentage): your Q1–Q4 levels, strongest area, and a practice plan.</p>
        <ul className="small">
          <li>Question 1: Personal Reflection OR Team Collaboration</li>
          <li>Question 2: Engineering Design Process</li>
          <li>Question 3: Learning Transfer</li>
          <li>Question 4: Learning Transfer</li>
        </ul>
        <p className="small muted" style={{ marginBottom: 0 }}>
          Questions unlock one at a time — you cannot skip ahead. Once a question is answered you can go back and revise it.
        </p>
        {stages.length > 0 && (
          <div className="card" style={{ marginTop: 12 }}>
            <label className="label" htmlFor="mock-stage">Teamwork question — which EDP stage?</label>
            <select
              id="mock-stage"
              className="select"
              value={stageNo}
              onChange={(e) => setStageNo(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Decide later (Q1 may be reflection or teamwork)</option>
              {stages.map((s) => (
                <option key={s.stage_no} value={s.stage_no}>Stage {s.stage_no} — {s.title}</option>
              ))}
            </select>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              Choosing a stage makes Question 1 a <strong>team collaboration</strong> question about that stage, and your answer is graded against it.
              These are platform study-guide stages, not official EDP stages.
            </p>
          </div>
        )}
        {allLOs.length > 0 && (
          <div className="card" style={{ marginTop: 12 }}>
            <p className="small" style={{ margin: '0 0 6px' }}><strong>Q3 + Q4 transfer LOs</strong></p>
            <LOPicker all={allLOs} value={los} onChange={setLos} />
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy} onClick={start}>{busy ? 'Preparing…' : 'Start Mock Journal'}</button>
        </div>
      </div>
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="eyebrow">Recent mock sessions</p>
          {history.map((s: any) => (
            <p key={s.id} className="small"><Link to={`/mock/${s.id}`}>{new Date(s.created_at).toLocaleString()}</Link> · {s.status}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function MockRun() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stageByQuestion, setStageByQuestion] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [timeup, setTimeup] = useState(false);
  const [stages, setStages] = useState<EdpStage[]>([]);
  const { scope } = useSemester();

  async function load() {
    try {
      const d = await api.get(`/api/sessions/${id}`);
      setData(d);
      return d as any;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    api.get(`/api/edp/stages?grade=${scope.grade}&semester=${scope.semester}`)
      .then((d) => setStages(d.stages ?? []))
      .catch(() => {});
  }, [scope.grade, scope.semester]);

  const questions: any[] = data?.questions ?? [];
  const q = questions[idx];

  // Latest saved attempt per question (a student may re-answer an earlier one).
  const latestByQuestion = useMemo(() => {
    const map = new Map<string, any>();
    for (const a of (data?.attempts ?? []) as any[]) map.set(a.question_id, a);
    return map;
  }, [data]);

  // A question is reachable once every question before it has an answer.
  const reachable = useMemo(() => {
    const out: boolean[] = [];
    for (let i = 0; i < questions.length; i++) {
      out.push(questions.slice(0, i).every((qq) => latestByQuestion.has(qq.id)));
    }
    return out;
  }, [questions, latestByQuestion]);

  const answeredCount = questions.filter((qq) => latestByQuestion.has(qq.id)).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  // Restore saved answers + chosen stages after a reload (merged, so unsaved
  // edits the student is typing are never thrown away).
  useEffect(() => {
    if (!data) return;
    const a: Record<string, string> = {};
    const s: Record<string, number> = {};
    for (const att of (data.attempts ?? []) as any[]) {
      a[att.question_id] = att.answer_text ?? '';
      if (att.edp_stage_no) s[att.question_id] = att.edp_stage_no;
    }
    // The session's pre-chosen EDP stage applies to the teamwork question.
    if (data.edp_stage?.stage_no) {
      const teamQ = (data.questions ?? []).find((qq: any) => qq.category === 'team_collaboration');
      if (teamQ && !s[teamQ.id]) s[teamQ.id] = data.edp_stage.stage_no;
    }
    setAnswers((prev) => {
      const next = { ...a };
      for (const k of Object.keys(prev)) if (!(k in next)) next[k] = prev[k];
      return next;
    });
    setStageByQuestion((prev) => {
      const next = { ...s };
      for (const k of Object.keys(prev)) if (!(k in next)) next[k] = prev[k];
      return next;
    });
  }, [data]);

  const answer = q ? (answers[q.id] ?? '') : '';
  const setAnswer = (v: string) => {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: v }));
  };

  const savedHere = q ? latestByQuestion.has(q.id) : false;

  async function submitOne() {
    if (!q) return;
    if (wordCount(answer) < 5) { setError('Write at least a few sentences before continuing.'); return; }
    setBusy(true); setError('');
    try {
      await api.post('/api/attempts', {
        question_id: q.id,
        session_id: id,
        answer_text: answer,
        ...(stageByQuestion[q.id] ? { edp_stage_no: stageByQuestion[q.id] } : {}),
      });
      const fresh = await load();
      const freshAttempts: any[] = fresh?.attempts ?? [];
      const answeredIds = new Set(freshAttempts.map((a) => a.question_id));
      const freshOrder: string[] = fresh?.questions?.map((qq: any) => qq.id) ?? questions.map((qq: any) => qq.id);
      // The next question unlocks only if every earlier one is answered.
      const nextIdx = idx + 1;
      const nextOpen = nextIdx < freshOrder.length && freshOrder.slice(0, nextIdx).every((qid) => answeredIds.has(qid));
      if (nextIdx < freshOrder.length) {
        if (nextOpen) setIdx(nextIdx);
      } else if (answeredIds.size >= freshOrder.length) {
        const r = await api.post(`/api/sessions/${id}/complete`, {});
        setResults(r);
        setDone(true);
      }
    } catch (e: any) {
      setError(e.message);
    } finally { setBusy(false); }
  }

  async function finish() {
    setBusy(true); setError('');
    try {
      const r = await api.post(`/api/sessions/${id}/complete`, {});
      setResults(r);
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally { setBusy(false); }
  }

  if (error && !data) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p className="muted">Loading mock journal…</p>;

  if (done && results) {
    const RANK: Record<string, number> = { BLUE: 0, GREEN: 1, YELLOW: 2, RED: 3 };
    const VERDICT: Record<string, string> = { BLUE: 'Excellent', GREEN: 'Good', YELLOW: 'Needs work', RED: 'Major work' };
    const ranked = Object.entries(results.profile).sort(([, a]: any, [, b]: any) => (RANK[(a as any).grade] ?? 9) - (RANK[(b as any).grade] ?? 9));
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Your rubric profile</h1>
        <ol className="rank-strip">
          {ranked.map(([cat, v]: any) => (
            <li key={cat} data-grade={v.grade}>
              <span className="rank-q">{cat.startsWith('Q') ? cat : 'Q?'}</span>
              <span className="rank-cat">{CATEGORY_LABELS[v.category] ?? v.category}</span>
              <GradeBadge grade={v.grade} />
              <span className="muted small">{VERDICT[v.grade] ?? ''}</span>
            </li>
          ))}
        </ol>
        {Object.keys(results.profile).length < 4 && <div className="alert">You answered {results.answered} of 4 questions. Unanswered categories show no level.</div>}
        <div className="card" style={{ marginTop: 16 }}>
          <p><strong>Strongest area:</strong> {results.strongest_area ? `${CATEGORY_LABELS[results.strongest_area] ?? results.strongest_area} (${results.strongest_question ?? ''})` : '—'}</p>
          <p><strong>Needs most practice:</strong> {results.needs_most_practice ? `${CATEGORY_LABELS[results.needs_most_practice] ?? results.needs_most_practice} (${results.needs_most_practice_question ?? ''})` : '—'}</p>
          <p><strong>Recommended practice plan:</strong> {results.recommended_plan}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => nav('/practice')}>Practice weakest area</button>
            <button className="btn" onClick={() => nav('/progress')}>View Progress</button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return <p className="muted">No questions in this session.</p>;

  const isTeamwork = q.category === 'team_collaboration';
  const chosenStage = stageByQuestion[q.id] ?? null;
  const stageInfo = stages.find((s) => s.stage_no === chosenStage) ?? null;

  return (
    <div>
      <div className="sim-head" aria-label="Simulation status">
        <div className="sim-cell">
          <div className="jt-label">Simulation mode</div>
          <strong>Mock Journal</strong>
        </div>
        <div className="sim-cell">
          <div className="jt-label">Prompt</div>
          <strong className="fine-num">{idx + 1} / {questions.length}</strong>
        </div>
        <div className="sim-cell">
          <div className="jt-label">Category</div>
          <strong style={{ fontSize: 14 }}>{CATEGORY_LABELS[q.category]}</strong>
        </div>
      </div>
      <div className="step-dots" aria-label="Mock journal steps">
        {questions.map((qq: any, i: number) => {
          const done = latestByQuestion.has(qq.id);
          const open = reachable[i];
          const label = `Question ${i + 1}${done ? ', answered' : i === idx ? ', current' : open ? ', not started' : ', locked — answer the earlier question first'}`;
          return (
            <button
              key={qq.id}
              type="button"
              className={`step-dot${done ? ' done' : ''}${i === idx ? ' current' : ''}${!open ? ' locked' : ''}`}
              aria-current={i === idx ? 'step' : undefined}
              aria-label={label}
              title={open ? `Go to question ${i + 1}` : 'Answer the earlier question first'}
              disabled={!open}
              onClick={() => { setIdx(i); setError(''); }}
            >
              <span className="dot" aria-hidden="true">{done ? '✓' : i === idx ? '→' : ''}</span> Q{i + 1}
            </button>
          );
        })}
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        Mock Journal · Question {idx + 1} of {questions.length} · {CATEGORY_LABELS[q.category]}
        {slotLabel(q.question_slot) ? ` · ${slotLabel(q.question_slot)}` : ''}
        {savedHere ? ' · answered (you can revise it)' : ''}
      </p>
      <h1 className="question-text" style={{ marginTop: 0 }}>{q.question_text}</h1>
      <div className="testing-box"><strong>What this tests: </strong>{q.what_testing}</div>
      {isTeamwork && stages.length > 0 && (
        <div className="stage-picker">
          <label className="label" htmlFor="mock-stage-now">Which EDP stage is this teamwork about?</label>
          <select
            id="mock-stage-now"
            className="select"
            value={chosenStage ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? '' : Number(e.target.value);
              setStageByQuestion((prev) => {
                const next = { ...prev };
                if (v === '') delete next[q.id];
                else next[q.id] = v;
                return next;
              });
            }}
          >
            <option value="">Choose a stage…</option>
            {stages.map((s) => (
              <option key={s.stage_no} value={s.stage_no}>Stage {s.stage_no} — {s.title}</option>
            ))}
          </select>
          {stageInfo ? (
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              {stageInfo.body} {stageInfo.prompt ? <><span className="tag">Try it</span> {stageInfo.prompt}</> : null}
            </p>
          ) : (
            <p className="small muted" style={{ margin: '6px 0 0' }}>Pick the stage your team was working on — your answer is graded against it.</p>
          )}
        </div>
      )}
      <JournalTimer words={wordCount(answer)} running={!timeup && !done} onExpired={() => setTimeup(true)} onDurationChange={() => setTimeup(false)} />
      {timeup && <div className="alert alert-error" role="alert"><strong>Time's up!</strong> The journal window has closed. Answers already saved are kept — increase the timer to keep going, or finish what you have.</div>}
      <label className="label" htmlFor="mock-answer">Your answer</label>
      <textarea id="mock-answer" className="textarea" spellCheck lang="en-US" value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={timeup} placeholder="Write in your own words…" />
      <WritingPanel text={answer} onApply={setAnswer} />
      <div className="editor-meta"><span>{wordCount(answer)} words</span></div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="btn-row">
        <button className="btn" disabled={busy || idx === 0} onClick={() => { const p = idx - 1; if (reachable[p]) { setIdx(p); setError(''); } }}>
          ← Previous question
        </button>
        <button className="btn btn-primary" disabled={busy || timeup} onClick={submitOne}>
          {busy ? 'Saving…' : savedHere ? (idx + 1 < questions.length ? 'Update answer & continue' : 'Update answer') : (idx + 1 < questions.length ? 'Save & Next Question' : 'Save & Finish')}
        </button>
        {allAnswered && (
          <button className="btn" disabled={busy} onClick={finish}>Finish Mock Journal</button>
        )}
      </div>
      {!allAnswered && (
        <p className="small muted" style={{ marginTop: 8 }}>
          {answeredCount} of {questions.length} answered. Answer them in order — you can revisit any question you have already answered.
        </p>
      )}
    </div>
  );
}
