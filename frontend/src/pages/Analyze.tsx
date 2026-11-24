import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, CATEGORY_LABELS } from '../lib/api';
import { useSemester } from '../lib/semester';
import { GradeBadge } from '../components/chrome';

interface AnalyzeResult {
  analysis: {
    summary: string;
    estimated_grade: 'BLUE' | 'GREEN' | 'YELLOW' | 'RED' | null;
    confidence: string;
    question_coverage: { component: string; label: string; covered: boolean; evidence: string }[];
    strengths: string[];
    missing_elements: string[];
    weaknesses: string[];
    improvement_actions: string[];
    recommended_practice: string;
  };
  document: { filename: string; pages: number | null; word_count: number; char_count: number; truncated: boolean };
  question: { id: string; category: string; question_text: string } | null;
  extract?: string;
  ai: { available: boolean; model: string | null; provider: string | null };
}

export function Analyze() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [questionId, setQuestionId] = useState('');
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [grading, setGrading] = useState(false);
  const nav = useNavigate();
  const { scope, qs } = useSemester();

  useEffect(() => {
    api.get(`/api/questions?${qs}`).then((d) => setQuestions(d.questions ?? [])).catch(() => {});
  }, [qs]);

  function pickFile(f: File | undefined | null) {
    setError('');
    if (!f) return;
    const name = f.name.toLowerCase();
    const ok = name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.txt');
    if (!ok) {
      setError('Only PDF, DOCX, or TXT files are accepted.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File too large — max 5MB.');
      return;
    }
    setFile(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!file) {
      setError('Choose a PDF file first.');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (questionId) form.append('question_id', questionId);
      const d = await api.upload('/api/analyze/pdf', form);
      setResult(d);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const a = result?.analysis;

  async function gradeAsAnswer() {
    if (!result?.extract || !result?.question) return;
    setGrading(true);
    setError('');
    try {
      const d = await api.post('/api/attempts', { question_id: result.question.id, answer_text: result.extract });
      nav(`/attempt/${d.attempt.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGrading(false);
    }
  }

  return (
    <div>
      <p className="eyebrow">Document laboratory · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Grade your real journal</h1>
      <p className="muted">Upload your journal with its answers (PDF, DOCX, or TXT, max 5MB). The lab extracts it, links it to a journal question, and runs a rubric analysis. Then grade it as your answer for a real level, tips, and retries. Your file is never stored.</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={submit} className="form-grid">
          <label className="label" id="pdf-label">Your journal document</label>
          <div
            className={`dropzone${dragOver ? ' dragover' : ''}`}
            role="button"
            tabIndex={0}
            aria-labelledby="pdf-label"
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              pickFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.docx,.txt"
              aria-label="Choose a journal file"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <div className="dz-icon" aria-hidden="true">📄</div>
            <p className="dz-title">{dragOver ? 'Drop it — we will take it from here' : 'Drag & drop your journal here'}</p>
            <p className="dz-sub">or <strong>browse your files</strong> · PDF, DOCX, TXT · max 5MB · never stored</p>
            {file && (
              <div className="dz-file" onClick={(e) => e.stopPropagation()}>
                <span aria-hidden="true">📎</span>
                <span className="dz-name">{file.name}</span>
                <span className="dz-size">{(file.size / 1024).toFixed(0)} KB</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInput.current) fileInput.current.value = '';
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          <label className="label" htmlFor="analyze-question">Which journal question does this answer? (optional — grounds the analysis)</label>
          <select id="analyze-question" className="select" value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
            <option value="">General Capstone check (no specific question)</option>
            {questions.map((q: any) => (
              <option key={q.id} value={q.id}>
                [{CATEGORY_LABELS[q.category] ?? q.category}] {q.question_text.slice(0, 80)}…
              </option>
            ))}
          </select>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy || !file}>
              {busy ? 'Analyzing… (up to a minute)' : 'Analyze journal'}
            </button>
          </div>
        </form>
      </div>

      {result && a && (
        <div style={{ marginTop: 16 }}>
          <div className="doc-pipe" aria-label="Document pipeline">
            <span className="doc-stage done">Document</span><span className="doc-stage arrow" aria-hidden="true">→</span>
            <span className={`doc-stage${result.question ? ' done' : ''}`}>Journal prompts</span><span className="doc-stage arrow" aria-hidden="true">→</span>
            <span className="doc-stage done">Rubric analysis</span><span className="doc-stage arrow" aria-hidden="true">→</span>
            <span className="doc-stage">Writing opportunities</span>
          </div>
          <div className="doc-sheet">
            <p className="section-label">Document · {result.document.filename}</p>
            <p className="meta-line">
              {result.document.pages != null && <span>{result.document.pages} pages</span>}
              <span className="fine-num">{result.document.word_count} words</span>
              {result.document.truncated && <span>truncated to first section</span>}
            </p>
            {result.question && result.extract && (
              <div className="btn-row">
                <button className="btn btn-primary" disabled={grading} onClick={gradeAsAnswer}>
                  {grading ? 'Grading…' : 'Grade this as my answer →'}
                </button>
              </div>
            )}
            {!result.question && (
              <p className="small muted">Pick a journal question above and re-run to enable one-click grading of this document.</p>
            )}
            {a.estimated_grade
              ? <p style={{ margin: '10px 0' }}><GradeBadge grade={a.estimated_grade} size="lg" /></p>
              : <p className="small"><strong>No estimated level</strong> — configure an AI provider key for rubric-graded analysis.</p>}
            <p>{a.summary}</p>
            {result.question && <p className="small muted">Checked against: {result.question.question_text.slice(0, 120)}…</p>}
          </div>

          <div className="doc-sheet" style={{ marginTop: 16 }} aria-label="Potential journal connections">
            <p className="section-label">Potential journal connections</p>
            {a.question_coverage.length > 0 ? (
              <ul className="small" style={{ listStyle: 'none', padding: 0 }}>
                {a.question_coverage.map((c, i) => (
                  <li key={i} style={{ margin: '6px 0' }}>
                    {c.covered ? '✓ Evidence found' : c.evidence.toLowerCase().includes('no ') || c.evidence.toLowerCase().includes('not') ? '○ Weak connection' : '✕ No evidence'} — {c.label}
                    <br /><span className="muted">{c.evidence}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small muted">No specific prompt was selected — pick a challenge question above and re-run for grounded connections.</p>
            )}
            <div className="btn-row">
              <Link className="btn btn-primary btn-small" to="/practice">Open practice</Link>
            </div>
          </div>

          <div className="card feedback" style={{ marginTop: 16 }}>
            {a.question_coverage.length > 0 && (
              <>
                <h3>Required-part coverage</h3>
                <ul>
                  {a.question_coverage.map((c, i) => (
                    <li key={i}>{c.covered ? '✓' : '✗'} {c.label} — {c.evidence}</li>
                  ))}
                </ul>
              </>
            )}
            {a.strengths.length > 0 && (
              <>
                <h3>What the document does well</h3>
                <ul>{a.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </>
            )}
            {a.missing_elements.length > 0 && (
              <>
                <h3>What is missing</h3>
                <ul>{a.missing_elements.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </>
            )}
            {a.weaknesses.length > 0 && (
              <>
                <h3>Weaknesses</h3>
                <ul>{a.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </>
            )}
            {a.improvement_actions.length > 0 && (
              <>
                <h3>How to improve</h3>
                <ul>{a.improvement_actions.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </>
            )}
            {a.recommended_practice ? (
              <>
                <h3>Recommended practice</h3>
                <p className="small">{a.recommended_practice}</p>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
