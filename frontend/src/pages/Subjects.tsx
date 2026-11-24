import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function List({ items, label }: { items: string[]; label: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h4>{label}</h4>
      <ul className="check-list">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export function Subjects() {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/subjects').then((d) => setData(d.subjects)).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data) return <p className="muted">Loading subject reference…</p>;

  return (
    <div>
      <p className="eyebrow">Research library</p>
      <h1 style={{ marginTop: 0 }}>STEM Learning Outcomes</h1>
      <p className="muted">
        Big Ideas, essential questions, key concepts and skills from the official STEM curriculum. When you answer
        a <strong>Learning Transfer</strong> journal question, name the subject, its Big Idea, and how your project
        solution connects to it.
      </p>
      <div style={{ marginTop: 8 }}>
        {data.map((s, i) => (
          <details className="summary-card" key={s.code} style={{ margin: 0 }}>
            <summary className="subj-row" style={{ cursor: 'pointer', listStyle: 'none' }}>              <span className="subj-code">SUBJ·{String(i + 1).padStart(2, '0')}</span>
              <span className="subj-name">{s.name}</span>
              <span className="subj-count">{s.units?.length ?? 0} units · {s.big_ideas?.length ?? 0} big ideas · {s.essential_questions?.length ?? 0} questions</span>
            </summary>
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {s.units?.length > 0 && (
                <div>
                  <h4>Units</h4>
                  <div className="subj-tags">
                    {s.units.map((u: string, i: number) => (
                      <span className="subj-tag" key={i}>{u}</span>
                    ))}
                  </div>
                </div>
              )}
              <List label="Big Ideas" items={s.big_ideas} />
              <List label="Essential Questions" items={s.essential_questions} />
              <List label="Key Concepts" items={s.key_concepts} />
              <List label="Skills" items={s.skills} />
              {s.sources?.length > 0 && (
                <div>
                  <h4>Sources</h4>
                  <ul className="small muted">
                    {s.sources.map((src: any, i: number) => (
                      <li key={i}>
                        {src.url ? (
                          <a href={src.url} target="_blank" rel="noreferrer">{src.label}</a>
                        ) : (
                          src.label
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}