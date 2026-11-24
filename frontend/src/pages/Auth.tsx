import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, setToken, setUser } from '../lib/api';

export function Login() {
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const expired = params.get('expired') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      if (expired) setParams({}, { replace: true });
      nav('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="narrow">
      <p className="eyebrow">Sign in</p>
      <h1>Welcome back</h1>
      <p className="muted" style={{ marginTop: 0 }}>Continue your training — every attempt is saved and graded.</p>
      {expired && !error && <div className="alert alert-info" role="status">Your session expired — please sign in again.</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="card form-grid">
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <Link className="btn" to="/register">Create account</Link>
        </div>
      </form>
    </div>
  );
}

export function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await api.post('/api/auth/register', { email, password, display_name: displayName });
      setToken(data.token);
      setUser(data.user);
      nav('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="narrow">
      <p className="eyebrow">Create account</p>
      <h1>Start your training</h1>
      <p className="muted" style={{ marginTop: 0 }}>Journal-style questions with rubric coaching, feedback after every attempt, and progress tracking.</p>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="card form-grid">
        <label className="label" htmlFor="reg-name">Display name</label>
        <input id="reg-name" name="name" className="input" autoComplete="nickname" spellCheck={false} required minLength={2} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <label className="label" htmlFor="reg-email">Email</label>
        <input id="reg-email" name="email" className="input" type="email" autoComplete="email" spellCheck={false} required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label" htmlFor="reg-password">Password (min 8 characters)</label>
        <input id="reg-password" name="new-password" className="input" type="password" autoComplete="new-password" spellCheck={false} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          <Link className="btn" to="/login">I have an account</Link>
        </div>
      </form>
    </div>
  );
}
