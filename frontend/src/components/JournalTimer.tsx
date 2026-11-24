import { useEffect, useRef, useState } from 'react';

function fmt(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface Props {
  totalMinutes?: number;
  running?: boolean;
  words: number;
  onExpired?: () => void;
  onDurationChange?: (minutes: number) => void;
}

export function JournalTimer({ totalMinutes = 60, running = true, words, onExpired, onDurationChange }: Props) {
  const [minutes, setMinutes] = useState(totalMinutes);
  const [elapsedMs, setElapsedMs] = useState(0);
  const totalMs = minutes * 60_000;
  const fired = useRef(false);

  useEffect(() => {
    if (!running) return;
    const start = Date.now();
    const iv = setInterval(() => setElapsedMs(Date.now() - start), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const expired = remainingMs <= 0;

  useEffect(() => {
    if (expired && !fired.current) {
      fired.current = true;
      onExpired?.();
    }
  }, [expired, onExpired]);

  function setDuration(next: number) {
    const n = Math.min(300, Math.max(5, next));
    setMinutes(n);
    // Preserve elapsed time: changing the window adjusts the total, never the clock.
    fired.current = false;
    onDurationChange?.(n);
  }

  // Honest pace: no words-per-minute until there is something to measure.
  const measurable = words >= 20 && elapsedMs >= 60_000;
  const wpm = measurable ? Math.round(words / (elapsedMs / 60000)) : null;
  const pct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  const state = expired ? 'expired' : remainingMs <= 120_000 ? 'danger' : remainingMs <= 600_000 ? 'warn' : 'ok';

  return (
    <div className={`journal-timer timer-${state}`} role="timer" aria-label="Journal timer and writing speed">
      <div className="jt-row">
        <span className="jt-cell jt-clock">
          <span className="jt-label">Time left · {minutes} min</span>
          <strong>{fmt(remainingMs)}</strong>
        </span>
        <span className="jt-cell">
          <span className="jt-label">Your speed</span>
          <strong>{wpm == null ? '—' : wpm} <small>words/min</small></strong>
        </span>
        <span className="jt-cell">
          <span className="jt-label">Written</span>
          <strong className="fine-num">{words} <small>words</small></strong>
        </span>
      </div>
      <div className="jt-controls">
        <button className="jt-btn" type="button" onClick={() => setDuration(minutes - 5)} aria-label="Decrease time by 5 minutes">−5</button>
        <span className="jt-presets" role="group" aria-label="Choose journal time">
          {[15, 30, 45, 60, 90].map((m) => (
            <button
              key={m}
              className={`jt-preset${minutes === m ? ' jt-preset-active' : ''}`}
              type="button"
              onClick={() => setDuration(m)}
              aria-pressed={minutes === m}
            >
              {m} min
            </button>
          ))}
        </span>
        <button className="jt-btn" type="button" onClick={() => setDuration(minutes + 5)} aria-label="Increase time by 5 minutes">+5</button>
      </div>
      <div className="jt-track"><span className="jt-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}