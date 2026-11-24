import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, CATEGORY_LABELS } from '../lib/api';

export function Project() {
  const [form, setForm] = useState<any>({ name: '', problem: '', description: '', role: '', team_members: '', edp_steps: '', challenges: '', outcomes: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/project').then((d) => {
      if (d.project) {
        setForm({
          name: d.project.name ?? '',
          problem: d.project.problem ?? '',
          description: d.project.description ?? '',
          role: d.project.role ?? '',
          team_members: (d.project.team_members ?? []).join(', '),
          edp_steps: (d.project.edp_steps ?? []).join(', '),
          challenges: d.project.challenges ?? '',
          outcomes: d.project.outcomes ?? '',
        });
      }
    }).catch((e) => setError(e.message));
  }, []);

  function set(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.put('/api/project', {
        name: form.name || null,
        problem: form.problem || null,
        description: form.description || null,
        role: form.role || null,
        team_members: form.team_members ? form.team_members.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        edp_steps: form.edp_steps ? form.edp_steps.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        challenges: form.challenges || null,
        outcomes: form.outcomes || null,
      });
      setMsg('Project context saved. Feedback will now reference your real project instead of asking for generic examples.');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="narrow">
      <p className="eyebrow">Project context (optional)</p>
      <h1 style={{ marginTop: 0 }}>Tell the coach about your Capstone</h1>
      <p className="muted small">This makes feedback specific (“describe the challenge you faced while testing the prototype…”) instead of generic (“give an example”). The system never invents project details — it only uses what you provide here and in your answers.</p>
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="doc-sheet" style={{ marginBottom: 16 }} aria-label="Practice for your project">
        <p className="section-label">Practice for your project</p>
        <p className="small" style={{ marginTop: 0 }}>Journal prompts related to your real work — research question, experimental design, reflection, evidence, results:</p>
        <div className="btn-row" style={{ marginTop: 8 }}>
          {(Object.keys(CATEGORY_LABELS) as string[]).map((c) => (
            <Link key={c} className="btn btn-ghost btn-small" to={`/practice?category=${c}`}>{CATEGORY_LABELS[c]}</Link>
          ))}
        </div>
        <p className="small muted" style={{ margin: '8px 0 0' }}>Save your context above first — then every answer you write is graded against your actual Capstone.</p>
      </div>

      <form onSubmit={save} className="card form-grid">
        <label className="label" htmlFor="name">Project name</label>
        <input id="name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., Low-cost water filtration" />
        <label className="label" htmlFor="problem">Problem you address</label>
        <textarea id="problem" className="input" rows={2} value={form.problem} onChange={(e) => set('problem', e.target.value)} />
        <label className="label" htmlFor="desc">Short description</label>
        <textarea id="desc" className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        <label className="label" htmlFor="role">Your role in the team</label>
        <input id="role" className="input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g., prototyping lead" />
        <label className="label" htmlFor="team">Team members (comma-separated)</label>
        <input id="team" className="input" value={form.team_members} onChange={(e) => set('team_members', e.target.value)} />
        <label className="label" htmlFor="edp">EDP steps you worked on (comma-separated)</label>
        <input id="edp" className="input" value={form.edp_steps} onChange={(e) => set('edp_steps', e.target.value)} placeholder="e.g., prototyping, testing, redesign" />
        <label className="label" htmlFor="chal">Major challenges</label>
        <textarea id="chal" className="input" rows={2} value={form.challenges} onChange={(e) => set('challenges', e.target.value)} />
        <label className="label" htmlFor="out">Important learning outcomes</label>
        <textarea id="out" className="input" rows={2} value={form.outcomes} onChange={(e) => set('outcomes', e.target.value)} />
        <div className="btn-row"><button className="btn btn-primary">Save Project Context</button></div>
      </form>
    </div>
  );
}
