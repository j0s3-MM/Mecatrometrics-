import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bjdtnjrnznubnwwozohi.supabase.co'
const SUPABASE_KEY = 'sb_publishable_H9NZ-vnCC7WkHlSYZ72Ypw_eR3Ue3YR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)