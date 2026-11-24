import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUser } from '../lib/api';

const LEVELS = [
  { grade: 'RED', title: 'Major work', hint: 'Off-topic or generic', detail: 'The answer misses the question or stays vague — no specific Capstone situation, no evidence. The coach points at exactly which required part is missing so the next draft lands.' },
  { grade: 'YELLOW', title: 'Needs improvement', hint: 'Relevant but thin', detail: 'You are on topic, but evidence or reflection is shallow — a claim without measurements, or a story without what it taught you. One concrete example usually lifts this to GREEN.' },
  { grade: 'GREEN', title: 'Good', hint: 'Concrete + reflective', detail: 'A real situation with details, plus honest reflection on what changed. Solid journal material — the coach now hunts for the deeper insight that makes it BLUE.' },
  { grade: 'BLUE', title: 'Excellent', hint: 'Insight another team could reuse', detail: 'Specific evidence, clear reasoning, and a judgment valuable beyond your own project. This is exhibition-ready reflection.' },
] as const;

export function Landing() {
  const user = getUser();
  const [level, setLevel] = useState<(typeof LEVELS)[number]>(LEVELS[3]);
  return (
    <div>
      <section className="hero">
        <span className="hero-badge"><span className="dot" aria-hidden="true" /> Egyptian STEM · Capstone Journal Training</span>
        <h1>Train your journal<br />from <span className="grad">RED to BLUE.</span></h1>
        <p className="lead">Write real Capstone journal answers, get instant rubric coaching on every attempt, and compare against graded model answers — before the real submission.</p>

        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to={user ? '/practice' : '/register'}>Start Practicing</Link>
          <Link className="btn btn-lg" to={user ? '/analyze' : '/login'}>Upload a PDF</Link>
        </div>
        <p className="hero-note">SPEC SJP-312 // 312 real journal questions // 2015–2027 // your files are never stored</p>

        <div className="rubric-steps" role="group" aria-label="The four rubric levels — select one to learn what it means">
          {LEVELS.map((l) => (
            <button
              key={l.grade}
              className={`rstep${level.grade === l.grade ? ' active' : ''}`}
              data-grade={l.grade}
              aria-pressed={level.grade === l.grade}
              onClick={() => setLevel(l)}
            >
              <span className="rgrade" style={{ color: `var(--${l.grade.toLowerCase()}-fg)` }}>
                <span className="dot" aria-hidden="true" /> {l.grade}
              </span>
              <span className="rtitle">{l.title}</span>
              <span className="rhint">{l.hint}</span>
            </button>
          ))}
        </div>
        <div className="rstep-detail" data-grade={level.grade} role="status">
          <strong>{level.grade} — {level.title}.</strong>{' '}
          <span className="muted">{level.detail}</span>
        </div>
      </section>

      <div className="card" style={{ marginTop: 20 }}>
        <p className="eyebrow dim">How it works</p>
        <h2 style={{ marginTop: 0 }}>A training loop, not a grade machine</h2>
        <div className="journey">
          <div className="jstep">
            <div className="jnum">1</div>
            <h3>Write</h3>
            <p className="small muted">Pick a category and answer a journal-style question in your own words — timed like the real 60-minute window.</p>
          </div>
          <div className="jarrow" aria-hidden="true" />
          <div className="jstep">
            <div className="jnum">2</div>
            <h3>Get coached</h3>
            <p className="small muted">Instant BLUE/GREEN/YELLOW/RED with exact reasons, missing parts, and how to improve.</p>
          </div>
          <div className="jarrow" aria-hidden="true" />
          <div className="jstep">
            <div className="jnum">3</div>
            <h3>Retry &amp; climb</h3>
            <p className="small muted">Compare with the graded model answer, retry the same question, and watch RED turn BLUE.</p>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="card card-hover">
          <span className="spec-num" aria-hidden="true">01</span>
          <h2 style={{ marginTop: 0 }}>The four journal criteria</h2>
          <ul className="small" style={{ paddingLeft: 20 }}>
            <li><strong>Personal Reflection</strong> — insightful views on your growth, with detailed examples.</li>
            <li><strong>Team Collaboration</strong> — your individual role and effective teamwork, with evidence.</li>
            <li><strong>Learning Transfer</strong> — synthesis of subjects applied in your Capstone.</li>
            <li><strong>Engineering Design Process</strong> — reflection and value judgment another team could reuse.</li>
          </ul>
          <p className="small muted">Grammar alone never decides your level. Relevance, evidence, and reflection do.</p>
        </div>
        <div className="card card-hover">
          <span className="spec-num" aria-hidden="true">02</span>
          <h2 style={{ marginTop: 0 }}>Already have a draft?</h2>
          <p className="small muted">Upload your journal PDF and get it checked against the rubric — optionally grounded in one of the 312 practice questions.</p>
          <div className="btn-row">
            <Link className="btn btn-primary" to={user ? '/analyze' : '/login'}>Analyze a PDF</Link>
            <Link className="btn" to={user ? '/mock' : '/register'}>Try a mock journal</Link>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        <div className="card card-hover">
          <span className="spec-num" aria-hidden="true">03</span>
          <h3 style={{ marginTop: 0, fontSize: 17 }}>Real journal timing</h3>
          <p className="small muted" style={{ margin: 0 }}>A countdown timer with live words-per-minute, just like the 60-minute journal window.</p>
        </div>
        <div className="card card-hover">
          <span className="spec-num" aria-hidden="true">04</span>
          <h3 style={{ marginTop: 0, fontSize: 17 }}>312 real questions</h3>
          <p className="small muted" style={{ margin: 0 }}>Journal-style questions transcribed from past Egyptian STEM journal papers, 2015 through 2027.</p>
        </div>
        <div className="card card-hover">
          <span className="spec-num" aria-hidden="true">05</span>
          <h3 style={{ marginTop: 0, fontSize: 17 }}>Subject reference</h3>
          <p className="small muted" style={{ margin: 0 }}>Browse the official STEM curriculum Big Ideas and skills to ground your Learning Transfer answers.</p>
        </div>
      </div>

      <div className="protocol-note">
        <span className="proto-label">PROTOCOL // ACADEMIC INTEGRITY</span>
        <p className="small" style={{ margin: 0 }}>
          This platform is a coach, not an answer generator. There is no “write my journal” button, no AI-detection bypass,
          and no copied submissions. You write; the system shows you how to strengthen your own reasoning.
        </p>
      </div>
    </div>
  );
}
