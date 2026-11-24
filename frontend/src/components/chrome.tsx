import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { api, getUser, setToken, setUser } from '../lib/api';
import { useSemester, contextLabel } from '../lib/semester';

type ServerState = 'checking' | 'online' | 'db-down' | 'offline';

export function ServerStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<ServerState>('checking');
  useEffect(() => {
    let live = true;
    api
      .get('/api/health')
      .then((h: any) => {
        if (!live) return;
        setState(h && h.ok ? (h.db === false ? 'db-down' : 'online') : 'offline');
      })
      .catch(() => {
        if (live) setState('offline');
      });
    return () => {
      live = false;
    };
  }, []);
  const label =
    state === 'checking' ? 'Checking server…' :
    state === 'online' ? 'Connected to the practice server' :
    state === 'db-down' ? 'Server is up but the database is unreachable' :
    'Cannot reach the practice server';
  if (compact) {
    if (state === 'checking') return null;
    return (
      <span className={`server-status compact server-${state}`} title={label}>
        <span className="dot" aria-hidden="true" />
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{label}</span>
      </span>
    );
  }
  if (state === 'checking' || state === 'online') {
    return state === 'checking' ? null : (
      <span className="server-status server-online" title="Connected to the practice server">
        <span className="dot" aria-hidden="true" /> Connected
      </span>
    );
  }
  return (
    <span className={`server-status server-${state}`} role="alert" title={label}>
      <span className="dot" aria-hidden="true" /> {state === 'db-down' ? 'Database offline' : 'Server offline'}
    </span>
  );
}

function useTheme(): [string, () => void] {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      document.documentElement.dataset.theme = next;
      localStorage.setItem('sjp_theme', next);
    } catch {
      /* ignore */
    }
  }
  return [theme, toggle];
}

const TABS = [
  { to: '/', label: 'Home', end: true },
  { to: '/semester', label: 'My Semester' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/practice', label: 'Practice' },
  { to: '/lo-connections', label: 'LO Connections' },
  { to: '/mock', label: 'Mock Journal' },
  { to: '/academy', label: 'Academic Writing' },
  { to: '/challenge', label: 'EDP Challenge' },
  { to: '/lab', label: 'Research Paper Lab' },
  { to: '/progress', label: 'Progress' },
  { to: '/project', label: 'Project' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/resources', label: 'Resources' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
];

export function ContextBadge() {
  const { scope } = useSemester();
  return (
    <Link
      to="/semester"
      className="ctx-badge"
      title={`Academic context: Grade ${scope.grade} Semester ${scope.semester} — click to change`}
      aria-label={`Academic context Grade ${scope.grade} Semester ${scope.semester}. Change semester.`}
    >
      {contextLabel(scope)}
    </Link>
  );
}

function UserMenu({ user, onNavigate }: { user: any; onNavigate: (to: string) => void }) {
  const [open, setOpen] = useState(false);
  const pillRef = useRef<HTMLButtonElement>(null);
  const initial = ((user?.display_name ?? user?.email ?? '?') as string).trim().charAt(0).toUpperCase() || '?';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        pillRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open ]);

  function signOut() {
    setToken(null);
    setUser(null);
    setOpen(false);
    onNavigate('/');
  }

  return (
    <div className="user-area">
      <button
        ref={pillRef}
        className="user-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        title={user?.display_name ?? user?.email}
      >
        <span className="avatar" aria-hidden="true">{initial}</span>
        <span className="uname">{user?.display_name ?? user?.email}</span>
        <ServerStatus compact />
        <span className="chev" aria-hidden="true">▾</span>
      </button>
      {open && (
        <>
          <button className="menu-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} tabIndex={-1} />
          <div className="menu" role="menu">
            <div className="menu-head">
              <strong>{user?.display_name}</strong>
              <span>{user?.email}{user?.role === 'admin' ? ' · admin' : ''}</span>
            </div>
            <div className="menu-status"><ServerStatus /></div>
            {TABS.slice(0, 2).map((t) => (
              <Link key={t.to} role="menuitem" to={t.to} onClick={() => setOpen(false)}>{t.label}</Link>
            ))}
            {user?.role === 'admin' && (
              <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>Admin</Link>
            )}
            <button role="menuitem" className="menu-item menu-danger" onClick={signOut}>Sign out</button>
          </div>
        </>
      )}
    </div>
  );
}

function PrimaryNav({ open, isAdmin, onNavigate }: { open: boolean; isAdmin: boolean; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav id="primary-nav" className={`nav${open ? ' mobile-open' : ''}`} aria-label="Primary">
      <div className={`nav-list${expanded ? ' expanded' : ''}`}>
        {TABS.map((t: any) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={!!t.end}
            onClick={() => {
              setExpanded(false);
              onNavigate();
            }}
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            {t.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => {
              setExpanded(false);
              onNavigate();
            }}
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            Admin
          </NavLink>
        )}
      </div>
      <button
        type="button"
        className="nav-extend"
        aria-expanded={expanded}
        aria-controls="primary-nav"
        aria-label={expanded ? 'Collapse navigation' : 'Extend navigation — show all sections'}
        onClick={() => setExpanded((e) => !e)}
      >
        {expanded ? 'Less ▴' : 'More ▾'}
      </button>
    </nav>
  );
}

export function TopBar() {
  const user = getUser();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const themeBtn = (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to day lab' : 'Switch to night lab'}
      aria-label={theme === 'dark' ? 'Switch to day lab' : 'Switch to night lab'}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  );
  return (
    <header className="topbar">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="topbar-inner">
        <Link className="brand" to={user ? '/dashboard' : '/'} aria-label="STEM Journal Practice home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="38" height="38" focusable="false">
              <rect x="1.5" y="1.5" width="37" height="37" rx="10" fill="var(--surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
              <path d="M20 8.5L31.5 27h-23z" fill="none" stroke="var(--accent-deep)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M18.2 12h3.6" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" />
              <path d="M15.6 16.5h8.8M13.4 21.5h13.2" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.5 30.5l2.2 2.2 4.2-4.8" fill="none" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="brand-name">STEM Journal Practice</span>
            <span className="brand-sub">capstone lab // RED→BLUE</span>
          </span>
        </Link>
        {user && <ContextBadge />}
        {user ? (
          <>
            <PrimaryNav open={open} isAdmin={user.role === 'admin'} onNavigate={() => setOpen(false)} />
            {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
            <button
              className="mobile-toggle"
              aria-expanded={open}
              aria-controls="primary-nav"
              aria-label={open ? 'Close primary menu' : 'Open primary menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Close' : 'Menu'}
            </button>
            {themeBtn}
            <UserMenu user={user} onNavigate={(to) => nav(to)} />
          </>
        ) : (
          <div className="user-area" style={{ gap: 8 }}>
            <ServerStatus />
            {themeBtn}
            <Link className="btn btn-ghost btn-small" style={{ padding: '7px 14px', fontSize: 13.5 }} to="/login">Sign in</Link>
            <Link className="btn btn-primary btn-small" style={{ padding: '7px 14px', fontSize: 13.5 }} to="/register">Get started</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export function GradeBadge({ grade, size }: { grade: string; size?: 'lg' }) {
  return (
    <span className={`grade-chip grade-${grade}${size === 'lg' ? ' lg' : ''}`} title={`Rubric level: ${grade}`}>
      <span className="dot" aria-hidden="true" /> {grade}
    </span>
  );
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
