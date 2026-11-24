// Minimal safe markdown renderer for site CMS pages (## / ### / paragraphs).
// React text nodes only — no raw HTML injection, so page content can never run scripts.
export function MiniMd({ body }: { body: string }) {
  const blocks: { kind: 'h2' | 'h3' | 'p'; text: string }[] = [];
  for (const line of (body ?? '').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('### ')) blocks.push({ kind: 'h3', text: t.slice(4) });
    else if (t.startsWith('## ')) blocks.push({ kind: 'h2', text: t.slice(3) });
    else if (t.startsWith('# ')) continue;
    else blocks.push({ kind: 'p', text: t });
  }
  return (
    <>
      {blocks.map((b, i) =>
        b.kind === 'h2' ? (
          <h2 key={i} style={{ fontSize: 20, margin: '22px 0 8px' }}>{b.text}</h2>
        ) : b.kind === 'h3' ? (
          <h3 key={i} style={{ fontSize: 16.5, margin: '18px 0 6px' }}>{b.text}</h3>
        ) : (
          <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{b.text}</p>
        ),
      )}
    </>
  );
}
