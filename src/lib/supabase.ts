import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with actual environment variables via $env/static/public in SvelteKit
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
