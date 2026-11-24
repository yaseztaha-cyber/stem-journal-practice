import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function markRead(id: string) {
    try {
      await api.put(`/api/communication/announcements/${id}/read`);
      setAnnouncements(announcements.map((a) => a.id === id ? { ...a, read_at: new Date().toISOString() } : a));
    } catch (e: any) { setError(e.message); }
  }

  useEffect(() => {
    api.get('/api/communication/announcements')
      .then((d) => { setAnnouncements(d.announcements ?? []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <p className="muted">Loading announcements…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <p className="eyebrow">Announcements</p>
      <h1 style={{ marginTop: 0 }}>Platform Announcements</h1>
      {announcements.length === 0 && (
        <p className="empty">No announcements yet. Check back later.</p>
      )}
      {announcements.map((a) => (
        <article key={a.id} className="card" style={{ marginTop: 10, borderLeft: '4px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
            <span className={`tag ${a.type === 'alert' ? '' : a.type === 'reminder' ? '' : ''}`}>{a.type}</span>
            <span className="small muted">{new Date(a.scheduled_at).toLocaleDateString()}</span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>{a.title}</h3>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{a.body}</p>
          <div style={{ marginTop: 8 }}>
            <span className={`small muted ${a.read_at ? '' : ''}`}>
              {a.read_at ? 'Read' : 'Unread'}
            </span>
            {!a.read_at && (
              <button className="btn btn-small btn-ghost" style={{ marginLeft: 8 }} onClick={() => markRead(a.id)}>Mark read</button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
