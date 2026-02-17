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

  // Login fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Create account fields
  const [createUsername, setCreateUsername] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createApiKey, setCreateApiKey] = useState('')

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/hub')
    })
  }, [router])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Please enter username and password')
      return
    }
    setLoading(true)
    try {
      // Look up profile by username
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username, is_preset_account')
        .eq('username', username)
        .single()

      if (profileError || !profile) {
        alert('Username not found')
        setLoading(false)
        return
      }

      // Build email from username
      const email = `${username}@tafara.ai`

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        alert('Invalid username or password')
        setLoading(false)
        return
      }

      if (data.session) {
        localStorage.setItem('tafara-username', username)

        if (profile.is_preset_account) {
          // Fetch shared key from API route (keeps it server-side)
          const res = await fetch('/api/shared-key')
          const { key } = await res.json()
          localStorage.setItem('tafara-apikey', key)
        } else {
          const { data: fullProfile } = await supabase
            .from('user_profiles')
            .select('api_key')
            .eq('id', data.session.user.id)
            .single()
          if (fullProfile?.api_key) {
            localStorage.setItem('tafara-apikey', fullProfile.api_key)
          }
        }
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
      alert('Invalid OpenRouter API key - must start with sk-or-')
      return
    }
    setLoading(true)
    try {
      // Check username not taken
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', createUsername)
        .single()

      if (existing) {
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
        await supabase.from('user_profiles').insert([{
          id: data.user.id,
          username: createUsername,
          api_key: createApiKey,
          is_preset_account: false
        }])

        alert('Account created! Check your email to verify, then log in.')
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
              <input type="text" value={createUsername} onChange={(e) => setCreateUsername(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="Choose a username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input type="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="your@email.com" />
              <p className="text-xs text-gray-400 mt-1">Used for account recovery and verification</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input type="password" value={createPasswordConfirm} onChange={(e) => setCreatePasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="Confirm your password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OpenRouter API Key</label>
              <input type="password" value={createApiKey} onChange={(e) => setCreateApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="sk-or-..." />
              <div className="bg-tafara-teal/10 border border-tafara-teal/30 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-tafara-cyan mb-1">Don't have an API key?</p>
                <ol className="text-sm text-gray-300 space-y-1 ml-4 list-decimal">
                  <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-tafara-cyan underline">OpenRouter.ai</a></li>
                  <li>Sign up for free</li>
                  <li>Go to "Keys" and create one</li>
                  <li>Copy and paste it here</li>
                </ol>
              </div>
            </div>
            <button onClick={handleCreateAccount} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-tafara-dark hover:shadow-xl transition-all disabled:opacity-50">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none ${dm ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 focus:border-red-500' : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white focus:border-tafara-teal'}`}
              placeholder="Enter your username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3 rounded-lg focus:outline-none ${dm ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 focus:border-red-500' : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white focus:border-tafara-teal'}`}
              placeholder="Enter your password" />
          </div>
          <button onClick={handleLogin} disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50' : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'}`}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${dm ? 'border-red-500/30' : 'border-tafara-teal/30'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 ${dm ? 'bg-gray-900 text-gray-400' : 'bg-tafara-blue/30 text-gray-400'}`}>or</span>
            </div>
          </div>
          <button onClick={() => setShowCreateAccount(true)}
            className={`w-full py-3 rounded-lg font-semibold border-2 transition-all ${dm ? 'border-red-500 text-red-400 hover:bg-red-500/10' : 'border-tafara-teal text-tafara-cyan hover:bg-tafara-teal/10'}`}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
