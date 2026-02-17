import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gqbhchnwctsakqerkjrk.supabase.co'
const supabaseKey = 'sb_publishable_WY58EMT0e7b0shTX5EpbUw_6TLya-3o'

export const supabase = createClient(supabaseUrl, supabaseKey)
