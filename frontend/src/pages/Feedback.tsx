import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function FeedbackPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myFeedback, setMyFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/communication/feedback')
      .then((d) => { setMyFeedback(d.feedback ?? []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMsg('');
    try {
      setSubmitting(true);
      await api.post('/api/communication/feedback', { subject: subject.trim(), message: message.trim() });
      setMsg('Feedback sent — an admin will review it.');
      setSubject(''); setMessage('');
      const d = await api.get('/api/communication/feedback');
      setMyFeedback(d.feedback ?? []);
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <p className="eyebrow">Student Feedback</p>
      <h1 style={{ marginTop: 0 }}>Send Feedback to Admin</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <form onSubmit={submit} className="form-grid" style={{ marginTop: 12 }}>
        <label className="label" htmlFor="fb-subject">Subject</label>
        <input id="fb-subject" className="input" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Question Q3 rubric unclear" />
        <label className="label" htmlFor="fb-message" style={{ marginTop: 10 }}>Message</label>
        <textarea id="fb-message" className="input" rows={6} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue or suggestion…" />
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send Feedback'}</button>
        </div>
      </form>

      <div className="card" style={{ marginTop: 24 }}>
        <p className="eyebrow">Your Feedback History</p>
        {myFeedback.length === 0 && <p className="small muted">No feedback submitted yet.</p>}
        {myFeedback.map((f) => (
          <article key={f.id} className="card" style={{ marginTop: 8, padding: 10, border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <strong style={{ fontSize: 14 }}>{f.subject}</strong>
              <span className="small muted">{new Date(f.created_at).toLocaleDateString()}</span>
            </div>
            <span className={`tag ${f.status === 'replied' ? 'tag-ok' : 'tag-pending'}`}>{f.status}</span>
            <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{f.message}</p>
            {f.admin_response && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
                <p className="small muted" style={{ margin: '0 0 4px' }}>Admin reply:</p>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{f.admin_response}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
