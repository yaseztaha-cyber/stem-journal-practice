import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester } from '../lib/semester';

// Challenge Resources (§32): this semester's official + supplemental resources,
// honestly labeled. Never fabricated — empty when nothing is imported.
export function Resources() {
  const { scope, qs } = useSemester();
  const [challenge, setChallenge] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setChallenge(null);
    setResources([]);
    api.get(`/api/challenges?${qs}`)
      .then((d) => {
        const first = (d.challenges ?? [])[0];
        if (!first) return;
        return api.get(`/api/challenges/${first.id}`).then((det) => {
          setChallenge(det.challenge);
          setResources(det.resources ?? []);
        });
      })
      .catch((e) => setError(e.message));
  }, [qs]);

  if (error) return <div className="alert alert-error">{error}</div>;

  const official = resources.filter((r) => r.official);
  const supplemental = resources.filter((r) => !r.official);

  function ResourceList({ items }: { items: any[] }) {
    if (!items.length) return <p className="muted small">None attached yet.</p>;
    return (
      <>
        {items.map((r: any) => (
          <p key={r.id} className="small" style={{ margin: '8px 0' }}>
            <span className="tag">{r.kind}</span>{' '}
            {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : <strong>{r.title}</strong>}
            {r.notes && <span className="muted"> — {r.notes}</span>}
          </p>
        ))}
      </>
    );
  }

  return (
    <div>
      <p className="eyebrow">Resources · G{scope.grade} • S{scope.semester}</p>
      <h1 style={{ marginTop: 0 }}>Challenge resources</h1>
      {!challenge ? (
        <div className="alert">
          No challenge resources for G{scope.grade} S{scope.semester} yet — nothing is invented here.
          Meanwhile, the <Link to="/subjects">subject reference library</Link> is always available.
        </div>
      ) : (
        <>
          <p className="muted small">For: <strong>{challenge.title}</strong> ({challenge.school_year})</p>
          <section className="card" aria-label="Official resources">
            <p className="section-label">Official resources</p>
            <ResourceList items={official} />
          </section>
          <section className="card" style={{ marginTop: 12 }} aria-label="Supplemental resources">
            <p className="section-label">Supplemental resources</p>
            <ResourceList items={supplemental} />
          </section>
        </>
      )}
      <div className="btn-row">
        <Link className="btn" to="/subjects">Subject reference library</Link>
        <Link className="btn" to="/challenge">Open EDP challenge</Link>
      </div>
    </div>
  );
}
