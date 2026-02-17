'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AIConfig {
  name: string
  personality: string
  instructions: string
  model: string
  avatar: string
  background: string
}

export default function Builder() {
  const router = useRouter()
  const [config, setConfig] = useState<AIConfig>({
    name: 'My AI Assistant',
    personality: 'helpful and friendly',
    instructions: 'You are a helpful AI assistant.',
    model: 'openrouter/aurora-alpha',
    avatar: '🤖',
    background: ''
  })
  const [savedConfigs, setSavedConfigs] = useState<AIConfig[]>([])
  const [showChat, setShowChat] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')

    // Check authentication via Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      const username = localStorage.getItem('tafara-username') || ''
      setCurrentUser(username)
      const userConfigs = localStorage.getItem(`tafara-configs-${username}`)
      if (userConfigs) setSavedConfigs(JSON.parse(userConfigs))
    })
  }, [router])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const saveConfig = () => {
    const newConfigs = [...savedConfigs, config]
    setSavedConfigs(newConfigs)
    localStorage.setItem(`tafara-configs-${currentUser}`, JSON.stringify(newConfigs))
    alert('Configuration saved!')
  }

  const deleteConfig = (index: number) => {
    const newConfigs = savedConfigs.filter((_, i) => i !== index)
    setSavedConfigs(newConfigs)
    localStorage.setItem(`tafara-configs-${currentUser}`, JSON.stringify(newConfigs))
  }

  const dm = darkMode

  if (showChat) {
    return <ChatInterface config={config} onBack={() => setShowChat(false)} darkMode={dm} />
  }

  return (
    <div className={`min-h-screen p-6 ${dm ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link href="/hub" className={dm ? 'text-red-500 hover:text-red-400' : 'text-tafara-cyan hover:text-tafara-teal'}>
            ← Back to Hub
          </Link>
          <div className="flex gap-4 items-center">
            <button onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${dm ? 'border-red-500 bg-red-500/20 text-red-400' : 'border-tafara-teal bg-tafara-teal/20 text-tafara-cyan'}`}>
              {dm ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button onClick={async () => {
              await supabase.auth.signOut()
              localStorage.removeItem('tafara-username')
              localStorage.removeItem('tafara-apikey')
              router.push('/login')
            }} className="text-gray-400 hover:text-red-400">
              Logout
            </button>
          </div>
        </div>

        <h1 className={`text-4xl font-bold mb-8 ${dm ? 'text-red-500' : 'text-tafara-cyan'}`}>Build Your AI</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className={`backdrop-blur-sm rounded-xl p-8 ${dm ? 'bg-gray-900/50 border border-red-500/30' : 'bg-tafara-blue/30 border border-tafara-teal/30'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${dm ? 'text-red-400' : 'text-white'}`}>Configuration</h2>
            <div className="space-y-6">
              {/* AI Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Name</label>
                <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                  placeholder="e.g., My Study Buddy" />
              </div>

              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Avatar</label>
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {['🤖', '🧠', '⭐', '🎨', '💡', '🚀', '🔮', '👾', '🦾', '💬'].map(emoji => (
                      <button key={emoji} onClick={() => setConfig({...config, avatar: emoji})}
                        className={`text-3xl p-3 rounded-lg border-2 transition-all ${config.avatar === emoji ? 'border-tafara-teal bg-tafara-teal/20' : 'border-tafara-teal/30 hover:border-tafara-teal/50'}`}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Or upload your own:</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => setConfig({...config, avatar: event.target?.result as string})
                        reader.readAsDataURL(file)
                      }
                    }} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-tafara-teal/20 file:text-tafara-cyan hover:file:bg-tafara-teal/30" />
                  </div>
                  {config.avatar && !['🤖','🧠','⭐','🎨','💡','🚀','🔮','👾','🦾','💬'].includes(config.avatar) && (
                    <div className="flex items-center gap-2">
                      <img src={config.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover" />
                      <span className="text-xs text-gray-400">Custom avatar uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chat Background</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => setConfig({...config, background: event.target?.result as string})
                    reader.readAsDataURL(file)
                  }
                }} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-tafara-teal/20 file:text-tafara-cyan hover:file:bg-tafara-teal/30" />
                {config.background && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-20 h-12 rounded border border-tafara-teal/30 bg-cover bg-center" style={{backgroundImage: `url(${config.background})`}}></div>
                    <button onClick={() => setConfig({...config, background: ''})} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                  </div>
                )}
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Personality</label>
                <input type="text" value={config.personality} onChange={(e) => setConfig({...config, personality: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none"
                  placeholder="e.g., friendly and encouraging" />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Instructions</label>
                <textarea value={config.instructions} onChange={(e) => setConfig({...config, instructions: e.target.value})}
                  className="w-full px-4 py-2 bg-tafara-dark/50 border border-tafara-teal/30 rounded-lg text-white focus:border-tafara-teal focus:outline-none h-32"
                  placeholder="e.g., Help me study for exams by quizzing me" />
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">AI Model</label>
                <div className="space-y-3">
                  {[
                    { value: 'openrouter/aurora-alpha', name: 'Aurora Alpha', desc: 'Advanced reasoning and creative tasks' },
                    { value: 'stepfun/step-3.5-flash:free', name: 'Step 3.5 Flash', desc: 'Lightning fast responses' },
                    { value: 'arcee-ai/trinity-large-preview:free', name: 'Trinity Large Preview', desc: 'Powerful for complex reasoning' },
                    { value: 'liquid/lfm-2.5-1.2b-thinking:free', name: 'LFM 2.5 Thinking', desc: 'Advanced thinking and problem-solving' },
                    { value: 'liquid/lfm-2.5-1.2b-instruct:free', name: 'LFM 2.5 Instruct', desc: 'Great for following detailed instructions' },
                    { value: 'nvidia/nemotron-3-nano-30b-a3b:free', name: 'Nemotron 3 Nano 30B', desc: "NVIDIA's efficient powerhouse" },
                    { value: 'arcee-ai/trinity-mini:free', name: 'Trinity Mini', desc: 'Compact and fast for everyday tasks' },
                    { value: 'nvidia/nemotron-nano-12b-v2-vl:free', name: 'Nemotron Nano 12B VL', desc: 'Visual understanding and image analysis' },
                    { value: 'qwen/qwen3-vl-30b-a3b-thinking', name: 'Qwen3 VL 30B Thinking', desc: 'Visual + reasoning for complex analysis' },
                    { value: 'qwen/qwen3-vl-235b-a22b-thinking', name: 'Qwen3 VL 235B Thinking', desc: 'Most powerful visual reasoning model' },
                  ].map(model => (
                    <button key={model.value} onClick={() => setConfig({...config, model: model.value})}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${config.model === model.value ? 'border-tafara-teal bg-tafara-teal/20' : 'border-tafara-teal/30 bg-tafara-dark/30 hover:border-tafara-teal/50'}`}>
                      <div className="font-semibold text-base text-white mb-1">{model.name}</div>
                      <div className="text-xs text-gray-400">{model.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">✨ Hand-picked quality models</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Actions */}
            <div className={`backdrop-blur-sm rounded-xl p-6 ${dm ? 'bg-gray-900/50 border border-red-500/30' : 'bg-tafara-blue/30 border border-tafara-teal/30'}`}>
              <h2 className={`text-xl font-bold mb-4 ${dm ? 'text-red-400' : 'text-white'}`}>Actions</h2>
              <div className="space-y-3">
                <button onClick={() => setShowChat(true)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${dm ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50' : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'}`}>
                  💬 Test Your AI
                </button>
                <button onClick={saveConfig}
                  className={`w-full py-3 rounded-lg font-semibold border-2 transition-all ${dm ? 'border-red-500 text-red-400 hover:bg-red-500/10' : 'border-tafara-teal text-tafara-cyan hover:bg-tafara-teal/10'}`}>
                  💾 Save Configuration
                </button>
              </div>
            </div>

            {/* Saved Configs */}
            {savedConfigs.length > 0 && (
              <div className={`backdrop-blur-sm rounded-xl p-6 ${dm ? 'bg-gray-900/50 border border-red-500/30' : 'bg-tafara-blue/30 border border-tafara-teal/30'}`}>
                <h2 className={`text-xl font-bold mb-4 ${dm ? 'text-red-400' : 'text-white'}`}>Saved AIs</h2>
                <div className="space-y-3">
                  {savedConfigs.map((saved, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${dm ? 'bg-gray-800/50 border border-red-500/20' : 'bg-tafara-dark/30 border border-tafara-teal/20'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{saved.avatar && !saved.avatar.startsWith('data:') ? saved.avatar : '🤖'}</span>
                        <span className={`font-medium ${dm ? 'text-red-300' : 'text-white'}`}>{saved.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setConfig(saved)} className={`text-xs px-3 py-1 rounded ${dm ? 'text-red-400 border border-red-500/30 hover:bg-red-500/10' : 'text-tafara-cyan border border-tafara-teal/30 hover:bg-tafara-teal/10'}`}>
                          Load
                        </button>
                        <button onClick={() => deleteConfig(index)} className="text-xs px-3 py-1 rounded text-red-400 border border-red-700/30 hover:bg-red-900/20">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatInterface({ config, onBack, darkMode }: { config: AIConfig, onBack: () => void, darkMode: boolean }) {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dm = darkMode

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          config,
          sessionToken: session.access_token
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Request failed')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, there was an error: ${msg}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen p-6 ${dm ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onBack} className={dm ? 'text-red-500 hover:text-red-400' : 'text-tafara-cyan hover:text-tafara-teal'}>
            ← Back to Builder
          </button>
          <h1 className={`text-2xl font-bold ${dm ? 'text-red-500' : 'text-tafara-cyan'}`}>{config.name}</h1>
        </div>

        <div className={`rounded-xl p-6 mb-4 overflow-y-auto bg-cover bg-center ${dm ? 'bg-gray-900/50 border-2 border-red-500/30' : 'bg-tafara-blue/30 border-2 border-tafara-teal/30'}`}
          style={{
            height: '60vh',
            backgroundImage: config.background
              ? dm ? `linear-gradient(rgba(0,0,0,0.85),rgba(0,0,0,0.85)),url(${config.background})`
                   : `linear-gradient(rgba(15,31,58,0.85),rgba(15,31,58,0.85)),url(${config.background})`
              : 'none'
          }}>
          {messages.length === 0 ? (
            <div className={`text-center mt-20 ${dm ? 'text-red-400' : 'text-gray-400'}`}>
              <div className="text-6xl mb-4">
                {config.avatar && (config.avatar.startsWith('data:') || config.avatar.startsWith('http'))
                  ? <img src={config.avatar} alt="AI" className="w-20 h-20 rounded-full mx-auto object-cover" />
                  : <span>{config.avatar}</span>}
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
                      {config.avatar && (config.avatar.startsWith('data:') || config.avatar.startsWith('http'))
                        ? <img src={config.avatar} alt="AI" className="w-10 h-10 rounded-full object-cover" />
                        : <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${dm ? 'bg-red-500/20' : 'bg-tafara-teal/20'}`}>{config.avatar}</div>}
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-lg ${
                    msg.role === 'user'
                      ? dm ? 'bg-red-500/30 border border-red-500 text-red-100' : 'bg-tafara-teal text-tafara-dark'
                      : dm ? 'bg-black/70 border border-red-500/30 text-red-400' : 'bg-tafara-dark/70 border border-tafara-teal/30 text-white'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${dm ? 'bg-red-500/20' : 'bg-tafara-teal/20'}`}>
                    {config.avatar && !config.avatar.startsWith('data:') ? config.avatar : '🤖'}
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${dm ? 'bg-black/70 border border-red-500/30 text-red-400' : 'bg-tafara-dark/70 border border-tafara-teal/30 text-white'}`}>
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            className={`flex-1 px-4 py-3 rounded-lg focus:outline-none ${dm ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 focus:border-red-500' : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white focus:border-tafara-teal'}`}
            placeholder="Type your message..." disabled={isLoading} />
          <button onClick={sendMessage} disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${dm ? 'bg-gradient-to-r from-red-600 to-red-500 text-white' : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark'}`}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
