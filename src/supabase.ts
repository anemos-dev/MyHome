import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;
let configurationError: string | null = null;
if (!supabaseUrl || !supabaseKey) {
  configurationError = 'Supabaseの接続設定がありません。';
} else {
  try { client = createClient(supabaseUrl, supabaseKey); }
  catch { configurationError = 'Supabaseの接続設定が正しくありません。'; }
}
export const supabase = client;
export const supabaseConfigurationError = configurationError;