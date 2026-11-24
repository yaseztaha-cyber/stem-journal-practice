import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useSemester, GRADES, SEMESTERS } from '../lib/semester';

const FOCUS: Record<string, string> = {
  '10-1': 'Foundations: understanding journals, academic sentences, and the first EDP cycle.',
  '10-2': 'Building up: evidence, teamwork reflection, and deeper EDP iteration.',
  '11-1': 'Smart Sustainable Food Packaging — preservation plus a natural quality indicator. Four-question journal: reflection/teamwork, EDP, and double learning transfer.',
  '11-2': 'Advanced EDP and transfer: connecting semester learning to Capstone decisions.',
  '12-1': 'Capstone mastery: BLUE-level synthesis across the whole project.',
  '12-2': 'Final journal readiness: insight, judgment, and research-grade writing.',
};

export function SemesterHome() {
  const { scope, setScope, qs } = useSemester();
  const [challenge, setChallenge] = useState<any>(null);
  const [qcount, setQcount] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/api/challenges?${qs}`).then((d) => setChallenge((d.challenges ?? [])[0] ?? null)).catch(() => setChallenge(null));
    api.get(`/api/questions?${qs}`).then((d) => setQcount(d.questions.length)).catch(() => setQcount(null));
  }, [qs]);

  const tiles = [
    { to: '/practice', title: 'Journal Practice', desc: `Q1 reflection/teamwork · Q2 EDP · Q3+Q4 transfer for G${scope.grade} S${scope.semester}.` },
    { to: '/mock', title: 'Mock Journal', desc: 'Four questions in sequence with timer and a Q1–Q4 rubric profile.' },
    { to: '/academy', title: 'Academic Writing', desc: 'Learn → watch → practice → quiz → apply → journal.' },
    { to: '/challenge', title: 'EDP Challenge', desc: challenge ? challenge.title : 'Challenge content not yet imported.' },
    { to: '/lab', title: 'Research Paper Lab', desc: 'Build the research paper section by section.' },
    { to: '/progress', title: 'My Progress', desc: `G${scope.grade} S${scope.semester} levels, retries, and weaknesses.` },
    { to: '/project', title: 'Project Workspace', desc: 'Team, prototype iterations, tests, and reflection.' },
  ];

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>G{scope.grade} S{scope.semester}{challenge ? ` · ${challenge.title}` : ' · Select your journal'}</h1>
      <p className="muted" style={{ maxWidth: 640 }}>
        {FOCUS[`${scope.grade}-${scope.semester}`]} Everything below is scoped to{' '}
        <strong>G{scope.grade} • S{scope.semester}</strong> unless you change context.
      </p>

      <div className="card" role="group" aria-label="Grade and semester selector">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p className="eyebrow">Grade</p>
            <div className="seg" role="group" aria-label="Grade">
              {GRADES.map((g) => (
                <button key={g} aria-pressed={scope.grade === g} onClick={() => setScope({ grade: g, semester: scope.semester })}>
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Semester</p>
            <div className="seg" role="group" aria-label="Semester">
              {SEMESTERS.map((s) => (
                <button key={s} aria-pressed={scope.semester === s} onClick={() => setScope({ grade: scope.grade, semester: s })}>
                  Semester {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {challenge ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="eyebrow">This semester's EDP challenge</p>
          <h2 style={{ margin: '4px 0' }}>{challenge.title}</h2>
          {challenge.subtitle && <p className="muted" style={{ marginTop: 0 }}>{challenge.subtitle}</p>}
          <p className="small">
            Theme: <strong>{challenge.theme}</strong> · {challenge.school_year} ·{' '}
            <Link to="/challenge">Open the challenge →</Link>
          </p>
        </div>
      ) : (
        <div className="alert" style={{ marginTop: 16 }}>
          Challenge content not yet imported for G{scope.grade} S{scope.semester}. Journal practice
          {qcount != null && qcount > 0 ? ` (${qcount} questions available)` : ''} and Academic Writing remain fully usable.
        </div>
      )}

      <nav className="index-list" style={{ marginTop: 16 }} aria-label="Workspace sections">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="index-row">
            <span className="index-title">{t.title}</span>
            <span className="muted small">{t.desc}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
