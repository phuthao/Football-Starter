import { createClient } from '@supabase/supabase-js'

const url      = import.meta.env.VITE_SUPABASE_URL      as string
const key      = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const email    = import.meta.env.VITE_ADMIN_EMAIL       as string
const password = import.meta.env.VITE_ADMIN_PASSWORD    as string

export const supabase = createClient(url, key)

export async function signIn(): Promise<boolean> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return !error
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
