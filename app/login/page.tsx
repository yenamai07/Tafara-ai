'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserAccount {
  username: string
  password: string
  apiKey: string
}

// Preset accounts (you and TheBree) - they use the shared key
const PRESET_ACCOUNTS = [
  { username: 'yenamai07', password: 'pass6591' },
  { username: 'TheBree', password: 'pass6591' }
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createApiKey, setCreateApiKey] = useState('')

  useEffect(() => {
    // Load dark mode
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    }

    // Check if already logged in
    const savedUsername = localStorage.getItem('tafara-username')
    const savedApiKey = localStorage.getItem('tafara-apikey')
    
    if (savedApiKey && savedUsername) {
      // Already logged in, go to hub
      router.push('/hub')
    }
  }, [router])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const handleLogin = () => {
    if (!username || !password) {
      alert('Please enter username and password')
      return
    }

    // Check if it's a preset account (you or TheBree)
    const isPresetAccount = PRESET_ACCOUNTS.some(
      acc => acc.username === username && acc.password === password
    )
    
    if (isPresetAccount) {
      // Use shared API key
      localStorage.setItem('tafara-apikey', SHARED_API_KEY)
      localStorage.setItem('tafara-username', username)
      
      // Redirect to hub
      router.push('/hub')
      return
    }

    // Check user-created accounts
    const storedAccounts = localStorage.getItem('tafara-accounts')
    if (storedAccounts) {
      const accounts: UserAccount[] = JSON.parse(storedAccounts)
      const userAccount = accounts.find(
        acc => acc.username === username && acc.password === password
      )
      
      if (userAccount) {
        // Use their own API key
        localStorage.setItem('tafara-apikey', userAccount.apiKey)
        localStorage.setItem('tafara-username', username)
        
        // Redirect to hub
        router.push('/hub')
        return
      }
    }

    alert('Invalid username or password')
  }

  const handleCreateAccount = () => {
    if (!createUsername || !createPassword || !createApiKey) {
      alert('Please fill in all fields')
      return
    }

    if (createPassword !== createPasswordConfirm) {
      alert('Passwords do not match')
      return
    }

    if (!createApiKey.startsWith('sk-or-')) {
      alert('Invalid OpenRouter API key format')
      return
    }

    // Check if username already exists
    const presetExists = PRESET_ACCOUNTS.some(acc => acc.username === createUsername)
    if (presetExists) {
      alert('Username already taken')
      return
    }

    const storedAccounts = localStorage.getItem('tafara-accounts')
    const accounts: UserAccount[] = storedAccounts ? JSON.parse(storedAccounts) : []
    
    const userExists = accounts.some(acc => acc.username === createUsername)
    if (userExists) {
      alert('Username already taken')
      return
    }

    // Create new account
    accounts.push({ 
      username: createUsername, 
      password: createPassword,
      apiKey: createApiKey
    })
    localStorage.setItem('tafara-accounts', JSON.stringify(accounts))

    alert('Account created successfully! You can now log in.')
    setShowCreateAccount(false)
    setCreateUsername('')
    setCreatePassword('')
    setCreatePasswordConfirm('')
    setCreateApiKey('')
  }

  if (showCreateAccount) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
        <div className={`max-w-md w-full backdrop-blur-sm rounded-xl p-8 ${
          darkMode 
            ? 'bg-gray-900/50 border border-red-500/30' 
            : 'bg-tafara-blue/30 border border-tafara-teal/30'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setShowCreateAccount(false)}
              className={darkMode ? "text-red-500 hover:text-red-400" : "text-tafara-cyan hover:text-tafara-teal"}
            >
              ← Back to Login
            </button>
            <button
              onClick={toggleDarkMode}
              className="text-2xl"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
          
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-red-500' : 'text-tafara-cyan'}`}>Create Account</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="Choose a password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={createPasswordConfirm}
                onChange={(e) => setCreatePasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="Confirm your password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your OpenRouter API Key
              </label>
              <input
                type="password"
                value={createApiKey}
                onChange={(e) => setCreateApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                placeholder="sk-or-..."
              />
              <div className="bg-tafara-teal/10 border border-tafara-teal/30 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-300 mb-2">
                  <strong className="text-tafara-cyan">Don't have an API key?</strong>
                </p>
                <ol className="text-sm text-gray-300 space-y-1 ml-4 list-decimal">
                  <li>Go to{' '}
                    <a 
                      href="https://openrouter.ai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-tafara-cyan hover:text-tafara-teal underline"
                    >
                      OpenRouter.ai
                    </a>
                  </li>
                  <li>Sign up for free</li>
                  <li>Go to "Keys" section</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it here</li>
                </ol>
              </div>
            </div>
            <button
              onClick={handleCreateAccount}
              className="w-full py-3 px-4 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      <div className={`max-w-md w-full backdrop-blur-sm rounded-xl p-8 ${
        darkMode 
          ? 'bg-gray-900/50 border border-red-500/30' 
          : 'bg-tafara-blue/30 border border-tafara-teal/30'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className={darkMode ? "text-red-500 hover:text-red-400" : "text-tafara-cyan hover:text-tafara-teal"}>
            ← Back to Home
          </Link>
          <button
            onClick={toggleDarkMode}
            className="text-2xl"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
        
        <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-red-500' : 'text-tafara-cyan'}`}>Login</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
              placeholder="Enter password"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50 transition-all"
          >
            Login
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tafara-teal/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-tafara-blue/30 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateAccount(true)}
            className="w-full py-3 px-4 border-2 border-tafara-teal rounded-lg font-semibold text-tafara-teal hover:bg-tafara-teal/10 transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
