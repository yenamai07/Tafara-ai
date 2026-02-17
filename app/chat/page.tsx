'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface AIConfig {
  name: string
  personality: string
  instructions: string
  model: string
  avatar: string
  background: string
  id: string
}

function MessageContent({ content, darkMode }: { content: string, darkMode: boolean }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <div className="my-2 rounded-lg overflow-hidden text-sm">
              <div className={`flex items-center justify-between px-4 py-1 text-xs ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-700 text-gray-300'}`}>
                <span>{match[1]}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(String(children))}
                  className="hover:text-white transition-colors"
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code
              className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                darkMode ? 'bg-gray-800 text-red-300' : 'bg-gray-700 text-teal-300'
              }`}
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2 mt-3">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>
        },
        strong({ children }) {
          return <strong className="font-bold">{children}</strong>
        },
        blockquote({ children }) {
          return (
            <blockquote className={`border-l-4 pl-3 my-2 italic ${darkMode ? 'border-red-500 text-red-300' : 'border-teal-500 text-gray-300'}`}>
              {children}
            </blockquote>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
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
  const [config, setConfig] = useState<AIConfig | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    }

    const savedUsername = localStorage.getItem('tafara-username')

    if (!savedUsername) {
      router.push('/builder')
      return
    }

    setCurrentUser(savedUsername)

    if (aiId) {
      loadAI(aiId, savedUsername)
    } else {
      router.push('/hub')
    }
  }, [aiId, router])

  const loadAI = async (id: string, username: string) => {
    if (id.startsWith(username)) {
      const index = parseInt(id.split('-')[1])
      const userConfigs = localStorage.getItem(`tafara-configs-${username}`)
      if (userConfigs) {
        const configs = JSON.parse(userConfigs)
        if (configs[index]) {
          setConfig({ ...configs[index], id })
          return
        }
      }
    }

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
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          config,
          sessionToken: session.access_token
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])

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
      <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
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
          className={`flex-1 rounded-xl p-4 md:p-6 mb-4 overflow-y-auto bg-cover bg-center ${
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
                  <div className={`w-full max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-lg overflow-hidden ${
                    msg.role === 'user'
                      ? darkMode
                        ? 'bg-red-500/30 border border-red-500 text-red-100'
                        : 'bg-tafara-teal text-tafara-dark'
                      : darkMode
                        ? 'bg-black/70 border border-red-500/30 text-red-400'
                        : 'bg-tafara-dark/70 border border-tafara-teal/30 text-white'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none overflow-x-auto">
                        <MessageContent content={msg.content} darkMode={darkMode} />
                      </div>
                    ) : (
                      msg.content
                    )}
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
