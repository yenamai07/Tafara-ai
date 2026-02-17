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
  id: string
  category?: string
  isPublished?: boolean
  creatorUsername?: string
  isAnonymous?: boolean
}

export default function Hub() {
  const router = useRouter()
  const [myAIs, setMyAIs] = useState<AIConfig[]>([])
  const [communityAIs, setCommunityAIs] = useState<AIConfig[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('tafara-darkmode-global')
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')

    ;(async () => {
      let username = localStorage.getItem('tafara-username')

      // If no username in localStorage, try to restore from Supabase session
      if (!username) {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, api_key, is_preset_account')
          .eq('id', session.user.id)
          .single()

        if (!profile) {
          router.push('/login')
          return
        }

        // Restore localStorage from Supabase
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

        username = profile.username
      }

      setCurrentUser(username)

      // Load user's AIs from localStorage
      const userConfigs = localStorage.getItem(`tafara-configs-${username}`)
      if (userConfigs) {
        const configs = JSON.parse(userConfigs)
        setMyAIs(configs.map((config: AIConfig, index: number) => ({
          ...config,
          id: `${username}-${index}`
        })))
      }

      setAuthChecked(true)
      loadCommunityAIs()
    })()
  }, [router])

  const loadCommunityAIs = async () => {
    try {
      const { data, error } = await supabase
        .from('public_ais')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading community AIs:', error)
        return
      }

      if (data) {
        setCommunityAIs(data.map(ai => ({
          id: ai.id,
          name: ai.name,
          personality: ai.personality,
          instructions: ai.instructions,
          model: ai.model,
          avatar: ai.avatar,
          background: ai.background || '',
          category: ai.category || 'general',
          creatorUsername: ai.creator_username,
          isAnonymous: ai.is_anonymous
        })))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('tafara-darkmode-global', String(newMode))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('tafara-apikey')
    localStorage.removeItem('tafara-username')
    router.push('/login')
  }

  const deleteMyAI = (index: number) => {
    const newAIs = myAIs.filter((_, i) => i !== index)
    setMyAIs(newAIs)
    const configsToSave = newAIs.map(({ id, ...config }) => config)
    localStorage.setItem(`tafara-configs-${currentUser}`, JSON.stringify(configsToSave))
  }

  const publishAI = async (ai: AIConfig, isAnonymous: boolean, category: string) => {
    try {
      const { error } = await supabase
        .from('public_ais')
        .insert([{
          name: ai.name,
          personality: ai.personality,
          instructions: ai.instructions,
          model: ai.model,
          avatar: ai.avatar,
          background: ai.background || '',
          creator_username: isAnonymous ? 'Anonymous' : currentUser,
          is_anonymous: isAnonymous,
          category: category
        }])

      if (error) {
        console.error('Error publishing AI:', error)
        alert('Failed to publish AI')
        return
      }

      alert('AI published successfully!')
      loadCommunityAIs()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to publish AI')
    }
  }

  const deletePublicAI = async (aiId: string) => {
    if (currentUser !== 'yenamai07' && currentUser !== 'TheBree') {
      alert('Only moderators can delete public AIs')
      return
    }

    if (!confirm('Are you sure you want to delete this public AI?')) return

    try {
      const { error } = await supabase
        .from('public_ais')
        .delete()
        .eq('id', aiId)

      if (error) {
        console.error('Error deleting AI:', error)
        alert('Failed to delete AI')
        return
      }

      alert('AI deleted successfully!')
      loadCommunityAIs()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to delete AI')
    }
  }

  const categories = ['all', 'study', 'creative', 'productivity', 'fun', 'coding', 'general']

  const filteredCommunityAIs = communityAIs.filter(ai => {
    const matchesSearch = ai.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ai.personality.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || ai.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Show nothing while auth is being checked to avoid flash of redirect
  if (!authChecked) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-black via-gray-900 to-black' : ''}`}>
        <div className={`text-xl ${darkMode ? 'text-red-400' : 'text-tafara-cyan'}`}>Loading...</div>
      </div>
    )
  }

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
              className="text-gray-400 hover:text-red-400 transition-colors"
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
                  onPublish={publishAI}
                  showDelete={true}
                  showPublish={true}
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
                      ? darkMode ? 'bg-red-500 text-white' : 'bg-tafara-teal text-tafara-dark'
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
                onDelete={(currentUser === 'yenamai07' || currentUser === 'TheBree') ? () => deletePublicAI(ai.id) : undefined}
                showDelete={currentUser === 'yenamai07' || currentUser === 'TheBree'}
                showPublish={false}
                currentUser={currentUser}
                isModerator={currentUser === 'yenamai07' || currentUser === 'TheBree'}
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
  ai, darkMode, onDelete, onEdit, onChat, onPublish, showDelete, showPublish, currentUser, isModerator
}: {
  ai: AIConfig
  darkMode: boolean
  onDelete?: () => void
  onEdit?: () => void
  onChat: () => void
  onPublish?: (ai: AIConfig, isAnonymous: boolean, category: string) => void
  showDelete: boolean
  showPublish?: boolean
  currentUser?: string
  isModerator?: boolean
}) {
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [publishAnonymous, setPublishAnonymous] = useState(false)
  const [publishCategory, setPublishCategory] = useState('general')

  const handlePublish = () => {
    if (onPublish) {
      onPublish(ai, publishAnonymous, publishCategory)
      setShowPublishDialog(false)
      setPublishAnonymous(false)
      setPublishCategory('general')
    }
  }

  return (
    <>
      <div className={`rounded-xl p-6 transition-all hover:scale-105 ${
        darkMode
          ? 'bg-gray-900/50 border-2 border-red-500/30 hover:border-red-500'
          : 'bg-tafara-blue/30 border-2 border-tafara-teal/30 hover:border-tafara-teal'
      }`}>
        <div className="flex justify-center mb-4">
          {ai.avatar && (ai.avatar.startsWith('data:') || ai.avatar.startsWith('http')) ? (
            <img src={ai.avatar} alt={ai.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${darkMode ? 'bg-red-500/20' : 'bg-tafara-teal/20'}`}>
              {ai.avatar || '🤖'}
            </div>
          )}
        </div>

        <h3 className={`text-xl font-bold text-center mb-2 ${darkMode ? 'text-red-400' : 'text-tafara-cyan'}`}>
          {ai.name}
        </h3>
        <p className={`text-sm text-center mb-2 ${darkMode ? 'text-red-300/70' : 'text-gray-400'}`}>
          {ai.personality}
        </p>

        {ai.creatorUsername && (
          <p className={`text-xs text-center mb-4 ${darkMode ? 'text-red-400/50' : 'text-gray-500'}`}>
            {isModerator && ai.isAnonymous ? (
              <>🔒 Anonymous (actually: <span className="font-semibold">{ai.creatorUsername}</span>)</>
            ) : (
              <>by {ai.creatorUsername}</>
            )}
          </p>
        )}

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

          {showPublish && (
            <button
              onClick={() => setShowPublishDialog(true)}
              className={`w-full py-2 rounded-lg font-medium text-sm border transition-all ${
                darkMode
                  ? 'bg-red-700/30 border-red-600 text-red-300 hover:bg-red-700/50'
                  : 'bg-tafara-cyan/30 border-tafara-cyan text-tafara-cyan hover:bg-tafara-cyan/50'
              }`}
            >
              🌍 Publish
            </button>
          )}

          {showDelete && (
            <div className="flex gap-2">
              {onEdit && (
                <button onClick={onEdit} className="flex-1 py-2 rounded-lg font-medium text-sm border transition-all bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-700/50">
                  ✏️ Edit
                </button>
              )}
              {onDelete && (
                <button onClick={onDelete} className="flex-1 py-2 rounded-lg font-medium text-sm border transition-all bg-red-900/30 border-red-700 text-red-400 hover:bg-red-900/50">
                  🗑️ Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showPublishDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setShowPublishDialog(false)}>
          <div
            className={`max-w-md w-full rounded-xl p-6 ${darkMode ? 'bg-gray-900 border-2 border-red-500' : 'bg-tafara-blue border-2 border-tafara-teal'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-red-400' : 'text-tafara-cyan'}`}>
              Publish "{ai.name}"
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-red-300' : 'text-gray-300'}`}>Category</label>
                <select
                  value={publishCategory}
                  onChange={(e) => setPublishCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-800 border border-red-500/30 text-red-300' : 'bg-tafara-dark/50 border border-tafara-teal/30 text-white'}`}
                >
                  <option value="general">General</option>
                  <option value="study">Study</option>
                  <option value="creative">Creative</option>
                  <option value="productivity">Productivity</option>
                  <option value="fun">Fun</option>
                  <option value="coding">Coding</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" checked={publishAnonymous} onChange={(e) => setPublishAnonymous(e.target.checked)} className="w-4 h-4" />
                <label htmlFor="anonymous" className={`text-sm ${darkMode ? 'text-red-300' : 'text-gray-300'}`}>Publish as Anonymous</label>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPublishDialog(false)} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 hover:bg-gray-700/30">
                Cancel
              </button>
              <button
                onClick={handlePublish}
                className={`flex-1 py-2 rounded-lg font-semibold ${darkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-tafara-teal text-tafara-dark hover:bg-tafara-cyan'}`}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
