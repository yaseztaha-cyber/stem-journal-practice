import { useEffect, useState } from 'react';
import { addMyWord, applyFix, checkWriting, refreshCustomWords, type WritingIssue } from '../lib/writing';

// Word-style writing panel: shows misspellings + grammar slips found in the
// current draft, each with click-to-apply fixes. Suggestions only — the
// student always applies them; nothing rewrites the answer automatically.
export function WritingPanel({ text, onApply }: { text: string; onApply: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [applied, setApplied] = useState(0);
  const [issues, setIssues] = useState<WritingIssue[]>([]);
  const [engineError, setEngineError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setChecking(true);
    checkWriting(text)
      .then(({ issues: found, engineError: err }) => {
        if (!live) return;
        setIssues(found);
        setEngineError(err);
        setChecking(false);
      })
      .catch(() => {
        if (live) setChecking(false);
      });
    return () => {
      live = false;
    };
  }, [open, text, applied]);

  const visible = issues.filter((i) => !ignored.includes(`${i.start}:${i.text.toLowerCase()}`));

  function applyOne(issue: WritingIssue, replacement: string) {
    onApply(applyFix(text, issue, replacement));
    setApplied((n) => n + 1);
  }

  function applyAll() {
    let next = text;
    const sorted = [...visible].filter((i) => i.suggestions.length > 0).sort((a, b) => b.start - a.start);
    for (const issue of sorted) next = applyFix(next, issue, issue.suggestions[0]);
    onApply(next);
    setApplied((n) => n + 1);
  }

  function ignore(issue: WritingIssue) {
    setIgnored((prev) => [...prev, `${issue.start}:${issue.text.toLowerCase()}`]);
  }

  return (
    <div className="card" style={{ marginTop: 12 }} aria-label="Spelling and grammar check">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-small" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide writing check' : 'Check spelling & grammar'}
        </button>
        <span className="small muted">Offline dictionary — works without internet. Fixes apply only when you click them.</span>
      </div>
      {open && (
        <div style={{ marginTop: 8 }}>
          {checking && <p className="small muted">Checking… (loading the offline dictionary first time)</p>}
          {engineError && <div className="alert alert-error">Spell engine failed to load: {engineError}</div>}
          {!engineError && visible.length === 0 && (
            <p className="small" style={{ color: 'var(--green-fg)', fontWeight: 700 }}>✓ No misspellings or grammar slips found.</p>
          )}
          {visible.length > 0 && (
            <>
              <p className="small muted" style={{ margin: '0 0 6px' }}>
                {visible.length} suggestion{visible.length > 1 ? 's' : ''} — grading ignores spelling; this only polishes.
              </p>
              <div className="btn-row" style={{ marginTop: 0, marginBottom: 8 }}>
                <button className="btn btn-ghost btn-small" onClick={applyAll}>Fix all (top suggestion each)</button>
              </div>
              <ol style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
                {visible.map((issue, i) => (
                  <li key={`${issue.start}-${i}`} className="small">
                    <span className="tag">{issue.kind === 'spelling' ? 'Spelling' : 'Grammar'}</span>{' '}
                    <strong>“{issue.text}”</strong> <span className="muted">— {issue.message}</span>
                    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {issue.suggestions.slice(0, 3).map((s) => (
                        <button key={s} className="btn btn-ghost btn-small" onClick={() => applyOne(issue, s)} title={`Replace with ${s}`}>
                          → {s}
                        </button>
                      ))}
                      <button className="btn btn-ghost btn-small" onClick={() => ignore(issue)}>Ignore</button>
                      {issue.kind === 'spelling' && (
                        <button
                          className="btn btn-ghost btn-small"
                          title="Never flag this word again (your browser only)"
                          onClick={() => {
                            addMyWord(issue.text);
                            refreshCustomWords();
                            ignore(issue);
                          }}
                        >
                          My words
                        </button>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      )}
    </div>
  );
}
