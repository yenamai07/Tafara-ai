'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AIConfig {
  name: string
  personality: string
  instructions: string
  model: string
}

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

// Your shared API key (for you and TheBree only)
const SHARED_API_KEY = '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'

export default function Builder() {
  const [apiKey, setApiKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [createUsername, setCreateUsername] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [createApiKey, setCreateApiKey] = useState('')
  
  const [config, setConfig] = useState<AIConfig>({
    name: 'My AI Assistant',
    personality: 'helpful and friendly',
    instructions: 'You are a helpful AI assistant.',
    model: 'meta-llama/llama-3.2-3b-instruct:free'
  })

  const [savedConfigs, setSavedConfigs] = useState<AIConfig[]>([])
  const [showChat, setShowChat] = useState(false)

  // Load saved configurations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tafara-configs')
    if (saved) {
      setSavedConfigs(JSON.parse(saved))
    }
    const savedApiKey = localStorage.getItem('tafara-apikey')
    if (savedApiKey) {
      setApiKey(savedApiKey)
      setIsAuthenticated(true)
    }
  }, [])

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
      setApiKey(SHARED_API_KEY)
      setIsAuthenticated(true)
      localStorage.setItem('tafara-apikey', SHARED_API_KEY)
      localStorage.setItem('tafara-username', username)
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
        setApiKey(userAccount.apiKey)
        setIsAuthenticated(true)
        localStorage.setItem('tafara-apikey', userAccount.apiKey)
        localStorage.setItem('tafara-username', username)
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

  const saveConfig = () => {
    const newConfigs = [...savedConfigs, config]
    setSavedConfigs(newConfigs)
    localStorage.setItem('tafara-configs', JSON.stringify(newConfigs))
    alert('Configuration saved!')
  }

  const loadConfig = (cfg: AIConfig) => {
    setConfig(cfg)
  }

  const deleteConfig = (index: number) => {
    const newConfigs = savedConfigs.filter((_, i) => i !== index)
    setSavedConfigs(newConfigs)
    localStorage.setItem('tafara-configs', JSON.stringify(newConfigs))
  }

  if (!isAuthenticated) {
    if (showCreateAccount) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8">
            <button 
              onClick={() => setShowCreateAccount(false)}
              className="text-tafara-cyan hover:text-tafara-teal mb-6 inline-block"
            >
              ← Back to Login
            </button>
            
            <h1 className="text-3xl font-bold text-tafara-cyan mb-6">Create Account</h1>
            
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8">
          <Link href="/" className="text-tafara-cyan hover:text-tafara-teal mb-6 inline-block">
            ← Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-tafara-cyan mb-6">Login</h1>
          
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

  if (showChat) {
    return <ChatInterface config={config} apiKey={apiKey} onBack={() => setShowChat(false)} />
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-tafara-cyan hover:text-tafara-teal">
            ← Back to Home
          </Link>
          <button
            onClick={() => {
              setIsAuthenticated(false)
              setApiKey('')
              localStorage.removeItem('tafara-apikey')
            }}
            className="text-gray-400 hover:text-red-400"
          >
            Logout
          </button>
        </div>

        <h1 className="text-4xl font-bold text-tafara-cyan mb-8">Build Your AI</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Name
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                  placeholder="e.g., My Study Buddy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Personality
                </label>
                <input
                  type="text"
                  value={config.personality}
                  onChange={(e) => setConfig({...config, personality: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                  placeholder="e.g., friendly and encouraging"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructions (What should your AI do?)
                </label>
                <textarea
                  value={config.instructions}
                  onChange={(e) => setConfig({...config, instructions: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none h-32"
                  placeholder="e.g., Help me study for exams by quizzing me and explaining concepts"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model (Free Models Only)
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({...config, model: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                >
                  <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (Fast & Free)</option>
                  <option value="meta-llama/llama-3.2-1b-instruct:free">Llama 3.2 1B (Very Fast)</option>
                  <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Experimental)</option>
                  <option value="google/gemini-flash-1.5:free">Gemini Flash 1.5 (Reliable)</option>
                  <option value="nousresearch/hermes-3-llama-3.1-405b:free">Hermes 3 405B (Powerful)</option>
                  <option value="microsoft/phi-3-medium-128k-instruct:free">Phi-3 Medium (Smart)</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  ✨ All models are completely free on OpenRouter!
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={saveConfig}
                  className="flex-1 py-3 px-4 bg-tafara-teal/20 border border-tafara-teal/50 rounded-lg text-white hover:bg-tafara-teal/30 transition-all"
                >
                  Save Configuration
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50 transition-all"
                >
                  Test Your AI
                </button>
              </div>
            </div>
          </div>

          {/* Saved Configurations */}
          <div className="bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Saved AIs</h2>
            
            {savedConfigs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No saved configurations yet. Create and save your first AI!
              </p>
            ) : (
              <div className="space-y-4">
                {savedConfigs.map((cfg, index) => (
                  <div 
                    key={index}
                    className="bg-tafara-dark/50 border border-tafara-teal/20 rounded-lg p-4 hover:border-tafara-teal/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-tafara-cyan">{cfg.name}</h3>
                      <button
                        onClick={() => deleteConfig(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{cfg.personality}</p>
                    <button
                      onClick={() => loadConfig(cfg)}
                      className="w-full py-2 px-4 bg-tafara-teal/20 border border-tafara-teal/50 rounded-lg text-white text-sm hover:bg-tafara-teal/30 transition-all"
                    >
                      Load Configuration
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatInterface({ config, apiKey, onBack }: { config: AIConfig, apiKey: string, onBack: () => void }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { 
              role: 'system', 
              content: `You are ${config.name}. Your personality is ${config.personality}. ${config.instructions}` 
            },
            ...messages,
            userMessage
          ]
        })
      })

      const data = await response.json()
      const aiMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className="text-tafara-cyan hover:text-tafara-teal">
            ← Back to Builder
          </button>
          <h1 className="text-2xl font-bold text-tafara-cyan">{config.name}</h1>
        </div>

        <div className="bg-tafara-blue/30 backdrop-blur-sm border border-tafara-teal/30 rounded-xl p-6 mb-4" style={{height: '60vh', overflowY: 'auto'}}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-xl mb-2">Start chatting with {config.name}!</p>
              <p className="text-sm">Your AI is ready to help.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-tafara-teal text-tafara-dark' 
                      : 'bg-tafara-dark/50 border border-tafara-teal/30 text-white'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-tafara-dark/50 border border-tafara-teal/30 px-4 py-3 rounded-lg text-white">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-3 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-tafara-teal to-tafara-cyan rounded-lg font-semibold text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50 transition-all disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
