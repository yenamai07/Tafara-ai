'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface AIConfig {
  name: string
  personality: string
  instructions: string
  model: string
  avatar: string
  background: string
  id: string
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const aiId = searchParams.get('ai')

  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    // Load dark mode
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    }

    // Check authentication
    const savedUsername = localStorage.getItem('tafara-username')
    const savedApiKey = localStorage.getItem('tafara-apikey')
    
    if (!savedApiKey || !savedUsername) {
      router.push('/builder')
      return
    }

    setCurrentUser(savedUsername)
    setApiKey(savedApiKey)

    // Load AI config
    if (aiId) {
      loadAI(aiId, savedUsername)
    } else {
      router.push('/hub')
    }
  }, [aiId, router])

  const loadAI = async (id: string, username: string) => {
    // Check if it's a user's AI (format: username-index)
    if (id.startsWith(username)) {
      const index = parseInt(id.split('-')[1])
      const userConfigs = localStorage.getItem(`tafara-configs-${username}`)
      if (userConfigs) {
        const configs = JSON.parse(userConfigs)
        if (configs[index]) {
          setConfig({
            ...configs[index],
            id: id
          })
          return
        }
      }
    }

    // Otherwise, load from community (Supabase)
    try {
      const { data, error } = await supabase
        .from('public_ais')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error loading AI:', error)
        router.push('/hub')
        return
      }

      setConfig({
        id: data.id,
        name: data.name,
        personality: data.personality,
        instructions: data.instructions,
        model: data.model,
        avatar: data.avatar,
        background: data.background || ''
      })
    } catch (error) {
      console.error('Error:', error)
      router.push('/hub')
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !config) return

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
            ...messages,
            userMessage
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error?.message || 'API request failed')
      }

      const data = await response.json()
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format')
      }

      const aiMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, there was an error: ${errorMessage}. Please check your API key and try again.` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-xl ${darkMode ? 'text-red-400' : 'text-tafara-cyan'}`}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-20' : 'w-0'} transition-all duration-300 flex flex-col items-center py-6 gap-6 border-r ${
        darkMode ? 'bg-gray-900/50 border-red-500/30' : 'bg-tafara-blue/30 border-tafara-teal/30'
      }`}>
        {showSidebar && (
          <>
            <Link 
              href="/hub"
              className={`p-3 rounded-lg transition-all hover:scale-110 ${
                darkMode 
                  ? 'bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-tafara-teal/20 border-2 border-tafara-teal/50 hover:bg-tafara-teal/30'
              }`}
              title="Hub"
            >
              <span className="text-2xl">🏠</span>
            </Link>

            <Link 
              href="/builder"
              className={`p-3 rounded-lg transition-all hover:scale-110 ${
                darkMode 
                  ? 'bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-tafara-teal/20 border-2 border-tafara-teal/50 hover:bg-tafara-teal/30'
              }`}
              title="Builder"
            >
              <span className="text-2xl">🔧</span>
            </Link>

            <button
              onClick={() => {
                const newMode = !darkMode
                setDarkMode(newMode)
                localStorage.setItem('tafara-darkmode-global', String(newMode))
              }}
              className={`p-3 rounded-lg transition-all hover:scale-110 ${
                darkMode 
                  ? 'bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-tafara-teal/20 border-2 border-tafara-teal/50 hover:bg-tafara-teal/30'
              }`}
              title="Toggle Dark Mode"
            >
              <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
            </button>

            <div className="flex-1"></div>

            <button
              onClick={() => {
                localStorage.removeItem('tafara-apikey')
                localStorage.removeItem('tafara-username')
                router.push('/builder')
              }}
              className="p-3 rounded-lg transition-all hover:scale-110 bg-red-900/30 border-2 border-red-700/50 hover:bg-red-900/50"
              title="Logout"
            >
              <span className="text-2xl">🚪</span>
            </button>
          </>
        )}
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg ${
          darkMode 
            ? 'bg-red-500/30 border border-red-500 text-red-400' 
            : 'bg-tafara-teal/30 border border-tafara-teal text-tafara-cyan'
        }`}
      >
        {showSidebar ? '◀' : '▶'}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 ml-12">
          <div>
            {config.avatar.startsWith('data:') || config.avatar.startsWith('http') ? (
              <img src={config.avatar} alt={config.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                darkMode ? 'bg-red-500/20' : 'bg-tafara-teal/20'
              }`}>
                {config.avatar}
              </div>
            )}
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-red-500' : 'text-tafara-cyan'}`}>
              {config.name}
            </h1>
            <p className={`text-sm ${darkMode ? 'text-red-300/70' : 'text-gray-400'}`}>
              {config.personality}
            </p>
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          className={`flex-1 rounded-xl p-6 mb-4 overflow-y-auto bg-cover bg-center ${
            darkMode 
              ? 'bg-gray-900/50 border-2 border-red-500/30' 
              : 'bg-tafara-blue/30 border-2 border-tafara-teal/30'
          }`}
          style={{
            backgroundImage: config.background 
              ? darkMode 
                ? `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url(${config.background})`
                : `linear-gradient(rgba(15, 31, 58, 0.85), rgba(15, 31, 58, 0.85)), url(${config.background})`
              : 'none'
          }}
        >
          {messages.length === 0 ? (
            <div className={`text-center mt-20 ${darkMode ? 'text-red-400' : 'text-gray-400'}`}>
              <div className="text-6xl mb-4">
                {config.avatar.startsWith('data:') || config.avatar.startsWith('http') ? (
                  <img src={config.avatar} alt="AI Avatar" className="w-20 h-20 rounded-full mx-auto object-cover" />
                ) : (
                  <span>{config.avatar}</span>
                )}
              </div>
              <p className="text-xl mb-2">Start chatting with {config.name}!</p>
              <p className="text-sm">Your AI is ready to help.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      {config.avatar.startsWith('data:') || config.avatar.startsWith('http') ? (
                        <img src={config.avatar} alt="AI" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          darkMode ? 'bg-red-500/20' : 'bg-tafara-teal/20'
                        }`}>
                          {config.avatar}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-lg ${
                    msg.role === 'user' 
                      ? darkMode 
                        ? 'bg-red-500/30 border border-red-500 text-red-100'
                        : 'bg-tafara-teal text-tafara-dark'
                      : darkMode
                        ? 'bg-black/70 border border-red-500/30 text-red-400'
                        : 'bg-tafara-dark/70 border border-tafara-teal/30 text-white'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    {config.avatar.startsWith('data:') || config.avatar.startsWith('http') ? (
                      <img src={config.avatar} alt="AI" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        darkMode ? 'bg-red-500/20' : 'bg-tafara-teal/20'
                      }`}>
                        {config.avatar}
                      </div>
                    )}
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${
                    darkMode 
                      ? 'bg-black/70 border border-red-500/30 text-red-400'
                      : 'bg-tafara-dark/70 border border-tafara-teal/30 text-white'
                  }`}>
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            className={`flex-1 px-4 py-3 rounded-lg focus:outline-none ${
              darkMode
                ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 placeholder-red-500/50 focus:border-red-500'
                : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white placeholder-gray-400 focus:border-tafara-teal'
            }`}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
              darkMode
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50'
                : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
