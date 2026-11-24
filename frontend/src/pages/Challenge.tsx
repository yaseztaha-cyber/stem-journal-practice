import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester } from '../lib/semester';

const SECTION_TITLES: Record<string, string> = {
  requirements: 'Requirements',
  materials: 'Materials',
  packaging: 'Packaging',
  measurements: 'Measurements & experiments',
  constraints: 'Safety & constraints',
  deliverables: 'Deliverables',
};

export function ChallengePage() {
  const { scope, qs } = useSemester();
  const [list, setList] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    setDetail(null);
    api.get(`/api/challenges?${qs}`)
      .then((d) => {
        setList(d.challenges ?? []);
        const first = (d.challenges ?? [])[0];
        if (first) return api.get(`/api/challenges/${first.id}`).then(setDetail);
      })
      .catch((e) => setError(e.message));
  }, [qs]);

  if (error) return <div className="alert alert-error">{error}</div>;

  if (list.length === 0) {
    return (
      <div className="narrow">
        <p className="eyebrow">EDP Challenge · G{scope.grade} • S{scope.semester}</p>
        <h1 style={{ marginTop: 0 }}>Challenge content not yet imported</h1>
        <div className="card">
          <p>
            The official challenge for Grade {scope.grade} Semester {scope.semester} has not been loaded into the
            platform yet. Nothing here is invented — the page will appear once the official material is imported by an
            admin.
          </p>
          <p className="small muted">Meanwhile you can keep training:</p>
          <div className="btn-row">
            <Link className="btn btn-primary" to="/practice">Journal Practice</Link>
            <Link className="btn" to="/academy">Academic Writing</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return <p className="muted">Loading challenge…</p>;
  const c = detail.challenge;

  return (
    <div>
      <p className="eyebrow">EDP Challenge · G{c.grade} • S{c.semester} · {c.school_year}</p>
      <h1 style={{ marginTop: 0 }}>{c.title}</h1>
      {c.subtitle && <p className="muted" style={{ marginTop: -8 }}>{c.subtitle}</p>}
      {c.theme && <p><span className="tag">Theme: {c.theme}</span></p>}

      {(c.big_idea || c.essential_question || c.design_challenge) && (
        <div className="card">
          {c.big_idea && (<><p className="eyebrow">Big idea</p><p>{c.big_idea}</p></>)}
          {c.essential_question && (<><p className="eyebrow">Essential question</p><p>{c.essential_question}</p></>)}
          {c.design_challenge && (<><p className="eyebrow">Design challenge</p><p>{c.design_challenge}</p></>)}
        </div>
      )}

      {(detail.sections ?? []).map((s: any, i: number) => (
        <section className="card" key={s.section} style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>
            <span className="mono-dim" aria-hidden="true">§{i + 1} — </span>{s.heading || SECTION_TITLES[s.section] || s.section}
          </h2>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{s.body}</p>
        </section>
      ))}

      {(detail.track ?? []).length > 0 && (
        <section className="card" style={{ marginTop: 12 }} aria-label="How to approach this challenge">
          <h2 style={{ fontSize: 18, margin: '0 0 4px' }}>How to approach it</h2>
          <p className="small muted" style={{ margin: '0 0 10px' }}>
            A platform study guide for working through this challenge — not official EDP stages.
          </p>
          <ol className="track-steps">
            {(detail.track ?? []).map((t: any) => (
              <li key={t.id}>
                <strong>{t.stage_no}. {t.title}</strong>
                <p className="small" style={{ margin: '4px 0' }}>{t.body}</p>
                {t.prompt && <p className="small" style={{ margin: 0 }}><span className="tag">Try it</span> {t.prompt}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {c.timeline && (
        <section className="card" style={{ marginTop: 12 }}>
          <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Timeline</h2>
          <p style={{ margin: 0 }}>{c.timeline}</p>
        </section>
      )}

      <section className="card" style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Evaluation day</h2>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{c.evaluation_day}</p>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>Resources</h2>
        {(detail.resources ?? []).length === 0 && <p className="muted small">No resources attached yet.</p>}
        {(detail.resources ?? []).map((r: any) => (
          <p key={r.id} className="small" style={{ margin: '6px 0' }}>
            <span className={`tag ${r.official ? 'tag-official' : ''}`}>{r.official ? 'Official' : 'Supplemental'} · {r.kind}</span>{' '}
            {r.url ? <a href={r.url} target="_blank" rel="noreferrer">{r.title}</a> : r.title}
            {r.notes && <span className="muted"> — {r.notes}</span>}
          </p>
        ))}
      </section>

      <div className="btn-row" style={{ marginTop: 16 }}>
        <Link className="btn btn-primary" to="/practice">Practice this semester's journals →</Link>
        <Link className="btn" to="/project">Open project workspace</Link>
      </div>
    </div>
  );
}
