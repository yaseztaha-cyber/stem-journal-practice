import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export function Mistakes() {
  const [rows, setRows] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [unit, setUnit] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim().length >= 2) params.set('q', q.trim());
      if (unit) params.set('unit', unit);
      api.get(`/api/academy/mistakes?${params.toString()}`)
        .then((d) => {
          setRows(d.mistakes);
          setUnits(d.units);
        })
        .catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [q, unit]);

  return (
    <div>
      <p className="eyebrow"><Link to="/academy">Academic Writing</Link> · Library</p>
      <h1 style={{ marginTop: 0 }}>Mistake Library</h1>
      <p className="muted">Every mistake below comes from a real unit lesson — each tells you what it looks like, why it is weak, and how to fix it.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <input
          className="input"
          style={{ maxWidth: 320 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search: vague, evidence, citation…"
          autoComplete="off"
          aria-label="Search mistakes"
        />
        <select className="select" style={{ maxWidth: 280 }} value={unit} onChange={(e) => setUnit(e.target.value)} aria-label="Filter by unit">
          <option value="">All units</option>
          {units.map((u: any) => <option key={u.slug} value={u.slug}>Unit {u.unit_number} — {u.title}</option>)}
        </select>
      </div>
      {rows.length === 0 ? (
        <div className="empty">No mistakes match — try “vague”, “evidence”, or “citation”.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map((m: any, i: number) => (
            <div className="card" key={`${m.unit_slug}-${i}`}>
               <p style={{ marginTop: 0 }}><strong>⚠️ {m.title}</strong></p>
              <p className="small" style={{ margin: '4px 0' }}>{m.body}</p>
              <p className="small muted" style={{ margin: 0 }}>
                <Link to={`/academy/${m.unit_slug}`}>Unit {m.unit_number} — {m.unit_title} →</Link>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
