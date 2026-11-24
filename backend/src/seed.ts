import bcrypt from 'bcryptjs';
import { pool } from './db';
import { config } from './config';
import { RUBRICS, RUBRIC_VERSION, Category, Grade } from './lib/rubric';
import { OFFICIAL_JOURNAL_QUESTIONS } from './data/officialJournals';
import { PRACTICE_PACK_G11_S1 } from './data/practicePackG11S1';
import { PEER_GUIDE_PACK } from './data/peerGuidePack';
import { PRACTICE_PACK_VOLUME_2 } from './data/practicePackVolume2';
import { PRACTICE_PACK_VOLUME_3 } from './data/practicePackVolume3';
import { PRACTICE_PACK_VOLUME_4 } from './data/practicePackVolume4';
import { seedAcademy } from './seedAcademy';

interface SeedQuestion {
  category: Category;
  question_text: string;
  what_testing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  required_components: { key: string; label: string; keywords: string[] }[];
  source: 'official_example' | 'practice' | 'teacher_created' | 'admin_created';
  source_label: string;
  tags: string[];
  reference_answer?: string;
  // Explicit scope wins over label-derived scope (used by curated practice packs).
  scope?: {
    grade?: number | null;
    semester?: number | null;
    school_year?: string;
    question_number?: number | null;
    question_slot?: number | null;
    question_type?: string;
    learning_objectives?: string[];
    instructions?: string;
  };
}

const QUESTIONS: SeedQuestion[] = [
  // ---------- Personal Reflection ----------
  {
    category: 'personal_reflection',
    question_text:
      'Reflect on how completing your Capstone project has influenced your personality. Describe a specific change in how you think, behave, or approach challenges, and support it with a concrete example from your project.',
    what_testing:
      'Whether you can identify a genuine personal change and support it with a specific example — not just generic statements about growth.',
    difficulty: 'medium',
    required_components: [
      { key: 'describe_specific_change', label: 'Describe one specific change in your personality, thinking, or behavior', keywords: ['changed', 'become', 'now i', 'used to', 'personality', 'behavior', 'behavior', 'approach', 'mindset', 'patient', 'confident', 'organized', 'persistent'] },
      { key: 'concrete_example', label: 'Give a concrete example/situation from your Capstone showing the change', keywords: ['for example', 'when', 'during', 'prototype', 'team', 'we ', 'i did', 'happened', 'situation', 'event', 'challenge'] },
      { key: 'explain_personal_impact', label: 'Explain how the experience caused the change and what it means for you', keywords: ['because', 'taught', 'learned', 'realized', 'made me', 'therefore', 'growth', 'lesson', 'impact'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['growth', 'personality', 'insight'],
  },
  {
    category: 'personal_reflection',
    question_text:
      'Describe two specific practices or strategies you would use again in your next project, and one approach you would avoid. For each, explain why, using examples from your Capstone experience.',
    what_testing:
      'Whether you can evaluate your own strategies with reasons and evidence — distinguishing what worked from what did not.',
    difficulty: 'medium',
    required_components: [
      { key: 'two_practices', label: 'Describe two specific practices/strategies you would reuse', keywords: ['practice', 'strategy', 'strategies', 'again', 'reuse', 'planning', 'testing', 'meeting', 'dividing', 'document', 'prototype', 'schedule'] },
      { key: 'approach_to_avoid', label: 'Describe one approach you would avoid', keywords: ['avoid', 'not use', 'would not', 'mistake', 'failed', 'poor', 'skipped', 'ignored', 'last minute'] },
      { key: 'explain_with_examples', label: 'Explain why for each, with Capstone examples', keywords: ['because', 'example', 'when', 'result', 'worked', 'failed', 'evidence', 'tested'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['strategy', 'growth', 'judgment'],
  },
  {
    category: 'personal_reflection',
    question_text:
      'Describe a moment during your Capstone when you struggled, failed, or felt stuck. What did you do, what did you learn about yourself, and how did it change your approach afterward?',
    what_testing: 'Depth of self-awareness: can you turn a setback into an explained lesson with a behavior change?',
    difficulty: 'hard',
    required_components: [
      { key: 'describe_struggle', label: 'Describe the specific struggle or failure moment', keywords: ['failed', 'struggle', 'stuck', 'difficult', 'problem', 'mistake', 'wrong', 'challenge', 'when'] },
      { key: 'your_response', label: 'Explain what you personally did in response', keywords: ['i did', 'i tried', 'i asked', 'i changed', 'my response', 'decided', 'action'] },
      { key: 'lesson_and_change', label: 'Explain what you learned and how your approach changed', keywords: ['learned', 'realized', 'changed', 'now', 'next time', 'growth', 'lesson', 'different'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['resilience', 'growth'],
  },
  {
    category: 'personal_reflection',
    question_text:
      'How has your understanding of your own strengths and weaknesses changed through the Capstone? Give one example that revealed a strength and one that revealed a weakness, and explain what you will do with that knowledge.',
    what_testing: 'Whether reflection is balanced, specific, and forward-looking — not just praise or self-criticism.',
    difficulty: 'hard',
    required_components: [
      { key: 'strength_example', label: 'Give an example revealing a personal strength', keywords: ['strength', 'good at', 'skilled', 'led', 'succeeded', 'contributed', 'example'] },
      { key: 'weakness_example', label: 'Give an example revealing a personal weakness', keywords: ['weakness', 'weak', 'struggle', 'poor', 'need to improve', 'failed', 'difficult'] },
      { key: 'future_use', label: 'Explain what you will do with this self-knowledge', keywords: ['will', 'next', 'plan', 'improve', 'use', 'develop', 'goal', 'change'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['strengths', 'self-awareness'],
  },
  // ---------- Team Collaboration ----------
  {
    category: 'team_collaboration',
    question_text:
      'Describe your individual role in your Capstone team and give a specific example showing effective collaborative behavior. Explain what made the collaboration effective.',
    what_testing: 'Whether you can separate your own contributions from the team\u2019s and evaluate collaboration with evidence.',
    difficulty: 'medium',
    required_components: [
      { key: 'individual_role', label: 'State your specific individual role and contributions', keywords: ['my role', 'i was', 'responsible', 'handled', 'my task', 'my contribution', 'i did', 'led', 'managed'] },
      { key: 'collaborative_example', label: 'Give a specific example of collaboration (what you and teammates each did)', keywords: ['teammate', 'together', 'we ', 'meeting', 'divided', 'helped', 'collaborat', 'communicat', 'example', 'when'] },
      { key: 'why_effective', label: 'Explain what made it effective (or what you learned)', keywords: ['effective', 'because', 'worked', 'result', 'learned', 'improved', 'successful'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['role', 'collaboration'],
  },
  {
    category: 'team_collaboration',
    question_text:
      'Describe a disagreement or conflict in your team. What was your role in addressing it, what did each side do, and what was the outcome? What would you do differently?',
    what_testing: 'Maturity in handling conflict: specifics, your part, and reflective judgment.',
    difficulty: 'hard',
    required_components: [
      { key: 'describe_conflict', label: 'Describe the specific disagreement (who, about what)', keywords: ['disagree', 'conflict', 'argument', 'different opinion', 'tension', 'issue', 'problem'] },
      { key: 'your_role', label: 'Explain your personal role in addressing it', keywords: ['i did', 'i said', 'i suggested', 'my role', 'i listened', 'i proposed', 'mediat'] },
      { key: 'outcome_and_lesson', label: 'Give the outcome and what you would do differently', keywords: ['outcome', 'result', 'resolved', 'decided', 'learned', 'differently', 'next time', 'lesson'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['conflict', 'communication'],
  },
  {
    category: 'team_collaboration',
    question_text:
      'How did your team divide tasks and hold members accountable? Give a concrete example of the system you used and evaluate whether it worked.',
    what_testing: 'Understanding of team process and accountability — with evaluation, not just description.',
    difficulty: 'medium',
    required_components: [
      { key: 'division_system', label: 'Describe how tasks were divided and tracked', keywords: ['divided', 'split', 'assigned', 'schedule', 'deadline', 'trello', 'sheet', 'plan', 'task', 'track'] },
      { key: 'accountability_example', label: 'Give a concrete example of accountability in action', keywords: ['example', 'when', 'checked', 'meeting', 'followed', 'missed', 'completed', 'report'] },
      { key: 'evaluation', label: 'Evaluate whether the system worked and why', keywords: ['worked', 'effective', 'failed', 'because', 'improve', 'better', 'result'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['accountability', 'process'],
  },
  {
    category: 'team_collaboration',
    question_text:
      'If you could restart your Capstone teamwork from day one, what would you change about how you collaborated? Justify each change with something that actually happened.',
    what_testing: 'Reflective value judgment grounded in real events — useful to another team.',
    difficulty: 'easy',
    required_components: [
      { key: 'proposed_changes', label: 'State specific changes you would make', keywords: ['would change', 'would do', 'improve', 'start', 'plan', 'communicat', 'meeting', 'differently'] },
      { key: 'grounding_event', label: 'Ground each change in something that actually happened', keywords: ['because', 'when', 'example', 'happened', 'failed', 'worked', 'issue', 'problem'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['improvement', 'reflection'],
  },
  // ---------- Learning Transfer ----------
  {
    category: 'learning_transfer',
    question_text:
      'Explain how at least two scientific theories, laws, or concepts you learned in STEM subjects were applied during the construction or testing of your prototype. For each, explain HOW it shaped a design decision.',
    what_testing: 'Evidence of synthesis: naming real content and showing the mechanism of application — not just listing subjects.',
    difficulty: 'hard',
    required_components: [
      { key: 'two_concepts', label: 'Name at least two specific theories/laws/concepts with subjects', keywords: ['physics', 'chemistry', 'biology', 'math', 'newton', 'ohm', 'bernoulli', 'energy', 'force', 'pressure', 'theory', 'law', 'principle', 'concept', 'formula'] },
      { key: 'how_applied', label: 'Explain HOW each was applied in construction/testing', keywords: ['applied', 'used', 'built', 'designed', 'constructed', 'tested', 'shaped', 'decision', 'chose', 'calculated'] },
      { key: 'design_impact', label: 'Explain what changed in the design because of each concept', keywords: ['because', 'therefore', 'result', 'changed', 'improved', 'redesign', 'effect', 'measured'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['synthesis', 'science', 'prototype'],
  },
  {
    category: 'learning_transfer',
    question_text:
      'Describe how you combined knowledge from at least two different school subjects to solve a Capstone problem. What was the problem, what did each subject contribute, and what was the combined insight?',
    what_testing: 'True synthesis across disciplines — the combined insight should be more than the sum of parts.',
    difficulty: 'hard',
    required_components: [
      { key: 'the_problem', label: 'State the specific Capstone problem', keywords: ['problem', 'challenge', 'issue', 'needed', 'had to', 'design', 'prototype'] },
      { key: 'subject_contributions', label: 'Explain what each subject contributed', keywords: ['physics', 'chemistry', 'biology', 'math', 'english', 'subject', 'contributed', 'provided', 'concept'] },
      { key: 'combined_insight', label: 'State the combined insight or solution', keywords: ['combined', 'together', 'insight', 'solution', 'realized', 'therefore', 'result', 'synthesis'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['interdisciplinary', 'synthesis'],
  },
  {
    category: 'learning_transfer',
    question_text:
      'Describe one classroom concept that changed a specific decision in your project. What did you originally plan, what did the concept teach you, and what did you do instead?',
    what_testing: 'Transfer as decision-change: before → concept → after, with mechanism.',
    difficulty: 'medium',
    required_components: [
      { key: 'original_plan', label: 'State the original plan or assumption', keywords: ['originally', 'planned', 'first', 'assumed', 'thought', 'initial'] },
      { key: 'the_concept', label: 'Name and explain the classroom concept', keywords: ['concept', 'theory', 'law', 'learned', 'physics', 'chemistry', 'math', 'principle'] },
      { key: 'changed_decision', label: 'Explain what you did differently and why', keywords: ['instead', 'changed', 'redesign', 'decided', 'because', 'result', 'better'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['transfer', 'decision'],
  },
  {
    category: 'learning_transfer',
    question_text:
      'What is the most important insight you gained across your Capstone that connects your subjects to a real-world problem? Explain the connection with a specific project detail.',
    what_testing: 'Breadth of insight plus specific grounding — not abstract claims.',
    difficulty: 'easy',
    required_components: [
      { key: 'the_insight', label: 'State the cross-subject insight', keywords: ['insight', 'learned', 'realized', 'understood', 'connection', 'important'] },
      { key: 'real_world_link', label: 'Connect it to the real-world problem your project addresses', keywords: ['real world', 'problem', 'community', 'egypt', 'water', 'energy', 'pollution', 'solution', 'need'] },
      { key: 'project_detail', label: 'Support with a specific project detail', keywords: ['prototype', 'tested', 'built', 'measured', 'example', 'when', 'data'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['insight', 'real-world'],
  },
  // ---------- Engineering Design Process ----------
  {
    category: 'engineering_design_process',
    question_text:
      'Choose ONE Engineering Design Process step your team worked on (e.g., defining the problem, generating solutions, prototyping, or testing). Describe what you did, evaluate what worked and what did not, and explain what another team should learn from your experience.',
    what_testing: 'Quality of reflection and value judgment — the answer should be useful to someone attempting a similar project.',
    difficulty: 'medium',
    required_components: [
      { key: 'the_step_and_actions', label: 'Name the step and describe what you actually did', keywords: ['step', 'prototyp', 'test', 'define', 'generate', 'design', 'built', 'constructed', 'we did'] },
      { key: 'value_judgment', label: 'Evaluate what worked / did not work and why', keywords: ['worked', 'failed', 'effective', 'limitation', 'because', 'evidence', 'result', 'problem'] },
      { key: 'lesson_for_others', label: 'State a reusable lesson for another team', keywords: ['another team', 'should', 'recommend', 'lesson', 'advice', 'next', 'avoid', 'ensure'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['edp', 'judgment', 'prototype'],
  },
  {
    category: 'engineering_design_process',
    question_text:
      'How did your team define design criteria and constraints? Give the actual criteria/constraints and explain how they shaped your final design with a specific trade-off you made.',
    what_testing: 'Whether constraints genuinely drove decisions — with a concrete trade-off.',
    difficulty: 'hard',
    required_components: [
      { key: 'criteria_constraints', label: 'List actual criteria and constraints', keywords: ['criteria', 'constraint', 'requirement', 'cost', 'time', 'material', 'safety', 'size', 'budget'] },
      { key: 'shaped_design', label: 'Explain how they shaped the design', keywords: ['shaped', 'chose', 'decided', 'designed', 'because', 'limited', 'required'] },
      { key: 'tradeoff', label: 'Describe one specific trade-off and why you chose it', keywords: ['tradeoff', 'trade-off', 'instead', 'sacrificed', 'chose', 'compared', 'better', 'worse'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['criteria', 'constraints', 'tradeoff'],
  },
  {
    category: 'engineering_design_process',
    question_text:
      'Describe how you tested your prototype. What did you measure or observe, what did the results show, and what specific redesign did you make (or decide not to make) based on the results?',
    what_testing: 'Evidence-based iteration: test → result → decision.',
    difficulty: 'medium',
    required_components: [
      { key: 'test_method', label: 'Describe the test method and what was measured', keywords: ['tested', 'measured', 'observed', 'trial', 'experiment', 'data', 'method'] },
      { key: 'results', label: 'State what the results showed', keywords: ['result', 'showed', 'found', 'data', 'failed', 'passed', 'revealed', 'because'] },
      { key: 'redesign_decision', label: 'Explain the redesign decision based on results', keywords: ['redesign', 'changed', 'fixed', 'improved', 'decided', 'iteration', 'version'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['testing', 'iteration'],
  },
  {
    category: 'engineering_design_process',
    question_text:
      'What practical advice would you give another STEM team attempting a project like yours? Base each piece of advice on something specific that happened in your project.',
    what_testing: 'Usefulness to others: advice grounded in evidence, not generic tips.',
    difficulty: 'easy',
    required_components: [
      { key: 'advice', label: 'Give 2+ specific pieces of practical advice', keywords: ['advice', 'should', 'recommend', 'ensure', 'avoid', 'test', 'plan', 'document', 'tip'] },
      { key: 'grounding', label: 'Ground each in a specific project event', keywords: ['because', 'when', 'example', 'happened', 'we learned', 'failed', 'worked'] },
    ],
    source: 'practice',
    source_label: 'Practice Question',
    tags: ['advice', 'transfer'],
  },
];

async function seed() {
  // rubric version
  await pool.query(
    `INSERT INTO rubric_versions(version, notes) VALUES ($1, $2) ON CONFLICT (version) DO UPDATE SET notes=EXCLUDED.notes`,
    [RUBRIC_VERSION, 'Initial rubric: BLUE/GREEN/YELLOW/RED across 4 Capstone categories'],
  );
  const rv = await pool.query(`SELECT id FROM rubric_versions WHERE version=$1`, [RUBRIC_VERSION]);
  const rvId = rv.rows[0].id;

  const cats: Category[] = ['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process'];
  const levels: Grade[] = ['BLUE', 'GREEN', 'YELLOW', 'RED'];
  for (const c of cats) {
    for (const l of levels) {
      const def = RUBRICS[c].find((r) => r.level === l)!;
      await pool.query(
        `INSERT INTO rubrics(category, level, title, description, indicators, rubric_version_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (category, level) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, indicators=EXCLUDED.indicators, rubric_version_id=EXCLUDED.rubric_version_id`,
        [c, l, def.title, def.description, def.indicators, rvId],
      );
    }
  }
  console.log('rubrics seeded');

  // questions (idempotent by question_text): practice questions + authentic official journal questions
  const ALL_QUESTIONS: SeedQuestion[] = [
    ...QUESTIONS,
    ...OFFICIAL_JOURNAL_QUESTIONS.map((q) => ({
      ...q,
      source: 'official_example' as const,
    })),
    ...PRACTICE_PACK_G11_S1,
    ...PEER_GUIDE_PACK,
    ...PRACTICE_PACK_VOLUME_2,
    ...PRACTICE_PACK_VOLUME_3,
    ...PRACTICE_PACK_VOLUME_4,
  ];

  // Grade/semester scope derived from the source label — same rules as
  // migrations 006/007, so fresh databases (desktop embedded) match dev.
  // Transfer slots Q3/Q4 alternate within each journal set.
  // LO codes (CH.2.01 …) are extracted into learning_objectives so students
  // can filter transfer questions by LOs they have actually reached.
  const transferCount = new Map<string, number>();
  // LO codes in many spellings: CH.2.01, MA 2.03, ES2.01, (02.05) needs subject context —
  // the bare-number form is too ambiguous, so require the subject prefix.
  const LO_RE = /([A-Z]{2,4})\s*\.?\s*(\d{1,2})\s*\.\s*(\d{1,2})/g;
  function scopeOf(q: SeedQuestion) {
    const label = q.source_label;
    const category = q.category;
    const s = {
      grade: null as number | null,
      semester: null as number | null,
      school_year: '',
      question_number: null as number | null,
      question_slot: null as number | null,
      question_type:
        category === 'personal_reflection' ? 'PERSONAL_REFLECTION'
        : category === 'team_collaboration' ? 'TEAM_COLLABORATION'
        : category === 'engineering_design_process' ? 'ENGINEERING_DESIGN_PROCESS'
        : category === 'learning_transfer' ? 'LEARNING_TRANSFER' : '',
      source: null as string | null,
    };
    let m: RegExpMatchArray | null;
    if ((m = label.match(/S'(\d\d)\s+G(\d\d?)\s+S([12])/))) {
      s.school_year = '20' + m[1];
      s.grade = parseInt(m[2], 10);
      s.semester = parseInt(m[3], 10);
      const j = label.match(/\sJ(\d+)/);
      if (j) s.question_number = parseInt(j[1], 10);
    } else if ((m = label.match(/S'(\d\d)\s+G12\s+J(\d+)/))) {
      s.school_year = '20' + m[1];
      s.grade = 12;
      s.question_number = parseInt(m[2], 10);
    } else if ((m = label.match(/Past Paper — G12 (\d{4}) J(\d+)/))) {
      s.school_year = m[1];
      s.grade = 12;
      s.question_number = parseInt(m[2], 10);
    } else if ((m = label.match(/Official G10 Sample.*J(\d+)/))) {
      s.school_year = 'sample';
      s.grade = 10;
      s.question_number = parseInt(m[1], 10);
    } else if ((m = label.match(/Official G2 S2.*J(\d+)/))) {
      s.grade = 12;
      s.semester = 2;
      s.question_number = parseInt(m[1], 10);
    }
    if (/official/i.test(label)) {
      s.source = /water theme/i.test(label) ? 'practice' : 'official';
    }
    if (category === 'personal_reflection' || category === 'team_collaboration') s.question_slot = 1;
    else if (category === 'engineering_design_process') s.question_slot = 2;
    else if (category === 'learning_transfer') {
      const key = `${s.grade}|${s.semester}|${s.school_year}|${s.question_number}`;
      const n = (transferCount.get(key) ?? 0) + 1;
      transferCount.set(key, n);
      s.question_slot = n % 2 === 1 ? 3 : 4;
    }
    // LO codes mentioned in the prompt/testing notes, e.g. CH.2.01.
    const loSet = new Set<string>();
    let lm: RegExpMatchArray | null;
    LO_RE.lastIndex = 0;
    const hay = `${q.question_text} ${q.what_testing}`;
    while ((lm = LO_RE.exec(hay))) {
      const major = lm[2].replace(/^0+/, '') || '0';
      const minor = (lm[3].replace(/^0+/, '') || '0').padStart(2, '0');
      loSet.add(`${lm[1]}.${major}.${minor}`);
    }
    const derived = { ...s, learning_objectives: [...loSet], instructions: '' };
    // Explicit per-question scope wins over anything derived.
    const o = q.scope ?? {};
    return {
      ...derived,
      grade: o.grade !== undefined ? o.grade : derived.grade,
      semester: o.semester !== undefined ? o.semester : derived.semester,
      school_year: o.school_year ?? derived.school_year,
      question_number: o.question_number !== undefined ? o.question_number : derived.question_number,
      question_slot: o.question_slot !== undefined ? o.question_slot : derived.question_slot,
      question_type: o.question_type ?? derived.question_type,
      learning_objectives: o.learning_objectives ?? derived.learning_objectives,
      instructions: o.instructions ?? '',
    };
  }

  for (const q of ALL_QUESTIONS) {
    const sc = scopeOf(q);
    const source = sc.source ?? q.source;
    const existing = await pool.query(`SELECT id FROM questions WHERE question_text=$1`, [q.question_text]);
    let qid: string;
    if (existing.rows.length > 0) {
      qid = existing.rows[0].id;
      await pool.query(
        `UPDATE questions SET category=$2, what_testing=$3, difficulty=$4, rubric_category=$5, required_components=$6, source=$7, source_label=$8, reference_answer=$9, active=TRUE,
          grade=$10, semester=$11, school_year=$12, question_number=$13, question_slot=$14, question_type=$15,
          learning_objectives=CASE WHEN $16::text[] = '{}'::text[] THEN questions.learning_objectives ELSE $16 END,
          instructions=$17, updated_at=now() WHERE id=$1`,
        [qid, q.category, q.what_testing, q.difficulty, q.category, JSON.stringify(q.required_components), source, q.source_label, q.reference_answer ?? '',
         sc.grade, sc.semester, sc.school_year, sc.question_number, sc.question_slot, sc.question_type, sc.learning_objectives, sc.instructions],
      );
    } else {
      const ins = await pool.query(
        `INSERT INTO questions(category, question_text, what_testing, difficulty, rubric_category, required_components, source, source_label, reference_answer, active,
          grade, semester, school_year, question_number, question_slot, question_type, learning_objectives, instructions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id`,
        [q.category, q.question_text, q.what_testing, q.difficulty, q.category, JSON.stringify(q.required_components), source, q.source_label, q.reference_answer ?? '',
         sc.grade, sc.semester, sc.school_year, sc.question_number, sc.question_slot, sc.question_type, sc.learning_objectives, sc.instructions],
      );
      qid = ins.rows[0].id;
    }
    for (const tag of q.tags) {
      await pool.query(`INSERT INTO question_tags(question_id, tag) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [qid, tag]);
    }
  }
  console.log(`questions seeded (${ALL_QUESTIONS.length})`);

  // admin bootstrap
  const adminEmail = (config.adminEmail ?? '').toLowerCase();
  const existing = await pool.query(`SELECT id FROM users WHERE email=$1`, [adminEmail]);
  const hash = await bcrypt.hash(config.adminPassword, config.bcryptRounds);
  let adminId: string;
  if (existing.rows.length === 0) {
    const r = await pool.query(`INSERT INTO users(email, password_hash, role, display_name) VALUES ($1,$2,'admin',$3) RETURNING id`, [
      adminEmail,
      hash,
      'Admin',
    ]);
    adminId = r.rows[0].id;
  } else {
    adminId = existing.rows[0].id;
    await pool.query(`UPDATE users SET role='admin', password_hash=$2 WHERE id=$1`, [adminId, hash]);
  }
  await pool.query(`INSERT INTO admin_users(user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [adminId]);
  console.log(`admin ensured: ${adminEmail}`);

  await seedAcademy();
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
