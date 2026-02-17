import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { messages, config, sessionToken } = await request.json()

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's API key from the database
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('api_key, is_preset_account')
      .eq('id', user.id)
      .single()

    // Use shared key for preset accounts, their own key for others
    const apiKey = profile?.is_preset_account
      ? process.env.SHARED_API_KEY
      : profile?.api_key

    console.log('API key info:', {
      isPresetAccount: profile?.is_preset_account,
      hasSharedKey: !!process.env.SHARED_API_KEY,
      hasUserKey: !!profile?.api_key,
      keyPrefix: apiKey?.substring(0, 10)
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 400 })
    }

    // Make the OpenRouter request server-side
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://tafara-ai.vercel.app',
        'X-Title': 'Tafara.ai'
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: `You are ${config.name}. Your personality is ${config.personality}. ${config.instructions}`
          },
          ...messages
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenRouter error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      return NextResponse.json({ 
        error: errorData.error?.message || `OpenRouter error: ${response.status} ${response.statusText}` 
      }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ content: data.choices[0].message.content })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
