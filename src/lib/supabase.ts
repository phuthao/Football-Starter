import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL      as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

export async function signIn(email: string, password: string): Promise<{ ok: boolean; email?: string; wrongCredentials?: boolean }> {
  const attempt = async () => supabase.auth.signInWithPassword({ email, password })
  let { data, error } = await attempt()
  // Retry once on network/server error (not credential errors)
  if (error && error.status !== 400) {
    await new Promise(r => setTimeout(r, 1500))
    ;({ data, error } = await attempt())
  }
  if (error) return { ok: false, wrongCredentials: error.status === 400 }
  return { ok: true, email: data.user?.email }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
