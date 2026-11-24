import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend dir, then root dir
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl:
    process.env.DATABASE_URL ??
    `postgres://${process.env.PGUSER ?? 'aicommerce'}:${process.env.PGPASSWORD ?? 'aicommerce_dev'}@${process.env.PGHOST ?? 'localhost'}:${process.env.PGPORT ?? '5432'}/${process.env.PGDATABASE ?? 'stem_journal'}`,
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me-min-32-chars-please',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  openaiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'muse-spark-1.3-contributor-free',
  // OpenAI-compatible gateway base URL (no trailing slash).
  // Default is OpenCode Zen free models; set to https://api.openai.com/v1 to use paid OpenAI.
  openaiBaseUrl: (process.env.OPENAI_BASE_URL ?? 'https://opencode.ai/zen/v1').replace(/\/$/, ''),
  // Comma-separated fallback models tried in order before the local rubric engine.
  aiFallbackModels: (process.env.AI_FALLBACK_MODELS ?? 'deepseek-v4-flash-free,mimo-v2.5-free')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? '',
  aimlKey: process.env.AIML_API_KEY ?? '',
  aimlBaseUrl: (process.env.AIML_BASE_URL ?? 'https://api.aimlapi.com/v1').replace(/\/$/, ''),
  aimlModel: process.env.AIML_MODEL ?? 'deepseek/deepseek-chat',
  mistralKey: process.env.MISTRAL_API_KEY ?? '',
  mistralBaseUrl: (process.env.MISTRAL_BASE_URL ?? 'https://api.mistral.ai/v1').replace(/\/$/, ''),
  mistralModel: process.env.MISTRAL_MODEL ?? 'mistral-small-latest',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@stemjournal.local',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'Admin123!',
};
