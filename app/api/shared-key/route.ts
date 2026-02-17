import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  // Verify the user is authenticated and is a preset account
  const authHeader = request.headers.get('authorization')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get the session token from the auth header
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if this is a preset account
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_preset_account')
    .eq('id', user.id)
    .single()

  if (!profile?.is_preset_account) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return the shared key from environment variables (never exposed in code)
  return NextResponse.json({ key: process.env.SHARED_API_KEY })
}
