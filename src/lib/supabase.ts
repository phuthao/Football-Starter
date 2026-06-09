import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL      as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export async function signIn(email: string, password: string): Promise<{ ok: boolean; email?: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) return { ok: false }
  return { ok: true, email: data.session.user.email }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
