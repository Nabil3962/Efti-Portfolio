import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const configured = Boolean(supabaseUrl && supabaseKey)

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'missing')
