// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  throw new Error(
    'Faltan variables .env: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY'
  )
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,       // recuerda sesión en localStorage
    autoRefreshToken: true,     // refresca tokens automáticamente
    detectSessionInUrl: true,   // maneja callbacks OAuth si los usas
  },
})

