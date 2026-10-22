// Server-only secrets. Never import this from a 'use client' file.
// The `typeof window` guard makes a wrong import fail loudly in development.
if (typeof window !== 'undefined') {
  throw new Error('src/server/env.ts must not be imported in the browser');
}

export function serverEnv() {
  return {
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    gcpProject: process.env.GOOGLE_CLOUD_PROJECT ?? '',
    gcpLocation: process.env.GOOGLE_CLOUD_LOCATION ?? 'us-central1',
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    promptVersion: process.env.TUTOR_PROMPT_VERSION ?? 'v1',
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  };
}

/** Gemini is configured either with an AI Studio key or a Vertex AI project. */
export function hasGemini(): boolean {
  const e = serverEnv();
  return Boolean(e.geminiApiKey || e.gcpProject);
}
