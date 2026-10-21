export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("xxxxxxxx") && SUPABASE_KEY.length > 20;

export const DESMOS_API_KEY =
  process.env.NEXT_PUBLIC_DESMOS_API_KEY || "dcb31709b452b1cf9dc26972add0fda6"; // Desmos-ийн албан ёсны demo key (зөвхөн туршилтад)
