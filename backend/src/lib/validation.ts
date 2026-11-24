import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  display_name: z.string().min(2).max(80),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const projectSchema = z.object({
  name: z.string().max(200).optional().nullable(),
  problem: z.string().max(2000).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  role: z.string().max(1000).optional().nullable(),
  team_members: z.array(z.string().max(80)).max(12).optional(),
  edp_steps: z.array(z.string().max(120)).max(20).optional(),
  challenges: z.string().max(5000).optional().nullable(),
  outcomes: z.string().max(5000).optional().nullable(),
  grade: z.number().int().min(10).max(12).optional().nullable(),
  semester: z.number().int().min(1).max(2).optional().nullable(),
  school_year: z.string().max(20).optional().nullable(),
  challenge_id: z.string().uuid().optional().nullable(),
});

export const draftSchema = z.object({
  question_id: z.string().uuid(),
  session_id: z.string().uuid().optional().nullable(),
  answer_text: z.string().max(20000),
});

export const attemptSchema = z.object({
  question_id: z.string().uuid(),
  session_id: z.string().uuid().optional().nullable(),
  answer_text: z.string().min(1).max(20000),
  // EDP stage the student says this teamwork answer is about (platform study
  // guide stages). Optional everywhere; required by nothing at the API level.
  edp_stage_no: z.number().int().min(1).max(12).optional().nullable(),
});

export const questionCreateSchema = z.object({
  category: z.enum(['personal_reflection', 'team_collaboration', 'learning_transfer', 'engineering_design_process']),
  question_text: z.string().min(60).max(3000),
  what_testing: z.string().min(10).max(2000),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  required_components: z
    .array(z.object({ key: z.string().min(1).max(80), label: z.string().min(1).max(300), keywords: z.array(z.string()).min(1).max(20).default([]) }))
    .min(2)
    .max(8),
  source: z.enum(['official', 'official_example', 'official_adapted', 'practice', 'teacher_created', 'admin_created']).default('practice'),
  source_label: z.string().max(120).default('Practice Question'),
  reference_answer: z.string().max(8000).default(''),
  active: z.boolean().default(true),
  tags: z.array(z.string().max(40)).max(10).optional(),
  grade: z.number().int().min(10).max(12).nullable().optional(),
  semester: z.number().int().min(1).max(2).nullable().optional(),
  school_year: z.string().max(20).default(''),
  question_number: z.number().int().min(1).max(20).nullable().optional(),
  question_slot: z.number().int().min(1).max(4).nullable().optional(),
  question_type: z.string().max(60).default(''),
  instructions: z.string().max(3000).default(''),
  learning_objectives: z.array(z.string().max(300)).max(10).default([]),
});

export const questionUpdateSchema = questionCreateSchema.partial();

// ---------- Academic Writing Academy CMS ----------
export const academyUnitSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  unit_number: z.number().int().min(1).max(100),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).default(''),
  est_minutes: z.number().int().min(1).max(600).default(30),
  active: z.boolean().default(true),
  track_scope: z.enum(['CORE', 'G10', 'G11', 'G12', 'SEMESTER', 'JOURNAL', 'RESEARCH']).default('CORE'),
  grade: z.number().int().min(10).max(12).nullable().optional(),
  semester: z.number().int().min(1).max(2).nullable().optional(),
});

const academyExampleSchema = z.object({
  weak: z.string().max(4000),
  strong: z.string().max(4000),
  why: z.string().max(2000),
});

export const academyLessonSchema = z.object({
  unit_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  objective: z.string().max(1000).default(''),
  body_md: z.string().max(20000).default(''),
  examples: z.array(academyExampleSchema).max(10).default([]),
  widget: z.string().max(40).default(''),
  takeaway: z.string().max(2000).default(''),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const academyVideoSchema = z.object({
  unit_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).default(''),
  video_url: z.string().max(1000).default(''),
  thumbnail_url: z.string().max(1000).default(''),
  duration_seconds: z.number().int().min(0).max(7200).default(0),
  transcript: z.string().max(20000).default(''),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const academyItemSchema = z.object({
  unit_id: z.string().uuid(),
  lesson_id: z.string().uuid().nullable().optional(),
  quiz: z.boolean().default(false),
  kind: z.enum(['single_choice', 'multi_select', 'true_false', 'match', 'order_steps', 'short_answer', 'compare_levels', 'decoder', 'surgery']),
  prompt: z.string().min(3).max(4000),
  payload: z.record(z.any()).default({}),
  points: z.number().int().min(1).max(20).default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const academyTrickSchema = z.object({
  unit_id: z.string().uuid(),
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(2000),
  order_index: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const academyMistakeSchema = academyTrickSchema;

export const customWordSchema = z.object({
  word: z.string().min(2).max(60).regex(/^[A-Za-z][A-Za-z'-]{1,59}$/),
});

// ---------- Site CMS (§50): About / Privacy / Terms + creator settings ----------
export const sitePageUpdateSchema = z.object({
  title: z.string().min(2).max(200),
  body_md: z.string().min(10).max(40000),
});
export const siteSettingSchema = z.object({
  value: z.string().max(500),
});

// ---------- EDP challenge CMS (§48) ----------
export const challengeSchema = z.object({
  grade: z.number().int().min(10).max(12),
  semester: z.number().int().min(1).max(2),
  school_year: z.string().max(20).default(''),
  title: z.string().min(3).max(300),
  subtitle: z.string().max(500).default(''),
  theme: z.string().max(300).default(''),
  grand_challenge_link: z.string().max(1000).default(''),
  big_idea: z.string().max(5000).default(''),
  essential_question: z.string().max(2000).default(''),
  design_challenge: z.string().max(5000).default(''),
  timeline: z.string().max(3000).default(''),
  evaluation_day: z.string().max(5000).default(''),
  active: z.boolean().default(true),
});
export const challengeUpdateSchema = challengeSchema.partial();

export const challengeSectionSchema = z.object({
  challenge_id: z.string().uuid(),
  section: z.string().min(2).max(80),
  heading: z.string().max(300).default(''),
  body: z.string().min(10).max(20000),
  sort: z.number().int().min(0).default(0),
});
export const challengeSectionUpdateSchema = challengeSectionSchema.partial().omit({ challenge_id: true });

export const trackStageSchema = z.object({
  challenge_id: z.string().uuid(),
  stage_no: z.number().int().min(1).max(50),
  title: z.string().min(2).max(300),
  body: z.string().min(10).max(8000),
  prompt: z.string().max(2000).default(''),
  official: z.boolean().default(false),
  official_note: z.string().max(1000).default(''),
  sort: z.number().int().min(0).default(0),
});
export const trackStageUpdateSchema = trackStageSchema.partial().omit({ challenge_id: true });

export const challengeResourceSchema = z.object({
  challenge_id: z.string().uuid(),
  kind: z.enum(['document', 'video', 'link', 'template', 'data_sheet', 'guide', 'rubric']).default('document'),
  title: z.string().min(2).max(300),
  url: z.string().max(2000).default(''),
  official: z.boolean().default(false),
  notes: z.string().max(2000).default(''),
});
export const challengeResourceUpdateSchema = challengeResourceSchema.partial().omit({ challenge_id: true });

export const academyUnitUpdateSchema = academyUnitSchema.partial();
export const academyLessonUpdateSchema = academyLessonSchema.partial().omit({ unit_id: true });
export const academyVideoUpdateSchema = academyVideoSchema.partial().omit({ unit_id: true });
export const academyItemUpdateSchema = academyItemSchema.partial().omit({ unit_id: true });
export const academyTrickUpdateSchema = academyTrickSchema.partial().omit({ unit_id: true });
export const academyMistakeUpdateSchema = academyMistakeSchema.partial().omit({ unit_id: true });

// ---------- Admin communication (§7): announcements, feedback, preferences ----------
export const announcementCreateSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(10000),
  type: z.enum(['announcement', 'reminder', 'alert']).default('announcement'),
  target_roles: z.array(z.enum(['student', 'admin'])).default(['student']),
  target_grades: z.array(z.number().int().min(10).max(12)).default([]),
  target_semesters: z.array(z.number().int().min(1).max(2)).default([]),
  scheduled_at: z.string().datetime().optional().nullable(),
});
export const announcementUpdateSchema = announcementCreateSchema.partial();

export const feedbackCreateSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(10000),
});
export const feedbackUpdateSchema = z.object({
  status: z.enum(['open', 'replied', 'closed']).optional(),
  admin_response: z.string().max(10000).optional(),
});

export const notificationPreferenceSchema = z.object({
  email_announcements: z.boolean().default(true),
  email_feedback_replies: z.boolean().default(true),
  in_app_announcements: z.boolean().default(true),
});
