// Canonical rubric definitions — source of truth for evaluation engine (v1.0)
// Categories: personal_reflection, team_collaboration, learning_transfer, engineering_design_process
// Levels: BLUE (excellent), GREEN (good), YELLOW (needs improvement), RED (needs major improvement)

export type Grade = 'BLUE' | 'GREEN' | 'YELLOW' | 'RED';
export type Category =
  | 'personal_reflection'
  | 'team_collaboration'
  | 'learning_transfer'
  | 'engineering_design_process';

export const GRADES: Grade[] = ['BLUE', 'GREEN', 'YELLOW', 'RED'];
export const CATEGORIES: Category[] = [
  'personal_reflection',
  'team_collaboration',
  'learning_transfer',
  'engineering_design_process',
];

export const CATEGORY_LABELS: Record<Category, string> = {
  personal_reflection: 'Personal Reflection',
  team_collaboration: 'Team Collaboration',
  learning_transfer: 'Learning Transfer',
  engineering_design_process: 'Engineering Design Process',
};

export const GRADE_LABELS: Record<Grade, string> = {
  BLUE: 'Excellent / strongest level',
  GREEN: 'Good / acceptable but can be strengthened',
  YELLOW: 'Needs improvement',
  RED: 'Needs major improvement',
};

export const RUBRIC_VERSION = 'v1.0';

export interface RubricLevelDef {
  level: Grade;
  title: string;
  description: string;
  indicators: string[];
}

export const RUBRICS: Record<Category, RubricLevelDef[]> = {
  personal_reflection: [
    {
      level: 'BLUE',
      title: 'Personal Reflection — BLUE',
      description:
        'Provides insightful viewpoints and interpretations, with clear and detailed examples describing how the student understands their personal growth.',
      indicators: [
        'insightful viewpoint or interpretation (not just a generic statement)',
        'clear and detailed example(s) of a real situation',
        'explains how the experience changed thinking, behavior, or approach',
        'shows genuine understanding of personal growth',
      ],
    },
    {
      level: 'GREEN',
      title: 'Personal Reflection — GREEN',
      description:
        'Demonstrates viewpoints and interpretations with some examples describing personal growth.',
      indicators: [
        'identifies a viewpoint about personal growth',
        'includes at least one example',
        'example may lack detail or the change may be only partly explained',
      ],
    },
    {
      level: 'YELLOW',
      title: 'Personal Reflection — YELLOW',
      description: 'Contains unsupported viewpoints/interpretations or flawed arguments.',
      indicators: [
        'claim about growth with no supporting example',
        'generic statements without a concrete situation',
        'incomplete reasoning or missing parts of the question',
      ],
    },
    {
      level: 'RED',
      title: 'Personal Reflection — RED',
      description: 'Demonstrates a lack of understanding of personal growth.',
      indicators: [
        'does not answer the actual question',
        'almost no relevant reflection or evidence',
        'misses important requested elements',
      ],
    },
  ],
  team_collaboration: [
    {
      level: 'BLUE',
      title: 'Team Collaboration — BLUE',
      description:
        'Demonstrates clear understanding of the student\u2019s individual role in the team and of effective collaborative behavior, supported by specific evidence.',
      indicators: [
        'names the student\u2019s specific individual role and contributions',
        'describes what teammates did (collaboration is two-sided)',
        'explains an effective collaborative behavior with a concrete example',
        'reflects on what worked, what did not, and what would change',
      ],
    },
    {
      level: 'GREEN',
      title: 'Team Collaboration — GREEN',
      description:
        'Shows understanding of individual role and collaborative behavior with some examples, but lacks depth or specificity needed for BLUE.',
      indicators: [
        'mentions own role and teamwork in general',
        'at least one example of collaboration',
        'reflection on effectiveness is present but shallow',
      ],
    },
    {
      level: 'YELLOW',
      title: 'Team Collaboration — YELLOW',
      description:
        'Partially addresses collaboration but is vague, generic, or misses the individual role.',
      indicators: [
        'says "we worked together" without saying who did what',
        'generic claims without evidence',
        'answers only part of the question',
      ],
    },
    {
      level: 'RED',
      title: 'Team Collaboration — RED',
      description:
        'Fails to show understanding of individual role or effective collaboration.',
      indicators: [
        'does not describe any real collaborative situation',
        'off-topic or almost no relevant content',
      ],
    },
  ],
  learning_transfer: [
    {
      level: 'BLUE',
      title: 'Learning Transfer — BLUE',
      description:
        'Shows strong evidence of synthesis of content and insights gained throughout the Capstone, connecting ideas across subjects to the project.',
      indicators: [
        'names specific concepts/theories/laws from subjects and connects them',
        'explains HOW the knowledge was applied in the project (not just listed)',
        'synthesis: ideas from more than one area combined into insight',
        'specific project detail showing the transfer worked or was tested',
      ],
    },
    {
      level: 'GREEN',
      title: 'Learning Transfer — GREEN',
      description:
        'Shows synthesis of content with some connection to the Capstone, but explanation or specificity is incomplete.',
      indicators: [
        'names at least one relevant concept and links it to the project',
        'application is described but lacks mechanism or evidence',
      ],
    },
    {
      level: 'YELLOW',
      title: 'Learning Transfer — YELLOW',
      description:
        'Mentions subjects or concepts but with weak, vague, or unsupported connection to the project.',
      indicators: [
        'lists subjects without explaining application',
        'generic statements like "I used physics" with no mechanism',
        'missing parts of the question',
      ],
    },
    {
      level: 'RED',
      title: 'Learning Transfer — RED',
      description: 'Shows little or no evidence of synthesis or transfer to the Capstone.',
      indicators: ['no relevant concepts identified', 'off-topic or almost empty'],
    },
  ],
  engineering_design_process: [
    {
      level: 'BLUE',
      title: 'Engineering Design Process — BLUE',
      description:
        'Provides high-quality reflection and clear value judgment about the project step; the response would be genuinely useful to someone attempting a similar project.',
      indicators: [
        'names the specific EDP step and what was actually done',
        'evaluates what worked / what did not with reasons (value judgment)',
        'gives specific, actionable detail another team could reuse',
        'connects decisions to evidence, testing, or constraints',
      ],
    },
    {
      level: 'GREEN',
      title: 'Engineering Design Process — GREEN',
      description:
        'Reflects on the EDP step with a value judgment and some useful detail, but lacks depth or reusability for BLUE.',
      indicators: [
        'describes the step and gives an opinion on it',
        'some detail but not enough for another team to replicate the learning',
      ],
    },
    {
      level: 'YELLOW',
      title: 'Engineering Design Process — YELLOW',
      description:
        'Describes the step superficially with weak or unsupported judgment.',
      indicators: [
        'says what happened but not whether/why it was good',
        'generic statements without evidence or testing detail',
      ],
    },
    {
      level: 'RED',
      title: 'Engineering Design Process — RED',
      description: 'Fails to reflect meaningfully on the EDP step.',
      indicators: ['no real step described', 'off-topic or almost empty'],
    },
  ],
};

export function getRubric(category: Category, level: Grade): RubricLevelDef {
  const found = RUBRICS[category].find((r) => r.level === level);
  if (!found) throw new Error(`Rubric not found ${category}/${level}`);
  return found;
}

export function gradeRank(g: Grade): number {
  return { BLUE: 4, GREEN: 3, YELLOW: 2, RED: 1 }[g];
}

export function compareGrades(a: Grade, b: Grade): number {
  return gradeRank(a) - gradeRank(b);
}

export function nextLevel(g: Grade): Grade | null {
  if (g === 'RED') return 'YELLOW';
  if (g === 'YELLOW') return 'GREEN';
  if (g === 'GREEN') return 'BLUE';
  return null;
}
