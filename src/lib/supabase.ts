import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Project credentials provided by the user
export const SUPABASE_PROJECT_ID = 'qixxlesbgddtbetfnkzx';
export const SUPABASE_PROJECT_NAME = "mafuyuel012-max's Project";

const rawUrl =
  ((import.meta as any).env?.VITE_SUPABASE_URL as string) ||
  'https://qixxlesbgddtbetfnkzx.supabase.co';

const rawKey =
  ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpeHhsZXNiZ2RkdGJldGZua3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NzcyNDMsImV4cCI6MjEwNDU1MzI0M30.evb4prdNL6XyF1EhAVwrDgv7aHR7sDUl4FGwj2mgGpk';

// Clean trailing /rest/v1 or slashes
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = rawKey.trim();

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
