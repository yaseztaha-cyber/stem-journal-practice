import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUser, setToken, setUser } from '../lib/api';
import { useSemester, GRADES, SEMESTERS } from '../lib/semester';

function currentTheme(): string {
  try {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function Settings() {
  const user = getUser();
  const nav = useNavigate();
  const { scope, setScope } = useSemester();
  const [theme, setTheme] = useState(currentTheme);

  function applyTheme(next: string) {
    setTheme(next);
    try {
      document.documentElement.dataset.theme = next;
      localStorage.setItem('sjp_theme', next);
    } catch {
      /* ignore */
    }
  }

  function signOut() {
    setToken(null);
    setUser(null);
    nav('/');
  }

  return (
    <div className="narrow">
      <p className="eyebrow">Settings</p>
      <h1 style={{ marginTop: 0 }}>Your preferences</h1>

      <section className="card" aria-label="Appearance">
        <p className="section-label">Appearance</p>
        <div className="seg" role="group" aria-label="Theme">
          {['light', 'dark'].map((t) => (
            <button key={t} aria-pressed={theme === t} onClick={() => applyTheme(t)}>
              {t === 'light' ? '☀ Day lab' : '☾ Night lab'}
            </button>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 12 }} aria-label="Academic context">
        <p className="section-label">Academic context</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p className="small muted" style={{ margin: '0 0 6px' }}>Grade</p>
            <div className="seg" role="group" aria-label="Grade">
              {GRADES.map((g) => (
                <button key={g} aria-pressed={scope.grade === g} onClick={() => setScope({ grade: g, semester: scope.semester })}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="small muted" style={{ margin: '0 0 6px' }}>Semester</p>
            <div className="seg" role="group" aria-label="Semester">
              {SEMESTERS.map((s) => (
                <button key={s} aria-pressed={scope.semester === s} onClick={() => setScope({ grade: scope.grade, semester: s })}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="small muted" style={{ margin: '10px 0 0' }}>
          Applies everywhere instantly. <Link to="/semester">Open the full semester workspace</Link>.
        </p>
      </section>

      <AppUpdates />

      <AiProviders />

      <section className="card" style={{ marginTop: 12 }} aria-label="Account">
        <p className="section-label">Account</p>
        {user ? (
          <>
            <p style={{ margin: '0 0 4px' }}><strong>{user.display_name}</strong></p>
            <p className="small muted" style={{ margin: 0 }}>{user.email}{user.role === 'admin' ? ' · admin' : ''}</p>
            <div className="btn-row">
              <button className="btn" onClick={signOut}>Sign out</button>
            </div>
          </>
        ) : (
          <div className="btn-row">
            <Link className="btn btn-primary" to="/login">Sign in</Link>
            <Link className="btn" to="/register">Create account</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function AiProviders() {
  const bridge = typeof window !== 'undefined' ? window.sjpDesktop : undefined;
  const [configured, setConfigured] = useState<string[]>([]);
  const [groq, setGroq] = useState('');
  const [aiml, setAiml] = useState('');
  const [mistral, setMistral] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!bridge?.getAiProviders) return;
    bridge.getAiProviders().then(setConfigured).catch(() => {});
  }, [bridge]);
  if (!bridge?.saveAiKeys) return null;

  async function save() {
    setBusy(true);
    setError('');
    setMsg('');
    try {
      const saved = await bridge!.saveAiKeys!({ groq, aiml, mistral });
      setConfigured(saved);
      setGroq('');
      setAiml('');
      setMistral('');
      if (window.confirm('Keys saved. Restart the app now so grading uses them?')) {
        await bridge!.restartApp!();
      } else {
        setMsg('Saved. Restart the app for the keys to take effect.');
      }
    } catch {
      setError('Could not save keys. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ marginTop: 12 }} aria-label="AI providers">
      <p className="section-label">AI providers — real AI grading</p>
      <p className="small muted" style={{ marginTop: 0 }}>
        {configured.length > 0
          ? <>Configured: <strong>{configured.join(', ')}</strong> — answers are graded by real AI models.</>
          : <>No provider configured — answers are graded by the offline engine. Paste keys to unlock AI grading.</>}
        {' '}Keys stay on this device only, never leave it except to call the provider.
      </p>
      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-ok" role="status">{msg}</div>}
      <div className="form-grid">
        <label className="label" htmlFor="ai-groq">Groq key (primary grader)</label>
        <input id="ai-groq" className="input" type="password" autoComplete="off" value={groq} onChange={(e) => setGroq(e.target.value)} placeholder={configured.includes('OPENAI_API_KEY') ? 'Set — paste a new one to replace' : 'gsk_…'} />
        <label className="label" htmlFor="ai-aiml">AIML API key (fallback)</label>
        <input id="ai-aiml" className="input" type="password" autoComplete="off" value={aiml} onChange={(e) => setAiml(e.target.value)} placeholder={configured.includes('AIML_API_KEY') ? 'Set — paste a new one to replace' : '…'} />
        <label className="label" htmlFor="ai-mistral">Mistral key (fallback)</label>
        <input id="ai-mistral" className="input" type="password" autoComplete="off" value={mistral} onChange={(e) => setMistral(e.target.value)} placeholder={configured.includes('MISTRAL_API_KEY') ? 'Set — paste a new one to replace' : 'mstrl_…'} />
        <div className="btn-row">
          <button className="btn btn-primary btn-small" disabled={busy || (!groq.trim() && !aiml.trim() && !mistral.trim())} onClick={save}>
            {busy ? 'Saving…' : 'Save keys'}
          </button>
        </div>
      </div>
    </section>
  );
}

function AppUpdates() {
  const bridge = typeof window !== 'undefined' ? window.sjpDesktop : undefined;
  const [version, setVersion] = useState<string>('');
  const [status, setStatus] = useState<{ status: string; version?: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!bridge?.getAppVersion) return;
    bridge.getAppVersion().then(setVersion).catch(() => {});
    if (!bridge?.onUpdateStatus) return;
    const off = bridge.onUpdateStatus(setStatus);
    return off;
  }, [bridge]);
  if (!bridge?.checkForUpdates) return null;
  async function check() {
    setBusy(true);
    try {
      setStatus(await bridge!.checkForUpdates!());
    } catch {
      setStatus({ status: 'error', message: 'Update check failed. Try again.' });
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card" style={{ marginTop: 12 }} aria-label="App updates">
      <p className="section-label">App updates</p>
      <p className="small muted" style={{ margin: '0 0 8px' }}>
        Installed version: <strong className="fine-num">{version || '…'}</strong>
      </p>
      <div className="btn-row" style={{ marginTop: 0 }}>
        <button className="btn btn-small" disabled={busy} onClick={check}>
          {busy ? 'Checking…' : 'Check for updates'}
        </button>
      </div>
      {status && (
        <p className="small" role="status" style={{ margin: '8px 0 0' }}>
          <strong>{status.status === 'up-to-date' ? '✓ ' : ''}{status.status.replace('-', ' ')}</strong>
          {status.version ? ` — v${status.version}` : ''} · {status.message}
        </p>
      )}
    </section>
  );
}
