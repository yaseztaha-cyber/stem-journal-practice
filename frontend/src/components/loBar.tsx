import { useMemo } from 'react';

// Modern LO picker: a subject-grouped snap rail instead of a wrapping pill.
// Chips toggle; the header shows live coverage and a reset.
export function LOPicker({ all, value, onChange }: { all: string[]; value: string[]; onChange: (next: string[]) => void }) {
  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const code of [...all].sort()) {
      const subj = code.split('.')[0] ?? 'OTHER';
      if (!map.has(subj)) map.set(subj, []);
      map.get(subj)!.push(code);
    }
    return [...map.entries()];
  }, [all]);

  function toggle(code: string) {
    onChange(value.includes(code) ? value.filter((c) => c !== code) : [...value, code]);
  }

  if (groups.length === 0) return null;
  return (
    <div className="lo-picker">
      <div className="lo-head">
        <span className="lo-title">Transfer LOs</span>
        <span className="lo-count fine-num" aria-live="polite">
          {value.length === 0 ? `all ${all.length}` : `${value.length} of ${all.length}`}
        </span>
        {value.length > 0 && (
          <button className="lo-clear" onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>
      <p className="lo-hint">Only objectives your class has reached — advanced LOs stay out of your draws.</p>
      <div className="lo-rail" role="group" aria-label="Learning objectives by subject" tabIndex={0}>
        {groups.map(([subj, codes]) => (
          <div className="lo-group" key={subj}>
            <span className="lo-sub" aria-hidden="true">{subj}</span>
            <div className="lo-chips">
              {codes.map((code) => {
                const on = value.includes(code);
                return (
                  <button
                    key={code}
                    className="lo-chip"
                    aria-pressed={on}
                    title={on ? `Hide ${code}` : `Only ${code}`}
                    onClick={() => toggle(code)}
                  >
                    {on && <span aria-hidden="true">✓ </span>}{code}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
