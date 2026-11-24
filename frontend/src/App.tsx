import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { TopBar, RequireAuth } from './components/chrome';
import { Landing } from './pages/Landing';
import { Login, Register } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Practice, QuestionPage, AttemptResult } from './pages/Practice';
import { LOConnections } from './pages/LOConnections';
import { MockStart, MockRun } from './pages/Mock';
import { Analyze } from './pages/Analyze';
import { AnnouncementsPage } from './pages/Announcements';
import { FeedbackPage } from './pages/Feedback';
import { AcademyHome, AcademyUnit } from './pages/Academy';
import { Mistakes } from './pages/Mistakes';
import { ResearchLab, ResearchEditor } from './pages/ResearchLab';
import { Progress } from './pages/Progress';
import { Project } from './pages/Project';
import { Subjects } from './pages/Subjects';
import { Admin } from './pages/Admin';
import { SemesterHome } from './pages/Semester';
import { ChallengePage } from './pages/Challenge';
import { About, SitePage } from './pages/About';
import { Resources } from './pages/Resources';
import { Settings } from './pages/Settings';
import { api, getUser } from './lib/api';

function AdminRoute({ children }: { children: JSX.Element }) {
  const u = getUser();
  if (!u) return <Navigate to="/login" />;
  if (u.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <main id="main" className="container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/semester" element={<RequireAuth><SemesterHome /></RequireAuth>} />
          <Route path="/challenge" element={<RequireAuth><ChallengePage /></RequireAuth>} />
          <Route path="/practice" element={<RequireAuth><Practice /></RequireAuth>} />
          <Route path="/announcements" element={<RequireAuth><AnnouncementsPage /></RequireAuth>} />
          <Route path="/feedback" element={<RequireAuth><FeedbackPage /></RequireAuth>} />
          <Route path="/lo-connections" element={<RequireAuth><LOConnections /></RequireAuth>} />
          <Route path="/question/:id" element={<RequireAuth><QuestionPage /></RequireAuth>} />
          <Route path="/attempt/:id" element={<RequireAuth><AttemptResult /></RequireAuth>} />
          <Route path="/mock" element={<RequireAuth><MockStart /></RequireAuth>} />
          <Route path="/mock/:id" element={<RequireAuth><MockRun /></RequireAuth>} />
          <Route path="/analyze" element={<RequireAuth><Analyze /></RequireAuth>} />
          <Route path="/academy" element={<RequireAuth><AcademyHome /></RequireAuth>} />
          <Route path="/academy/:slug" element={<RequireAuth><AcademyUnit /></RequireAuth>} />
          <Route path="/mistakes" element={<RequireAuth><Mistakes /></RequireAuth>} />
          <Route path="/lab" element={<RequireAuth><ResearchLab /></RequireAuth>} />
          <Route path="/lab/:id" element={<RequireAuth><ResearchEditor /></RequireAuth>} />
          <Route path="/progress" element={<RequireAuth><Progress /></RequireAuth>} />
          <Route path="/project" element={<RequireAuth><Project /></RequireAuth>} />
          <Route path="/subjects" element={<RequireAuth><Subjects /></RequireAuth>} />
          <Route path="/resources" element={<RequireAuth><Resources /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<SitePage slug="privacy" />} />
          <Route path="/terms" element={<SitePage slug="terms" />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="*" element={<div className="narrow"><h1>Page not found</h1><p><Link to="/">Go home</Link></p></div>} />
        </Routes>
      </main>
      <SiteFooter />
    </BrowserRouter>
  );
}

function SiteFooter() {
  const [settings, setSettings] = useState<any>({});
  useEffect(() => {
    api.get('/api/site/settings').then((d) => setSettings(d.settings ?? {})).catch(() => {});
  }, []);
  return (
    <footer className="footer">
      <p style={{ margin: '0 0 4px' }}>
        <strong>{settings.platform_name || 'STEM Journal Academy'}</strong>
        <span className="muted"> · {settings.platform_tagline || 'Academic Journal Practice & Writing Training'}</span>
      </p>
      <nav aria-label="Footer">
        <Link to="/about">About</Link> · <Link to="/academy">Academic Writing</Link> · <Link to="/practice">Journal Practice</Link> ·{' '}
        <Link to="/challenge">EDP Challenge</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link>
      </nav>
      <p className="small muted" style={{ margin: '6px 0 0' }}>
        Created by {settings.creator_name || 'Yassen Taha Hussainy Elnasher'} · {settings.creator_school || "S'28 STEM Gharbiya"}
        {(settings.contact_email || settings.contact_whatsapp) && (
          <span>
            {' '}· <a href={`mailto:${settings.contact_email || 'yaseen.1925048@stemgharbiya.moe.edu.eg'}`}>{settings.contact_email || 'yaseen.1925048@stemgharbiya.moe.edu.eg'}</a>
            {settings.contact_whatsapp && (
              <span> · <a href={`https://wa.me/${(settings.contact_whatsapp || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {settings.contact_whatsapp}</a></span>
            )}
          </span>
        )}
      </p>
    </footer>
  );
}
