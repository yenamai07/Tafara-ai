'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  const [loginInput, setLoginInput] = useState('')
  const [password, setPassword] = useState('')

  const [createUsername, setCreateUsername] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createApiKey, setCreateApiKey] = useState('')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')

    // Only redirect if session is verified
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email_confirmed_at) {
        await restoreSessionData(session)
        router.push('/hub')
      }
    })
  }, [router])

  const restoreSessionData = async (session: any) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('username, api_key, is_preset_account')
      .eq('id', session.user.id)
      .single()

    if (profile) {
      localStorage.setItem('tafara-username', profile.username)

      if (profile.is_preset_account) {
        const res = await fetch('/api/shared-key', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
        const { key } = await res.json()
        if (key) localStorage.setItem('tafara-apikey', key)
      } else if (profile.api_key) {
        localStorage.setItem('tafara-apikey', profile.api_key)
      }
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const handleLogin = async () => {
    if (!loginInput || !password) {
      alert('Please enter username/email and password')
      return
    }

    setLoading(true)

    try {
      const input = loginInput.trim()
      let email = ''
      let username = ''

      if (input.includes('@')) {
        email = input
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('email', email)
          .single()
        username = profile?.username || email.split('@')[0]
      } else {
        username = input
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', username)
          .single()
        email = profile?.email || `${username}@tafara.ai`
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Give a helpful message specifically for unverified emails
        if (error.message.toLowerCase().includes('email not confirmed')) {
          alert('Please check your email and click the verification link before logging in.')
        } else {
          alert('Invalid username/email or password')
        }
        setLoading(false)
        return
      }

      if (data.session) {
        // Double-check email is verified before letting them in
        if (!data.session.user.email_confirmed_at) {
          alert('Please verify your email before logging in. Check your inbox for a verification link.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        await restoreSessionData(data.session)
        router.push('/hub')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!createUsername || !createEmail || !createPassword || !createApiKey) {
      alert('Please fill in all fields')
      return
    }

    if (createPassword !== createPasswordConfirm) {
      alert('Passwords do not match')
      return
    }

    if (createPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    if (!createApiKey.startsWith('sk-or-')) {
      alert('Invalid OpenRouter API key format - must start with sk-or-')
      return
    }

    setLoading(true)

    try {
      // Check username isn't taken
      const { data: existingUsername } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', createUsername)
        .single()

      if (existingUsername) {
        alert('Username already taken')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: createEmail,
        password: createPassword,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Save profile — if this fails the user is stuck, so handle it
        const { error: profileError } = await supabase.from('user_profiles').insert([{
          id: data.user.id,
          username: createUsername,
          email: createEmail,
          api_key: createApiKey,
          is_preset_account: false
        }])

        if (profileError) {
          console.error('Profile insert error:', profileError)
          // Clean up the auth account so they can try again
          await supabase.auth.signOut()
          alert('Something went wrong saving your profile. Please try signing up again.')
          setLoading(false)
          return
        }

        alert('Account created! Please check your email and click the verification link, then come back and log in.')
        setShowCreateAccount(false)
        setCreateUsername('')
        setCreateEmail('')
        setCreatePassword('')
        setCreatePasswordConfirm('')
        setCreateApiKey('')
      }
    } catch (error) {
      console.error('Create account error:', error)
      alert('Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  const dm = darkMode

  const inputClass = `w-full px-4 py-2 rounded-lg focus:outline-none ${
    dm
      ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 focus:border-red-500'
      : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white focus:border-tafara-teal'
  }`

  if (showCreateAccount) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${dm ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
        <div className={`max-w-md w-full backdrop-blur-sm rounded-xl p-8 ${dm ? 'bg-gray-900/50 border border-red-500/30' : 'bg-tafara-blue/30 border border-tafara-teal/30'}`}>
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setShowCreateAccount(false)} className={dm ? 'text-red-500 hover:text-red-400' : 'text-tafara-cyan hover:text-tafara-teal'}>
              ← Back to Login
            </button>
            <button onClick={toggleDarkMode} className="text-2xl">{dm ? '🌙' : '☀️'}</button>
          </div>

          <h1 className={`text-3xl font-bold mb-6 ${dm ? 'text-red-500' : 'text-tafara-cyan'}`}>Create Account</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)} className={inputClass} placeholder="Choose a username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
              <p className="text-xs text-gray-400 mt-1">Used for login and account recovery</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input type="password" value={createPasswordConfirm} onChange={(e) => setCreatePasswordConfirm(e.target.value)} className={inputClass} placeholder="Confirm your password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
              <input type="password" value={createApiKey} onChange={(e) => setCreateApiKey(e.target.value)} className={inputClass} placeholder="sk-or-..." />
              <div className={`rounded-lg p-3 mt-2 ${dm ? 'bg-red-500/10 border border-red-500/30' : 'bg-tafara-teal/10 border border-tafara-teal/30'}`}>
                <p className={`text-sm font-medium mb-1 ${dm ? 'text-red-400' : 'text-tafara-cyan'}`}>Don't have an API key?</p>
                <ol className="text-sm text-gray-300 space-y-1 ml-4 list-decimal">
                  <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className={dm ? 'text-red-400 underline' : 'text-tafara-cyan underline'}>OpenRouter.ai</a></li>
                  <li>Sign up for free</li>
                  <li>Go to "Keys" and create one</li>
                  <li>Copy and paste it here</li>
                </ol>
              </div>
            </div>

            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50' : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'}`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${dm ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      <div className={`max-w-md w-full backdrop-blur-sm rounded-xl p-8 ${dm ? 'bg-gray-900/50 border border-red-500/30' : 'bg-tafara-blue/30 border border-tafara-teal/30'}`}>
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className={dm ? 'text-red-500 hover:text-red-400' : 'text-tafara-cyan hover:text-tafara-teal'}>
            ← Back to Home
          </Link>
          <button onClick={toggleDarkMode} className="text-2xl">{dm ? '🌙' : '☀️'}</button>
        </div>

        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${dm ? 'text-red-500' : 'text-tafara-cyan'}`}>Welcome to Tafara.ai</h1>
          <p className="text-gray-400 mt-2">Login to access your AI assistants</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username or Email</label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none ${dm ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 placeholder-red-500/50 focus:border-red-500' : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white placeholder-gray-400 focus:border-tafara-teal'}`}
              placeholder="Enter username or email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none ${dm ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 placeholder-red-500/50 focus:border-red-500' : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white placeholder-gray-400 focus:border-tafara-teal'}`}
              placeholder="Enter your password"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50' : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${dm ? 'border-red-500/30' : 'border-tafara-teal/30'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${dm ? 'bg-gray-900/50 text-gray-400' : 'bg-tafara-blue/30 text-gray-400'}`}>or</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateAccount(true)}
            className={`w-full py-3 rounded-lg font-semibold border-2 transition-all ${dm ? 'border-red-500 text-red-400 hover:bg-red-500/10' : 'border-tafara-teal text-tafara-cyan hover:bg-tafara-teal/10'}`}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
