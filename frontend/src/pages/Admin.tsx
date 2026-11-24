import { useEffect, useState } from 'react';
import { api, CATEGORY_LABELS } from '../lib/api';

export function Admin() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ category: 'personal_reflection', question_text: '', what_testing: '', difficulty: 'medium', source_label: 'Practice Question', reference_answer: '', required_components: '[\n  {"key":"part_one","label":"Describe…","keywords":["example"]},\n  {"key":"part_two","label":"Explain…","keywords":["because"]}\n]' });

  async function load() {
    try {
      const q = await api.get('/api/admin/questions');
      setQuestions(q.questions);
      const s = await api.get('/api/admin/stats');
      setStats(s);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      let comps;
      try { comps = JSON.parse(form.required_components); } catch { throw new Error('required_components must be valid JSON'); }
      if (editing) {
        await api.put(`/api/admin/questions/${editing.id}`, { ...form, required_components: comps });
        setEditing(null);
      } else {
        await api.post('/api/admin/questions', { ...form, required_components: comps });
      }
      setForm({ category: 'personal_reflection', question_text: '', what_testing: '', difficulty: 'medium', source_label: 'Practice Question', reference_answer: '', required_components: '[\n  {"key":"part_one","label":"Describe…","keywords":["example"]},\n  {"key":"part_two","label":"Explain…","keywords":["because"]}\n]' });
      await load();
    } catch (err: any) { setError(err.message); }
  }

  async function toggleActive(q: any) {
    await api.put(`/api/admin/questions/${q.id}`, { active: !q.active });
    await load();
  }

  return (
    <div>
      <p className="eyebrow">Admin</p>
      <h1 style={{ marginTop: 0 }}>Question & rubric management</h1>
      {error && <div className="alert alert-error">{error}</div>}

      {stats && (
        <div className="card">
          <p className="eyebrow">Practice statistics (anonymized)</p>
          <p className="small">{stats.totals.users} users · {stats.totals.attempts} attempts · {stats.improvement.retries} retries ({stats.improvement.improved} improved)</p>
          <div className="table-wrap">
            <table className="table">
              <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 6 }}>Attempts and rubric levels per question (top 12 by attempts).</caption>
              <thead><tr><th scope="col">Question</th><th scope="col">Attempts</th><th scope="col">Blue</th><th scope="col">Green</th><th scope="col">Yellow</th><th scope="col">Red</th></tr></thead>
              <tbody>
                {stats.per_question.slice(0, 12).map((r: any) => (
                  <tr key={r.id}><td className="small">{r.preview}…</td><td>{r.attempt_count}</td><td>{r.blue}</td><td>{r.green}</td><td>{r.yellow}</td><td>{r.red}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">Top weaknesses: {(stats.weaknesses ?? []).slice(0, 5).map((w: any) => `${w.code} (${w.total})`).join(', ') || '—'}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow">{editing ? 'Edit question' : 'Create question'}</p>
        <form onSubmit={create} className="form-grid">
          <label className="label" htmlFor="aq-category">Category</label>
          <select id="aq-category" className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <label className="label" htmlFor="aq-text">Question text</label>
          <textarea id="aq-text" className="input" rows={3} required value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
          <label className="label" htmlFor="aq-testing">What this tests</label>
          <textarea id="aq-testing" className="input" rows={2} value={form.what_testing} onChange={(e) => setForm({ ...form, what_testing: e.target.value })} />
          <label className="label" htmlFor="aq-comps">Required components (JSON: key, label, keywords)</label>
          <textarea id="aq-comps" className="input" rows={5} style={{ fontFamily: 'monospace', fontSize: 13 }} value={form.required_components} onChange={(e) => setForm({ ...form, required_components: e.target.value })} />
          <label className="label" htmlFor="aq-ref">Reference answer (model exemplar — revealed to students only after they submit an attempt)</label>
          <textarea id="aq-ref" className="input" rows={6} value={form.reference_answer} onChange={(e) => setForm({ ...form, reference_answer: e.target.value })} />
          <div className="btn-row">
            <button className="btn btn-primary">{editing ? 'Save changes' : 'Create question'}</button>
            {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm({ category: 'personal_reflection', question_text: '', what_testing: '', difficulty: 'medium', source_label: 'Practice Question', reference_answer: '', required_components: '[]' }); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow">All questions ({questions.length})</p>
        <div className="table-wrap">
            <table className="table">
              <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 6 }}>All questions with attempt counts and activation controls.</caption>
              <thead><tr><th scope="col">Category</th><th scope="col">Question</th><th scope="col">Attempts</th><th scope="col">Active</th><th scope="col"><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Actions</span></th></tr></thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td className="small">{CATEGORY_LABELS[q.category]}</td>
                  <td className="small">{q.question_text.slice(0, 90)}…</td>
                  <td>{q.attempt_count}</td>
                  <td>{q.active ? 'yes' : 'no'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn btn-ghost btn-small" onClick={() => { setEditing(q); setForm({ category: q.category, question_text: q.question_text, what_testing: q.what_testing, difficulty: q.difficulty, source_label: q.source_label, reference_answer: q.reference_answer ?? '', required_components: JSON.stringify(q.required_components, null, 2) }); }}>Edit</button>{' '}
                    <button className="btn btn-ghost btn-small" onClick={() => toggleActive(q)}>{q.active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AcademyAdmin />
      <JournalImport />
      <WordsManager />
      <StudentsReview />
      <ChallengeContentAdmin />
      <SiteAdmin />
      <AnnouncementsAdmin />
      <FeedbackAdmin />
    </div>
  );
}

function AnnouncementsAdmin() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ title: '', body: '', type: 'announcement', target_roles: ['student'], target_grades: [], target_semesters: [], scheduled_at: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const d = await api.get('/api/admin/announcements');
      setAnnouncements(d.announcements ?? []);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      await api.post('/api/admin/announcements', {
        ...form,
        target_grades: form.target_grades ? form.target_grades.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n)) : [],
        target_semesters: form.target_semesters ? form.target_semesters.split(',').map((s: string) => Number(s.trim())).filter((n: number) => !isNaN(n)) : [],
        scheduled_at: form.scheduled_at || new Date().toISOString(),
      });
      setMsg('Announcement created.');
      setForm({ title: '', body: '', type: 'announcement', target_roles: ['student'], target_grades: [], target_semesters: [], scheduled_at: '' });
      load();
    } catch (err: any) { setError(err.message); }
  }

  async function del(id: string) {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.del(`/api/admin/announcements/${id}`);
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function send(id: string) {
    try {
      await api.post(`/api/admin/announcements/${id}/send`);
      setMsg('Announcement sent.');
      load();
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Announcements (admin)</p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <form onSubmit={create} className="form-grid" style={{ marginTop: 8 }}>
        <label className="label" htmlFor="aa-title">Title</label>
        <input id="aa-title" className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label className="label" htmlFor="aa-body" style={{ marginTop: 8 }}>Body</label>
        <textarea id="aa-body" className="input" rows={4} required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <label className="label" htmlFor="aa-type" style={{ marginTop: 8 }}>Type</label>
        <select id="aa-type" className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="announcement">Announcement</option>
          <option value="reminder">Reminder</option>
          <option value="alert">Alert</option>
        </select>
        <label className="label" htmlFor="aa-roles" style={{ marginTop: 8 }}>Target roles</label>
        <select id="aa-roles" className="select" value={form.target_roles.join(',')} onChange={(e) => setForm({ ...form, target_roles: [e.target.value] })}>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
        <label className="label" htmlFor="aa-grades" style={{ marginTop: 8 }}>Target grades (comma-separated, empty = all)</label>
        <input id="aa-grades" className="input" value={form.target_grades.join(',')} onChange={(e) => setForm({ ...form, target_grades: e.target.value.split(',') })} placeholder="e.g., 11,12" />
        <label className="label" htmlFor="aa-semesters" style={{ marginTop: 8 }}>Target semesters (comma-separated, empty = all)</label>
        <input id="aa-semesters" className="input" value={form.target_semesters.join(',')} onChange={(e) => setForm({ ...form, target_semesters: e.target.value.split(',') })} placeholder="e.g., 1,2" />
        <label className="label" htmlFor="aa-scheduled" style={{ marginTop: 8 }}>Scheduled at (ISO, default now)</label>
        <input id="aa-scheduled" className="input" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-primary">Create Announcement</button>
        </div>
      </form>

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>All Announcements ({announcements.length})</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Recipients</th><th>Read</th><th>Sent</th><th></th></tr></thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td className="small">{a.title}</td>
                  <td className="small">{a.type}</td>
                  <td className="small">{a.recipient_count ?? 0}</td>
                  <td className="small">{a.read_count ?? 0}</td>
                  <td className="small">{a.sent_at ? new Date(a.sent_at).toLocaleString() : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {!a.sent_at && <button className="btn btn-ghost btn-small" onClick={() => send(a.id)}>Send</button>}
                    <button className="btn btn-ghost btn-small" onClick={() => del(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  async function load() {
    try {
      const url = statusFilter === 'all' ? '/api/admin/feedback' : `/api/admin/feedback?status=${statusFilter}`;
      const d = await api.get(url);
      setFeedback(d.feedback ?? []);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); }, [statusFilter]);

  async function respond(id: string, response: string, status: 'replied' | 'closed') {
    try {
      await api.put(`/api/admin/feedback/${id}`, { admin_response: response, status });
      setMsg('Response saved.');
      setOpenReplyId(null);
      setReplyText('');
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function setStatus(id: string, status: 'replied' | 'closed') {
    try {
      await api.put(`/api/admin/feedback/${id}`, { status });
      load();
    } catch (e: any) { setError(e.message); }
  }

  function buttonLabel(f: any): string {
    if (openReplyId === f.id) return 'Close';
    if (f.status === 'open') return 'Reply';
    return 'Re-open';
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Student Feedback Inbox</p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <div className="seg" role="group" aria-label="Feedback status" style={{ marginTop: 8 }}>
        {['all', 'open', 'replied', 'closed'].map((s) => (
          <button key={s} aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <h3 style={{ fontSize: 15, margin: '0 0 8px' }}>Feedback Messages ({feedback.length})</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Subject</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {feedback.map((f) => {
                const isOpen = openReplyId === f.id;
                return (
                  <>
                    <tr>
                      <td className="small"><strong>{f.student_name}</strong><br /><span className="muted">{f.student_email}</span></td>
                      <td className="small">{f.subject}</td>
                      <td><span className={`tag ${f.status}`}>{f.status}</span></td>
                      <td className="small">{new Date(f.created_at).toLocaleDateString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-ghost btn-small" onClick={() => { setOpenReplyId(f.id); setReplyText(''); }}>{buttonLabel(f)}</button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={`${String(f.id)}-reply`}>
                        <td colSpan={5}>
                          <form onSubmit={(e) => { e.preventDefault(); respond(f.id, replyText, 'replied'); }} className="form-grid" style={{ marginTop: 8 }}>
                            <label className="label">Admin Response</label>
                            <textarea className="input" rows={4} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                            <div className="seg" style={{ marginTop: 6 }}>
                              <button type="button" className="btn btn-small" onClick={() => setStatus(f.id, 'replied')}>Mark Replied</button>
                              <button type="button" className="btn btn-small" onClick={() => setStatus(f.id, 'closed')}>Mark Closed</button>
                              <button type="submit" className="btn btn-primary btn-small">Save Response</button>
                              <button type="button" className="btn btn-ghost btn-small" onClick={() => setOpenReplyId(null)}>Cancel</button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function JournalImport() {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [picked, setPicked] = useState<boolean[]>([]);
  const [grade, setGrade] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function parse() {
    if (!file) return;
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const form = new FormData();
      form.append('file', file);
      const data = await api.upload('/api/admin/journal-import/parse', form).catch((e: any) => {
        throw new Error(e?.data?.error || e.message || 'Parse failed');
      });
      setFilename(data.filename ?? file.name);
      setCandidates(data.candidates ?? []);
      setPicked((data.candidates ?? []).map(() => true));
      if ((data.candidates ?? []).length === 0) setError('No journal Q&A pairs detected. The file may be scanned images or a format the splitter cannot read.');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function setCand(i: number, patch: any) {
    setCandidates((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  async function commit() {
    const items = candidates
      .filter((_, i) => picked[i])
      .map((c) => ({
        question_text: c.question,
        category: c.categoryGuess,
        reference_answer: c.answer,
        grade: grade ? Number(grade) : null,
        semester: semester ? Number(semester) : null,
      }));
    if (!items.length) {
      setError('Select at least one pair to import.');
      return;
    }
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const d = await api.post('/api/admin/journal-import/commit', { filename, items });
      setMsg(`Imported ${d.created} question(s) as practice-labeled bank entries. They were NOT marked official.`);
      setCandidates([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Journal import — PDF / DOCX / TXT</p>
      <p className="small muted" style={{ marginTop: 0 }}>
        Upload a journal document. The splitter proposes Q&A pairs — you review every one before anything enters the bank.
        Imports are always labeled practice/imported, never official.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          aria-label="Journal document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button className="btn btn-small" disabled={!file || busy} onClick={parse}>
          {busy ? 'Reading…' : 'Split into Q&A'}
        </button>
      </div>
      {candidates.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <div>
              <p className="small muted" style={{ margin: '0 0 6px' }}>Apply to all imported</p>
              <div className="seg" role="group" aria-label="Import grade">
                <button aria-pressed={grade === ''} onClick={() => setGrade('')}>Shared pool</button>
                {[10, 11, 12].map((g) => (
                  <button key={g} aria-pressed={grade === String(g)} onClick={() => setGrade(String(g))}>G{g}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="small muted" style={{ margin: '0 0 6px' }}>Semester</p>
              <div className="seg" role="group" aria-label="Import semester">
                <button aria-pressed={semester === ''} onClick={() => setSemester('')}>—</button>
                {[1, 2].map((s) => (
                  <button key={s} aria-pressed={semester === String(s)} onClick={() => setSemester(String(s))}>S{s}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {candidates.map((c, i) => (
              <div key={i} className="card" style={{ margin: 0 }}>
                <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}>
                  <input type="checkbox" checked={picked[i]} onChange={(e) => setPicked((p) => p.map((v, j) => (j === i ? e.target.checked : v)))} />
                  Import pair {i + 1}
                </label>
                <label className="label" htmlFor={`ji-q-${i}`}>Question</label>
                <textarea id={`ji-q-${i}`} className="input" rows={2} value={c.question} onChange={(e) => setCand(i, { question: e.target.value })} />
                <label className="label" htmlFor={`ji-c-${i}`}>Category</label>
                <select id={`ji-c-${i}`} className="select" style={{ maxWidth: 300 }} value={c.categoryGuess} onChange={(e) => setCand(i, { categoryGuess: e.target.value })}>
                  <option value="personal_reflection">Personal Reflection</option>
                  <option value="team_collaboration">Team Collaboration</option>
                  <option value="learning_transfer">Learning Transfer</option>
                  <option value="engineering_design_process">Engineering Design Process</option>
                </select>
                <p className="small muted" style={{ margin: '6px 0 0' }}>Answer ({c.answer.length} chars): {c.answer.slice(0, 160)}…</p>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={busy} onClick={commit}>Import selected as practice</button>
          </div>
        </>
      )}
    </div>
  );
}

function WordsManager() {
  const [words, setWords] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const d = await api.get('/api/admin/words');
      setWords(d.words);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(''); setMsg('');
      await api.post('/api/admin/words', { word: draft.trim() });
      setDraft('');
      setMsg('Word added — the checker stops flagging it.');
      load();
    } catch (err: any) { setError(err.message); }
  }

  async function remove(word: string) {
    try {
      await api.del(`/api/admin/words/${encodeURIComponent(word)}`);
      load();
    } catch (e: any) { setError((e as any).message); }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Custom dictionary — {words.length} words</p>
      <p className="small muted" style={{ marginTop: 0 }}>STEM terms the spellchecker must never flag. Students also keep personal lists in their own browsers.</p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <form onSubmit={add} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input className="input" style={{ maxWidth: 260 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g., chitosan" aria-label="New dictionary word" />
        <button className="btn btn-small">Add word</button>
      </form>
      <p className="small" style={{ margin: 0 }}>
        {words.map((w: any) => (
          <span key={w.word} className="tag" style={{ margin: '0 6px 6px 0' }}>
            {w.word}{' '}
            <button
              aria-label={`Remove ${w.word}`}
              onClick={() => remove(w.word)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 800 }}
            >
              ×
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}

function StudentsReview() {
  const [q, setQ] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function search() {
    try {
      setError('');
      const d = await api.get(`/api/admin/students${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
      setStudents(d.students);
      setOpenId(null);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { search(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function openStudent(id: string) {
    if (openId === id) { setOpenId(null); return; }
    try {
      const d = await api.get(`/api/admin/students/${id}/attempts?limit=20`);
      setAttempts(d.attempts);
      setOpenId(id);
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Student answer review</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input className="input" style={{ maxWidth: 300 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" aria-label="Search students" autoComplete="off" />
        <button className="btn btn-small" onClick={search}>Search</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <caption className="small muted" style={{ textAlign: 'left', paddingBottom: 6 }}>Students with attempt counts and latest levels.</caption>
          <thead><tr><th scope="col">Student</th><th scope="col">Attempts</th><th scope="col">Last level</th><th scope="col">Last active</th><th scope="col"><span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Review</span></th></tr></thead>
          <tbody>
            {students.map((s: any) => (
              <>
                <tr key={s.id}>
                  <td className="small"><strong>{s.display_name}</strong><br /><span className="muted">{s.email}</span></td>
                  <td className="fine-num">{s.attempts}</td>
                  <td>{s.last_grade ?? '—'}</td>
                  <td className="small">{s.last_active ? new Date(s.last_active).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-ghost btn-small" onClick={() => openStudent(s.id)} aria-expanded={openId === s.id}>{openId === s.id ? 'Hide' : 'Review'}</button></td>
                </tr>
                {openId === s.id && (
                  <tr key={`${s.id}-detail`}>
                    <td colSpan={5}>
                      {attempts.length === 0 && <p className="small muted">No attempts yet.</p>}
                      {attempts.map((a: any) => (
                        <p key={a.id} className="small" style={{ margin: '6px 0', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                          <strong>{a.grade}</strong> · {CATEGORY_LABELS[a.category] ?? a.category}
                          {a.question_slot ? ` · Q${a.question_slot}` : ''}
                          {a.q_grade != null ? ` · G${a.q_grade}S${a.q_semester ?? ''}` : ''} · attempt {a.attempt_number} · {a.word_count} words
                          <br /><span className="muted">{a.question_preview}…</span>
                          {a.summary && <><br /><span>{a.summary}</span></>}
                        </p>
                      ))}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChallengeContentAdmin() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [cid, setCid] = useState('');
  const [resources, setResources] = useState<any[]>([]);
  const [track, setTrack] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [resForm, setResForm] = useState<any>({ kind: 'document', title: '', url: '', official: false, notes: '' });
  const [stageForm, setStageForm] = useState<any>({ stage_no: 1, title: '', body: '', prompt: '', official: false, sort: 0 });

  async function load() {
    try {
      const d = await api.get('/api/admin/challenges');
      setChallenges(d.challenges);
      if (d.challenges.length && !cid) setCid(d.challenges[0].id);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function loadDetail(id: string) {
    if (!id) return;
    try {
      const [r, t] = await Promise.all([
        api.get(`/api/admin/challenges/${id}/resources`),
        api.get(`/api/admin/challenges/${id}/track`),
      ]);
      setResources(r.resources);
      setTrack(t.track);
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { loadDetail(cid); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [cid]);

  async function addResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(''); setMsg('');
      await api.post('/api/admin/challenge-resources', { ...resForm, challenge_id: cid });
      setResForm({ kind: 'document', title: '', url: '', official: false, notes: '' });
      setMsg('Resource added.');
      loadDetail(cid);
    } catch (err: any) { setError(err.message); }
  }

  async function addStage(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(''); setMsg('');
      await api.post('/api/admin/track-stages', { ...stageForm, stage_no: Number(stageForm.stage_no), sort: Number(stageForm.sort), challenge_id: cid });
      setStageForm({ stage_no: (track.length || 0) + 1, title: '', body: '', prompt: '', official: false, sort: (track.length || 0) + 1 });
      setMsg('Track stage added.');
      loadDetail(cid);
    } catch (err: any) { setError(err.message); }
  }

  async function del(kind: 'resource' | 'stage', id: string) {
    try {
      await api.del(kind === 'resource' ? `/api/admin/challenge-resources/${id}` : `/api/admin/track-stages/${id}`);
      loadDetail(cid);
    } catch (e: any) { setError((e as any).message); }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Challenge content — resources & learning track</p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <label className="label" htmlFor="cc-challenge">Challenge</label>
      <select id="cc-challenge" className="select" style={{ maxWidth: 420 }} value={cid} onChange={(e) => setCid(e.target.value)}>
        {challenges.map((c: any) => <option key={c.id} value={c.id}>G{c.grade} S{c.semester} · {c.title} ({c.school_year})</option>)}
      </select>

      <h3 style={{ fontSize: 15, margin: '14px 0 6px' }}>Resources ({resources.length})</h3>
      {resources.map((r: any) => (
        <p key={r.id} className="small" style={{ margin: '4px 0' }}>
          <span className="tag">{r.official ? 'Official' : 'Supplemental'} · {r.kind}</span> {r.title}
          <button className="btn btn-ghost btn-small" style={{ marginLeft: 8 }} onClick={() => del('resource', r.id)}>Delete</button>
        </p>
      ))}
      <form onSubmit={addResource} className="form-grid" style={{ marginTop: 8 }}>
        <label className="label" htmlFor="cc-rtitle">New resource title</label>
        <input id="cc-rtitle" className="input" required value={resForm.title} onChange={(e) => setResForm({ ...resForm, title: e.target.value })} />
        <label className="label" htmlFor="cc-rurl">URL (empty for offline documents)</label>
        <input id="cc-rurl" className="input" value={resForm.url} onChange={(e) => setResForm({ ...resForm, url: e.target.value })} placeholder="https://…" />
        <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={resForm.official} onChange={(e) => setResForm({ ...resForm, official: e.target.checked })} /> Official (from supplied material)
        </label>
        <div className="btn-row"><button className="btn btn-small">Add resource</button></div>
      </form>

      <h3 style={{ fontSize: 15, margin: '16px 0 6px' }}>Learning track ({track.length})</h3>
      {track.map((t: any) => (
        <p key={t.id} className="small" style={{ margin: '4px 0' }}>
          <strong>{t.stage_no}. {t.title}</strong>{t.official ? ' (official)' : ' (guide)'}
          <button className="btn btn-ghost btn-small" style={{ marginLeft: 8 }} onClick={() => del('stage', t.id)}>Delete</button>
        </p>
      ))}
      <form onSubmit={addStage} className="form-grid" style={{ marginTop: 8 }}>
        <label className="label" htmlFor="cc-sno">Stage number</label>
        <input id="cc-sno" className="input" type="number" min={1} max={50} value={stageForm.stage_no} onChange={(e) => setStageForm({ ...stageForm, stage_no: e.target.value })} />
        <label className="label" htmlFor="cc-stitle">Title</label>
        <input id="cc-stitle" className="input" required value={stageForm.title} onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })} />
        <label className="label" htmlFor="cc-sbody">Guidance (min 10 chars)</label>
        <textarea id="cc-sbody" className="input" rows={3} required value={stageForm.body} onChange={(e) => setStageForm({ ...stageForm, body: e.target.value })} />
        <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={stageForm.official} onChange={(e) => setStageForm({ ...stageForm, official: e.target.checked })} /> Official stage (supported by source material)
        </label>
        <div className="btn-row"><button className="btn btn-small">Add stage</button></div>
      </form>
    </div>
  );
}

function SiteAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [slug, setSlug] = useState('about');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [settings, setSettings] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const p = await api.get('/api/admin/site/pages');
      setPages(p.pages);
      const s = await api.get('/api/admin/site/settings');
      setSettings(s.settings);
      const about = p.pages.find((x: any) => x.slug === slug);
      if (about) { setTitle(about.title); setBody(about.body_md); }
    } catch (e: any) { setError(e.message); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  function pick(next: string) {
    setSlug(next);
    const pg = pages.find((x: any) => x.slug === next);
    if (pg) { setTitle(pg.title); setBody(pg.body_md); }
  }

  async function savePage(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(''); setMsg('');
      await api.put(`/api/admin/site/pages/${slug}`, { title, body_md: body });
      setMsg(`${slug} page saved.`);
      load();
    } catch (err: any) { setError(err.message); }
  }

  async function saveSetting(key: string, value: string) {
    try {
      setError(''); setMsg('');
      await api.put(`/api/admin/site/settings/${key}`, { value });
      setMsg(`${key} saved.`);
      load();
    } catch (err: any) { setError(err.message); }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow">Site content — About / Privacy / Terms / creator</p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <div className="seg" role="group" aria-label="Site page">
        {['about', 'privacy', 'terms'].map((s) => (
          <button key={s} aria-pressed={slug === s} onClick={() => pick(s)}>{s}</button>
        ))}
      </div>
      <form onSubmit={savePage} className="form-grid" style={{ marginTop: 8 }}>
        <label className="label" htmlFor="site-title">Page title</label>
        <input id="site-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="label" htmlFor="site-body">Page body (## headings, paragraphs)</label>
        <textarea id="site-body" className="input" rows={10} value={body} onChange={(e) => setBody(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
        <div className="btn-row"><button className="btn btn-small">Save page</button></div>
      </form>
      <h3 style={{ fontSize: 15, margin: '14px 0 6px' }}>Creator & platform settings</h3>
      {settings.map((s: any) => (
        <form
          key={s.key}
          onSubmit={(e) => { e.preventDefault(); const v = (document.getElementById(`site-set-${s.key}`) as HTMLInputElement)?.value ?? ''; saveSetting(s.key, v); }}
          style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}
        >
          <label className="small" htmlFor={`site-set-${s.key}`} style={{ minWidth: 140 }}><span className="mono-dim">{s.key}</span></label>
          <input id={`site-set-${s.key}`} className="input" style={{ maxWidth: 340 }} defaultValue={s.value} />
          <button className="btn btn-ghost btn-small">Save</button>
        </form>
      ))}
    </div>
  );
}

// ---------------- Academy content management ----------------
type Field = { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'json' | 'lesson'; options?: string[] };

const ACADEMY_KINDS: { id: string; label: string; fields: Field[]; deletable: boolean }[] = [
  {
    id: 'units', label: 'Units', deletable: false,
    fields: [
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'unit_number', label: 'Number', type: 'number' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'est_minutes', label: 'Minutes', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    id: 'lessons', label: 'Lessons', deletable: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'objective', label: 'Objective', type: 'textarea' },
      { key: 'body_md', label: 'Body (mini-markdown)', type: 'textarea' },
      { key: 'examples', label: 'Examples JSON [{weak,strong,why,breakdown?}]', type: 'json' },
      { key: 'widget', label: 'Widget (rq_builder/blue_check/master_challenge/empty)', type: 'text' },
      { key: 'takeaway', label: 'Key takeaway (1–2 sentences)', type: 'textarea' },
      { key: 'order_index', label: 'Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    id: 'videos', label: 'Videos', deletable: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'video_url', label: 'Video URL (empty = slot only)', type: 'text' },
      { key: 'thumbnail_url', label: 'Thumbnail URL', type: 'text' },
      { key: 'duration_seconds', label: 'Duration (sec)', type: 'number' },
      { key: 'transcript', label: 'Transcript', type: 'textarea' },
      { key: 'order_index', label: 'Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    id: 'items', label: 'Quiz & practice items', deletable: true,
    fields: [
      { key: 'lesson_id', label: 'Lesson (empty = unit-level quiz)', type: 'lesson' },
      { key: 'quiz', label: 'Part of graded quiz', type: 'checkbox' },
      { key: 'kind', label: 'Kind', type: 'select', options: ['single_choice', 'multi_select', 'true_false', 'match', 'order_steps', 'short_answer', 'compare_levels', 'decoder'] },
      { key: 'prompt', label: 'Prompt', type: 'textarea' },
      { key: 'payload', label: 'Payload JSON (options/correct/explanation…)', type: 'json' },
      { key: 'points', label: 'Points', type: 'number' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['easy', 'medium', 'hard'] },
      { key: 'order_index', label: 'Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    id: 'tricks', label: 'Smart tricks', deletable: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'order_index', label: 'Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    id: 'mistakes', label: 'Common mistakes', deletable: true,
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Body', type: 'textarea' },
      { key: 'order_index', label: 'Order', type: 'number' },
      { key: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
];

function fieldValue(row: any, f: Field): any {
  const v = row?.[f.key];
  if (f.type === 'json') return typeof v === 'string' ? v : JSON.stringify(v ?? (f.key === 'payload' ? {} : []), null, 2);
  if (f.type === 'checkbox') return !!v;
  if (f.type === 'number') return v ?? 0;
  if (f.type === 'lesson') return v ?? '';
  return v ?? '';
}

function AcademyAdmin() {
  const [units, setUnits] = useState<any[]>([]);
  const [unitId, setUnitId] = useState('');
  const [kind, setKind] = useState('lessons');
  const [rows, setRows] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const def = ACADEMY_KINDS.find((k) => k.id === kind)!;

  async function loadUnits() {
    const d = await api.get('/api/admin/academy/units');
    setUnits(d.units);
    if (!unitId && d.units.length) setUnitId(d.units[0].id);
  }
  async function loadRows(uid: string, k: string) {
    if (k === 'units') {
      setRows(units);
      return;
    }
    const d = await api.get(`/api/admin/academy/${k}?unit_id=${uid}`);
    setRows(d[k]);
    if (k === 'items') {
      const l = await api.get(`/api/admin/academy/lessons?unit_id=${uid}`);
      setLessons(l.lessons);
    }
  }

  useEffect(() => { loadUnits().catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    if (!unitId) return;
    setEditing(null);
    setForm({});
    loadRows(unitId, kind).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId, kind, units.length]);

  function startEdit(row: any) {
    setEditing(row);
    const f: any = {};
    for (const fld of def.fields) f[fld.key] = fieldValue(row, fld);
    setForm(f);
    setMsg('');
  }
  function startAdd() {
    setEditing({ __new: true });
    const f: any = {};
    for (const fld of def.fields) {
      f[fld.key] = fld.type === 'checkbox' ? (fld.key === 'active' ? true : false)
        : fld.type === 'number' ? 0
        : fld.type === 'json' ? (fld.key === 'payload' ? '{}' : '[]')
        : fld.type === 'select' ? (fld.options?.[0] ?? '')
        : '';
    }
    if (kind === 'items') {
      f.quiz = false;
      f.kind = 'single_choice';
      f.difficulty = 'medium';
      f.points = 1;
    }
    setForm(f);
    setMsg('');
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body: any = {};
      for (const fld of def.fields) {
        let v = form[fld.key];
        if (fld.type === 'number') v = Number(v);
        if (fld.type === 'json') {
          try {
            v = JSON.parse(v === '' ? (fld.key === 'payload' ? '{}' : '[]') : v);
          } catch {
            throw new Error(`Invalid JSON in ${fld.label}`);
          }
        }
        if (fld.type === 'lesson' && v === '') v = null;
        body[fld.key] = v;
      }
      if (kind !== 'units') body.unit_id = unitId;
      if (editing?.__new) {
        await api.post(`/api/admin/academy/${kind}`, body);
        setMsg('Created.');
      } else {
        await api.put(`/api/admin/academy/${kind}/${editing.id}`, body);
        setMsg('Saved.');
      }
      setEditing(null);
      setForm({});
      await loadRows(unitId, kind);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleActive(row: any) {
    await api.put(`/api/admin/academy/${kind}/${row.id}`, { active: !row.active });
    await loadRows(unitId, kind);
  }

  async function remove(row: any) {
    if (!window.confirm('Delete this entry?')) return;
    await api.del(`/api/admin/academy/${kind}/${row.id}`);
    await loadRows(unitId, kind);
  }

  function renderField(fld: Field) {
    const v = form[fld.key];
    const set = (nv: any) => setForm({ ...form, [fld.key]: nv });
    switch (fld.type) {
      case 'textarea':
      case 'json':
        return <textarea className="input" rows={fld.type === 'json' || fld.key === 'body_md' || fld.key === 'transcript' ? 6 : 3} style={fld.type === 'json' ? { fontFamily: 'monospace', fontSize: 12.5 } : undefined} value={v ?? ''} onChange={(e) => set(e.target.value)} />;
      case 'number':
        return <input className="input" type="number" value={v ?? 0} onChange={(e) => set(e.target.value)} />;
      case 'checkbox':
        return <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} aria-label={fld.label} />;
      case 'select':
        return (
          <select className="select" value={v ?? ''} onChange={(e) => set(e.target.value)}>
            {(fld.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'lesson':
        return (
          <select className="select" value={v ?? ''} onChange={(e) => set(e.target.value)}>
            <option value="">— unit-level (quiz) —</option>
            {lessons.map((l: any) => <option key={l.id} value={l.id}>{l.order_index}. {l.title}</option>)}
          </select>
        );
      default:
        return <input className="input" value={v ?? ''} onChange={(e) => set(e.target.value)} />;
    }
  }

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <p className="eyebrow dim">Academy content management</p>
      <h2 style={{ marginTop: 0 }}>Units, lessons, videos, quizzes</h2>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok">{msg}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <label className="label">Unit</label>
          <select className="select" style={{ minWidth: 260 }} value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            {units.map((u: any) => <option key={u.id} value={u.id}>{u.unit_number}. {u.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Collection</label>
          <select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
            {ACADEMY_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </div>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button className="btn btn-primary" onClick={startAdd}>+ Add {def.label.slice(0, -1).toLowerCase()}</button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="form-grid" style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}>
          <p className="eyebrow dim">{editing.__new ? `New ${kind.slice(0, -1)}` : 'Edit entry'}</p>
          {def.fields.filter((f) => !(kind === 'units' && editing.__new === undefined && f.key === 'slug')).map((fld) => (
            <div key={fld.key}>
              <label className="label">{fld.label}{fld.type === 'checkbox' ? <>: {renderField(fld)}</> : null}</label>
              {fld.type !== 'checkbox' && renderField(fld)}
            </div>
          ))}
          <div className="btn-row">
            <button className="btn btn-primary">{editing.__new ? 'Create' : 'Save changes'}</button>
            <button type="button" className="btn" onClick={() => { setEditing(null); setForm({}); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="table">
          <thead><tr><th>#</th><th>Title / prompt</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={r.id}>
                <td className="small fine-num">{r.unit_number ?? r.order_index ?? i}</td>
                <td className="small">{(r.title ?? r.prompt ?? r.slug ?? '').slice(0, 100)}</td>
                <td>{r.active ? 'yes' : 'no'}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => startEdit(r)}>Edit</button>{' '}
                  <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => toggleActive(r)}>{r.active ? 'Deactivate' : 'Activate'}</button>{' '}
                  {def.deletable && <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 13, color: 'var(--red-fg)' }} onClick={() => remove(r)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
