import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester } from '../lib/semester';

export function LOConnections() {
  const { scope, qs } = useSemester();
  const [los, setLos] = useState<Map<string, { code: string; subject: string; questions: any[] }[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/api/questions?category=learning_transfer&${qs}`)
      .then((d) => {
        const questions = d.questions ?? [];
        const byLO = new Map<string, { code: string; subject: string; questions: any[] }>();
        for (const q of questions) {
          for (const code of (q.learning_objectives ?? [])) {
            const subject = code.split('.')[0] ?? 'OTHER';
            if (!byLO.has(code)) {
              byLO.set(code, { code, subject, questions: [] });
            }
            byLO.get(code)!.questions.push(q);
          }
        }
        const grouped = new Map<string, { code: string; subject: string; questions: any[] }[]>();
        for (const entry of byLO.values()) {
          const subj = entry.subject;
          if (!grouped.has(subj)) grouped.set(subj, []);
          grouped.get(subj)!.push(entry);
        }
        setLos(grouped);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [qs]);

  if (loading) return <p className="muted">Loading learning objectives…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const subjects = [...los.keys()].sort();

  return (
    <div>
      <p className="eyebrow">Learning Objective Connections · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Subjects → LOs → Practice Questions</h1>
      <p className="small muted" style={{ marginTop: 0 }}>
        Each Learning Objective (LO) below is tested by journal practice questions. Click an LO to see its questions, then answer them from Practice.
      </p>

      {subjects.map((subj) => (
        <section key={subj} className="card" style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>{subj}</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            {los.get(subj)!.map((entry) => (
              <div key={entry.code} className="lo-card" style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span className="tag lo-code">{entry.code}</span>
                  <span className="small muted">{entry.questions.length} question{entry.questions.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                  {entry.questions.slice(0, 3).map((q) => (
                    <span key={q.id} className="tag small" style={{ fontSize: 11 }}>{q.category}</span>
                  ))}
                  {entry.questions.length > 3 && <span className="tag small muted" style={{ fontSize: 11 }}>+{entry.questions.length - 3} more</span>}
                </div>
                <Link className="btn btn-small btn-ghost" to={`/practice?category=learning_transfer&los=${encodeURIComponent(entry.code)}`}>
                  Practice {entry.code} questions →
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}

      {subjects.length === 0 && (
        <p className="empty">No Learning Transfer questions found for this semester. LOs come from practice pack data tagged with subject codes (CH, PH, BI, MA, ES, CS, ENL).</p>
      )}
    </div>
  );
}
