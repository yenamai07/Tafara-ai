'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AIConfig {
  name: string
  personality: string
  instructions: string
  model: string
  avatar: string
  background: string
  id: string
}

export default function Hub() {
  const router = useRouter()
  const [myAIs, setMyAIs] = useState<AIConfig[]>([])
  const [communityAIs, setCommunityAIs] = useState<AIConfig[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

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

    // Load user's AIs
    const userConfigs = localStorage.getItem(`tafara-configs-${savedUsername}`)
    if (userConfigs) {
      const configs = JSON.parse(userConfigs)
      setMyAIs(configs.map((config: AIConfig, index: number) => ({
        ...config,
        id: `${savedUsername}-${index}`
      })))
    }

    // TODO: Load community AIs from backend
    // For now, using placeholder data
    setCommunityAIs([
      {
        id: 'community-1',
        name: 'Study Buddy',
        personality: 'encouraging and patient',
        instructions: 'Help students learn and understand complex topics',
        model: 'openrouter/aurora-alpha',
        avatar: '📚',
        background: ''
      },
      {
        id: 'community-2',
        name: 'Creative Writer',
        personality: 'imaginative and inspiring',
        instructions: 'Help with creative writing, brainstorming, and storytelling',
        model: 'openrouter/aurora-alpha',
        avatar: '✍️',
        background: ''
      }
    ])
  }, [router])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const handleLogout = () => {
    localStorage.removeItem('tafara-apikey')
    localStorage.removeItem('tafara-username')
    router.push('/builder')
  }

  const deleteMyAI = (index: number) => {
    const newAIs = myAIs.filter((_, i) => i !== index)
    setMyAIs(newAIs)
    // Remove the id property before saving
    const configsToSave = newAIs.map(({ id, ...config }) => config)
    localStorage.setItem(`tafara-configs-${currentUser}`, JSON.stringify(configsToSave))
  }

  const categories = ['all', 'study', 'creative', 'productivity', 'fun', 'coding']

  const filteredCommunityAIs = communityAIs.filter(ai => {
    const matchesSearch = ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ai.personality.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' // TODO: Add category field to AIs
    return matchesSearch && matchesCategory
  })

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-red-500' : 'text-tafara-cyan'}`}>
              Welcome back, {currentUser}!
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-red-300' : 'text-gray-300'}`}>
              Create, explore, and chat with AI assistants
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={toggleDarkMode}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                darkMode 
                  ? 'border-red-500 bg-red-500/20 text-red-400' 
                  : 'border-tafara-teal bg-tafara-teal/20 text-tafara-cyan'
              }`}
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        {/* My AIs Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-3xl font-bold ${darkMode ? 'text-red-400' : 'text-white'}`}>
              My AIs
            </h2>
            <Link
              href="/builder"
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-xl hover:shadow-red-500/50'
                  : 'bg-gradient-to-r from-tafara-teal to-tafara-cyan text-tafara-dark hover:shadow-xl hover:shadow-tafara-teal/50'
              }`}
            >
              + Create New AI
            </Link>
          </div>

          {myAIs.length === 0 ? (
            <div className={`text-center py-16 rounded-xl border-2 border-dashed ${
              darkMode ? 'border-red-500/30' : 'border-tafara-teal/30'
            }`}>
              <p className={`text-xl mb-4 ${darkMode ? 'text-red-400' : 'text-gray-400'}`}>
                You haven't created any AIs yet
              </p>
              <Link
                href="/builder"
                className={`inline-block px-6 py-3 rounded-lg font-semibold ${
                  darkMode
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30'
                    : 'bg-tafara-teal/20 border-2 border-tafara-teal text-tafara-cyan hover:bg-tafara-teal/30'
                }`}
              >
                Create Your First AI
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAIs.map((ai, index) => (
                <AICard
                  key={ai.id}
                  ai={ai}
                  darkMode={darkMode}
                  onDelete={() => deleteMyAI(index)}
                  onEdit={() => router.push(`/builder?edit=${index}`)}
                  onChat={() => router.push(`/chat?ai=${ai.id}`)}
                  showDelete={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Community AIs Section */}
        <section>
          <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-red-400' : 'text-white'}`}>
            Community AIs
          </h2>

          {/* Search and Filter */}
          <div className="mb-6 space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AIs..."
              className={`w-full px-4 py-3 rounded-lg focus:outline-none ${
                darkMode
                  ? 'bg-gray-900/50 border-2 border-red-500/30 text-red-400 placeholder-red-500/50 focus:border-red-500'
                  : 'bg-tafara-dark/50 border-2 border-tafara-teal/30 text-white placeholder-gray-400 focus:border-tafara-teal'
              }`}
            />

            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                    selectedCategory === cat
                      ? darkMode
                        ? 'bg-red-500 text-white'
                        : 'bg-tafara-teal text-tafara-dark'
                      : darkMode
                        ? 'bg-gray-900/50 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                        : 'bg-tafara-dark/30 border border-tafara-teal/30 text-gray-300 hover:bg-tafara-dark/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunityAIs.map(ai => (
              <AICard
                key={ai.id}
                ai={ai}
                darkMode={darkMode}
                onChat={() => router.push(`/chat?ai=${ai.id}`)}
                showDelete={false}
              />
            ))}
          </div>

          {filteredCommunityAIs.length === 0 && (
            <div className={`text-center py-16 ${darkMode ? 'text-red-400' : 'text-gray-400'}`}>
              <p className="text-xl">No AIs found matching your search</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function AICard({ 
  ai, 
  darkMode, 
  onDelete, 
  onEdit, 
  onChat,
  showDelete 
}: { 
  ai: AIConfig
  darkMode: boolean
  onDelete?: () => void
  onEdit?: () => void
  onChat: () => void
  showDelete: boolean
}) {
  return (
    <div className={`rounded-xl p-6 transition-all hover:scale-105 cursor-pointer ${
      darkMode
        ? 'bg-gray-900/50 border-2 border-red-500/30 hover:border-red-500'
        : 'bg-tafara-blue/30 border-2 border-tafara-teal/30 hover:border-tafara-teal'
    }`}>
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        {ai.avatar.startsWith('data:') || ai.avatar.startsWith('http') ? (
          <img src={ai.avatar} alt={ai.name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${
            darkMode ? 'bg-red-500/20' : 'bg-tafara-teal/20'
          }`}>
            {ai.avatar}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-red-400' : 'text-tafara-cyan'}`}>
        {ai.name}
      </h3>

      {/* Personality */}
      <p className={`text-sm text-center mb-4 ${darkMode ? 'text-red-300/70' : 'text-gray-400'}`}>
        {ai.personality}
      </p>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={onChat}
          className={`w-full py-2 rounded-lg font-semibold transition-all ${
            darkMode
              ? 'bg-red-500/30 border border-red-500 text-red-300 hover:bg-red-500/50'
              : 'bg-tafara-teal/30 border border-tafara-teal text-tafara-cyan hover:bg-tafara-teal/50'
          }`}
        >
          💬 Chat
        </button>

        {showDelete && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex-1 py-2 rounded-lg font-medium text-sm border transition-all bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex-1 py-2 rounded-lg font-medium text-sm border transition-all bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
