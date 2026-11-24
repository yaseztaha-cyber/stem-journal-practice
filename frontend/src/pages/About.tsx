import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { MiniMd } from '../lib/minimd';

export function About() {
  const [page, setPage] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/site/pages/about').then((d) => setPage(d.page)).catch((e) => setError(e.message));
    api.get('/api/site/settings').then((d) => setSettings(d.settings ?? {})).catch(() => {});
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!page) return <p className="muted">Loading…</p>;

  return (
    <div className="narrow">
      <p className="eyebrow">About</p>
      <h1 style={{ marginTop: 0 }}>{page.title}</h1>
      <div className="card">
        <MiniMd body={page.body_md} />
      </div>
      <section className="card" style={{ marginTop: 16 }} aria-label="Creator">
        <p className="eyebrow dim">Created by</p>
        <p style={{ margin: 0 }}>
          <strong>{settings.creator_name || 'Yassen Taha Hussainy Elnasher'}</strong>
          <br />
          <span className="muted small">{settings.creator_school || "S'28 STEM Gharbiya"}</span>
        </p>
        <p className="small" style={{ margin: '8px 0 0' }}>
          <a href={`mailto:${settings.contact_email || 'yaseen.1925048@stemgharbiya.moe.edu.eg'}`}>{settings.contact_email || 'yaseen.1925048@stemgharbiya.moe.edu.eg'}</a>
          {(settings.contact_whatsapp || '+201092332523') && (
            <span className="muted"> · <a href={`https://wa.me/${(settings.contact_whatsapp || '+201092332523').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">WhatsApp {settings.contact_whatsapp || '+201092332523'}</a></span>
          )}
        </p>
      </section>
      <div className="btn-row">
        <Link className="btn btn-primary" to="/practice">Start practicing</Link>
        <Link className="btn" to="/academy">Open Academic Writing</Link>
      </div>
    </div>
  );
}

export function SitePage({ slug }: { slug: 'privacy' | 'terms' }) {
  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(null);
    api.get(`/api/site/pages/${slug}`).then((d) => setPage(d.page)).catch((e) => setError(e.message));
  }, [slug]);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!page) return <p className="muted">Loading…</p>;

  return (
    <div className="narrow">
      <h1 style={{ marginTop: 0 }}>{page.title}</h1>
      <div className="card">
        <MiniMd body={page.body_md} />
      </div>
    </div>
  );
}
