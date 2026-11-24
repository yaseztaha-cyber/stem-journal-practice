import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester } from '../lib/semester';

const SECTIONS = [
  { id: 'title', label: 'Title', tip: 'Name variables + context. Never hopes or journeys.', rows: 1 },
  { id: 'research_question', label: 'Research question', tip: 'Factor + outcome + context. Must be answerable by evidence.', rows: 2 },
  { id: 'background', label: 'Background', tip: 'Problem → known → gap → direction. Earn the study\u2019s existence.', rows: 6 },
  { id: 'hypothesis', label: 'Hypothesis (if any)', tip: 'What you expect, stated before results can tempt you.', rows: 3 },
  { id: 'methods', label: 'Methods', tip: 'Repeatable detail: materials, setup, procedure, measurements, controls.', rows: 6 },
  { id: 'results', label: 'Results', tip: 'Report observations plainly. No interpretation, no adjectives-as-proof.', rows: 6 },
  { id: 'discussion', label: 'Discussion', tip: 'What do results mean? Compare, explain surprises, admit limits.', rows: 6 },
  { id: 'conclusion', label: 'Conclusion', tip: 'Only what the evidence supports — with conditions attached.', rows: 4 },
  { id: 'references_text', label: 'References', tip: 'Every source actually used, consistent format. Cite while writing.', rows: 4 },
];

export function ResearchLab() {
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const nav = useNavigate();
  const { scope, qs } = useSemester();

  async function load() {
    try {
      setProjects((await api.get(`/api/research?${qs}`)).projects);
      const ch = await api.get(`/api/challenges?${qs}`).catch(() => ({ challenges: [] }));
      setChallengeId((ch.challenges ?? [])[0]?.id ?? null);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, [qs]);

  async function create() {
    try {
      const d = await api.post('/api/research', {
        title: 'Untitled research',
        grade: scope.grade,
        semester: scope.semester,
        challenge_id: challengeId,
      });
      nav(`/lab/${d.project.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <p className="eyebrow">Research Paper Lab · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Your research workspace</h1>
      <p className="muted">Move section by section — learn, draft, check. The AI coach reviews clarity and structure but never invents sources, data, or citations.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="btn-row" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={create}>+ New research project</button>
        <Link className="btn" to="/academy/research-fundamentals">Learn: Research Fundamentals</Link>
      </div>
      {projects.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 30 }} aria-hidden="true">🔬</div>
          <p style={{ margin: '8px 0 2px', fontWeight: 800, color: 'var(--ink)' }}>No research projects yet</p>
          <p className="small muted">Start one above — title and question first, sources serve the question.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {projects.map((p: any) => (
            <Link key={p.id} to={`/lab/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card card-hover">
                <div className="q-meta">
                  <span className="tag">{p.status}</span>
                  {p.grade != null && p.semester != null && <span className="tag">G{p.grade} • S{p.semester}</span>}
                  <span className="q-source">updated {new Date(p.updated_at).toLocaleDateString()}</span>
                </div>
                <p style={{ margin: '8px 0 4px', fontSize: 17, fontWeight: 800 }}>{p.title}</p>
                {p.research_question && <p className="small muted" style={{ margin: 0 }}>{p.research_question}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SourcesManager({ sources, onSave }: { sources: any[]; onSave: (s: any[]) => void }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [citation, setCitation] = useState('');
  const [official, setOfficial] = useState(false);

  function add() {
    const t = title.trim();
    if (!t) return;
    onSave([...sources, { title: t, note: note.trim(), citation: citation.trim(), official }]);
    setTitle('');
    setNote('');
    setCitation('');
    setOfficial(false);
  }

  function removeAt(i: number) {
    onSave(sources.filter((_, j) => j !== i));
  }

  return (
    <section className="card" style={{ marginTop: 12 }} aria-label="Source manager">
      <p className="section-label">Sources — only what you actually read</p>
      {sources.length === 0 && <p className="small muted">No sources tracked yet. Add each source you read; the coach never invents them.</p>}
      {sources.map((s: any, i: number) => (
        <div key={i} className="small" style={{ borderTop: '1px solid var(--border)', padding: '8px 0' }}>
          <p style={{ margin: '0 0 2px' }}>
            <strong>{s.title}</strong>{' '}
            <span className="tag">{s.official ? 'Official' : 'Supplemental'}</span>
          </p>
          {s.note && <p className="muted" style={{ margin: '0 0 2px' }}>{s.note}</p>}
          {s.citation && <p className="mono-dim" style={{ margin: '0 0 4px' }}>{s.citation}</p>}
          <button className="btn btn-ghost btn-small" onClick={() => removeAt(i)}>Remove</button>
        </div>
      ))}
      <div className="form-grid" style={{ marginTop: 8 }}>
        <label className="label" htmlFor="src-title">New source title</label>
        <input id="src-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Author (year), title, journal" />
        <label className="label" htmlFor="src-note">What you took from it (one line)</label>
        <input id="src-note" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g., barrier effect size for starch coatings" />
        <label className="label" htmlFor="src-cite">Full citation</label>
        <input id="src-cite" className="input" value={citation} onChange={(e) => setCitation(e.target.value)} placeholder="Author, A. (year). Title. Journal." />
        <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={official} onChange={(e) => setOfficial(e.target.checked)} /> Official/supplied source
        </label>
        <div className="btn-row"><button className="btn btn-primary btn-small" onClick={add} disabled={!title.trim()}>Add source</button></div>
      </div>
    </section>
  );
}

export function ResearchEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [section, setSection] = useState('research_question');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function load() {
    try {
      setProject((await api.get(`/api/research/${id}`)).project);
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function save(patch: any) {
    try {
      setSaving('Saving…');
      const d = await api.put(`/api/research/${id}`, patch);
      setProject(d.project);
      setSaving(`Saved ${new Date(d.project.updated_at).toLocaleTimeString()}`);
    } catch (e: any) {
      setSaving('');
      setError(e.message);
    }
  }

  // debounced autosave on draft edits
  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      const { title, research_question, background, hypothesis, methods, results, discussion, conclusion, references_text } = project;
      save({ title, research_question, background, hypothesis, methods, results, discussion, conclusion, references_text });
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.title, project?.research_question, project?.background, project?.hypothesis, project?.methods, project?.results, project?.discussion, project?.conclusion, project?.references_text]);

  async function analyzeSection() {
    const text = (project?.[section] ?? '').trim();
    if (text.length < 20) {
      setError('Write at least a few sentences in this section first.');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      setAnalysis(await api.post('/api/analyze/text', { section, draft: text }));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this research project?')) return;
    try {
      await api.del(`/api/research/${id}`);
      nav('/lab');
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (error && !project) return <div className="alert alert-error">{error}</div>;
  if (!project) return <p className="muted">Loading project…</p>;
  const sec = SECTIONS.find((s) => s.id === section)!;

  return (
    <div>
      <p className="eyebrow"><Link to="/lab">Research Paper Lab</Link></p>
      <input
        className="input"
        style={{ fontSize: 24, fontWeight: 800, border: 'none', paddingLeft: 0, boxShadow: 'none' }}
        value={project.title}
        onChange={(e) => setProject({ ...project, title: e.target.value })}
        aria-label="Research title"
      />
      {(() => {
        const secs = ['research_question', 'background', 'hypothesis', 'methods', 'results', 'discussion', 'conclusion', 'references_text'];
        const filled = secs.filter((s) => (project[s] ?? '').trim().length > 0).length;
        const sources = Array.isArray(project.sources) ? project.sources.length : 0;
        const next = !project.research_question?.trim() ? 'State your research question'
          : !project.background?.trim() ? 'Build the literature background'
          : !project.methods?.trim() ? 'Draft your methods'
          : !project.results?.trim() ? 'Record your results'
          : !project.discussion?.trim() ? 'Interpret in the discussion'
          : !project.conclusion?.trim() ? 'Write the conclusion'
          : !project.references_text?.trim() ? 'Complete your references'
          : 'Review and finalize';
        return (
          <div className="doc-sheet" style={{ margin: '12px 0 0' }} aria-label="Current paper status">
            <p className="section-label">Current paper</p>
            <p className="meta-line">
              <span className="fine-num">{filled}/{secs.length} sections drafted</span>
              <span className="fine-num">{sources} sources</span>
              <span>{project.references_text?.trim() ? 'citations present' : 'citations missing'}</span>
            </p>
            <p className="small" style={{ margin: '8px 0 0' }}><strong>Next step:</strong> {next}</p>
          </div>
        );
      })()}
      <p className="small muted" role="status">{saving} · status: {project.status}</p>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="seg" role="group" aria-label="Paper sections" style={{ marginTop: 8 }}>
        {SECTIONS.map((s) => {
          const filled = (project[s.id] ?? '').trim().length > 0;
          return (
            <button key={s.id} aria-pressed={section === s.id} onClick={() => { setSection(s.id); setAnalysis(null); }} title={s.label}>
              {filled ? '✓ ' : ''}{s.label}
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <p className="eyebrow dim">Learn — {sec.label}</p>
        <p className="small" style={{ marginTop: 0 }}><strong>Job of this section:</strong> {sec.tip}</p>
        <label className="label" htmlFor="sec-draft">Draft</label>
        <textarea
          id="sec-draft"
          className="textarea"
          style={{ minHeight: sec.rows * 32 }}
          value={project[section] ?? ''}
          onChange={(e) => setProject({ ...project, [section]: e.target.value })}
          placeholder={`Write your ${sec.label.toLowerCase()} here — your own words, your own data…`}
        />
        <div className="btn-row">
          <button className="btn" onClick={() => save({ [section]: project[section] })}>Save now</button>
          <button className="btn btn-primary" disabled={analyzing} onClick={analyzeSection}>
            {analyzing ? 'Coaching…' : 'Coach this section'}
          </button>
          <select
            className="select"
            style={{ maxWidth: 200 }}
            value={project.status}
            onChange={(e) => save({ status: e.target.value })}
            aria-label="Project status"
          >
            <option value="draft">draft</option>
            <option value="in_review">in review</option>
            <option value="done">done</option>
          </select>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--red-fg)' }} onClick={remove}>Delete</button>
        </div>
      </div>

      <SourcesManager sources={Array.isArray(project.sources) ? project.sources : []} onSave={(sources) => save({ sources })} />

      {analysis && (
        <div className="card feedback" style={{ marginTop: 12 }}>
          <p className="eyebrow dim">Coach feedback {analysis.ai?.available ? `· ${analysis.ai.model}` : '· local check'}</p>
          <p>{analysis.analysis.summary}</p>
          <p className="small"><strong>Section fit:</strong> {analysis.analysis.section_fit}</p>
          {analysis.analysis.strengths?.length > 0 && (<><h3>Strengths</h3><ul>{analysis.analysis.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></>)}
          {analysis.analysis.missing_elements?.length > 0 && (<><h3>Missing</h3><ul>{analysis.analysis.missing_elements.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></>)}
          {analysis.analysis.weaknesses?.length > 0 && (<><h3>Weaknesses</h3><ul>{analysis.analysis.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></>)}
          {analysis.analysis.improvement_actions?.length > 0 && (<><h3>Next actions</h3><ul>{analysis.analysis.improvement_actions.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></>)}
        </div>
      )}
    </div>
  );
}
