import { createClient } from '@supabase/supabase-js'
import invariant from 'tiny-invariant'

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

invariant(
  supabaseUrl,
  'SUPABASE_URL must be set in your environment variables.'
)

invariant(
  supabaseAnonKey,
  'SUPABASE_ANON_KEY must be set in your environment variables.'
)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createUser(email, password, name) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  }, { data: { name } })
  if (error) {
    throw new Response(error.message)
  }
  // get the user profile after created
  const profile = await getProfileByEmail(user?.email)
  return profile
}

export async function getProfileById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, id, name')
    .eq('id', id)
    .single()

  if (error) return null
  if (data) return { id: data.id, email: data.email }
}

export async function getProfileByEmail(email) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, id, name')
    .eq('email', email)
    .single()

  if (error) return null
  if (data) return data
}

export async function verifyLogin(email, password) {
  const { user, error } = await supabase.auth.signIn({
    email,
    password,
  })

  console.log('user user.server.js:60', user)
  console.log('verifyLogin error', error)
  if (error) return undefined
  const profile = await getProfileByEmail(user?.email)
  return profile
}
