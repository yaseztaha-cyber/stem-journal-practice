import type { Category } from './rubric';

// Import a journal document (PDF / DOCX / TXT) into structured Q&A pairs an
// admin reviews before anything enters the question bank. Nothing is stored
// by parsing alone; the commit step is explicit and labels everything as
// imported (never official).

export interface ImportCandidate {
  question: string;
  answer: string;
  categoryGuess: Category;
}

// require() first (works on modern Node AND under test runners), real
// dynamic import only as fallback for older runtimes (packaged Electron Node).
async function loadMammothExtract(): Promise<(input: { buffer: Buffer }) => Promise<{ value: string }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const cjs = require('mammoth') as any;
    const fn = cjs?.default?.extractRawText ?? cjs?.extractRawText;
    if (fn) return fn;
  } catch {
    /* fall through to real dynamic import */
  }
  const mod: any = await Function('return import("mammoth")')();
  const fn = mod?.default?.extractRawText ?? mod?.extractRawText;
  if (!fn) throw new Error('DOCX engine unavailable');
  return fn;
}

export async function extractDocText(buffer: Buffer, filename: string): Promise<{ text: string; pages?: number }> {
  const lower = (filename ?? '').toLowerCase();
  if (lower.endsWith('.txt')) {
    return { text: buffer.toString('utf8') };
  }
  if (lower.endsWith('.pdf')) {
    if (!(buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46)) {
      throw new Error('Not a PDF file (magic bytes mismatch)');
    }
    const { loadPDFParse } = await import('./pdfLoader');
    const Cls = await loadPDFParse();
    const parser = new Cls({ data: buffer });
    const result = await parser.getText();
    return { text: String(result?.text ?? ''), pages: Number(result?.total ?? result?.pages?.length ?? 1) || 1 };
  }
  if (lower.endsWith('.docx')) {
    if (!(buffer[0] === 0x50 && buffer[1] === 0x4b)) {
      throw new Error('Not a DOCX file (magic bytes mismatch)');
    }
    const fn = await loadMammothExtract();
    const result = await fn({ buffer });
    return { text: String(result?.value ?? '') };
  }
  throw new Error('Only PDF, DOCX, or TXT files are accepted');
}

function latinRatio(t: string): number {
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  const other = (t.match(/[^\x00-\x7F\s\d.,;:!?'"()\-–—]/g) || []).length;
  return letters / Math.max(1, letters + other);
}

function guessCategory(q: string): Category {
  const t = q.toLowerCase();
  const score: [Category, RegExp][] = [
    ['team_collaboration', /team|leader|teammate|collaborat|role|member|together/],
    ['engineering_design_process', /prototype|design|test|requirement|solution|experiment|iteration|build|redesign|edp/],
    ['learning_transfer', /chem|phys|bio|math|subject|chapter|transfer|apply|concept|formula|principle|lo\.|ch\.|ma\.|ph\./],
    ['personal_reflection', /growth|reflect|myself|learned|change|feeling|organize|advice|habit|mindset/],
  ];
  let best: Category = 'personal_reflection';
  let bestN = 0;
  for (const [c, re] of score) {
    const n = (t.match(new RegExp(re.source, 'g')) || []).length;
    if (n > bestN) {
      bestN = n;
      best = c;
    }
  }
  return best;
}

function isQuestionLine(ln: string): boolean {
  if (ln.length < 30 || ln.length > 700 || latinRatio(ln) < 0.7) return false;
  if (/[?]\s*$/.test(ln)) return true;
  // Statement-form prompts must be long: short fragments ("you to improve...").
  // routinely match bare starters like "you" and would swallow real content.
  if (ln.length < 60) return false;
  if (!/[.:]\s*$/.test(ln)) return false;
  if (/^(if you|explain|describe|write|give|state|compare|discuss|reflect|as a|while|imagine|suppose|you|your|how|what|why|when|there are|there is|this is|these are|through|using|applying)/i.test(ln)) return true;
  // "In CH.2.01 you studied ..." — subject-code-led transfer prompts.
  return /^in\s+[(\[]?(ch|ma|ph|bi|es|cs|enl|me|lo)\b/i.test(ln);
}

const NOISE = /^(tips|here are|here is|use word|after you|good vocabulary|blues?|reds?|yellows?|greens?)\s*:/i;

const CAT_PAREN = /^(.*?)\((personal reflection|team collaboration|engineering design process|learning_transfer|learning transfer|EDP|reflection|collaboration|transfer)\)\s*$/i;

/** Split journal text into question→answer pairs. Pure function (unit-tested). */
export function segmentJournal(raw: string): ImportCandidate[] {
  const text = raw
    .replace(/-- \d+ of \d+ --/g, '\n')
    .replace(/[ \t]+/g, ' ');
  const L = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const out: ImportCandidate[] = [];
  let cur: { question: string; answer: string[] } | null = null;
  let pending: string[] = [];
  const flush = () => {
    if (!cur) return;
    const question = cur.question.replace(/\s+/g, ' ').trim();
    const answer = cur.answer
      .filter((x) => latinRatio(x) >= 0.5)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (question.length >= 40 && question.length <= 800 && /^[A-Z0-9"“]/.test(question) && answer.length >= 150 && answer.length <= 6000) {
      out.push({ question, answer, categoryGuess: guessCategory(question) });
    }
    cur = null;
  };
  const tailQuestion = (head: string): string => {
    const tail = pending.slice(-3).filter((x) => latinRatio(x) >= 0.7);
    pending = [];
    return [...tail, head].join(' ').trim();
  };
  for (const ln of L) {
    if (NOISE.test(ln) && !cur) {
      pending = [];
      continue;
    }
    const pm = ln.match(CAT_PAREN);
    if (pm) {
      flush();
      const head = tailQuestion(pm[1]);
      cur = { question: head, answer: [] };
      continue;
    }
    if (isQuestionLine(ln)) {
      flush();
      cur = { question: ln, answer: [] };
      pending = [];
    } else if (cur) {
      cur.answer.push(ln);
      if (cur.answer.join(' ').length > 6000) flush();
    } else {
      pending.push(ln);
      if (pending.length > 5) pending.shift();
    }
  }
  flush();
  return out;
}
