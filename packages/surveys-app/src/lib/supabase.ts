import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client — dibuat LAZY supaya tidak melempar error saat module di-load
 * pada BUILD TIME (ketika env vars belum tersedia). Saat ini modul ini belum
 * dipakai oleh fitur apa pun (login & kuesioner memakai PostgreSQL + JWT).
 */

const globalForSupabase = globalThis as unknown as {
  supabase: SupabaseClient | undefined
}

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase belum dikonfigurasi. Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export function getSupabase(): SupabaseClient {
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createSupabaseClient()
  }
  return globalForSupabase.supabase
}
