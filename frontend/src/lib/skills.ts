// Shared journal-skill mappings (single source of truth for Practice/Progress/Dashboard).

export const WEAKNESS_UNITS: Record<string, { slug: string; title: string }> = {
  needs_examples: { slug: 'evidence-examples', title: 'Unit 4 — Evidence & Specific Examples' },
  claims_without_evidence: { slug: 'evidence-examples', title: 'Unit 4 — Evidence & Specific Examples' },
  generic_reflection: { slug: 'reflection-depth', title: 'Unit 5 — Reflection: Beyond Description' },
  no_personal_growth: { slug: 'reflection-depth', title: 'Unit 5 — Reflection: Beyond Description' },
  partial_coverage: { slug: 'understanding-questions', title: 'Unit 2 — Understanding the Question' },
  off_topic: { slug: 'understanding-questions', title: 'Unit 2 — Understanding the Question' },
  no_project_link: { slug: 'synthesis-transfer', title: 'Unit 8 — Synthesis & Learning Transfer' },
  weak_synthesis: { slug: 'synthesis-transfer', title: 'Unit 8 — Synthesis & Learning Transfer' },
  weak_value_judgment: { slug: 'edp-writing', title: 'Unit 10 — Engineering Design Process Writing' },
  no_individual_role: { slug: 'teamwork-writing', title: 'Unit 9 — Team Collaboration Writing' },
};

// Journal skill dimensions derived from real coverage labels + weakness codes.
export interface JournalSkill {
  key: string;
  label: string;
  hint: string;
}

export const JOURNAL_SKILLS: JournalSkill[] = [
  { key: 'prompt', label: 'Responding to prompt', hint: 'Covering every part the question asks for.' },
  { key: 'evidence', label: 'Evidence use', hint: 'Specific, checkable facts behind each claim.' },
  { key: 'explanation', label: 'Explanation', hint: 'Causes and mechanisms, not just events.' },
  { key: 'specificity', label: 'Specificity', hint: 'Named details instead of vague statements.' },
  { key: 'reflection', label: 'Reflection', hint: 'Lessons and changes, not just description.' },
];

function hasKeys(hay: string, keys: string[]): boolean {
  return keys.some((k) => hay.includes(k));
}

/** Classify one coverage item's label into journal skill buckets. */
export function classifyCoverage(label: string): string[] {
  const l = label.toLowerCase();
  const out: string[] = [];
  if (hasKeys(l, ['part', 'cover', 'question', 'address', 'includ', 'miss'])) out.push('prompt');
  if (hasKeys(l, ['evidence', 'example', 'data', 'measur', 'fact', 'specific', 'detail', 'support'])) out.push('evidence');
  if (hasKeys(l, ['expla', 'because', 'why', 'how', 'reason', 'mechanism', 'cause'])) out.push('explanation');
  if (hasKeys(l, ['specific', 'concrete', 'precise', 'vague', 'detail', 'names', 'numbers'])) out.push('specificity');
  if (hasKeys(l, ['reflect', 'learn', 'change', 'lesson', 'growth', 'insight', 'judg'])) out.push('reflection');
  return [...new Set(out)];
}

/** Map a weakness code into journal skill buckets. */
export function classifyWeakness(code: string): string[] {
  switch (code) {
    case 'partial_coverage':
    case 'off_topic':
      return ['prompt'];
    case 'needs_examples':
    case 'claims_without_evidence':
      return ['evidence', 'specificity'];
    case 'generic_reflection':
    case 'no_personal_growth':
      return ['reflection'];
    case 'no_project_link':
      return ['evidence'];
    case 'weak_synthesis':
      return ['explanation'];
    case 'weak_value_judgment':
      return ['reflection', 'explanation'];
    case 'no_individual_role':
      return ['prompt', 'specificity'];
    default:
      return [];
  }
}
