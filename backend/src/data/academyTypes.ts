// Academy seed-content contracts. Payload shapes per item kind:
//
// single_choice:  { options: string[]; correct: number; explanation: string }
// multi_select:   { options: string[]; correct: number[]; explanation: string }
// true_false:     { correct: boolean; explanation: string }
// match:          { pairs: { left: string; right: string }[]; explanation: string } (answer: Record<leftText, rightText>)
// order_steps:    { steps: string[] /* correct order */; explanation: string } (answer: string[])
// short_answer:   { keywords: string[]; threshold?: number /* default 0.6 */; sample: string; explanation: string } (answer: string)
// compare_levels: { weak: string; medium: string; strong: string; options: string[]; correct: number[]; explanation: string }
// decoder:        { question: string; blanks: { label: string; options: string[]; correct: number }[]; explanation: string } (answer: number[])
// surgery:        { weak: string; steps: { label: string; prompt: string; hint: string; keywords: string[]; threshold?: number; sample: string }[]; closing?: string; explanation: string } (answer: string[])

export interface AcademyLessonSeed {
  title: string;
  objective: string;
  body_md: string;
  examples: AcademyExampleSeed[];
  widget?: string; // e.g. 'rq_builder' | 'blue_check' | 'master_challenge'
  takeaway?: string; // one-paragraph key takeaway shown at lesson end
}

export interface AcademyVideoSeed {
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  transcript: string;
}

export interface AcademyExampleSeed {
  weak: string;
  strong: string;
  why: string;
  // Optional annotated segments of the STRONG answer for the Academic Breakdown view.
  breakdown?: { label: 'CLAIM' | 'EVIDENCE' | 'EXPLANATION' | 'ANALYSIS'; text: string }[];
}

export interface AcademyItemSeed {
  lesson: number | null; // index into unit lessons, or null for unit-level quiz
  quiz: boolean;
  kind: string;
  prompt: string;
  payload: Record<string, any>;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AcademyUnitSeed {
  slug: string;
  unit_number: number;
  title: string;
  description: string;
  est_minutes: number;
  video: AcademyVideoSeed;
  lessons: AcademyLessonSeed[];
  items: AcademyItemSeed[];
  tricks: { title: string; body: string }[];
  mistakes: { title: string; body: string }[];
}
