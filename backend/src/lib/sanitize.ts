/**
 * Sanitize student-authored text: allow plain paragraphs only, strip scripts/tags.
 * Dependency-free: removes angle-bracket markup (both tags and script bodies), then
 * escapes any residue so submitted answers are always rendered as inert text.
 */
export function sanitizeAnswer(input: string): string {
  const raw = (input ?? '').toString().slice(0, 20000);
  let s = raw;
  s = s.replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, ' ');
  s = s.replace(/<\s*style[\s\S]*?<\s*\/\s*style\s*>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<[^>]*>/g, ' ');
  s = escapeHtml(s);
  return s.replace(/\s+\n\s+/g, '\n').trim();
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
