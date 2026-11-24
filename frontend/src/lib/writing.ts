import Typo from 'typo-js';

// Offline writing checker: hunspell spellcheck (no network, works in the
// desktop app) plus small deterministic grammar rules. It SUGGESTS fixes the
// student applies — it never rewrites answers on its own.
//
// The ~550 KB dictionary loads lazily (separate chunk) the first time the
// checker opens, so normal page loads stay fast.

export interface WritingIssue {
  kind: 'spelling' | 'grammar';
  start: number;
  end: number;
  text: string;
  suggestions: string[];
  message: string;
}

const MY_WORDS_KEY = 'sjp_mywords';
const BUILTIN_EXTRA = [
  // Capstone staples the hunspell dictionary lacks (server list extends this).
  'chitosan', 'beeswax', 'anthocyanin', 'turmeric', 'beetroot', 'kraft',
  'repurposed', 'upcycled', 'biopolymer', 'bioplastic', 'desiccant', 'agar',
  'baladi', 'taamiya', 'koshari', 'molokhia', 'gharbiya', 'sharkya',
];

export function loadMyWords(): string[] {
  try {
    const raw = localStorage.getItem(MY_WORDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.filter((x) => typeof x === 'string');
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function addMyWord(word: string) {
  try {
    const set = new Set(loadMyWords());
    set.add(word.toLowerCase());
    localStorage.setItem(MY_WORDS_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

let customWordsPromise: Promise<Set<string>> | null = null;

export function refreshCustomWords() {
  customWordsPromise = null;
}

function apiBase(): string {
  try {
    return (typeof window !== 'undefined' && (window as any).sjpDesktop?.apiBase) || '';
  } catch {
    return '';
  }
}

function loadCustomWords(): Promise<Set<string>> {
  if (!customWordsPromise) {
    customWordsPromise = fetch(`${apiBase()}/api/words`, { headers: authHeader() })
      .then((r) => (r.ok ? r.json() : { words: [] }))
      .then((d: any) => new Set<string>([...BUILTIN_EXTRA, ...(d.words ?? []), ...loadMyWords()].map((w: string) => String(w).toLowerCase())))
      .catch(() => new Set<string>([...BUILTIN_EXTRA, ...loadMyWords()].map((w: string) => w.toLowerCase())));
  }
  return customWordsPromise;
}

function authHeader(): Record<string, string> {
  try {
    const t = localStorage.getItem('sjp_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

let typoPromise: Promise<any> | null = null;

function loadTypo(): Promise<any> {
  if (!typoPromise) {
    typoPromise = Promise.all([import('../assets/dict/en.aff?raw'), import('../assets/dict/en.dic?raw')])
      .then(([aff, dic]) => {
        try {
          return new Typo('en_US', (aff as any).default ?? aff, (dic as any).default ?? dic);
        } catch (e: any) {
          throw new Error(String((e && e.message) || e));
        }
      })
      .catch((e: any) => {
        // Reset so a later retry can succeed; callers surface the message.
        typoPromise = null;
        throw e;
      });
  }
  return typoPromise;
}

const WORD_RE = /[A-Za-z][A-Za-z'\u2019-]*/g;

function isSkippable(word: string): boolean {
  if (word.length < 2) return word.toLowerCase() !== 'i' ? true : false;
  if (/\d/.test(word)) return true;
  // Acronyms and lab codes (PVI, EDP, CH.2.01 handled by tokenizer).
  if (/^[A-Z]{2,}$/.test(word.replace(/['\u2019-]/g, ''))) return true;
  return false;
}

function checkSpelling(t: any, text: string, max: number, custom: Set<string> = new Set()): WritingIssue[] {
  if (!t) return [];
  const issues: WritingIssue[] = [];
  WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = WORD_RE.exec(text)) && issues.length < max) {
    const word = m[0];
    if (isSkippable(word)) continue;
    if (custom.has(word.toLowerCase())) continue;
    let ok = false;
    try {
      ok = t.check(word) || t.check(word.toLowerCase());
    } catch {
      continue;
    }
    if (!ok) {
      let suggestions: string[] = [];
      try {
        suggestions = (t.suggest(word, 5) || []).filter((s: string) => s.toLowerCase() !== word.toLowerCase()).slice(0, 5);
      } catch {
        /* ignore */
      }
      // Preserve leading capitalization of the original word.
      if (/^[A-Z]/.test(word)) {
        suggestions = suggestions.map((s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s));
      }
      issues.push({
        kind: 'spelling',
        start: m.index,
        end: m.index + word.length,
        text: word,
        suggestions,
        message: suggestions.length ? `Did you mean ${suggestions[0]}?` : 'Not in the dictionary — check the spelling.',
      });
    }
  }
  return issues;
}

function checkGrammar(text: string): WritingIssue[] {
  const issues: WritingIssue[] = [];
  // Repeated word: "the the".
  const rep = /\b([A-Za-z]+)\s+\1\b/gi;
  let m: RegExpExecArray | null;
  rep.lastIndex = 0;
  while ((m = rep.exec(text))) {
    issues.push({
      kind: 'grammar',
      start: m.index,
      end: m.index + m[0].length,
      text: m[0],
      suggestions: [m[1]],
      message: `Repeated word — keep one "${m[1]}".`,
    });
  }
  // Double+ spaces.
  const dsp = / {2,}/g;
  dsp.lastIndex = 0;
  while ((m = dsp.exec(text))) {
    issues.push({ kind: 'grammar', start: m.index, end: m.index + m[0].length, text: m[0], suggestions: [' '], message: 'Extra spaces — use one.' });
  }
  // Missing space after sentence punctuation: "end.Next".
  const nsp = /([.!?])([A-Z])/g;
  nsp.lastIndex = 0;
  while ((m = nsp.exec(text))) {
    issues.push({ kind: 'grammar', start: m.index, end: m.index + m[0].length, text: m[0], suggestions: [`${m[1]} ${m[2]}`], message: 'Missing space after punctuation.' });
  }
  // Lowercase sentence start after end punctuation.
  const lcs = /([.!?]\s+)([a-z])/g;
  lcs.lastIndex = 0;
  while ((m = lcs.exec(text))) {
    const fixed = m[1] + m[2].toUpperCase();
    issues.push({ kind: 'grammar', start: m.index, end: m.index + m[0].length, text: m[0], suggestions: [fixed], message: 'Sentences start with a capital letter.' });
  }
  // Lone lowercase "i" as a word.
  const loneI = /(^|[\s("'])i(?=[\s.,;!?)'"’]|$)/g;
  loneI.lastIndex = 0;
  while ((m = loneI.exec(text))) {
    const at = m.index + m[1].length;
    issues.push({ kind: 'grammar', start: at, end: at + 1, text: 'i', suggestions: ['I'], message: 'The pronoun "I" is always capital.' });
  }
  return issues;
}

export async function checkWriting(text: string, maxIssues = 40): Promise<{ issues: WritingIssue[]; engineError: string }> {
  let t: any = null;
  let engineError = '';
  try {
    t = await loadTypo();
  } catch (e: any) {
    engineError = String((e && e.message) || e);
  }
  const custom = await loadCustomWords();
  const issues = [...checkGrammar(text), ...checkSpelling(t, text, maxIssues, custom)].slice(0, maxIssues);
  issues.sort((a, b) => a.start - b.start);
  return { issues, engineError };
}

/** Apply one fix; indices shift, so callers apply end-to-start for batches. */
export function applyFix(text: string, issue: WritingIssue, replacement: string): string {
  return text.slice(0, issue.start) + replacement + text.slice(issue.end);
}
