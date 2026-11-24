import { Category } from '../lib/rubric';

export interface OfficialQuestion {
  category: Category;
  question_text: string;
  what_testing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  required_components: { key: string; label: string; keywords: string[] }[];
  source_label: string;
  tags: string[];
  // Optional LO codes students can filter transfer questions by.
  // Optional graded model answer (from official scored exemplars) shown to students
  // after evaluation. Empty string means no exemplar exists.
  reference_answer?: string;
}

// All questions are transcription-faithful to the attached official Capstone journals.
// Modern set: S'24 -> S'27, G10-G12. Legacy set: G12 past papers 2015-2017.
// Combined "Personal Reflection/Team Collaboration" items are assigned to the single
// DB category that best matches their emphasis; the original combined label is
// preserved in `tags`.
export const OFFICIAL_JOURNAL_QUESTIONS: OfficialQuestion[] = [
  // ================= S'24 G10 S2 =================

  // ================= S'25 G11 S1 =================

  // ================= S'25 G11 S2 =================

  // ================= G2 S2 First Journal (industry / biomimicry) =================
  {
    category: 'team_collaboration',
    question_text:
      'Group Presentation has an important role during capstone Exhibition. What do you suggest having a good group presentation for the next Exhibition?',
    what_testing: 'Giving practical suggestions for an effective group presentation.',
    difficulty: 'easy',
    required_components: [
      { key: 'suggestions', label: 'Give practical presentation suggestions', keywords: ['practice', 'roles', 'signal', 'organize', 'agree', 'presentation'] },
      { key: 'teamwork', label: 'Frame them around team cooperation', keywords: ['team', 'leader', 'each member', 'together'] },
    ],
    source_label: "Official G10 Sample — J5",
    tags: ['team_collaboration', 'presentation'],
  },
  {
    category: 'engineering_design_process',
    question_text:
      'As our conclusions summarize how your results support or do not support your original hypothesis, which it should be drawn from the prototype test results and analysis, write your Project Conclusion for this semester including your hypothesis and the main results.',
    what_testing: 'Writing a conclusion that ties hypothesis, test results, and main findings.',
    difficulty: 'hard',
    required_components: [
      { key: 'hypothesis', label: 'Restate your hypothesis', keywords: ['hypothesis', 'expected', 'predicted'] },
      { key: 'results', label: 'Summarize the main results', keywords: ['result', 'tested', 'measured', 'reached', 'temperature', 'data'] },
      { key: 'verdict', label: 'State whether results support the hypothesis', keywords: ['supported', 'true', 'proved', 'confirmed', 'not supported'] },
    ],
    source_label: "Official G10 Sample — J5",
    tags: ['engineering_design_process', 'conclusion'],
  },
  {
    category: 'learning_transfer',
    question_text:
      'In Math, you are learning about "Create, Interpret and Analyze different types of functions that model real-world situations". Which function did you use for your Capstone Project about energy? And explain why did you use it?',
    what_testing: 'Choosing the function used in an energy capstone and justifying its selection.',
    difficulty: 'hard',
    required_components: [
      { key: 'function', label: 'State the function you used', keywords: ['function', 'power', 'formula', 'equation', 'p', 'mc'] },
      { key: 'why', label: 'Explain why you used it', keywords: ['because', 'calculate', 'energy', 'heat', 'variables', 'model'] },
    ],
    source_label: "Official G10 Sample — J5",
    tags: ['learning_transfer', 'math', 'energy'],
  },
];